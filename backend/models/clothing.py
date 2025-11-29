from pydantic import BaseModel, Field, GetJsonSchemaHandler
from pydantic_core import CoreSchema
from typing import List, Optional, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(BaseModel):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(
        cls, core_schema: CoreSchema, handler: GetJsonSchemaHandler
    ) -> dict[str, Any]:
        json_schema = super().__get_pydantic_json_schema__(core_schema, handler)
        json_schema = handler.resolve_ref_schema(json_schema)
        json_schema.update(type="string")
        return json_schema

class ClothingBase(BaseModel):
    type: str  # e.g., "t-shirt", "jeans", "sweater"
    category: str  # e.g., "top", "bottom", "outerwear"
    fit: str  # "slim", "regular/straight", "loose/baggy/oversized"
    color: str
    color_code: Optional[str] = None  # e.g., hex code like "#FFFFFF"
    seasons: List[str] = []  # e.g., ["spring", "summer"]
    image_url: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "type": "t-shirt",
                "category": "top",
                "fit": "oversized",
                "color": "white",
                "color_code": "#FFFFFF",
                "seasons": ["spring", "summer", "fall"],
                "image_url": "",
                "notes": "A comfortable white oversized t-shirt."
            }
        }

class ClothingItem(ClothingBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ClothingCreate(ClothingBase):
    pass

class ClothingUpdate(BaseModel):
    type: Optional[str] = None
    category: Optional[str] = None
    fit: Optional[str] = None
    color: Optional[str] = None
    color_code: Optional[str] = None
    seasons: Optional[List[str]] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}