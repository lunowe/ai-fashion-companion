from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime
from .clothing import PyObjectId
from bson import ObjectId

class UserProfileBase(BaseModel):
    preferences: Dict[str, List[str]] = Field(default_factory=dict)
    # Example: {"preferred_colors": ["black", "navy"], "disliked_colors": ["yellow"], "preferred_fits": ["oversized"]}
    style_notes: Optional[str] = None
    sizes: Dict[str, str] = Field(default_factory=dict)
    # Example: {"top": "M", "bottom": "32", "shoes": "42"}

    class Config:
        json_schema_extra = {
            "example": {
                "preferences": {
                    "preferred_colors": ["black", "white"],
                    "disliked_colors": ["neon"],
                    "preferred_fits": ["relaxed"]
                },
                "style_notes": "I prefer minimalist styles.",
                "sizes": {"top": "L", "bottom": "34"}
            }
        }

class UserProfile(UserProfileBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserProfileUpdate(BaseModel):
    preferences: Optional[Dict[str, List[str]]] = None
    style_notes: Optional[str] = None
    sizes: Optional[Dict[str, str]] = None
