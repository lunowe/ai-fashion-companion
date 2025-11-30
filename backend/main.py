from fastapi import FastAPI, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager

from config import settings
from routes import clothing, style, outfit, user_profile, auth, images
from middleware.auth_refresh import TokenRefreshMiddleware

from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to the MongoDB database
    app.mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
    app.mongodb = app.mongodb_client[settings.DB_NAME]
    print("Connected to MongoDB!")
    yield
    # Close the MongoDB connection
    app.mongodb_client.close()
    print("Disconnected from MongoDB!")

app = FastAPI(
    title="AI Styling Assistant API",
    description="API for digital wardrobe and outfit generation",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TokenRefreshMiddleware)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(clothing.router, prefix="/api/clothing", tags=["clothing"])
app.include_router(style.router, prefix="/api/styles", tags=["styles"])
app.include_router(outfit.router, prefix="/api/outfits", tags=["outfits"])
app.include_router(user_profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(images.router, prefix="/api/images", tags=["images"])

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Styling Assistant API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)