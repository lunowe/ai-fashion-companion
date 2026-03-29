import json
import base64
import tempfile
import os
from typing import List, Dict, Optional
from pathlib import Path

from config import settings
from llama_index.core.llms import ChatMessage, TextBlock, ImageBlock
from llama_index.llms.openrouter import OpenRouter

DEFAULT_MODEL = "anthropic/claude-sonnet-4.6"

# Per-model configurations for OpenRouter (same as outfit_generator)
MODEL_CONFIGS = {
    "anthropic/claude-sonnet-4.6": {
        "max_tokens": 128000,
        "context_window": 200000,
        "reasoning": {"enabled": True},
    },
    "moonshotai/kimi-k2": {
        "max_tokens": 64000,
        "context_window": 128000,
        "reasoning": None,
    },
    "moonshotai/kimi-k2.5": {
        "max_tokens": 64000,
        "context_window": 128000,
        "reasoning": None,
    },
    "google/gemini-3.1-flash": {
        "max_tokens": 64000,
        "context_window": 1000000,
        "reasoning": None,
    },
    "openai/gpt-5.4": {
        "max_tokens": 64000,
        "context_window": 128000,
        "reasoning": {"reasoning_effort": "medium"},
    },
    "x-ai/grok-4.20-beta": {
        "max_tokens": 64000,
        "context_window": 128000,
        "reasoning": None,
    },
}


class ItemAnalyzer:
    """
    AI-powered clothing item analyzer. Identifies clothing from photos,
    evaluates closet compatibility, and generates styling suggestions.
    """

    def _base64_to_temp_file(self, image_base64: str) -> Path:
        """Decode a base64 data URL and write to a temp file. Returns the path."""
        # Strip data URL prefix if present (e.g., "data:image/jpeg;base64,...")
        if "," in image_base64:
            header, data = image_base64.split(",", 1)
            # Extract extension from MIME type
            if "png" in header:
                ext = "png"
            elif "webp" in header:
                ext = "webp"
            elif "gif" in header:
                ext = "gif"
            else:
                ext = "jpg"
        else:
            data = image_base64
            ext = "jpg"

        image_bytes = base64.b64decode(data)

        temp_file = tempfile.NamedTemporaryFile(
            delete=False,
            suffix=f".{ext}",
            dir=tempfile.gettempdir(),
        )
        temp_file.write(image_bytes)
        temp_file.close()
        return Path(temp_file.name)

    def _build_llm(self, model: str = None, api_key: str = None) -> OpenRouter:
        """Build an OpenRouter LLM instance with the given model and API key."""
        api_key = api_key or settings.OPENROUTER_API_KEY
        selected_model = model or DEFAULT_MODEL
        config = MODEL_CONFIGS.get(selected_model, MODEL_CONFIGS[DEFAULT_MODEL])

        llm_kwargs = {
            "api_key": api_key,
            "max_tokens": config["max_tokens"],
            "context_window": config["context_window"],
            "model": selected_model,
        }
        if config.get("reasoning"):
            llm_kwargs["reasoning"] = config["reasoning"]

        return OpenRouter(**llm_kwargs)

    def _parse_json_response(self, content: str) -> Dict:
        """Extract and parse JSON from an LLM response string."""
        json_start = content.find("{")
        json_end = content.rfind("}") + 1

        if json_start != -1 and json_end > json_start:
            json_str = content[json_start:json_end]
        else:
            json_str = content.strip()

        return json.loads(json_str)

    def _format_wardrobe(self, wardrobe_items: List[Dict]) -> List[Dict]:
        """Format wardrobe items for the prompt (same as outfit_generator)."""
        return [
            {
                "id": str(item["_id"]),
                "type": item["type"],
                "category": item["category"],
                "fit": item["fit"],
                "color": item["color"],
                "material": item.get("material"),
                "notes": item.get("notes"),
                "seasons": item.get("seasons"),
            }
            for item in wardrobe_items
        ]

    def _clean_none(self, obj):
        """Recursively remove None values from dicts."""
        if isinstance(obj, dict):
            return {k: self._clean_none(v) for k, v in obj.items() if v is not None}
        if isinstance(obj, list):
            return [self._clean_none(v) for v in obj]
        return obj

    # ─── Method 1: Analyze Item ────────────────────────────────────────

    async def analyze_item(
        self,
        image_base64: str,
        model: str = None,
        api_key: str = None,
    ) -> Dict:
        """
        Analyze a clothing item from a base64-encoded photo.
        Returns structured item attributes (type, category, color, etc.).
        """
        temp_path = self._base64_to_temp_file(image_base64)

        try:
            llm = self._build_llm(model, api_key)

            prompt_data = {
                "task": {
                    "action": "identify_clothing_item",
                    "output_format": "json_only",
                },
                "instructions": [
                    "Analyze the provided image and identify the clothing item",
                    "Determine the exact type, category, color, fit, and material",
                    "Provide a hex color code for the primary color",
                    "Assess which seasons this item is suitable for",
                    "Rate the formality level from 1 (very casual) to 5 (very formal)",
                    "RETURN ONLY VALID JSON - no conversational text",
                ],
                "response_schema": {
                    "type": "string (e.g., t-shirt, blazer, jeans, sneakers)",
                    "category": "string (top, bottom, outerwear, shoes, accessories)",
                    "color": "string (primary color name, e.g., navy, black, cream)",
                    "color_code": "string (hex code, e.g., #1A2B3C)",
                    "fit": "string (slim, regular, loose/oversized)",
                    "material": "string (best guess, e.g., cotton, denim, leather)",
                    "seasons": ["array of applicable seasons: spring, summer, fall, winter"],
                    "formality_level": "number 1-5 (1=very casual, 5=very formal)",
                    "description": "string (brief 1-sentence description of the item)",
                },
            }

            system_msg = ChatMessage(
                role="system",
                text=(
                    "You are a fashion expert AI with deep expertise in identifying clothing items "
                    "from photographs. Analyze the image carefully and return ONLY a valid JSON object. "
                    "Do not include any conversational text, markdown formatting, or prefixes."
                ),
            )
            user_msg = ChatMessage(
                role="user",
                blocks=[
                    ImageBlock(path=temp_path),
                    TextBlock(text=json.dumps(prompt_data, indent=2)),
                ],
            )

            print(f"[ItemAnalyzer] Analyzing item with model: {model or DEFAULT_MODEL}")
            response = await llm.achat([system_msg, user_msg])
            content = response.message.content
            print(f"[ItemAnalyzer] Analysis response: {content[:500]}")

            result = self._parse_json_response(content)
            return result

        finally:
            # Clean up temp file
            try:
                os.unlink(temp_path)
            except OSError:
                pass

    # ─── Method 2: Check Closet Fit ───────────────────────────────────

    async def check_closet_fit(
        self,
        analyzed_item: Dict,
        wardrobe_items: List[Dict],
        user_preferences: Dict = None,
        model: str = None,
        api_key: str = None,
    ) -> Dict:
        """
        Evaluate whether a new clothing item complements the user's existing wardrobe.
        Returns compatibility scores, gap analysis, redundancies, and a buy recommendation.
        """
        llm = self._build_llm(model, api_key)
        formatted_wardrobe = self._format_wardrobe(wardrobe_items)

        prompt_data = {
            "task": {
                "action": "evaluate_closet_compatibility",
                "output_format": "json_only",
            },
            "new_item": analyzed_item,
            "existing_wardrobe": formatted_wardrobe,
            "user_preferences": (
                {
                    "preferred_colors": user_preferences.get("preferred_colors", []),
                    "disliked_colors": user_preferences.get("disliked_colors", []),
                    "preferred_fits": user_preferences.get("preferred_fits", []),
                    "style_notes": user_preferences.get("style_notes", ""),
                }
                if user_preferences
                else None
            ),
            "evaluation_criteria": [
                "Color harmony with existing pieces",
                "Gap filling: does this add a missing category, color, or formality level?",
                "Redundancy: does the wardrobe already have very similar items?",
                "Versatility: how many existing items can this pair with?",
                "Seasonal coverage improvement",
                "Style cohesion with overall wardrobe aesthetic",
            ],
            "instructions": [
                "Evaluate how well the new item fits the existing wardrobe",
                "Be specific about which existing items pair well (use their IDs)",
                "Be honest about redundancies - list similar items already owned",
                "Consider the user's preferences if provided",
                "RETURN ONLY VALID JSON - no conversational text",
            ],
            "response_schema": {
                "compatibility_score": "number 1-10 (10 = perfect fit)",
                "verdict": "string (concise 1-2 sentence recommendation)",
                "fills_gaps": ["list of gaps this item would fill in the wardrobe"],
                "redundancies": ["list of similar items already owned (describe briefly)"],
                "color_harmony": "string (how this item's color works with the wardrobe)",
                "versatility_score": "number 1-10 (10 = pairs with everything)",
                "suggested_pairings": ["item_id_1", "item_id_2 (IDs of wardrobe items that pair well)"],
                "recommendation": {
                    "should_buy": "boolean",
                    "reasoning": "string (brief explanation)",
                },
            },
        }

        system_msg = ChatMessage(
            role="system",
            text=(
                "You are a professional wardrobe consultant and color theory expert. "
                "Evaluate whether a new clothing item complements an existing wardrobe. "
                "Be practical and honest in your assessment. "
                "Return ONLY a valid JSON object. No conversational text."
            ),
        )
        user_msg = ChatMessage(
            role="user",
            blocks=[TextBlock(text=json.dumps(self._clean_none(prompt_data), indent=2))],
        )

        print(f"[ItemAnalyzer] Checking closet fit with {len(wardrobe_items)} wardrobe items")
        response = await llm.achat([system_msg, user_msg])
        content = response.message.content
        print(f"[ItemAnalyzer] Closet check response: {content[:500]}")

        result = self._parse_json_response(content)

        # Validate suggested_pairings - only keep IDs that exist in wardrobe
        valid_ids = {str(item["_id"]) for item in wardrobe_items}
        if "suggested_pairings" in result:
            result["suggested_pairings"] = [
                pid for pid in result["suggested_pairings"] if pid in valid_ids
            ]

        return result

    # ─── Method 3: Style With Closet ──────────────────────────────────

    async def style_with_closet(
        self,
        analyzed_item: Dict,
        wardrobe_items: List[Dict],
        style: Dict = None,
        occasion: str = None,
        weather: str = None,
        user_preferences: Dict = None,
        num_outfits: int = 3,
        model: str = None,
        api_key: str = None,
    ) -> List[Dict]:
        """
        Generate outfit suggestions combining a new item with existing wardrobe pieces.
        The new item is treated as a mandatory anchor piece in every outfit.
        """
        llm = self._build_llm(model, api_key)
        formatted_wardrobe = self._format_wardrobe(wardrobe_items)

        prompt_data = {
            "task": {
                "action": "create_outfits_with_new_item",
                "count": num_outfits,
                "output_format": "json_only",
            },
            "new_item": {
                "id": "NEW_ITEM",
                "description": analyzed_item.get("description", ""),
                "type": analyzed_item.get("type", "unknown"),
                "category": analyzed_item.get("category", "unknown"),
                "color": analyzed_item.get("color", "unknown"),
                "fit": analyzed_item.get("fit", "regular"),
                "material": analyzed_item.get("material"),
                "seasons": analyzed_item.get("seasons"),
            },
            "wardrobe_items": formatted_wardrobe,
            "constraints": {
                "style": (
                    {
                        "name": style["name"],
                        "description": style.get("description", ""),
                    }
                    if style
                    else None
                ),
                "occasion": occasion,
                "weather": weather,
            },
            "user_preferences": (
                {
                    "preferred_colors": user_preferences.get("preferred_colors", []),
                    "disliked_colors": user_preferences.get("disliked_colors", []),
                    "preferred_fits": user_preferences.get("preferred_fits", []),
                    "style_notes": user_preferences.get("style_notes", ""),
                }
                if user_preferences
                else None
            ),
            "instructions": [
                f"Create {num_outfits} distinct outfits that MUST include the new item (id: NEW_ITEM)",
                "Each outfit should combine the new item with existing wardrobe pieces",
                "Use the actual item IDs from the wardrobe_items list and 'NEW_ITEM' for the new piece",
                "Ensure color coordination, fit combination, and style cohesion",
                "Provide brief reasoning for each outfit explaining why these items work together",
                "Ensure variety between outfits",
                "If style/occasion/weather are provided, respect those constraints",
                "RETURN ONLY VALID JSON - no conversational text",
            ],
            "guidelines": {
                "layering": "lighter colors under darker colors",
                "silhouette": "avoid slim bottoms with bulky tops",
                "color_balance": "balance bold colors with neutrals",
                "practicality": "appropriate for weather conditions if specified",
            },
            "response_schema": {
                "outfits": [
                    {
                        "outfit_name": "string",
                        "items": ["NEW_ITEM", "item_id_1", "item_id_2"],
                        "reasoning": "string",
                    }
                ]
            },
        }

        system_msg = ChatMessage(
            role="system",
            text=(
                "You are a professional fashion stylist AI. Your task is to create outfits "
                "that incorporate a new clothing item with pieces from an existing wardrobe. "
                "The new item MUST appear in every outfit as 'NEW_ITEM'. "
                "Return ONLY a valid JSON object. No conversational text."
            ),
        )
        user_msg = ChatMessage(
            role="user",
            blocks=[TextBlock(text=json.dumps(self._clean_none(prompt_data), indent=2))],
        )

        print(f"[ItemAnalyzer] Styling with closet: {num_outfits} outfits, {len(wardrobe_items)} wardrobe items")
        response = await llm.achat([system_msg, user_msg])
        content = response.message.content
        print(f"[ItemAnalyzer] Style response: {content[:500]}")

        result = self._parse_json_response(content)

        # Map and validate outfit item IDs
        outfits = self._map_outfits_to_ids(result.get("outfits", []), wardrobe_items)
        return outfits

    def _map_outfits_to_ids(
        self, generated_outfits: List[Dict], wardrobe_items: List[Dict]
    ) -> List[Dict]:
        """
        Map generated outfits to actual clothing item IDs.
        Preserves the 'NEW_ITEM' marker for the external piece.
        """
        item_lookup = {str(item["_id"]): item for item in wardrobe_items}

        mapped_outfits = []
        for outfit in generated_outfits:
            valid_item_ids = []
            for item_id in outfit.get("items", []):
                if item_id == "NEW_ITEM":
                    valid_item_ids.append("NEW_ITEM")
                elif item_id in item_lookup:
                    valid_item_ids.append(item_id)

            if valid_item_ids:
                mapped_outfits.append(
                    {
                        "name": outfit.get("outfit_name", "Unnamed Outfit"),
                        "items": valid_item_ids,
                        "ai_generated_reasoning": outfit.get("reasoning", ""),
                    }
                )

        return mapped_outfits
