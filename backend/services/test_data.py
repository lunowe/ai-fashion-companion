import json
from fastapi import Depends, APIRouter, Request
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from database import get_database

router = APIRouter()

# Predefined test wardrobe items
TEST_WARDROBE = [
    # Tops
    {"type": "t-shirt", "category": "top", "fit": "oversized", "color": "white", "seasons": ["spring", "summer", "fall"]},
    {"type": "t-shirt", "category": "top", "fit": "slim", "color": "black", "seasons": ["spring", "summer", "fall", "winter"]},
    {"type": "t-shirt", "category": "top", "fit": "regular", "color": "navy", "seasons": ["spring", "summer", "fall"]},
    {"type": "long-sleeve", "category": "top", "fit": "regular", "color": "gray", "seasons": ["fall", "winter"]},
    {"type": "long-sleeve", "category": "top", "fit": "oversized", "color": "black", "seasons": ["fall", "winter"]},
    {"type": "button-up", "category": "top", "fit": "slim", "color": "white", "seasons": ["spring", "summer", "fall", "winter"]},
    {"type": "button-up", "category": "top", "fit": "regular", "color": "light blue", "seasons": ["spring", "summer", "fall"]},
    {"type": "polo", "category": "top", "fit": "slim", "color": "navy", "seasons": ["spring", "summer"]},
    {"type": "turtleneck", "category": "top", "fit": "slim", "color": "black", "seasons": ["fall", "winter"]},
    
    # Bottoms
    {"type": "jeans", "category": "bottom", "fit": "slim", "color": "indigo", "seasons": ["spring", "fall", "winter"]},
    {"type": "jeans", "category": "bottom", "fit": "regular", "color": "black", "seasons": ["spring", "fall", "winter"]},
    {"type": "chinos", "category": "bottom", "fit": "slim", "color": "beige", "seasons": ["spring", "summer", "fall"]},
    {"type": "chinos", "category": "bottom", "fit": "regular", "color": "navy", "seasons": ["spring", "summer", "fall"]},
    {"type": "shorts", "category": "bottom", "fit": "regular", "color": "khaki", "seasons": ["spring", "summer"]},
    {"type": "shorts", "category": "bottom", "fit": "slim", "color": "black", "seasons": ["spring", "summer"]},
    {"type": "sweatpants", "category": "bottom", "fit": "loose", "color": "gray", "seasons": ["fall", "winter"]},
    {"type": "dress pants", "category": "bottom", "fit": "slim", "color": "black", "seasons": ["fall", "winter", "spring"]},
    
    # Outerwear
    {"type": "hoodie", "category": "outerwear", "fit": "oversized", "color": "black", "seasons": ["fall", "winter"]},
    {"type": "sweatshirt", "category": "outerwear", "fit": "oversized", "color": "gray", "seasons": ["fall", "winter"]},
    {"type": "cardigan", "category": "outerwear", "fit": "regular", "color": "navy", "seasons": ["fall", "winter"]},
    {"type": "denim jacket", "category": "outerwear", "fit": "regular", "color": "blue", "seasons": ["spring", "fall"]},
    {"type": "bomber jacket", "category": "outerwear", "fit": "regular", "color": "black", "seasons": ["fall", "winter"]},
    {"type": "blazer", "category": "outerwear", "fit": "slim", "color": "navy", "seasons": ["fall", "winter", "spring"]},
    {"type": "parka", "category": "outerwear", "fit": "oversized", "color": "green", "seasons": ["winter"]},
    
    # Footwear
    {"type": "sneakers", "category": "footwear", "fit": "regular", "color": "white", "seasons": ["spring", "summer", "fall"]},
    {"type": "sneakers", "category": "footwear", "fit": "regular", "color": "black", "seasons": ["spring", "summer", "fall", "winter"]},
    {"type": "boots", "category": "footwear", "fit": "regular", "color": "brown", "seasons": ["fall", "winter"]},
    {"type": "loafers", "category": "footwear", "fit": "regular", "color": "brown", "seasons": ["spring", "summer", "fall"]},
    {"type": "dress shoes", "category": "footwear", "fit": "regular", "color": "black", "seasons": ["fall", "winter", "spring", "summer"]},
    
    # Accessories
    {"type": "beanie", "category": "accessory", "fit": "regular", "color": "black", "seasons": ["fall", "winter"]},
    {"type": "belt", "category": "accessory", "fit": "regular", "color": "black", "seasons": ["spring", "summer", "fall", "winter"]},
    {"type": "watch", "category": "accessory", "fit": "regular", "color": "silver", "seasons": ["spring", "summer", "fall", "winter"]},
]

# Predefined styles
PREDEFINED_STYLES = [
    {
        "name": "Streetwear",
        "description": "Urban casual style with oversized silhouettes and bold expression",
        "is_custom": False,
        "style_prompt": "Create an outfit that embodies modern streetwear aesthetics. Favor oversized or loose fits, layering, and a balance of comfort and style. Focus on urban silhouettes, casual statement pieces, and a contemporary approach to everyday clothing. Consider sneakers as the primary footwear option."
    },
    {
        "name": "Business Casual",
        "description": "Professional style that balances formal and relaxed elements",
        "is_custom": False,
        "style_prompt": "Create a business casual outfit that's appropriate for a professional setting while still being comfortable. Balance formal elements (like button-ups, blazers, chinos) with more relaxed pieces. Maintain a clean, put-together appearance while avoiding overly casual items like t-shirts or athletic wear. Focus on slim or regular fits rather than oversized items."
    },
    {
        "name": "Minimalist",
        "description": "Clean, simple style with neutral colors and essential pieces",
        "is_custom": False,
        "style_prompt": "Create a minimalist outfit focusing on clean lines, simple silhouettes, and a restrained color palette (primarily black, white, gray, navy, and beige). Avoid bold patterns or excessive accessories. Each item should serve a purpose, with an emphasis on quality basics rather than trend-driven pieces. The overall effect should be understated, sophisticated, and timeless."
    },
    {
        "name": "Scandinavian",
        "description": "Functional, clean style with a focus on layering and neutral tones",
        "is_custom": False,
        "style_prompt": "Create an outfit inspired by Scandinavian/Nordic fashion. Focus on practical, functional clothing with clean lines and a muted color palette. Incorporate layering for both style and practicality. Balance minimalism with subtle unique elements. The outfit should feel effortless, comfortable, and quietly confident rather than overtly trendy or attention-seeking."
    },
    {
        "name": "Smart Casual",
        "description": "Elegant but relaxed style bridging formal and casual wear",
        "is_custom": False,
        "style_prompt": "Create a smart casual outfit that strikes a balance between formal and casual elements. Combine more elevated pieces (like blazers, button-ups, chinos) with relaxed items, but maintain a polished overall appearance. Avoid anything too formal (suits) or too casual (athletic wear, distressed items). The outfit should be appropriate for upscale restaurants, cultural events, or semi-formal social gatherings."
    },
    {
        "name" : "Starboy",
        "description": "A style inspired by The Weeknd's 'Starboy' era, featuring sleek, edgy pieces with a modern urban vibe.",
        "is_custom": False,
        "style_prompt": "Create an outfit that embodies the sleek, edgy aesthetic of The Weeknd's 'Starboy' era. Focus on modern urban pieces with a mix of high fashion and streetwear influences. Incorporate leather jackets, fitted turtlenecks, tailored trousers, and statement footwear. The color palette should be dark and moody, with pops of metallic or bold accents. Aim for a look that is both stylish and slightly mysterious."
    }
]

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