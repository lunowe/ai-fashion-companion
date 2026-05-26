# FitFlow

AI-powered wardrobe and outfit assistant. Upload your clothes, define your styles, and let an LLM generate outfit combinations, pack travel suitcases, and tell you whether a new item actually fits the closet you already own.

## Access

The app is hosted on **Railway** behind invite-only registration. To try it, ask me for an invite code — registration is locked to those codes, and there is no public sign-up.

Tiers:

- `free` — 5 outfit generations/day, up to 75 wardrobe items, 1 custom style
- `premium` — 50 outfit generations/day, 250 items, 10 custom styles, travel suitcase + item analysis
- `byok` — bring your own OpenRouter key, no limits

## What it does today

- **Wardrobe** — upload photos of clothing items, store them in S3, tag by category/color, edit metadata, browse with a catalog-style picker
- **Outfit generator** — pick a style, occasion, weather, optionally pin or exclude items, get N outfit combinations back from an LLM with reasoning
- **Styles** — predefined styles plus user-created styles with reference images that the model uses for grounding
- **Saved outfits** — keep, edit, and revisit generated outfits
- **Travel suitcase** (premium) — give a destination, dates, occasions, and 1–3 styles; get a packing list, daily outfits, and versatility notes
- **Item analysis** (premium) — photograph an item you don't own yet and ask:
  - *Closet check* — does this fit what I already have?
  - *Style piece* — what outfits could I build around this with my current wardrobe?
- **Model picker** — choose between Claude Sonnet 4.6, Kimi K2/K2.5, Gemini 3.1 Flash, GPT-5.4, or Grok 4.20 via OpenRouter
- **Auth** — JWT access + refresh tokens with auto-refresh, BYOK API key storage
- **UX** — responsive mobile + desktop layouts, light/dark theme, invite-code registration

## What it can't do (yet)

- **No visual try-on.** The generator returns item lists and descriptions, not rendered images of you wearing the outfit.
- **No live weather.** You manually pick weather; there's no geolocation or forecast integration.
- **No calendar / wear tracking.** Outfits aren't scheduled or logged against dates, so cost-per-wear and rotation insights don't exist.
- **No shopping integration.** The catalog is internal; you can't buy items, link to retailers, or import from a store.
- **No social layer.** No sharing, no public profiles, no collaborative wardrobes.
- **No native mobile app.** Web only, though the layout is mobile-friendly.
- **No bulk import.** Items go in one photo at a time.
- **Background removal is basic.** `rembg` is wired in but quality varies with the source photo.
- **No fit/sizing model.** The AI reasons about style coherence, not whether a given size fits your body.

## Possible next steps

- Visual outfit composition (avatar or photo-based try-on)
- Weather + location API so the generator picks something you can actually wear outside today
- Outfit calendar with wear-count + cost-per-wear analytics
- Shopping links / affiliate integration from the closet-check flow ("you're missing X, here are options")
- Bulk wardrobe import from photos of a closet or a clothing-app export
- A native mobile shell (capacitor or RN) for camera + push
- Sharing & collaborative styling (friends rate your outfits, stylists drop in suggestions)
- Long-term style profile that learns from kept vs. discarded outfits

## Stack

- **Backend** — FastAPI (async), MongoDB via Motor, JWT auth, AWS S3 for images, LlamaIndex + OpenRouter for LLM routing
- **Frontend** — React 19, TypeScript, Vite, shadcn/ui (New York), Tailwind v4, React Query, react-router
- **Landing** — Next.js 16

## Local setup

```bash
# Backend
cd backend
pip install -r requirements.txt
# create backend/.env (see below)
uvicorn main:app --reload --port 8000

# Frontend (in another terminal)
cd frontend
pnpm install
# create frontend/.env.local with VITE_API_BASE_URL=http://localhost:8000
pnpm dev
```

`backend/.env` needs:

```
MONGODB_URL=...
DATABASE_NAME=...
SECRET_KEY=...
OPENROUTER_API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
AWS_REGION=us-east-1
```

To register locally you need an invite code in the `invite_codes` collection — generate one directly in Mongo or via the admin tooling.

Docker (backend only):

```bash
docker build -t fitflow-backend .
docker run -p 8000:8000 --env-file backend/.env fitflow-backend
```

## Repo layout

```
backend/    FastAPI app, services (outfit_generator, item_analyzer, travel_suitcase_generator), MongoDB models
frontend/   React app (pages/, components/, services/)
landing_page/fit-flow-landing-page/   Next.js marketing site
```

Project-specific guidance for contributors and AI agents lives in `CLAUDE.md`.
