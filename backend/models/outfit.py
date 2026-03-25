from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from bson import ObjectId
from .clothing import PyObjectId

class OutfitBase(BaseModel):
    name: str
    style_id: str
    items: List[str]  # References to clothing items
    occasion: str
    weather: str  # e.g., "hot", "cold", "rainy"
    ai_generated_reasoning: Optional[str] = None
    notes: Optional[str] = None  # Additional notes about the outfit

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Casual Summer Day",
                "style_id": "60d21b4967d0d8992e610c85",
                "items": ["60d21b4967d0d8992e610c86", "60d21b4967d0d8992e610c87"],
                "occasion": "casual hangout",
                "weather": "hot",
                "ai_generated_reasoning": "This outfit combines light, breathable fabrics in a streetwear style suitable for hot weather."
            }
        }

class Outfit(OutfitBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    visualization_key: Optional[str] = None  # S3 key for the outfit visualization image
    visualization_url: Optional[str] = None  # Full URL for the outfit visualization image
    visualization_status: Optional[Literal["none", "pending", "completed", "failed"]] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class OutfitCreate(OutfitBase):
    pass

class OutfitGenRequest(BaseModel):
    style_id: str
    occasion: str
    weather: str
    description: Optional[str] = None
    required_items: List[str] = []  # IDs of 0-2 required clothing items
    exclude_items: List[str] = []   # IDs of items to exclude
    num_outfits: int = 3
    model: Optional[str] = None  # OpenRouter model ID

    class Config:
        json_schema_extra = {
            "example": {
                "style_id": "60d21b4967d0d8992e610c85",
                "occasion": "casual dinner",
                "weather": "mild",
                "description": "Something with a vintage vibe",
                "required_items": ["60d21b4967d0d8992e610c86"],
                "num_outfits": 3,
                "model": "anthropic/claude-sonnet-4.6"
            }
        }

class OutfitUpdate(BaseModel):
    name: Optional[str] = None
    style_id: Optional[str] = None
    items: Optional[List[str]] = None
    occasion: Optional[str] = None
    weather: Optional[str] = None
    ai_generated_reasoning: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Updated Outfit Name",
                "notes": "Added a new accessory to the outfit."
            }
        }