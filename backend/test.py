import boto3
from dotenv import load_dotenv
import os

load_dotenv()

s3 = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)

# Try listing buckets
try:
    response = s3.list_buckets()
    print("✓ Credentials work! Buckets:", [b['Name'] for b in response['Buckets']])
except Exception as e:
    print("✗ Credentials failed:", e)