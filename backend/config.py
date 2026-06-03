from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv(".env")

class Settings(BaseModel):
    MONGODB_URL: str = os.getenv("MONGODB_URL")
    DB_NAME: str = os.getenv("DATABASE_NAME")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    GOOGLE_GENAI_API_KEY: str = os.getenv("GOOGLE_GENAI_API_KEY")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY")
    
    # Auth settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here") # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Object storage settings (S3-compatible: AWS S3, MinIO, Cloudflare R2, ...)
    # For MinIO, AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY are the MinIO root user / password.
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "")
    PRESIGNED_URL_EXPIRATION: int = int(os.getenv("PRESIGNED_URL_EXPIRATION", "3600"))  # 1 hour default

    # Custom S3-compatible endpoint. Leave empty to use AWS S3.
    # S3_ENDPOINT_URL: server-side endpoint for uploads/downloads/deletes. On Railway,
    #   prefer private networking, e.g. "http://minio.railway.internal:9000".
    # S3_PUBLIC_ENDPOINT_URL: browser-reachable endpoint used to SIGN pre-signed URLs,
    #   e.g. "https://minio-production-xxxx.up.railway.app". Falls back to S3_ENDPOINT_URL.
    S3_ENDPOINT_URL: str = os.getenv("S3_ENDPOINT_URL", "")
    S3_PUBLIC_ENDPOINT_URL: str = os.getenv("S3_PUBLIC_ENDPOINT_URL", "")

    class Config:
        env_file = ".env"

settings = Settings()