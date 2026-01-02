from fastapi import APIRouter, Body, Depends, HTTPException, Request, status, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from typing import List, Dict
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
import traceback
from datetime import datetime, timezone 
from utils.auth import get_current_user 
from models.user import UserResponse

from models.outfit import OutfitCreate, OutfitGenRequest, Outfit, OutfitUpdate
from database import get_database
from services.outfit_generator import OutfitGenerator
from services.outfit_visualizer import OutfitVisualizer
from utils.s3_service import s3_service
from services.usage_limiter import require_outfit_gen, require_visualization, saved_outfits_limiter

import uuid

router = APIRouter()
outfit_generator = OutfitGenerator()
outfit_visualizer = OutfitVisualizer()

def _add_presigned_url_to_outfit(outfit: Dict) -> Dict:
    """
    Checks if the outfit has a 'visualization_key' (S3 key).
    If present, generates a 'visualization_url' (Pre-signed URL) 
    and adds it to the response dictionary.
    """
    key = outfit.get("visualization_key")
    
    if key:
        # If it's already a full URL (legacy), just copy it to url
        if key.startswith("http"):
            outfit["visualization_url"] = key
        else:
            try:
                # Generate pre-signed URL for the specific S3 key
                # 
                url = s3_service.generate_presigned_url(key)
                outfit["visualization_url"] = url
            except Exception as e:
                print(f"Error generating presigned URL for outfit {outfit.get('_id')}: {e}")
                # Fallback: don't set the URL if generation fails
                pass
                
    return outfit

@router.post("/generate", response_description="Generate outfit suggestions")
async def generate_outfits(
    request: Request,
    outfit_request: OutfitGenRequest = Body(...),
    current_user: UserResponse = Depends(require_outfit_gen),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    current_time = datetime.now(timezone.utc)
    user_role = current_user.role
    
    # Get the style
    style = await db.styles.find_one({"_id": ObjectId(outfit_request.style_id)})
    if style is None:
        raise HTTPException(status_code=404, detail=f"Style {outfit_request.style_id} not found")
    print(f"Generating outfits for style: {style['name']}")
    

    # Get all user's wardrobe items
    wardrobe_items = await db.clothing.find({"user_id": user_id}).to_list(1000)
    if not wardrobe_items:
        raise HTTPException(status_code=400, detail="User has no clothing items in wardrobe")
    print(f"Found {len(wardrobe_items)} items in user's wardrobe")
    
    
    # Get required items if any
    required_items = []
    for item_id in outfit_request.required_items:
        item = await db.clothing.find_one({"_id": ObjectId(item_id), "user_id": user_id})
        if item is None:
            raise HTTPException(status_code=404, detail=f"Required item {item_id} not found")
        required_items.append(item)
    
    # Get user profile for preferences
    user_profile = await db.user_profiles.find_one({"user_id": user_id})
    user_preferences = user_profile.get("preferences", {}) if user_profile else {}
    user_style_notes = user_profile.get("style_notes", "") if user_profile else ""
    user_preferences["style_notes"] = user_style_notes

    try:
        # Generate outfits
        generated_outfits = await outfit_generator.generate_outfits(
            wardrobe_items=wardrobe_items,
            style=style,
            occasion=outfit_request.occasion,
            weather=outfit_request.weather,
            required_items=required_items,
            exclude_items=outfit_request.exclude_items,
            description=outfit_request.description,
            user_preferences=user_preferences,
            num_outfits=outfit_request.num_outfits,
            api_key=current_user.api_key if user_role == "byok" else None
        )
        
        if not generated_outfits:
            raise HTTPException(status_code=500, detail="Failed to generate outfits")

        history_entry = {
            "generated_at": current_time,
            "request_details": {
                "style_name": style.get("name"),
                "style_id": str(style.get("_id")),
                "occasion": outfit_request.occasion,
                "weather": outfit_request.weather,
                "description": outfit_request.description
            },
            "outfits": generated_outfits
        }

        # Update User: Increment count AND Push to history (keeping only last 5)
        await require_outfit_gen.increment(current_user.id, db)
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$push": {
                    "generation_history": {
                        "$each": [history_entry],
                        "$slice": -5  # Negative number keeps the last 5 elements
                    }
                }
            }
        )
        
        return {"outfits": generated_outfits}
    except Exception as e:
        # with open("error.log", "w") as f:
        #     f.write(traceback.format_exc())
        print(f"Error in route generate_outfits: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate outfits")

@router.get("/history", response_description="Get past generation history")
async def get_generation_history(
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    # Fetch only the generation_history field for the user
    user = await db.users.find_one(
        {"_id": ObjectId(user_id)},
        {"generation_history": 1}
    )
    
    history = user.get("generation_history", [])
    
    # Sort by date descending (newest first) for display
    history.reverse()
    
    return history

@router.post("/", response_description="Save an outfit")
async def save_outfit(
    request: Request,
    outfit: OutfitCreate = Body(...),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    # Check saved outfits limit
    await saved_outfits_limiter.check_limit(current_user, db)
    
    print(outfit)
    outfit_data = jsonable_encoder(outfit)
    outfit_data["user_id"] = user_id
    
    # Verify all items exist in user's wardrobe
    for item_id in outfit.items:
        item = await db.clothing.find_one({"_id": ObjectId(item_id), "user_id": user_id})
        if item is None:
            raise HTTPException(status_code=404, detail=f"Item {item_id} not found in user's wardrobe")
    
    # Verify style exists
    style = await db.styles.find_one({"_id": ObjectId(outfit.style_id)})
    if style is None:
        raise HTTPException(status_code=404, detail=f"Style {outfit.style_id} not found")
    
    new_outfit = await db.outfits.insert_one(outfit_data)
    created_outfit = await db.outfits.find_one({"_id": new_outfit.inserted_id})
    created_outfit["_id"] = str(created_outfit["_id"])
    
    return created_outfit

@router.get("/", response_description="List all user outfits")
async def list_outfits(
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    outfits = await db.outfits.find({"user_id": user_id}).to_list(100)
    results = []
    for outfit in outfits:
        outfit["_id"] = str(outfit["_id"])
        outfit = _add_presigned_url_to_outfit(outfit)
        results.append(outfit)

    return results

@router.get("/{id}", response_description="Get a single outfit")
async def get_outfit(
    id: str,
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    outfit = await db.outfits.find_one({"_id": ObjectId(id), "user_id": user_id})
    if outfit is None:
        raise HTTPException(status_code=404, detail=f"Outfit {id} not found or does not belong to user")
    
    outfit["_id"] = str(outfit["_id"])
    outfit = _add_presigned_url_to_outfit(outfit)
    return outfit

@router.put("/{id}", response_description="Update an outfit")
async def update_outfit(
    id: str,
    request: Request,
    outfit: OutfitUpdate = Body(...),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    # Filter out None values
    outfit_data = {k: v for k, v in outfit.model_dump().items() if v is not None}
    
    if len(outfit_data) >= 1:
        update_result = await db.outfits.update_one(
            {"_id": ObjectId(id), "user_id": user_id}, 
            {"$set": outfit_data}
        )
        
        if update_result.modified_count == 1:
            updated_outfit = await db.outfits.find_one({"_id": ObjectId(id)})
            if updated_outfit:
                updated_outfit["_id"] = str(updated_outfit["_id"])
                # Resolve URL for the response
                updated_outfit = _add_presigned_url_to_outfit(updated_outfit)
                return updated_outfit
    
    existing_outfit = await db.outfits.find_one({"_id": ObjectId(id), "user_id": user_id})
    if existing_outfit:
        existing_outfit["_id"] = str(existing_outfit["_id"])
        existing_outfit = _add_presigned_url_to_outfit(existing_outfit)
        return existing_outfit
        
    raise HTTPException(status_code=404, detail=f"Outfit {id} not found or not owned by user")

@router.delete("/{id}", response_description="Delete an outfit")
async def delete_outfit(
    id: str,
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    # 1. Fetch first to check ownership and get S3 keys
    outfit = await db.outfits.find_one({"_id": ObjectId(id), "user_id": user_id})
    
    if not outfit:
        raise HTTPException(status_code=404, detail=f"Outfit {id} not found")
    
    # 2. Delete the Visualization Image from S3 if it exists
    visualization_key = outfit.get("visualization_key")
    if visualization_key and not visualization_key.startswith("http"):
        try:
            success = s3_service.delete_object(visualization_key)
            if success:
                print(f"Deleted S3 visualization for outfit {id}: {visualization_key}")
        except Exception as e:
            # Log but don't stop the DB deletion
            print(f"Failed to delete S3 object {visualization_key}: {e}")

    # 3. Delete from Database
    delete_result = await db.outfits.delete_one({"_id": ObjectId(id)})
    
    if delete_result.deleted_count == 1:
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT, content=None)
    
    raise HTTPException(status_code=500, detail="Failed to delete outfit")

VISUALIZATION_STATUS = {
    "none": "none",
    "pending": "pending", 
    "completed": "completed",
    "failed": "failed"
}

async def run_visualization_task(
    outfit_id: str,
    user_id: str,
    items: list,
    style_name: str | None,
    occasion: str | None,
    weather: str | None,
    reasoning: str | None,
    api_key: str | None,
    db: AsyncIOMotorDatabase 
):
    """Background task for generating visualization."""

    try:
        image_bytes = await outfit_visualizer.generate_image(
            items=items,
            reasoning=reasoning,
            style_name=style_name,
            occasion=occasion,
            weather=weather,
            api_key=api_key
        )
        
        if not image_bytes:
            await db.outfits.update_one(
                {"_id": ObjectId(outfit_id)},
                {"$set": {"visualization_status": "failed"}}
            )
            return
        
        # Upload to S3
        s3_key = f"visualizations/{user_id}/{uuid.uuid4()}.png"
        s3_service.upload_bytes(image_bytes, s3_key, content_type="image/png")
        
        # Update outfit
        await db.outfits.update_one(
            {"_id": ObjectId(outfit_id)},
            {"$set": {
                "visualization_key": s3_key,
                "visualization_status": "completed"
            }}
        )
        print(f"Visualization completed for outfit {outfit_id}")
        
    except Exception as e:
        print(f"Visualization failed for outfit {outfit_id}: {e}")
        await db.outfits.update_one(
            {"_id": ObjectId(outfit_id)},
            {"$set": {"visualization_status": "failed"}}
        )

@router.post("/{id}/visualize", response_description="Queue outfit visualization")
async def visualize_outfit(
    id: str,
    background_tasks: BackgroundTasks,
    current_user: UserResponse = Depends(require_visualization),
    db: AsyncIOMotorDatabase = Depends(get_database),
    regenerate: bool = False,
):
    user_id = current_user.id
    
    outfit = await db.outfits.find_one({"_id": ObjectId(id), "user_id": user_id})
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    
    # Handle regeneration: delete old visual and reset status
    if regenerate and outfit.get("visualization_key"):
        old_key = outfit.get("visualization_key")
        if old_key and not old_key.startswith("http"):
            try:
                s3_service.delete_object(old_key)
                print(f"Deleted old visualization for outfit {id}: {old_key}")
            except Exception as e:
                print(f"Failed to delete old S3 visualization {old_key}: {e}")
        
        # Reset status to allow regeneration
        await db.outfits.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"visualization_status": "none", "visualization_key": None}}
        )
    elif not regenerate:
        # Not regenerating - check existing status
        # Already completed
        if outfit.get("visualization_status") == "completed" and outfit.get("visualization_key"):
            url = s3_service.generate_presigned_url(outfit["visualization_key"])
            return {"status": "completed", "visualization_url": url}
        
        # Already pending
        if outfit.get("visualization_status") == "pending":
            return {"status": "pending"}
    
    # Fetch items
    items = []
    for item_id in outfit.get("items", []):
        item = await db.clothing.find_one({"_id": ObjectId(item_id)})
        if item:
            # Convert ObjectId to string for background task
            item["_id"] = str(item["_id"])
            items.append(item)
    
    if not items:
        raise HTTPException(status_code=400, detail="No items found")
    
    # Fetch style
    style = await db.styles.find_one({"_id": ObjectId(outfit.get("style_id"))})
    
    # Mark as pending
    await require_visualization.increment(current_user.id, db)
    await db.outfits.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"visualization_status": "pending"}}
    )
    
    # Queue background task
    background_tasks.add_task(
        run_visualization_task,
        outfit_id=id,
        user_id=user_id,
        items=items,
        style_name=style.get("name") if style else None,
        occasion=outfit.get("occasion"),
        weather=outfit.get("weather"),
        reasoning=outfit.get("ai_generated_reasoning"),
        api_key=current_user.api_key if current_user.role == "byok" else None,
        db=db
    )
    
    return {"status": "pending"}

@router.get("/{id}/visualization-status", response_description="Check visualization status")
async def get_visualization_status(
    id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    outfit = await db.outfits.find_one(
        {"_id": ObjectId(id), "user_id": current_user.id},
        {"visualization_status": 1, "visualization_key": 1}
    )
    
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    
    status = outfit.get("visualization_status", "none")
    response = {"status": status}
    
    if status == "completed" and outfit.get("visualization_key"):
        response["visualization_url"] = s3_service.generate_presigned_url(outfit["visualization_key"])
    
    return response