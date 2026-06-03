# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FitFlow is an AI-powered wardrobe management and outfit generation app. Users choose their clothing items, and the AI generates outfit combinations based on style, occasion, and weather.

## Commands

```bash
# Backend
cd backend && pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend && pnpm install
pnpm dev
pnpm build
pnpm lint

# Landing Page
cd landing_page/fit-flow-landing-page
pnpm install && pnpm dev

# Docker (backend)
docker build -t fitflow-backend .
docker run -p 8000:8000 fitflow-backend
```

## Architecture

### Tech Stack

- **Backend**: FastAPI (async), MongoDB (Motor), JWT auth, AWS S3, LlamaIndex with OpenRouter/Gemini
- **Frontend**: React 19, TypeScript, Vite, shadcn/ui (New York style), Tailwind CSS v4, React Query
- **Landing**: Next.js 16, React 19, Tailwind CSS v4

### Key Data Flow

1. **Clothing**: User uploads image → Base64 → Backend stores metadata in MongoDB + image in S3 → Pre-signed URLs on retrieval
2. **Outfit Generation**: User selects style/occasion/weather → Backend fetches wardrobe → LLM prompt with reference images → JSON response with outfit combinations
3. **Auth**: JWT access (30min) + refresh (7 days) tokens, auto-refresh middleware, Axios interceptors for token refresh

### Backend Patterns

Routes use async MongoDB with auth dependency:

```python
@router.post("/")
async def create_item(
    item: ItemCreate = Body(...),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_id = current_user.id
```

Pydantic models: `Base` → `Create` → `Update` → `Response`. Always convert `_id` to string: `item["_id"] = str(item["_id"])`

### Frontend Patterns

API calls via configured axios instance:

```typescript
import { api } from "@/lib/api";
export async function listItems(): Promise<Item[]> {
  const { data } = await api.get("/api/items/");
  return data;
}
```

Use `@/` path alias. UI primitives in `components/ui/`, feature components at `components/`, pages in `pages/`.

## MongoDB Collections

- `users` - Accounts with `generation_count`, `last_reset_date`, tier (`free`/`premium`/`byok`)
- `clothing` - Wardrobe items scoped by `user_id`, S3 keys in `image_url`
- `styles` - Predefined (`user_id` null) and custom styles with `reference_images`
- `outfits` - Saved outfit combinations
- `user_profiles` - Style preferences
- `invite_codes` - Registration invite system

## User Tiers

- `free`: 5 generations/day
- `premium`: 50 generations/day
- `byok`: Unlimited (user provides own API key)

## Environment Variables

**Backend (.env)**:
`MONGODB_URL`, `DATABASE_NAME`, `SECRET_KEY`, `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `AWS_REGION`

Storage is S3-compatible. Self-hosted MinIO on Railway (current setup) adds `S3_ENDPOINT_URL` (server-side, private network) and `S3_PUBLIC_ENDPOINT_URL` (browser-reachable, used to sign pre-signed URLs). Leaving both unset falls back to AWS S3. See `backend/RAILWAY_MINIO_SETUP.md`.

**Frontend (.env.local)**:
`VITE_API_BASE_URL` (defaults to `http://localhost:8000`)

## Key Files

- `backend/services/outfit_generator.py` - Core AI outfit generation with LLM
- `backend/utils/s3_service.py` - S3 operations, pre-signed URL generation
- `backend/utils/auth.py` - JWT creation, password hashing, `get_current_user` dependency
- `backend/middleware/auth_refresh.py` - Token auto-refresh within 5 min of expiry
- `frontend/src/lib/api.ts` - Axios instance with token refresh interceptors
- `frontend/src/context/AuthContext.tsx` - Auth state (user, tokens, login/logout)
