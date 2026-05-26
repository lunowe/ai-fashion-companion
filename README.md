# FitFlow

AI wardrobe and outfit assistant built around a simple idea: **clothes are building blocks, not photos**. Instead of cataloging specific pieces with pictures, you describe what you own — *white oversized t-shirt*, *baggy light-blue jeans*, *black leather Chelsea boots* — and the LLM composes outfits from that abstract closet.

## Why building blocks?

Most wardrobe apps treat your closet as a gallery of unique items, which makes you spend hours photographing and tagging clothes and locks you into reasoning about *that specific shirt*. FitFlow treats items as **type + attributes** (category, color, fit, cut, material, vibe). That has a few consequences:

- Adding clothes is fast — you pick from a catalog of building blocks instead of taking and editing photos.
- The model reasons about outfits the way a stylist does: "an oversized white tee with a tailored trouser", not "item #4823 with item #1907".
- Two near-identical pieces (three white tees) collapse to one block, which is how you actually wear them.
- Recommendations transfer — what works for *baggy light-blue jeans* works for any pair you own that fits that description.

Photo upload is **not** how you fill the wardrobe. It is only used for two flows where a real picture matters:

- **Closet check** — point your phone at a piece you're thinking of buying; the app abstracts it into the same building-block representation and tells you whether it fits the closet you already have.
- **Style piece** — photograph an item (yours or one you're considering) and ask how to style it against your current wardrobe.

## Access

Hosted on **Railway** behind invite-only registration. Ask me for an invite code — there is no public sign-up.

Tiers:

- `free` — 5 outfit generations/day, up to 75 wardrobe items, 1 custom style
- `premium` — 50 outfit generations/day, 250 items, 10 custom styles, travel suitcase + item analysis
- `byok` — bring your own OpenRouter key, no limits

## What it does today

- **Wardrobe as building blocks** — add items from a structured catalog (category, color, fit, attributes). No photo required. Edit, browse, or remove blocks as your closet evolves.
- **Outfit generator** — pick a style, occasion, weather, optionally pin or exclude blocks; get N outfit combinations back from an LLM with reasoning about why each combination works.
- **Styles** — predefined aesthetic profiles plus user-created styles. Custom styles *do* take reference images, which the model uses to ground the look you want.
- **Saved outfits** — keep, edit, and revisit generated combinations.
- **Travel suitcase** (premium) — destination, dates, occasions, and 1–3 styles in; packing list + daily outfits + versatility notes out, all composed from your building blocks.
- **Item analysis from a photo** (premium) — the only place pictures of individual items enter the system:
  - *Closet check* — does this new piece fit my existing wardrobe?
  - *Style piece* — what outfits could I build around this with what I already own?
- **Model picker** — Claude Sonnet 4.6, Kimi K2/K2.5, Gemini 3.1 Flash, GPT-5.4, or Grok 4.20 via OpenRouter.
- **Auth** — JWT access + refresh with auto-refresh, BYOK API key storage.
- **UX** — responsive mobile + desktop, light/dark theme, invite-code registration.

## What it can't do (yet)

- **No visual try-on.** Outfits come back as descriptions and item blocks, not rendered images of you wearing them.
- **No per-piece tracking.** Because items are abstract building blocks, you can't (today) track *which specific shirt* you wore on which day, or count wears of an individual garment.
- **No live weather.** You manually pick weather; there's no geolocation or forecast integration.
- **No calendar / wear tracking.** Outfits aren't scheduled against dates, so cost-per-wear and rotation insights don't exist.
- **No shopping integration.** The catalog is internal; you can't buy items, link to retailers, or import from a store.
- **No social layer.** No sharing, no public profiles, no collaborative wardrobes.
- **No native mobile app.** Web only, though the layout is mobile-friendly.
- **Closet check is single-item.** You can't drop a whole shopping cart in and get a batched verdict.
- **Background removal is basic.** `rembg` is used on the item-analysis photos but quality varies with the source.
- **No fit/sizing model on your body.** The AI reasons about style coherence, not whether a given size fits *you*.

## Possible next steps

- Smarter block extraction: snap a photo of a clothing pile and auto-generate the matching building blocks.
- Optional per-piece layer on top of blocks (e.g. "this specific oversized white tee is the Uniqlo U one") for wear-count + cost-per-wear, without losing the abstraction for outfit reasoning.
- Weather + location API so the generator picks something you can actually wear outside today.
- Outfit calendar with wear-count + cost-per-wear analytics.
- Shopping links from closet-check ("you're missing a navy crew sweater — here are options").
- Bulk closet-check (drop a whole cart, get a batched verdict).
- A native mobile shell (Capacitor or RN) for camera + push.
- Sharing & collaborative styling (friends rate, stylists drop in suggestions).
- Long-term style profile that learns from kept vs. discarded outfits.

## Stack

- **Backend** — FastAPI (async), MongoDB via Motor, JWT auth, AWS S3 (only for the few photos that exist: style refs and item-analysis uploads), LlamaIndex + OpenRouter for LLM routing.
- **Frontend** — React 19, TypeScript, Vite, shadcn/ui (New York), Tailwind v4, React Query, react-router.
- **Landing** — Next.js 16.

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
