from fastapi import APIRouter, Body, Depends, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from utils.auth import get_current_user 
from models.user import UserResponse

from models.user_profile import UserProfile, UserProfileUpdate
from database import get_database

router = APIRouter()

@router.get("/", response_description="Get user profile")
async def get_profile(
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    profile = await db.user_profiles.find_one({"user_id": user_id})
    if profile:
        profile["_id"] = str(profile["_id"])
        return profile
    
    # Create default profile if not exists
    new_profile = UserProfile(user_id=user_id)
    profile_data = jsonable_encoder(new_profile)
    profile_data.pop("_id", None)
    new_profile_result = await db.user_profiles.insert_one(profile_data)
    created_profile = await db.user_profiles.find_one({"_id": new_profile_result.inserted_id})
    created_profile["_id"] = str(created_profile["_id"])
    return created_profile

@router.put("/", response_description="Update user profile")
async def update_profile(
    request: Request,
    profile_update: UserProfileUpdate = Body(...),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    
    update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
    
    if not update_data:
         raise HTTPException(status_code=400, detail="No data provided for update")

    result = await db.user_profiles.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
         # Create if not exists (upsert logic essentially, but we want to be explicit)
         # But get_profile handles creation, so this might be edge case.
         # Let's just try to create one if it doesn't exist
         new_profile = UserProfile(user_id=user_id, **update_data)
         profile_data = jsonable_encoder(new_profile)
         await db.user_profiles.insert_one(profile_data)

    profile = await db.user_profiles.find_one({"user_id": user_id})
    profile["_id"] = str(profile["_id"])
    return profile
