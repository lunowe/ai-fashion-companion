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
@router.post("/seed", status_code=201)
async def seed_catalog(
    current_user: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Initialize the database with comprehensive default catalog data.
    Only runs if collection is empty.
    """
    count = await db.catalog_items.count_documents({})
    if count > 0:
        return {"message": "Catalog already contains data. Seed skipped."}

    initial_data = [
        # === TOPS ===
        {
            "category": "tops",
            "type": "t-shirt",
            "icon_id": "tshirt",
            "icon_aspect_ratio": "landscape",
            "allowed_colors": ["black", "white", "grey", "navy", "red", "green", "beige", "brown", "light-blue"],
            "allowed_fits": ["slim", "regular", "oversized", "cropped"],
            "allowed_materials": ["cotton", "polyester", "blend"],
            "default_seasons": ["spring", "summer"],
            "formality_level": 2
        },
        {
            "category": "tops",
            "type": "dress shirt",
            "icon_id": "dress-shirt",
            "icon_aspect_ratio": "portrait",
            "allowed_colors": ["white", "light-blue", "pink", "lavender", "grey", "navy"],
            "allowed_fits": ["slim", "regular", "relaxed"],
            "allowed_materials": ["cotton", "linen", "poplin", "oxford"],
            "default_seasons": ["all"],
            "formality_level": 7
        },
        {
            "category": "tops",
            "type": "polo shirt",
            "icon_id": "polo",
            "icon_aspect_ratio": "landscape",
            "allowed_colors": ["white", "navy", "black", "green", "burgundy", "light-blue"],
            "allowed_fits": ["slim", "regular"],
            "allowed_materials": ["cotton", "pique"],
            "default_seasons": ["spring", "summer"],
            "formality_level": 4
        },
        {
            "category": "tops",
            "type": "henley",
            "icon_id": "henley",
            "icon_aspect_ratio": "portrait",
            "allowed_colors": ["white", "grey", "navy", "olive", "burgundy", "charcoal"],
            "allowed_fits": ["slim", "regular"],
            "allowed_materials": ["cotton", "waffle-knit", "thermal"],
            "default_seasons": ["fall", "winter"],
            "formality_level": 3
        },
        {
            "category": "tops",
            "type": "tank top",
            "icon_id": "tank",
            "icon_aspect_ratio": "portrait",
            "allowed_colors": ["white", "black", "grey", "navy"],
            "allowed_fits": ["slim", "regular", "oversized"],
            "allowed_materials": ["cotton", "blend"],
            "default_seasons": ["summer"],
            "formality_level": 1
        },
        
        # === SWEATERS ===
        {
            "category": "sweaters",
            "type": "crewneck sweater",
            "icon_id": "sweater-crew",
            "icon_aspect_ratio": "landscape",
            "allowed_colors": ["navy", "grey", "black", "camel", "burgundy", "forest", "cream"],
            "allowed_fits": ["slim", "regular", "oversized"],
            "allowed_materials": ["wool", "cashmere", "cotton", "merino", "blend"],
            "default_seasons": ["fall", "winter"],
            "formality_level": 5
        },
        {
            "category": "sweaters",
            "type": "v-neck sweater",
            "icon_id": "sweater-vneck",
            "icon_aspect_ratio": "landscape",
            "allowed_colors": ["navy", "charcoal", "burgundy", "camel", "grey"],
            "allowed_fits": ["slim", "regular"],
            "allowed_materials": ["wool", "merino", "cashmere"],
            "default_seasons": ["fall", "winter"],
            "formality_level": 6
        },
        {
            "category": "sweaters",
            "type": "cardigan",
            "icon_id": "cardigan",
            "icon_aspect_ratio": "portrait",
            "allowed_colors": ["navy", "grey", "camel", "black", "cream", "olive"],
            "allowed_fits": ["slim", "regular", "oversized"],
            "allowed_materials": ["wool", "cashmere", "cotton", "blend"],
            "default_seasons": ["fall", "winter", "spring"],
            "formality_level": 5
        },
        {
            "category": "sweaters",
            "type": "turtleneck",
            "icon_id": "turtleneck",
            "icon_aspect_ratio": "portrait",
            "allowed_colors": ["black", "cream", "grey", "navy", "camel", "burgundy"],
            "allowed_fits": ["slim", "regular"],
            "allowed_materials": ["wool", "cashmere", "merino", "cotton"],
            "default_seasons": ["fall", "winter"],
            "formality_level": 6
        },
        {
            "category": "sweaters",
            "type": "hoodie",
            "icon_id": "hoodie",
            "icon_aspect_ratio": "portrait",
            "allowed_colors": ["black", "grey", "navy", "white", "olive", "burgundy"],
            "allowed_fits": ["regular", "oversized"],
            "allowed_materials": ["cotton", "fleece", "blend"],
            "default_seasons": ["fall", "winter", "spring"],
            "formality_level": 2
        },
        {
            "category": "sweaters",
            "type": "quarter-zip",
            "icon_id": "quarter-zip",
            "icon_aspect_ratio": "portrait",
            "allowed_colors": ["navy", "grey", "black", "olive", "charcoal"],
            "allowed_fits": ["slim", "regular"],
            "allowed_materials": ["merino", "fleece", "cotton"],
            "default_seasons": ["fall", "winter", "spring"],
            "formality_level": 4
        },
        
        # === OUTERWEAR ===
        {
            "category": "outerwear",
            "type": "denim jacket",
            "icon_id": "jacket-denim",
            "icon_aspect_ratio": "portrait",
            "allowed_colors": ["blue", "light-blue", "black", "grey"],
            "allowed_fits": ["slim", "regular", "oversized"],
            "allowed_materials": ["denim"],
            "default_seasons": ["spring", "fall"],
            "formality_level": 3
        },
        {
            "category": "outerwear",
            "type": "bomber jacket",
            "icon_id": "jacket-bomber",
            "icon_aspect_ratio": "landscape",
            "allowed_colors": ["black", "navy", "olive", "burgundy", "khaki"],
            "allowed_fits": ["slim", "regular"],
            "allowed_materials": ["nylon", "leather", "suede", "satin"],
            "default_seasons": ["spring", "fall"],
            "formality_level": 4
        },
        {
            "category": "outerwear",
            "type": "leather jacket",
            "icon_id": "jacket-leather",
            "icon_aspect_ratio": "portrait",
            "allowed_colors": ["black", "brown", "tan", "burgundy"],
            "allowed_fits": ["slim", "regular"],
            "allowed_materials": ["leather", "faux-leather"],
            "default_seasons": ["fall", "winter", "spring"],
            "formality_level": 5
        },
        {
            "category": "outerwear",
            "type": "blazer",
            "icon_id": "blazer",
            "icon_aspect_ratio": "portrait",
            "allowed_colors": ["navy", "charcoal", "black", "grey", "camel", "tan"],
            "allowed_fits": ["slim", "regular", "relaxed"],
            "allowed_materials": ["wool", "cotton", "linen", "tweed"],
            "default_seasons": ["all"],
            "formality_level": 8
        },
        {
            "category": "outerwear",
            "type": "overcoat",
            "icon_id": "overcoat",
            "icon_aspect_ratio": "tall",
            "allowed_colors": ["black", "charcoal", "camel", "navy", "grey"],
            "allowed_fits": ["slim", "regular"],
            "allowed_materials": ["wool", "cashmere", "blend"],
            "default_seasons": ["fall", "winter"],
            "formality_level": 8
        },
        {
            "category": "outerwear",
            "type": "puffer jacket",
            "icon_id": "jacket-puffer",
            "icon_aspect_ratio": "portrait",
            "allowed_colors": ["black", "navy", "olive", "grey", "red"],
            "allowed_fits": ["regular", "oversized"],
            "allowed_materials": ["nylon", "polyester"],
            "default_seasons": ["winter"],
            "formality_level": 3
        },
        {
            "category": "outerwear",
            "type": "raincoat",
            "icon_id": "raincoat",
            "icon_aspect_ratio": "tall",
            "allowed_colors": ["navy", "black", "khaki", "olive"],
            "allowed_fits": ["regular", "relaxed"],
            "allowed_materials": ["polyester", "nylon", "gore-tex"],
            "default_seasons": ["spring", "fall"],
            "formality_level": 4
        },
        {
            "category": "outerwear",
            "type": "vest",
            "icon_id": "vest",
            "icon_aspect_ratio": "portrait",
            "allowed_colors": ["navy", "black", "grey", "olive", "charcoal"],
            "allowed_fits": ["slim", "regular"],
            "allowed_materials": ["down", "fleece", "wool"],
            "default_seasons": ["fall", "winter"],
            "formality_level": 4
        },
        
        # === BOTTOMS ===
        {
            "category": "bottoms",
            "type": "jeans",
            "icon_id": "jeans",
            "icon_aspect_ratio": "tall",
            "allowed_colors": ["blue", "light-blue", "black", "grey", "white"],
            "allowed_fits": ["slim", "straight", "relaxed", "wide", "skinny", "tapered"],
            "allowed_materials": ["denim"],
            "default_seasons": ["all"],
            "formality_level": 3
        },
        {
            "category": "bottoms",
            "type": "chinos",
            "icon_id": "chinos",
            "icon_aspect_ratio": "tall",
            "allowed_colors": ["khaki", "navy", "olive", "grey", "tan", "black", "white", "beige"],
            "allowed_fits": ["slim", "straight", "relaxed", "tapered"],
            "allowed_materials": ["cotton", "twill"],
            "default_seasons": ["all"],
            "formality_level": 5
        },
        {
            "category": "bottoms",
            "type": "dress pants",
            "icon_id": "trousers",
            "icon_aspect_ratio": "tall",
            "allowed_colors": ["charcoal", "navy", "black", "grey", "tan"],
            "allowed_fits": ["slim", "regular", "relaxed"],
            "allowed_materials": ["wool", "polyester", "blend"],
            "default_seasons": ["all"],
            "formality_level": 8
        },
        {
            "category": "bottoms",
            "type": "shorts",
            "icon_id": "shorts",
            "icon_aspect_ratio": "landscape",
            "allowed_colors": ["khaki", "navy", "olive", "white", "grey", "beige"],
            "allowed_fits": ["slim", "regular", "relaxed"],
            "allowed_materials": ["cotton", "linen", "blend"],
            "default_seasons": ["summer"],
            "formality_level": 2
        },
        {
            "category": "bottoms",
            "type": "joggers",
            "icon_id": "joggers",
            "icon_aspect_ratio": "tall",
            "allowed_colors": ["black", "grey", "navy", "olive"],
            "allowed_fits": ["slim", "regular", "tapered"],
            "allowed_materials": ["cotton", "fleece", "tech"],
            "default_seasons": ["all"],
            "formality_level": 1
        },
        {
            "category": "bottoms",
            "type": "cargo pants",
            "icon_id": "cargo",
            "icon_aspect_ratio": "tall",
            "allowed_colors": ["olive", "khaki", "black", "navy", "grey"],
            "allowed_fits": ["regular", "relaxed", "tapered"],
            "allowed_materials": ["cotton", "twill", "ripstop"],
            "default_seasons": ["all"],
            "formality_level": 2
        },
        
        # === SHOES ===
        {
            "category": "shoes",
            "type": "sneakers",
            "icon_id": "sneakers",
            "icon_aspect_ratio": "landscape",
            "allowed_colors": ["white", "black", "grey", "navy", "red", "green"],
            "allowed_fits": ["low-top", "high-top"],
            "allowed_materials": ["leather", "canvas", "suede", "mesh"],
            "default_seasons": ["all"],
            "formality_level": 2
        },
        {
            "category": "shoes",
            "type": "dress shoes",
            "icon_id": "oxford-shoes",
            "icon_aspect_ratio": "landscape",
            "allowed_colors": ["black", "brown", "tan", "burgundy"],
            "allowed_fits": ["oxford", "derby", "monk-strap"],
            "allowed_materials": ["leather"],
            "default_seasons": ["all"],
            "formality_level": 9
        },
        {
            "category": "shoes",
            "type": "loafers",
            "icon_id": "loafers",
            "icon_aspect_ratio": "landscape",
            "allowed_colors": ["black", "brown", "tan", "burgundy", "navy", "suede-grey"],
            "allowed_fits": ["penny", "tassel", "bit"],
            "allowed_materials": ["leather", "suede"],
            "default_seasons": ["spring", "summer", "fall"],
            "formality_level": 6
        },
        {
            "category": "shoes",
            "type": "boots",
            "icon_id": "boots",
            "icon_aspect_ratio": "portrait",
            "allowed_colors": ["black", "brown", "tan", "grey"],
            "allowed_fits": ["chelsea", "chukka", "lace-up", "hiking"],
            "allowed_materials": ["leather", "suede"],
            "default_seasons": ["fall", "winter"],
            "formality_level": 5
        },
        {
            "category": "shoes",
            "type": "sandals",
            "icon_id": "sandals",
            "icon_aspect_ratio": "landscape",
            "allowed_colors": ["black", "brown", "tan", "white"],
            "allowed_fits": ["slides", "flip-flops", "strappy"],
            "allowed_materials": ["leather", "rubber", "synthetic"],
            "default_seasons": ["summer"],
            "formality_level": 1
        },
        {
            "category": "shoes",
            "type": "running shoes",
            "icon_id": "running-shoes",
            "icon_aspect_ratio": "landscape",
            "allowed_colors": ["black", "white", "grey", "blue", "red", "neon"],
            "allowed_fits": ["neutral", "stability", "motion-control"],
            "allowed_materials": ["mesh", "synthetic", "knit"],
            "default_seasons": ["all"],
            "formality_level": 1
        },
        
        # === ACCESSORIES ===
        {
            "category": "accessories",
            "type": "watch",
            "icon_id": "watch",
            "icon_aspect_ratio": "square",
            "allowed_colors": ["silver", "gold", "black", "brown", "navy"],
            "allowed_fits": ["dress", "sport", "casual", "smart"],
            "allowed_materials": ["stainless-steel", "leather", "nato", "rubber"],
            "default_seasons": ["all"],
            "formality_level": 5
        },
        {
            "category": "accessories",
            "type": "belt",
            "icon_id": "belt",
            "icon_aspect_ratio": "landscape",
            "allowed_colors": ["black", "brown", "tan", "navy"],
            "allowed_fits": ["dress", "casual", "reversible"],
            "allowed_materials": ["leather", "suede", "canvas", "woven"],
            "default_seasons": ["all"],
            "formality_level": 5
        },
        {
            "category": "accessories",
            "type": "tie",
            "icon_id": "tie",
            "icon_aspect_ratio": "tall",
            "allowed_colors": ["navy", "burgundy", "grey", "black", "red", "blue"],
            "allowed_fits": ["standard", "slim", "knit"],
            "allowed_materials": ["silk", "wool", "cotton", "knit"],
            "default_seasons": ["all"],
            "formality_level": 9
        },
        {
            "category": "accessories",
            "type": "sunglasses",
            "icon_id": "sunglasses",
            "icon_aspect_ratio": "landscape",
            "allowed_colors": ["black", "tortoise", "gold", "silver", "brown"],
            "allowed_fits": ["aviator", "wayfarer", "round", "square", "clubmaster"],
            "allowed_materials": ["acetate", "metal", "titanium"],
            "default_seasons": ["spring", "summer"],
            "formality_level": 4
        },
        {
            "category": "accessories",
            "type": "scarf",
            "icon_id": "scarf",
            "icon_aspect_ratio": "landscape",
            "allowed_colors": ["grey", "navy", "burgundy", "camel", "black", "cream"],
            "allowed_fits": ["standard", "infinity", "blanket"],
            "allowed_materials": ["wool", "cashmere", "silk", "cotton"],
            "default_seasons": ["fall", "winter"],
            "formality_level": 5
        },
        {
            "category": "accessories",
            "type": "hat",
            "icon_id": "hat",
            "icon_aspect_ratio": "square",
            "allowed_colors": ["black", "navy", "grey", "khaki", "white"],
            "allowed_fits": ["baseball", "beanie", "fedora", "bucket"],
            "allowed_materials": ["cotton", "wool", "felt", "straw"],
            "default_seasons": ["all"],
            "formality_level": 3
        },
        {
            "category": "accessories",
            "type": "bag",
            "icon_id": "bag",
            "icon_aspect_ratio": "square",
            "allowed_colors": ["black", "brown", "tan", "navy", "grey"],
            "allowed_fits": ["backpack", "messenger", "tote", "briefcase", "weekender"],
            "allowed_materials": ["leather", "canvas", "nylon"],
            "default_seasons": ["all"],
            "formality_level": 5
        },
        {
            "category": "accessories",
            "type": "wallet",
            "icon_id": "wallet",
            "icon_aspect_ratio": "landscape",
            "allowed_colors": ["black", "brown", "tan", "navy"],
            "allowed_fits": ["bifold", "trifold", "card-holder", "money-clip"],
            "allowed_materials": ["leather", "canvas"],
            "default_seasons": ["all"],
            "formality_level": 5
        },
    ]

    await db.catalog_items.insert_many(initial_data)
    return {"message": f"Seeded {len(initial_data)} catalog items successfully"}