from fastapi import APIRouter, Body, Depends, HTTPException, status, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from utils.auth import get_current_user 
from models.user import UserResponse

from models.clothing import ClothingItem, ClothingCreate, ClothingUpdate
from database import get_database
from bson import ObjectId
from services.usage_limiter import wardrobe_limiter

router = APIRouter()

@router.post("/", response_description="Add a new clothing item")
async def create_clothing_item(
    request: Request,
    clothing: ClothingCreate = Body(...),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    # Check wardrobe size limit
    await wardrobe_limiter.check_limit(current_user, db)
    
    clothing_data = jsonable_encoder(clothing)
    clothing_data["user_id"] = user_id
    
    new_clothing = await db.clothing.insert_one(clothing_data)
    created_clothing = await db.clothing.find_one({"_id": new_clothing.inserted_id})
    created_clothing["_id"] = str(created_clothing["_id"])
    
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=created_clothing)

@router.get("/", response_description="List all clothing items")
async def list_clothing_items(
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    items = await db.clothing.find({"user_id": user_id}).to_list(1000)
    for item in items:
        item["_id"] = str(item["_id"])
    return items

@router.get("/{id}", response_description="Get a single clothing item")
async def get_clothing_item(
    id: str,
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    item = await db.clothing.find_one({"_id": ObjectId(id)})
    if item is None:
        raise HTTPException(status_code=404, detail=f"Clothing item {id} not found")
    
    item["_id"] = str(item["_id"])
    return item

@router.put("/{id}", response_description="Update a clothing item")
async def update_clothing_item(
    id: str,
    request: Request,
    clothing: ClothingUpdate = Body(...),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    # Filter out None values
    clothing_data = {k: v for k, v in clothing.dict().items() if v is not None}
    
    if len(clothing_data) >= 1:
        update_result = await db.clothing.update_one(
            {"_id": ObjectId(id)}, {"$set": clothing_data}
        )
        
        if update_result.modified_count == 1:
            updated_clothing = await db.clothing.find_one({"_id": ObjectId(id)})
            if updated_clothing is not None:
                updated_clothing["_id"] = str(updated_clothing["_id"])
                return updated_clothing

    existing_clothing = await db.clothing.find_one({"_id": ObjectId(id)})
    if existing_clothing is not None:
        existing_clothing["_id"] = str(existing_clothing["_id"])
        return existing_clothing
    
    raise HTTPException(status_code=404, detail=f"Clothing item {id} not found")

@router.delete("/{id}", response_description="Delete a clothing item")
async def delete_clothing_item(
    id: str,
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    delete_result = await db.clothing.delete_one({"_id": ObjectId(id)})
    
    if delete_result.deleted_count == 1:
        return JSONResponse(content="Deleted successfully", status_code=status.HTTP_204_NO_CONTENT)

    raise HTTPException(status_code=404, detail=f"Clothing item {id} not found")
