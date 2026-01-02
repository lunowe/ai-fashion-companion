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
    """Daily usage features (reset daily)"""
    OUTFIT_GEN = "outfit_generation"
    SUITCASE_GEN = "suitcase_generation"
    VISUALIZATION = "visualization"


class ResourceType(str, Enum):
    """Resource limits (total counts, not daily)"""
    WARDROBE_SIZE = "wardrobe_size"
    SAVED_OUTFITS = "saved_outfits"
    CUSTOM_STYLES = "custom_styles"


# Daily limits (reset each day)
FEATURE_LIMITS = {
    FeatureType.OUTFIT_GEN: {"free": 5, "premium": 50, "byok": float("inf")},
    FeatureType.SUITCASE_GEN: {"free": 0, "premium": 10, "byok": float("inf")},
    FeatureType.VISUALIZATION: {"free": 3, "premium": 15, "byok": float("inf")},
}

# Resource limits (total counts)
RESOURCE_LIMITS = {
    ResourceType.WARDROBE_SIZE: {"free": 75, "premium": 250, "byok": float("inf")},
    ResourceType.SAVED_OUTFITS: {"free": 15, "premium": float("inf"), "byok": float("inf")},
    ResourceType.CUSTOM_STYLES: {"free": 1, "premium": 10, "byok": float("inf")},
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


class ResourceLimiter:
    """
    Checks resource limits based on total counts in the database.
    Unlike UsageLimiter, these don't reset daily.
    """
    def __init__(self, resource: ResourceType, collection: str, count_field: str = "user_id"):
        self.resource = resource
        self.collection = collection
        self.count_field = count_field

    async def check_limit(
        self,
        current_user: UserResponse,
        db: AsyncIOMotorDatabase,
    ) -> tuple[int, int]:
        """
        Check if user is within their resource limit.
        Returns (current_count, limit) tuple.
        Raises HTTPException if limit reached.
        """
        user_id = current_user.id
        limit = RESOURCE_LIMITS.get(self.resource, {}).get(current_user.role, 0)
        
        # Count existing resources for this user
        current_count = await db[self.collection].count_documents({self.count_field: user_id})
        
        if limit != float("inf") and current_count >= limit:
            raise HTTPException(
                403,
                f"Resource limit reached for {self.resource.value}. "
                f"You have {current_count}/{int(limit)} items. "
                f"Upgrade your plan for more capacity."
            )
        
        return current_count, limit

    def get_limit(self, role: str) -> int:
        """Get the limit for a specific role."""
        return RESOURCE_LIMITS.get(self.resource, {}).get(role, 0)


# Pre-built daily usage dependencies
require_outfit_gen = UsageLimiter(FeatureType.OUTFIT_GEN)
require_suitcase_gen = UsageLimiter(FeatureType.SUITCASE_GEN)
require_visualization = UsageLimiter(FeatureType.VISUALIZATION)

# Pre-built resource limiters
wardrobe_limiter = ResourceLimiter(ResourceType.WARDROBE_SIZE, "clothing")
saved_outfits_limiter = ResourceLimiter(ResourceType.SAVED_OUTFITS, "outfits")
custom_styles_limiter = ResourceLimiter(ResourceType.CUSTOM_STYLES, "styles")
require_visualization = UsageLimiter(FeatureType.VISUALIZATION)