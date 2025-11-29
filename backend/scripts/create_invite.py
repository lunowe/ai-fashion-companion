import asyncio
import secrets
import sys
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Add backend directory to path so we can import config/models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
from models.invite import InviteCode

async def create_invite_code():
    # Connect to DB
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db = client[os.getenv("DATABASE_NAME")]
    
    # Generate random code
    code = secrets.token_urlsafe(8)
    
    invite = InviteCode(code=code)
    
    # Insert
    result = await db["invite_codes"].insert_one(invite.model_dump())
    
    print(f"Created invite code: {code}")
    print(f"ID: {result.inserted_id}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_invite_code())
