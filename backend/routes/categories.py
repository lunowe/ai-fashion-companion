# routes/categories.py
from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId

from models.catalog import CategoryCreate, CategoryResponse
from database import get_database
from utils.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
async def list_categories(
    current_user: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    return await db.categories.find().sort("sort_order", 1).to_list(100)

@router.post("/", response_model=CategoryResponse)
async def create_category(
    category: CategoryCreate,
    current_user: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if await db.categories.find_one({"slug": category.slug}):
        raise HTTPException(400, f"Category '{category.slug}' exists")
    
    result = await db.categories.insert_one(category.model_dump())
    return await db.categories.find_one({"_id": result.inserted_id})

@router.put("/{id}", response_model=CategoryResponse)
async def update_category(
    id: str,
    updates: CategoryCreate,
    current_user: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if not ObjectId.is_valid(id):
        raise HTTPException(400, "Invalid ID")
    
    await db.categories.update_one(
        {"_id": ObjectId(id)},
        {"$set": updates.model_dump(exclude_unset=True)}
    )
    return await db.categories.find_one({"_id": ObjectId(id)})

@router.delete("/{id}")
async def delete_category(
    id: str,
    current_user: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Check if any catalog items use this category
    if await db.catalog_items.find_one({"category_id": id}):
        raise HTTPException(400, "Category has items, cannot delete")
    
    result = await db.categories.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

@router.post("/seed", status_code=201)
async def seed_categories(
    current_user: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if await db.categories.count_documents({}) > 0:
        return {"message": "Already seeded"}
    
    categories = [
        {"name": "Tops", "slug": "tops", "icon_id": "shirt", "sort_order": 1},
        {"name": "Sweaters & Knits", "slug": "sweaters", "icon_id": "sweater", "sort_order": 2},
        {"name": "Outerwear", "slug": "outerwear", "icon_id": "jacket", "sort_order": 3},
        {"name": "Bottoms", "slug": "bottoms", "icon_id": "pants", "sort_order": 4},
        {"name": "Shoes", "slug": "shoes", "icon_id": "sneaker", "sort_order": 5},
        {"name": "Accessories", "slug": "accessories", "icon_id": "watch", "sort_order": 6},
    ]
    await db.categories.insert_many(categories)
    return {"message": f"Seeded {len(categories)} categories"}