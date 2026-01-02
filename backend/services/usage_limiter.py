# services/usage_limiter.py
from datetime import datetime, timezone
from enum import Enum
from fastapi import HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from models.user import UserResponse, UsageCounts
from database import get_database
from utils.auth import get_current_user


class FeatureType(str, Enum):
    OUTFIT_GEN = "outfit_generation"
    SUITCASE_GEN = "suitcase_generation"
    VISUALIZATION = "visualization"
    WARDROBE_SIZE = "wardrobe_size"
    SAVED_OUTFITS = "saved_outfits"
    CUSTOM_STYLES = "custom_styles"


FEATURE_LIMITS = {
    FeatureType.OUTFIT_GEN: {"free": 5, "premium": 50, "byok": float("inf")},
    FeatureType.SUITCASE_GEN: {"free": 0, "premium": 10, "byok": float("inf")},
    FeatureType.VISUALIZATION: {"free": 3, "premium": 15, "byok": float("inf")},
    FeatureType.WARDROBE_SIZE: {"free": 75, "premium": 250, "byok": float("inf")},
    FeatureType.SAVED_OUTFITS: {"free": 15, "premium": float("inf"), "byok": float("inf")},
    FeatureType.CUSTOM_STYLES: {"free": 1, "premium": 10, "byok": float("inf")},
}


class UsageLimiter:
    def __init__(self, feature: FeatureType):
        self.feature = feature

    async def __call__(
        self,
        current_user: UserResponse = Depends(get_current_user),
        db: AsyncIOMotorDatabase = Depends(get_database),
    ) -> UserResponse:
        user_id = current_user.id
        now = datetime.now(timezone.utc)

        # Daily reset
        if current_user.last_reset_date.date() < now.date():
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {
                    "usage_counts": UsageCounts().model_dump(),
                    "last_reset_date": now
                }}
            )
            current_user.usage_counts = UsageCounts()

        # Get current count for this feature
        current_count = getattr(current_user.usage_counts, self.feature.value, 0)
        limit = FEATURE_LIMITS.get(self.feature, {}).get(current_user.role, 0)

        if limit == 0:
            raise HTTPException(403, f"{self.feature.value} requires a premium plan.")

        if current_count >= limit:
            raise HTTPException(
                403,
                f"Daily limit reached for {self.feature.value} ({int(current_count)}/{int(limit)})"
            )

        return current_user

    async def increment(self, user_id: str, db: AsyncIOMotorDatabase):
        """Increment the specific feature counter."""
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {f"usage_counts.{self.feature.value}": 1}}
        )


# Pre-built dependencies
require_outfit_gen = UsageLimiter(FeatureType.OUTFIT_GEN)
require_suitcase_gen = UsageLimiter(FeatureType.SUITCASE_GEN)
require_visualization = UsageLimiter(FeatureType.VISUALIZATION)