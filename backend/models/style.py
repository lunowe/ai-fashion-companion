from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from .clothing import PyObjectId

class StyleBase(BaseModel):
    name: str
    description: str
    is_custom: bool = False
    reference_images: Optional[List[str]] = []
    style_prompt: str  # Natural language description for AI

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Streetwear",
                "description": "Urban casual style with oversized fits and bold colors",
                "is_custom": False,
                "reference_images": [],
                "style_prompt": "Create a modern streetwear outfit with loose fitting items and urban aesthetic"
            }
        }

class Style(StyleBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: Optional[PyObjectId] = None  # None for predefined styles
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class StyleCreate(StyleBase):
    pass

class StyleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    reference_images: Optional[List[str]] = None
    style_prompt: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}