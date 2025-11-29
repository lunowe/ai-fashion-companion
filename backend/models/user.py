from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: str
    role: str = "free"  # free, premium, byok

class UserCreate(UserBase):
    password: str
    invite_code: str

class UserInDB(UserBase):
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    disabled: bool = False
    generation_count: int = 0
    last_reset_date: datetime = Field(default_factory=datetime.utcnow)
    api_key: Optional[str] = None

class UserResponse(UserBase):
    id: str
    created_at: datetime
    generation_count: int = 0
    last_reset_date: datetime
    api_key: Optional[str] = None

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
