# routes/colors.py
from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId

from models.catalog import ColorCreate, ColorResponse
from database import get_database
from utils.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ColorResponse])
async def list_colors(
    family: str | None = None,
    current_user: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    query = {"family": family} if family else {}
    return await db.colors.find(query).sort("name", 1).to_list(500)

@router.post("/", response_model=ColorResponse)
async def create_color(
    color: ColorCreate,
    current_user: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Enforce unique slug
    if await db.colors.find_one({"slug": color.slug}):
        raise HTTPException(400, f"Color '{color.slug}' already exists")
    
    result = await db.colors.insert_one(color.model_dump())
    return await db.colors.find_one({"_id": result.inserted_id})

@router.delete("/{slug}")
async def delete_color(
    slug: str,
    current_user: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    result = await db.colors.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(404, "Color not found")
    return {"message": "Deleted"}

@router.post("/seed", status_code=201)
async def seed_colors(
    current_user: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if await db.colors.count_documents({}) > 0:
        return {"message": "Colors already seeded"}
    
    colors = [
        {"name": "Black", "slug": "black", "hex": "#000000", "family": "neutrals"},
        {"name": "White", "slug": "white", "hex": "#FFFFFF", "family": "neutrals"},
        {"name": "Grey", "slug": "grey", "hex": "#808080", "family": "neutrals"},
        {"name": "Charcoal", "slug": "charcoal", "hex": "#36454F", "family": "neutrals"},
        {"name": "Navy", "slug": "navy", "hex": "#000080", "family": "blues"},
        {"name": "Blue", "slug": "blue", "hex": "#2563EB", "family": "blues"},
        {"name": "Light Blue", "slug": "light-blue", "hex": "#93C5FD", "family": "blues"},
        {"name": "Red", "slug": "red", "hex": "#DC2626", "family": "reds"},
        {"name": "Burgundy", "slug": "burgundy", "hex": "#991B1B", "family": "reds"},
        {"name": "Green", "slug": "green", "hex": "#16A34A", "family": "greens"},
        {"name": "Olive", "slug": "olive", "hex": "#65A30D", "family": "greens"},
        {"name": "Brown", "slug": "brown", "hex": "#92400E", "family": "browns"},
        {"name": "Tan", "slug": "tan", "hex": "#D2B48C", "family": "browns"},
        {"name": "Beige", "slug": "beige", "hex": "#D4A574", "family": "browns"},
        {"name": "Khaki", "slug": "khaki", "hex": "#C7B299", "family": "browns"},
        {"name": "Camel", "slug": "camel", "hex": "#C19A6B", "family": "browns"},
    ]
    await db.colors.insert_many(colors)
    return {"message": f"Seeded {len(colors)} colors"}