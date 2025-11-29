from fastapi import APIRouter, Body, Depends, Request
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from database import get_database
from services.test_data import TEST_WARDROBE, PREDEFINED_STYLES

router = APIRouter()

@router.post("/initialize", response_description="Initialize test data")
async def initialize_test_data(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = "placeholder_user_id"
    results = {"inserted_items": 0, "inserted_styles": 0}
    
    # Add test wardrobe items
    for item in TEST_WARDROBE:
        item_data = item.copy()
        item_data["user_id"] = user_id
        await db.clothing.insert_one(item_data)
        results["inserted_items"] += 1
    
    # Add predefined styles (if they don't exist)
    for style in PREDEFINED_STYLES:
        existing = await db.styles.find_one({"name": style["name"], "user_id": None})
        if not existing:
            style_data = style.copy()
            await db.styles.insert_one(style_data)
            results["inserted_styles"] += 1
    
    return JSONResponse(
        content={
            "message": "Test data initialized successfully",
            "wardrobe_items_added": results["inserted_items"],
            "styles_added": results["inserted_styles"]
        }
    )

@router.get("/wardrobe", response_description="Get test wardrobe definition")
async def get_test_wardrobe():
    return TEST_WARDROBE

@router.get("/styles", response_description="Get predefined styles definition")
async def get_predefined_styles():
    return PREDEFINED_STYLES

@router.delete("/clear", response_description="Clear test data")
async def clear_test_data(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = "placeholder_user_id"
    
    # Delete all user's clothing items
    clothing_result = await db.clothing.delete_many({"user_id": user_id})
    
    # Delete only custom styles, leave predefined styles
    styles_result = await db.styles.delete_many({"user_id": user_id})
    
    # Delete all user's outfits
    outfits_result = await db.outfits.delete_many({"user_id": user_id})
    
    return JSONResponse(
        content={
            "message": "Test data cleared successfully",
            "clothing_items_deleted": clothing_result.deleted_count,
            "custom_styles_deleted": styles_result.deleted_count,
            "outfits_deleted": outfits_result.deleted_count
        }
    )