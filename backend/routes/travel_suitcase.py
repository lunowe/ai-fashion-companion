from fastapi import APIRouter, Body, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from utils.auth import get_current_user
from models.user import UserResponse
from models.travel_suitcase import (
    TravelSuitcaseCreate,
    TravelSuitcaseUpdate,
    PackingItem,
    DailyOutfit,
    DestinationSummary,
)
from database import get_database
from services.travel_suitcase_generator import TravelSuitcaseGenerator

router = APIRouter()
suitcase_generator = TravelSuitcaseGenerator()

# Allowed tiers for suitcase generation (pro feature)
ALLOWED_TIERS = ["premium", "byok"]


class SuitcaseGenRequest(BaseModel):
    destination: str
    start_date: datetime
    end_date: datetime
    occasions: List[str]
    style_ids: List[str] = []  # 1-3 style IDs for variety


class SuitcaseGenResponse(BaseModel):
    destination_summary: Optional[DestinationSummary]
    packing_list: List[PackingItem]
    daily_outfits: List[DailyOutfit]
    versatility_insights: str


def check_pro_access(user: UserResponse):
    """Check if user has pro access for suitcase features"""
    if user.role not in ALLOWED_TIERS:
        raise HTTPException(
            status_code=403,
            detail="Travel Suitcase is a premium feature. Please upgrade your plan to access it."
        )


@router.post("/generate", response_description="Generate travel suitcase")
async def generate_suitcase(
    request: Request,
    suitcase_request: SuitcaseGenRequest = Body(...),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Generate an optimized travel suitcase with minimal items for maximum outfit combinations.
    Considers destination weather, trip duration, and planned occasions.

    PRO FEATURE: Only available to premium and byok tiers.
    """
    user_id = current_user.id

    # Check pro access
    check_pro_access(current_user)

    # --- RATE LIMIT CHECK (shares limit with outfit generation) ---
    LIMITS = {
        "premium": 50,
        "byok": float("inf")
    }

    current_time = datetime.now(timezone.utc)
    last_reset = current_user.last_reset_date

    # Reset if it's a new day
    if last_reset.date() < current_time.date():
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"generation_count": 0, "last_reset_date": current_time}}
        )
        current_user.generation_count = 0

    limit = LIMITS.get(current_user.role, 50)

    if current_user.generation_count >= limit:
        raise HTTPException(
            status_code=403,
            detail=f"Daily generation limit reached for {current_user.role} tier. Limit: {limit}"
        )
    # ---------------------------------

    # Validate dates
    if suitcase_request.end_date < suitcase_request.start_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")

    duration_days = (suitcase_request.end_date - suitcase_request.start_date).days + 1
    if duration_days > 30:
        raise HTTPException(status_code=400, detail="Trip duration cannot exceed 30 days")

    if not suitcase_request.occasions:
        raise HTTPException(status_code=400, detail="At least one occasion must be specified")

    # Validate style_ids (1-3 styles allowed)
    if len(suitcase_request.style_ids) > 3:
        raise HTTPException(status_code=400, detail="Maximum 3 styles can be selected")

    # Get user's wardrobe
    wardrobe_items = await db.clothing.find({"user_id": user_id}).to_list(1000)
    if not wardrobe_items:
        raise HTTPException(status_code=400, detail="User has no clothing items in wardrobe")

    print(f"Found {len(wardrobe_items)} items in user's wardrobe")

    # Get selected styles
    styles = []
    for style_id in suitcase_request.style_ids:
        style = await db.styles.find_one({"_id": ObjectId(style_id)})
        if style:
            styles.append(style)

    # Get user's saved outfits for preference learning
    saved_outfits = await db.outfits.find({"user_id": user_id}).to_list(100)
    print(f"Found {len(saved_outfits)} saved outfits for preference analysis")

    # Get user profile for preferences
    user_profile = await db.user_profiles.find_one({"user_id": user_id})
    user_preferences = user_profile.get("preferences", {}) if user_profile else {}
    user_style_notes = user_profile.get("style_notes", "") if user_profile else ""
    user_preferences["style_notes"] = user_style_notes

    try:
        # Generate the suitcase
        result = await suitcase_generator.generate_suitcase(
            wardrobe_items=wardrobe_items,
            destination=suitcase_request.destination,
            start_date=suitcase_request.start_date,
            end_date=suitcase_request.end_date,
            occasions=suitcase_request.occasions,
            styles=styles,
            saved_outfits=saved_outfits,
            user_preferences=user_preferences,
            api_key=current_user.api_key if current_user.role == "byok" else None
        )

        # Increment generation count
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"generation_count": 1}}
        )

        return result

    except Exception as e:
        print(f"Error in route generate_suitcase: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate travel suitcase")


@router.post("/", response_description="Save a generated suitcase")
async def save_suitcase(
    request: Request,
    suitcase: TravelSuitcaseCreate = Body(...),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Save a generated travel suitcase for later review."""
    user_id = current_user.id

    # Check pro access
    check_pro_access(current_user)

    suitcase_data = jsonable_encoder(suitcase)
    suitcase_data["user_id"] = user_id
    suitcase_data["created_at"] = datetime.now(timezone.utc)
    suitcase_data["updated_at"] = datetime.now(timezone.utc)

    # Generate a default name if not provided
    if not suitcase_data.get("name"):
        duration = (suitcase.end_date - suitcase.start_date).days + 1
        suitcase_data["name"] = f"{suitcase.destination} ({duration} days)"

    # Validate all packing list items exist in user's wardrobe
    for pack_item in suitcase.packing_list:
        item = await db.clothing.find_one({"_id": ObjectId(pack_item.item_id), "user_id": user_id})
        if item is None:
            raise HTTPException(
                status_code=404,
                detail=f"Clothing item {pack_item.item_id} not found in user's wardrobe"
            )

    new_suitcase = await db.travel_suitcases.insert_one(suitcase_data)
    created = await db.travel_suitcases.find_one({"_id": new_suitcase.inserted_id})
    created["_id"] = str(created["_id"])

    return created


@router.get("/", response_description="List all user's saved suitcases")
async def list_suitcases(
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all saved travel suitcases for the current user."""
    user_id = current_user.id

    suitcases = await db.travel_suitcases.find({"user_id": user_id}).sort("created_at", -1).to_list(100)

    for suitcase in suitcases:
        suitcase["_id"] = str(suitcase["_id"])

    return suitcases


@router.get("/{id}", response_description="Get a single suitcase")
async def get_suitcase(
    id: str,
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific saved travel suitcase."""
    user_id = current_user.id

    suitcase = await db.travel_suitcases.find_one({"_id": ObjectId(id), "user_id": user_id})
    if suitcase is None:
        raise HTTPException(status_code=404, detail=f"Suitcase {id} not found")

    suitcase["_id"] = str(suitcase["_id"])
    return suitcase


@router.put("/{id}", response_description="Update a suitcase")
async def update_suitcase(
    id: str,
    request: Request,
    suitcase: TravelSuitcaseUpdate = Body(...),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update a saved travel suitcase (edit packing list, outfits, etc.)."""
    user_id = current_user.id

    # Check pro access
    check_pro_access(current_user)

    # Filter out None values
    suitcase_data = {k: v for k, v in suitcase.model_dump().items() if v is not None}

    if len(suitcase_data) >= 1:
        suitcase_data["updated_at"] = datetime.now(timezone.utc)

        # Validate packing list items if being updated
        if "packing_list" in suitcase_data:
            for pack_item in suitcase_data["packing_list"]:
                item_id = pack_item.get("item_id") if isinstance(pack_item, dict) else pack_item.item_id
                item = await db.clothing.find_one({"_id": ObjectId(item_id), "user_id": user_id})
                if item is None:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Clothing item {item_id} not found in user's wardrobe"
                    )

        # Convert nested Pydantic models to dicts
        if "packing_list" in suitcase_data:
            suitcase_data["packing_list"] = [
                p.model_dump() if hasattr(p, 'model_dump') else p
                for p in suitcase_data["packing_list"]
            ]
        if "daily_outfits" in suitcase_data:
            suitcase_data["daily_outfits"] = [
                o.model_dump() if hasattr(o, 'model_dump') else o
                for o in suitcase_data["daily_outfits"]
            ]
        if "destination_summary" in suitcase_data and suitcase_data["destination_summary"]:
            if hasattr(suitcase_data["destination_summary"], 'model_dump'):
                suitcase_data["destination_summary"] = suitcase_data["destination_summary"].model_dump()

        update_result = await db.travel_suitcases.update_one(
            {"_id": ObjectId(id), "user_id": user_id},
            {"$set": suitcase_data}
        )

        if update_result.modified_count == 1:
            updated = await db.travel_suitcases.find_one({"_id": ObjectId(id)})
            if updated:
                updated["_id"] = str(updated["_id"])
                return updated

    existing = await db.travel_suitcases.find_one({"_id": ObjectId(id), "user_id": user_id})
    if existing:
        existing["_id"] = str(existing["_id"])
        return existing

    raise HTTPException(status_code=404, detail=f"Suitcase {id} not found or not owned by user")


@router.delete("/{id}", response_description="Delete a suitcase")
async def delete_suitcase(
    id: str,
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a saved travel suitcase."""
    user_id = current_user.id

    # Check ownership
    suitcase = await db.travel_suitcases.find_one({"_id": ObjectId(id), "user_id": user_id})
    if not suitcase:
        raise HTTPException(status_code=404, detail=f"Suitcase {id} not found")

    delete_result = await db.travel_suitcases.delete_one({"_id": ObjectId(id)})

    if delete_result.deleted_count == 1:
        return JSONResponse(status_code=204, content=None)

    raise HTTPException(status_code=500, detail="Failed to delete suitcase")
