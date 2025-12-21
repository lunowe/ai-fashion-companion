# middleware/auth_refresh.py
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError
from datetime import datetime, timedelta
from config import settings
from utils.auth import create_access_token, create_refresh_token

class TokenRefreshMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return response

        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            # Use utcfromtimestamp to ensure consistent UTC comparison
            exp = datetime.fromtimestamp(payload["exp"])

            # If token expires within 5 minutes, issue new tokens
            if exp - datetime.now() < timedelta(minutes=5):
                username = payload.get("sub")
                # Use configured expiration times instead of defaults
                access_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
                new_access = create_access_token({"sub": username}, expires_delta=access_expires)
                new_refresh = create_refresh_token({"sub": username})
                response.headers["X-New-Access-Token"] = new_access
                response.headers["X-New-Refresh-Token"] = new_refresh
        except JWTError:
            pass

        return response