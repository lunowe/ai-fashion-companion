from fastapi import APIRouter, Depends, HTTPException, status, Request, Body
from typing import List, Dict
from motor.motor_asyncio import AsyncIOMotorDatabase
from utils.auth import get_current_user
from models.user import UserResponse
from database import get_database
from utils.s3_service import s3_service

router = APIRouter()

@router.post("/presigned-urls", response_description="Generate pre-signed URLs for S3 objects")
async def generate_presigned_urls(
    request: Request,
    s3_keys: List[str] = Body(..., embed=True),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Dict[str, str]:
    """
    Generate pre-signed URLs for a list of S3 keys.
    
    Request body:
    {
        "s3_keys": ["styles/uuid1.jpg", "styles/uuid2.jpg"]
    }
    
    Returns:
    {
        "styles/uuid1.jpg": "https://bucket.s3.region.amazonaws.com/styles/uuid1.jpg?X-Amz-...",
        "styles/uuid2.jpg": "https://bucket.s3.region.amazonaws.com/styles/uuid2.jpg?X-Amz-..."
    }
    """
    try:
        presigned_urls = s3_service.generate_presigned_urls(s3_keys)
        return presigned_urls
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate pre-signed URLs: {str(e)}"
        )
