# FitFlow AI Fashion Companion - Copilot Instructions

## Architecture Overview

**FitFlow** is an AI-powered wardrobe management and outfit generation app with a FastAPI backend and React/Vite frontend.

### Backend (`/backend`)

- **FastAPI** with async MongoDB (Motor) - all routes use `AsyncIOMotorDatabase`
- **Auth**: JWT with access/refresh tokens, auto-refresh middleware in `middleware/auth_refresh.py`
- **AI Services**: Uses LlamaIndex with Google Gemini (`gemini-2.5-flash`) for outfit generation, supports BYOK (Bring Your Own Key)
- **Storage**: AWS S3 for images with pre-signed URLs (private bucket)

### Frontend (`/frontend`)

- **React 19 + TypeScript + Vite** with SWC
- **UI**: shadcn/ui (New York style) with Radix primitives, Tailwind CSS v4, Lucide icons
- **State**: React Query (`@tanstack/react-query`), React Context for auth
- **Routing**: react-router-dom v7

## Key Patterns

### Backend Route Pattern

Routes follow CRUD with `get_current_user` dependency for auth:

```python
@router.post("/", response_description="...")
async def create_item(
    request: Request,
    item: ItemCreate = Body(...),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
    # Use db.collection_name for MongoDB operations
```

### Backend Model Pattern

Pydantic models in `models/` follow: `Base` → `Create` → `Update` → `InDB/Response`:

- Use `PyObjectId` for MongoDB ObjectIds (see `models/clothing.py`)
- Always convert `_id` to string when returning: `item["_id"] = str(item["_id"])`

### Frontend Service Pattern

API calls in `src/services/` use the configured axios instance:

```typescript
import { api } from "@/lib/api";
export async function listItems(): Promise<Item[]> {
  const { data } = await api.get("/api/items/");
  return data;
}
```

### Frontend Component Pattern

- UI primitives in `src/components/ui/` (shadcn)
- Feature components at `src/components/` level
- Pages in `src/pages/`
- Use `@/` path alias for imports

## Data Flow

1. **Clothing Items**: User uploads → stored in MongoDB with S3 image keys → displayed with pre-signed URLs
2. **Outfit Generation**: User selects style/occasion/weather → LLM generates combinations from wardrobe → results stored in user's generation history
3. **Styles**: Predefined (no user_id) + custom (with user_id) styles with reference images

## MongoDB Collections

- `users` - User accounts with generation limits/history
- `clothing` - Wardrobe items (user-scoped by `user_id`)
- `styles` - Style definitions (predefined + custom)
- `outfits` - Saved outfit combinations
- `user_profiles` - Style preferences
- `invite_codes` - Registration invite system

## Environment Variables

Backend (`.env`):

- `MONGODB_URL`, `DATABASE_NAME`
- `GOOGLE_GENAI_API_KEY`, `OPENAI_API_KEY`
- `SECRET_KEY` (JWT)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `AWS_REGION`

Frontend (`.env`):

- `VITE_API_BASE_URL` (defaults to `http://localhost:8000`)

## Commands

```bash
# Backend
cd backend && pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend && pnpm install
pnpm dev

# Docker (backend only)
docker build -t fitflow-backend .
```

## User Tiers

- `free`: 5 generations/day
- `premium`: 50 generations/day
- `byok`: Unlimited (user provides own API key)

## Important Files

- `backend/services/outfit_generator.py` - Core AI logic with LlamaIndex
- `backend/utils/s3_service.py` - S3 operations with pre-signed URL generation
- `frontend/src/lib/api.ts` - Axios instance with token refresh interceptors
- `frontend/src/context/AuthContext.tsx` - Auth state management
