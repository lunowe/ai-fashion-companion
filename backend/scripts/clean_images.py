import boto3
import io
from pymongo import MongoClient
from rembg import remove # The magic tool
from PIL import Image
import os
from dotenv import load_dotenv

load_dotenv("../.env")

# --- CONFIGURATION ---
MONGO_URI = os.getenv("MONGODB_URL")
DB_NAME = os.getenv("DATABASE_NAME")
COLLECTION_NAME = "outfits"

AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
AWS_REGION = os.getenv("AWS_REGION")

def process_backgrounds():
    # 1. Connect
    mongo = MongoClient(MONGO_URI)
    coll = mongo[DB_NAME][COLLECTION_NAME]
    s3 = boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
        region_name=AWS_REGION
    )

    # 2. Get all outfits with a visualization key
    cursor = coll.find({"visualization_key": {"$exists": True}})
    
    for doc in cursor:
        key = doc['visualization_key']
        print(f"Processing {key}...")

        try:
            # 3. Download
            file_obj = io.BytesIO()
            s3.download_fileobj(BUCKET_NAME, key, file_obj)
            file_obj.seek(0)
            input_data = file_obj.read()

            # 4. Remove Background (AI-powered masking, not generation)
            # This is safer than color-matching for grey clothes
            output_data = remove(input_data)

            # 5. Overwrite in S3
            # We use the same key since it's already a PNG
            s3.put_object(
                Bucket=BUCKET_NAME,
                Key=key,
                Body=output_data,
                ContentType='image/png'
            )
            print(f" -> Done.")

        except Exception as e:
            print(f" -> Error: {e}")

if __name__ == "__main__":
    process_backgrounds()