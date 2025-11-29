from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class InviteCode(BaseModel):
    code: str
    is_used: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    used_at: Optional[datetime] = None
    used_by: Optional[str] = None  # User ID or username
