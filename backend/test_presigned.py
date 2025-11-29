"""
Debug script to test S3 pre-signed URL generation
"""
import sys
sys.path.insert(0, '.')

from config import settings
from utils.s3_service import s3_service

print("=== S3 Configuration ===")
print(f"Access Key ID: {settings.AWS_ACCESS_KEY_ID}")
print(f"Secret Key: {settings.AWS_SECRET_ACCESS_KEY[:5]}...{settings.AWS_SECRET_ACCESS_KEY[-5:]}")
print(f"Region: {settings.AWS_REGION}")
print(f"Bucket: {settings.S3_BUCKET_NAME}")
print()

# Test generating a pre-signed URL for an existing key
test_key = "styles/b5e9032c-c988-4b52-84e2-e146aa9b01ce.jpg"  # From your error

print(f"=== Testing Pre-Signed URL for: {test_key} ===")
try:
    url = s3_service.generate_presigned_url(test_key)
    print("SUCCESS! Generated URL:")
    print(url)
    print()
    print("You can test this URL in your browser to see if it works")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
