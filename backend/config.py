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
    
    # AWS S3 settings
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "")
    PRESIGNED_URL_EXPIRATION: int = int(os.getenv("PRESIGNED_URL_EXPIRATION", "3600"))  # 1 hour default

    class Config:
        env_file = ".env"

settings = Settings()