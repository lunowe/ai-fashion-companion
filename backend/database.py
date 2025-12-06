from motor.motor_asyncio import AsyncIOMotorClient
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import MongoClient
from fastapi import FastAPI, Request
from config import settings

async def get_database(request: Request) -> AsyncIOMotorDatabase:
    return request.app.mongodb