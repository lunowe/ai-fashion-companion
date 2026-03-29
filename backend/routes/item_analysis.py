from fastapi import APIRouter, Body, Depends, HTTPException
from typing import Optional
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from models.user import UserResponse
from database import get_database
from services.item_analyzer import ItemAnalyzer
from services.usage_limiter import require_item_analysis

router = APIRouter()
item_analyzer = ItemAnalyzer()


# ─── Request Models ────────────────────────────────────────────────

class ClosetCheckRequest(BaseModel):
    image_base64: str
    model: Optional[str] = None


class StylePieceRequest(BaseModel):
    image_base64: str
    style_id: Optional[str] = None
    occasion: Optional[str] = None
    weather: Optional[str] = None
    num_outfits: int = 3
    model: Optional[str] = None


# ─── Endpoints ─────────────────────────────────────────────────────

@router.post("/closet-check", response_description="Check if a clothing item fits your closet")
async def closet_check(
    request: ClosetCheckRequest = Body(...),
    current_user: UserResponse = Depends(require_item_analysis),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Analyze a photo of a clothing item and evaluate how well it fits
    the user's existing wardrobe.
    """
    user_id = current_user.id
    user_role = current_user.role

    # Get user's wardrobe
    wardrobe_items = await db.clothing.find({"user_id": user_id}).to_list(1000)
    if not wardrobe_items:
        raise HTTPException(status_code=400, detail="You need clothing items in your wardrobe first")

    # Get user preferences
    user_profile = await db.user_profiles.find_one({"user_id": user_id})
    user_preferences = user_profile.get("preferences", {}) if user_profile else {}
    if user_profile:
        user_preferences["style_notes"] = user_profile.get("style_notes", "")

    # Resolve API key
    api_key = current_user.api_key if user_role == "byok" else None

    try:
        # Step 1: Analyze the item from the photo
        analyzed_item = await item_analyzer.analyze_item(
            image_base64=request.image_base64,
            model=request.model,
            api_key=api_key,
        )

        # Step 2: Check closet compatibility
        closet_check_result = await item_analyzer.check_closet_fit(
            analyzed_item=analyzed_item,
            wardrobe_items=wardrobe_items,
            user_preferences=user_preferences,
            model=request.model,
            api_key=api_key,
        )

        # Increment usage count
        await require_item_analysis.increment(user_id, db)

        return {
            "analyzed_item": analyzed_item,
            "closet_check": closet_check_result,
        }

    except Exception as e:
        print(f"[ItemAnalysis] Error in closet-check: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to analyze item: {str(e)}")


@router.post("/style-piece", response_description="Style a clothing item with your closet")
async def style_piece(
    request: StylePieceRequest = Body(...),
    current_user: UserResponse = Depends(require_item_analysis),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Analyze a photo of a clothing item and generate outfit suggestions
    combining it with pieces from the user's existing wardrobe.
    """
    user_id = current_user.id
    user_role = current_user.role

    # Get user's wardrobe
    wardrobe_items = await db.clothing.find({"user_id": user_id}).to_list(1000)
    if not wardrobe_items:
        raise HTTPException(status_code=400, detail="You need clothing items in your wardrobe first")

    # Get style if provided
    style = None
    if request.style_id:
        style = await db.styles.find_one({"_id": ObjectId(request.style_id)})
        if style is None:
            raise HTTPException(status_code=404, detail=f"Style {request.style_id} not found")

    # Get user preferences
    user_profile = await db.user_profiles.find_one({"user_id": user_id})
    user_preferences = user_profile.get("preferences", {}) if user_profile else {}
    if user_profile:
        user_preferences["style_notes"] = user_profile.get("style_notes", "")

    # Resolve API key
    api_key = current_user.api_key if user_role == "byok" else None

    try:
        # Step 1: Analyze the item from the photo
        analyzed_item = await item_analyzer.analyze_item(
            image_base64=request.image_base64,
            model=request.model,
            api_key=api_key,
        )

        # Step 2: Generate outfit suggestions
        outfits = await item_analyzer.style_with_closet(
            analyzed_item=analyzed_item,
            wardrobe_items=wardrobe_items,
            style=style,
            occasion=request.occasion,
            weather=request.weather,
            user_preferences=user_preferences,
            num_outfits=request.num_outfits,
            model=request.model,
            api_key=api_key,
        )

        if not outfits:
            raise HTTPException(status_code=500, detail="Failed to generate outfit suggestions")

        # Increment usage count
        await require_item_analysis.increment(user_id, db)

        return {
            "analyzed_item": analyzed_item,
            "outfits": outfits,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ItemAnalysis] Error in style-piece: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to style item: {str(e)}")
