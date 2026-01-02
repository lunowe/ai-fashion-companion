# utils/user_helpers.py
from models.user import UserResponse, UsageCounts
from datetime import datetime, timezone

def user_doc_to_response(doc: dict) -> UserResponse:
    """Convert MongoDB user document to UserResponse."""
    return UserResponse(
        id=str(doc["_id"]),
        username=doc["username"],
        email=doc["email"],
        created_at=doc["created_at"],
        role=doc.get("role", "free"),
        usage_counts=UsageCounts(**doc.get("usage_counts", {})),
        last_reset_date=doc.get("last_reset_date", datetime.now(timezone.utc)),
        api_key=doc.get("api_key")
    )