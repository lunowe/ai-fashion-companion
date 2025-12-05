from fastapi import APIRouter, HTTPException, Body, status, Depends
from fastapi.encoders import jsonable_encoder
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId

from models.catalog import CatalogItemCreate, CatalogItemUpdate, CatalogItemResponse
from database import get_database
from utils.auth import get_current_user 


router = APIRouter()

@router.post("/", response_description="Add new catalog definition", response_model=CatalogItemResponse)
async def create_catalog_item(item: CatalogItemCreate = Body(...), current_user: str = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Create a new item definition in the fashion ontology.
    """
    item_data = jsonable_encoder(item)
    
    # Optional: Check for duplicates to prevent two "t-shirt" entries in "tops"
    existing = await db.catalog_items.find_one({
        "category": item.category, 
        "type": item.type
    })
    if existing:
        raise HTTPException(status_code=400, detail=f"Item '{item.type}' already exists in category '{item.category}'")

    new_item = await db.catalog_items.insert_one(item_data)
    created_item = await db.catalog_items.find_one({"_id": new_item.inserted_id})
    return created_item

@router.get("/", response_description="List all catalog definitions", response_model=List[CatalogItemResponse])
async def list_catalog_items(category: str | None = None, current_user: str = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Get all defined items. Optional filtering by category (e.g., ?category=tops).
    The frontend will group these, so we send a flat list.
    """
    query = {}
    if category:
        query["category"] = category
        
    items = await db.catalog_items.find(query).to_list(1000)
    return items

@router.get("/{id}", response_description="Get a single catalog definition", response_model=CatalogItemResponse)
async def show_catalog_item(id: str, current_user: str = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID format")
        
    if (item := await db.catalog_items.find_one({"_id": ObjectId(id)})) is not None:
        return item

    raise HTTPException(status_code=404, detail=f"Catalog item {id} not found")

@router.put("/{id}", response_description="Update a catalog definition", response_model=CatalogItemResponse)
async def update_catalog_item(id: str, item: CatalogItemUpdate = Body(...), current_user: str = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID format")

    # Filter out None values to only update what was sent
    update_data = {k: v for k, v in item.model_dump(exclude_unset=True).items()}

    if len(update_data) >= 1:
        update_result = await db.catalog_items.update_one(
            {"_id": ObjectId(id)}, 
            {"$set": update_data}
        )

        if update_result.modified_count == 1:
            if (updated_item := await db.catalog_items.find_one({"_id": ObjectId(id)})) is not None:
                return updated_item

    # If no existing item found or nothing modified (but item exists)
    if (existing_item := await db.catalog_items.find_one({"_id": ObjectId(id)})) is not None:
        return existing_item

    raise HTTPException(status_code=404, detail=f"Catalog item {id} not found")

@router.delete("/{id}", response_description="Delete a catalog definition")
async def delete_catalog_item(id: str, current_user: str = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID format")
        
    delete_result = await db.catalog_items.delete_one({"_id": ObjectId(id)})

    if delete_result.deleted_count == 1:
        return {"message": "Item definition deleted successfully"}

    raise HTTPException(status_code=404, detail=f"Catalog item {id} not found")

# --- UTILITY: Seed Endpoint ---
# Useful for initializing your DB with the base categories you hardcoded before.
@router.post("/seed", status_code=201)
async def seed_catalog(current_user: str = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Initialize the database with default data.
    Only runs if collection is empty.
    """
    count = await db.catalog_items.count_documents({})
    if count > 0:
        return {"message": "Catalog already contains data. Seed skipped."}

    # The base data structure from your previous frontend code
    initial_data = [
        {
            "category": "tops", "type": "t-shirt", "icon": "👕",
            "allowed_colors": ["black", "white", "grey", "navy", "red", "green", "beige", "brown"],
            "allowed_fits": ["slim", "regular", "oversized", "cropped"],
            "allowed_materials": ["cotton", "polyester", "blend"]
        },
        {
            "category": "tops", "type": "dress shirt", "icon": "👔",
            "allowed_colors": ["white", "light blue", "pink", "lavender", "grey"],
            "allowed_fits": ["slim", "regular", "relaxed"],
            "allowed_materials": ["cotton", "linen", "poplin"]
        },
        {
            "category": "bottoms", "type": "jeans", "icon": "👖",
            "allowed_colors": ["black", "blue", "light blue", "grey"],
            "allowed_fits": ["slim", "straight", "relaxed", "wide"],
            "allowed_materials": ["denim"]
        },
        {
            "category": "shoes", "type": "sneakers", "icon": "👟",
            "allowed_colors": ["white", "black", "grey", "navy"],
            "allowed_fits": ["low-top", "high-top"],
            "allowed_materials": ["leather", "canvas", "suede"]
        }
    ]
    
    await db.catalog_items.insert_many(initial_data)
    return {"message": f"Seeded {len(initial_data)} items successfully"}