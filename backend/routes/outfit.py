from fastapi import APIRouter, Body, Depends, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
import traceback
from utils.auth import get_current_user 
from models.user import UserResponse

from models.outfit import OutfitCreate, OutfitGenRequest, Outfit
from database import get_database
from services.outfit_generator import OutfitGenerator

router = APIRouter()
outfit_generator = OutfitGenerator()

@router.post("/generate", response_description="Generate outfit suggestions")
async def generate_outfits(
    request: Request,
    outfit_request: OutfitGenRequest = Body(...),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
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
            num_outfits=outfit_request.num_outfits
        )
        
        if not generated_outfits:
            raise HTTPException(status_code=500, detail="Failed to generate outfits")
        
        return {"outfits": generated_outfits}
    except Exception as e:
        # with open("error.log", "w") as f:
        #     f.write(traceback.format_exc())
        print(f"Error in route generate_outfits: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate outfits")

@router.post("/", response_description="Save an outfit")
async def save_outfit(
    request: Request,
    outfit: OutfitCreate = Body(...),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
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
    for outfit in outfits:
        outfit["_id"] = str(outfit["_id"])
    return outfits

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
    return outfit

@router.delete("/{id}", response_description="Delete an outfit")
async def delete_outfit(
    id: str,
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    result = await db.outfits.delete_one({"_id": ObjectId(id), "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Outfit {id} not found or does not belong to user")
    
    return {"detail": "Outfit deleted successfully"}