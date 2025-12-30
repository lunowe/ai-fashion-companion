from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from .clothing import PyObjectId


class PackingItem(BaseModel):
    item_id: str
    reason: Optional[str] = None


class DailyOutfit(BaseModel):
    day: int
    date: Optional[str] = None
    occasion: str
    items: List[str]  # Clothing item IDs
    reasoning: Optional[str] = None


class DestinationSummary(BaseModel):
    weather: Optional[str] = None
    temperature_range: Optional[str] = None
    packing_notes: Optional[str] = None


class TravelSuitcaseBase(BaseModel):
    name: Optional[str] = None
    destination: str
    start_date: datetime
    end_date: datetime
    occasions: List[str]
    style_ids: List[str] = []  # 1-3 style IDs for cohesion
    destination_summary: Optional[DestinationSummary] = None
    packing_list: List[PackingItem] = []
    daily_outfits: List[DailyOutfit] = []
    versatility_insights: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Paris Spring Trip",
                "destination": "Paris, France",
                "start_date": "2025-03-15T00:00:00",
                "end_date": "2025-03-22T00:00:00",
                "occasions": ["Sightseeing", "Fine Dining", "Museum"],
                "style_ids": ["60d21b4967d0d8992e610c85"]
            }
        }


class TravelSuitcase(TravelSuitcaseBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class TravelSuitcaseCreate(BaseModel):
    """Used when saving a generated suitcase"""
    name: Optional[str] = None
    destination: str
    start_date: datetime
    end_date: datetime
    occasions: List[str]
    style_ids: List[str] = []
    destination_summary: Optional[DestinationSummary] = None
    packing_list: List[PackingItem] = []
    daily_outfits: List[DailyOutfit] = []
    versatility_insights: Optional[str] = None
    notes: Optional[str] = None


class TravelSuitcaseUpdate(BaseModel):
    """For partial updates"""
    name: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    occasions: Optional[List[str]] = None
    style_ids: Optional[List[str]] = None
    destination_summary: Optional[DestinationSummary] = None
    packing_list: Optional[List[PackingItem]] = None
    daily_outfits: Optional[List[DailyOutfit]] = None
    versatility_insights: Optional[str] = None
    notes: Optional[str] = None
