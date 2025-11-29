"""
Test script for S3 upload functionality.
Run this script to verify S3 configuration is working correctly.
"""

import asyncio
import base64
from utils.s3_service import s3_service
from config import settings

async def test_s3_upload():
    """Test uploading a dummy image to S3."""
    
    print("Testing S3 Configuration...")
    print(f"Bucket: {settings.S3_BUCKET_NAME}")
    print(f"Region: {settings.AWS_REGION}")
    print(f"Access Key ID: {settings.AWS_ACCESS_KEY_ID[:10]}..." if settings.AWS_ACCESS_KEY_ID else "Not set")
    print()
    
    # Create a simple 1x1 red pixel PNG image in base64
    # This is a valid minimal PNG file
    test_image_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
    
    print("Uploading test image to S3...")
    try:
        url = await s3_service.upload_base64_image(test_image_base64, folder="test")
        print(f"✓ Success! Image uploaded to: {url}")
        print()
        print("You can verify the upload by:")
        print("1. Checking your S3 bucket in AWS Console")
        print("2. Opening the URL in a browser (should show a small red pixel)")
        print(f"   URL: {url}")
        return True
    except Exception as e:
        print(f"✗ Error uploading to S3: {str(e)}")
        print()
        print("Common issues:")
        print("1. Check that AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in .env")
        print("2. Verify the IAM user has S3 upload permissions")
        print("3. Ensure the bucket name is correct and exists")
        print("4. Check that the bucket region matches AWS_REGION in .env")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_s3_upload())
    exit(0 if success else 1)
