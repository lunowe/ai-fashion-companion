from fastapi import APIRouter, Body, Depends, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
import traceback
from datetime import datetime, timezone 
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
    
    # --- LIMIT CHECK & RESET LOGIC ---
    LIMITS = {
        "free": 5,
        "premium": 50,
        "byok": float("inf")
    }
    
    current_time = datetime.now(timezone.utc)
    last_reset = current_user.last_reset_date
    
    # Reset if it's a new day (simple check: different date)
    if last_reset.date() < current_time.date():
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"generation_count": 0, "last_reset_date": current_time}}
        )
        current_user.generation_count = 0
    
    user_role = current_user.role
    limit = LIMITS.get(user_role, 5)
    
    if current_user.generation_count >= limit:
        raise HTTPException(
            status_code=403, 
            detail=f"Daily generation limit reached for {user_role} tier. Limit: {limit}"
        )
    # ---------------------------------
    
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
                "occasion": outfit_request.occasion,
                "weather": outfit_request.weather,
                "description": outfit_request.description
            },
            "outfits": generated_outfits
        }

        # Update User: Increment count AND Push to history (keeping only last 5)
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$inc": {"generation_count": 1},
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