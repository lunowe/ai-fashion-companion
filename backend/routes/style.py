from fastapi import APIRouter, Body, Depends, HTTPException, status, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from typing import List, Dict
from motor.motor_asyncio import AsyncIOMotorDatabase
from utils.auth import get_current_user 
from models.user import UserResponse

from models.style import Style, StyleCreate, StyleUpdate
from database import get_database
from bson import ObjectId
from utils.s3_service import s3_service
from services.usage_limiter import custom_styles_limiter

router = APIRouter()

async def save_base64_images(base64_images: List[str]) -> List[str]:
    """
    Upload base64 images to S3 and return their S3 keys (not URLs)
    """
    try:
        saved_keys = await s3_service.upload_base64_images(base64_images, folder="styles")
        return saved_keys
    except Exception as e:
        print(f"Error uploading images to S3: {e}")
        return []

def _add_presigned_urls_to_style(style: Dict) -> Dict:
    """
    Convert S3 keys in reference_images to pre-signed URLs.
    Handles both S3 keys and legacy full URLs.
    """
    if not style.get("reference_images"):
        return style
    
    # Collect S3 keys (filter out base64 data URLs and legacy full URLs)
    s3_keys = []
    for img in style["reference_images"]:
        # Skip data URLs
        if img.startswith("data:"):
            continue
        # Check if it's an S3 key (not a full URL)
        if not img.startswith("http"):
            s3_keys.append(img)
    
    # Generate pre-signed URLs for S3 keys
    if s3_keys:
        presigned_map = s3_service.generate_presigned_urls(s3_keys)
        
        # Replace S3 keys with pre-signed URLs
        updated_images = []
        for img in style["reference_images"]:
            if img in presigned_map:
                updated_images.append(presigned_map[img])
            else:
                # Keep data URLs and legacy full URLs as-is
                updated_images.append(img)
        
        style["reference_images"] = updated_images
    
    return style

@router.post("/", response_description="Create a new style")
async def create_style(
    request: Request,
    style: StyleCreate = Body(...),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    # Check custom styles limit
    await custom_styles_limiter.check_limit(current_user, db)
    
    style_data = jsonable_encoder(style)
    style_data["user_id"] = user_id
    if style_data.get("reference_images"):
        saved_image_keys = await save_base64_images(style_data["reference_images"])
        style_data["reference_images"] = saved_image_keys
    
    new_style = await db.styles.insert_one(style_data)
    created_style = await db.styles.find_one({"_id": new_style.inserted_id})
    created_style["_id"] = str(created_style["_id"])
    
    # Add pre-signed URLs before returning
    created_style = _add_presigned_urls_to_style(created_style)
    
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=created_style)

@router.get("/", response_description="List all styles")
async def list_styles(
    request: Request,
    custom_only: bool = False,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    query = {}
    if custom_only:
        query = {"user_id": user_id}
    else:
        # Get both predefined (user_id is None) and user's custom styles
        query = {"$or": [{"user_id": user_id}, {"user_id": None}]}
    
    styles = await db.styles.find(query).to_list(1000)
    for style in styles:
        style["_id"] = str(style["_id"])
        # Add pre-signed URLs
        style = _add_presigned_urls_to_style(style)
    return styles

@router.get("/{id}", response_description="Get a single style")
async def get_style(
    id: str,
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    style = await db.styles.find_one({"_id": ObjectId(id)})
    if style is None:
        raise HTTPException(status_code=404, detail=f"Style {id} not found")
    
    style["_id"] = str(style["_id"])
    # Add pre-signed URLs
    style = _add_presigned_urls_to_style(style)
    
    return style

@router.put("/{id}", response_description="Update a style")
async def update_style(
    id: str,
    request: Request,
    style: StyleUpdate = Body(...),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    style_data = {k: v for k, v in style.model_dump().items() if v is not None}
    
    if len(style_data) >= 1:
        # Only allow updating user's custom styles
        # Process reference images if they're being updated
        if "reference_images" in style_data and style_data["reference_images"]:
            # Fetch the existing style to get old image keys for cleanup
            existing_style = await db.styles.find_one({"_id": ObjectId(id), "user_id": user_id})
            if not existing_style:
                raise HTTPException(status_code=404, detail=f"Style {id} not found or not owned by user")
            
            old_keys = []
            if existing_style.get("reference_images"):
                for img in existing_style["reference_images"]:
                    # Extract S3 keys from old images (skip URLs and data URIs)
                    if not img.startswith("data:") and not img.startswith("http"):
                        old_keys.append(img)
                    elif ".s3." in img and ".amazonaws.com/" in img:
                        # Extract key from pre-signed URL
                        parts = img.split(".amazonaws.com/")
                        if len(parts) == 2:
                            key = parts[1].split("?")[0]
                            old_keys.append(key)
            
            # Check if they're base64 (new uploads) or S3 keys/URLs (existing images)
            new_images = []
            existing_keys = []

            for img in style_data["reference_images"]:
                # New base64 upload
                if img.startswith("data:"):
                    new_images.append(img)
                # S3 key (not a full URL)
                elif not img.startswith("http"):
                    existing_keys.append(img)
                # Pre-signed URL - extract key
                elif ".s3." in img and ".amazonaws.com/" in img:
                    # Extract key from URL
                    parts = img.split(".amazonaws.com/")
                    if len(parts) == 2:
                        key = parts[1].split("?")[0]  # Remove query params
                        existing_keys.append(key)
                else:
                    # Other URL types - keep as-is
                    existing_keys.append(img)
            
            # Save new images
            if new_images:
                saved_keys = await save_base64_images(new_images)
                style_data["reference_images"] = existing_keys + saved_keys
            else:
                style_data["reference_images"] = existing_keys
            
            # Delete old images that are no longer referenced
            keys_to_delete = [k for k in old_keys if k not in style_data["reference_images"]]
            if keys_to_delete:
                deleted_count = s3_service.delete_objects(keys_to_delete)
                print(f"Deleted {deleted_count} old S3 images during style update")

        update_result = await db.styles.update_one(
            {"_id": ObjectId(id), "user_id": user_id}, {"$set": style_data}
        )
        
        if update_result.modified_count == 1:
            updated_style = await db.styles.find_one({"_id": ObjectId(id)})
            if updated_style is not None:
                updated_style["_id"] = str(updated_style["_id"])
                # Add pre-signed URLs
                updated_style = _add_presigned_urls_to_style(updated_style)
                return updated_style
    else:
        existing_style = await db.styles.find_one({"_id": ObjectId(id), "user_id": user_id})
        if not existing_style:
            raise HTTPException(status_code=404, detail=f"Style {id} not found or not owned by user")
        
        old_keys = []
        if existing_style.get("reference_images"):
            for img in existing_style["reference_images"]:
                # Extract S3 keys from old images (skip URLs and data URIs)
                if not img.startswith("data:") and not img.startswith("http"):
                    old_keys.append(img)
                elif ".s3." in img and ".amazonaws.com/" in img:
                    # Extract key from pre-signed URL
                    parts = img.split(".amazonaws.com/")
                    if len(parts) == 2:
                        key = parts[1].split("?")[0]
                        old_keys.append(key)

        # Delete old images that are no longer referenced
        if old_keys:
            deleted_count = s3_service.delete_objects(old_keys)
            print(f"Deleted {deleted_count} old S3 images during style update")

    existing_style = await db.styles.find_one({"_id": ObjectId(id)})
    if existing_style is None:
        raise HTTPException(status_code=404, detail=f"Style {id} not found")
    
    if existing_style.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Cannot update other users' styles")
    existing_style["_id"] = str(existing_style["_id"])
    # Add pre-signed URLs
    existing_style = _add_presigned_urls_to_style(existing_style)
    return existing_style

@router.delete("/{id}", response_description="Delete a style")
async def delete_style(
    id: str,
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    # Fetch the style to get image keys for cleanup
    style = await db.styles.find_one({"_id": ObjectId(id), "user_id": user_id})
    
    if style:
        # Delete associated S3 images
        if style.get("reference_images"):
            keys_to_delete = []
            for img in style["reference_images"]:
                # Extract S3 keys
                if not img.startswith("data:") and not img.startswith("http"):
                    keys_to_delete.append(img)
                elif ".s3." in img and ".amazonaws.com/" in img:
                    parts = img.split(".amazonaws.com/")
                    if len(parts) == 2:
                        key = parts[1].split("?")[0]
                        keys_to_delete.append(key)
            
            if keys_to_delete:
                deleted_count = s3_service.delete_objects(keys_to_delete)
                print(f"Deleted {deleted_count} S3 images during style deletion")
        
        # Delete the style from database
        delete_result = await db.styles.delete_one({"_id": ObjectId(id), "user_id": user_id})
        
        if delete_result.deleted_count == 1:
            return JSONResponse(content="Deleted successfully", status_code=status.HTTP_204_NO_CONTENT)
    
    # Check if it exists but is another user's style
    style = await db.styles.find_one({"_id": ObjectId(id)})
    if style is None:
        raise HTTPException(status_code=404, detail=f"Style {id} not found")
    
    if style.get("user_id") is None:
        raise HTTPException(status_code=403, detail="Cannot delete predefined styles")
    
    raise HTTPException(status_code=404, detail=f"Style {id} not found or not owned by user")