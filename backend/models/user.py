from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime, timezone


class UsageCounts(BaseModel):
    """Per-feature usage tracking"""
    outfit_generation: int = 0
    suitcase_generation: int = 0
    visualization: int = 0
    item_analysis: int = 0


class UserBase(BaseModel):
    username: str
    email: str
    role: str = "free"


class UserCreate(UserBase):
    password: str
    invite_code: str


class UserInDB(UserBase):
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    disabled: bool = False
    usage_counts: UsageCounts = Field(default_factory=UsageCounts)
    last_reset_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    api_key: Optional[str] = None
    generation_history: Optional[list] = []


class UserResponse(UserBase):
    id: str
    created_at: datetime
    usage_counts: UsageCounts = Field(default_factory=UsageCounts)
    last_reset_date: datetime
    api_key: Optional[str] = None


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None