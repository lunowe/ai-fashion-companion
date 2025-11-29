from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str
    invite_code: str

class UserInDB(UserBase):
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    disabled: bool = False

class UserResponse(UserBase):
    id: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
