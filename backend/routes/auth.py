from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from models.user import UserCreate, UserResponse, Token, UserInDB
from utils.auth import get_password_hash, verify_password, create_access_token, create_refresh_token, get_current_user
from jose import JWTError, jwt
from config import settings
from models.user import TokenData

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, request: Request):
    # 1. Validate Invite Code
    invite = await request.app.mongodb["invite_codes"].find_one({
        "code": user.invite_code,
        "is_used": False
    })
    
    if not invite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or used invite code"
        )

    # 2. Check if user already exists
    existing_user = await request.app.mongodb["users"].find_one({
        "$or": [{"username": user.username}, {"email": user.email}]
    })
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )

    # 3. Create User
    hashed_password = get_password_hash(user.password)
    user_in_db = UserInDB(
        **user.model_dump(exclude={"invite_code"}),
        hashed_password=hashed_password
    )
    
    new_user = await request.app.mongodb["users"].insert_one(user_in_db.model_dump())
    created_user = await request.app.mongodb["users"].find_one({"_id": new_user.inserted_id})

    # 4. Mark Invite Code as Used
    await request.app.mongodb["invite_codes"].update_one(
        {"_id": invite["_id"]},
        {
            "$set": {
                "is_used": True,
                "used_at": datetime.utcnow(),
                "used_by": str(new_user.inserted_id)
            }
        }
    )

    # Return response
    return UserResponse(
        id=str(created_user["_id"]),
        username=created_user["username"],
        email=created_user["email"],
        created_at=created_user["created_at"]
    )

@router.post("/token", response_model=Token)
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = await request.app.mongodb["users"].find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": user["username"]}
    )
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
async def refresh_token(request: Request, refresh_token: str):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await request.app.mongodb["users"].find_one({"username": username})
    if not user:
        raise credentials_exception

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": username}, expires_delta=access_token_expires
    )
    
    # Optionally rotate refresh token here too, but for now just return new access token
    # and the SAME refresh token (or a new one if we want rotation).
    # Let's return a new refresh token to be safe/standard (rotation).
    new_refresh_token = create_refresh_token(
        data={"sub": username}
    )
    
    return {"access_token": access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}

@router.get("/users/me", response_model=UserResponse)
async def read_users_me(
    request: Request,
    current_user: TokenData = Depends(get_current_user)
):
    user = await request.app.mongodb["users"].find_one({"username": current_user.username})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    return UserResponse(
        id=str(user["_id"]),
        username=user["username"],
        email=user["email"],
        created_at=user["created_at"]
    )
