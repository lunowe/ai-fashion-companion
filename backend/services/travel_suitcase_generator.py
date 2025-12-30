import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from config import settings
from llama_index.core.llms import ChatMessage, TextBlock
from llama_index.llms.openrouter import OpenRouter


class TravelSuitcaseGenerator:
    def __init__(self):
        pass

    async def generate_suitcase(
        self,
        wardrobe_items: List[Dict],
        destination: str,
        start_date: datetime,
        end_date: datetime,
        occasions: List[str],
        styles: List[Dict] = None,
        saved_outfits: List[Dict] = None,
        user_preferences: Dict = None,
        api_key: str = None
    ) -> Dict:
        """
        Generate an optimized travel suitcase with minimal items for maximum outfit combinations.

        Args:
            wardrobe_items: List of clothing items in the wardrobe
            destination: Travel destination (city, country)
            start_date: Trip start date
            end_date: Trip end date
            occasions: List of occasions/activities planned
            styles: List of 1-3 style dicts for cohesion with variety
            saved_outfits: User's saved outfits for preference learning
            user_preferences: User's style preferences
            api_key: Optional API key for BYOK tier

        Returns:
            Dict with packing_list, daily_outfits, and destination_summary
        """
        duration_days = (end_date - start_date).days + 1

        # Format the wardrobe items for the prompt
        formatted_wardrobe = self._format_wardrobe(wardrobe_items)

        # Analyze saved outfits for preference patterns
        favorite_items = self._analyze_saved_outfits(saved_outfits) if saved_outfits else []

        # Format styles for prompt
        formatted_styles = self._format_styles(styles) if styles else []

        # Build the prompt
        prompt = self._build_suitcase_prompt(
            formatted_wardrobe,
            destination,
            start_date,
            end_date,
            duration_days,
            occasions,
            formatted_styles,
            favorite_items,
            user_preferences
        )

        print(f"Generated prompt for travel suitcase:\n{prompt}\n")

        try:
            # Use user's API key if provided (BYOK), otherwise use system key
            key = api_key if api_key else settings.OPENROUTER_API_KEY

            llm = OpenRouter(
                api_key=key,
                max_tokens=64000,
                context_window=128000,
                model="openai/gpt-5.2",
                reasoning={"reasoning_effort": "medium"}
            )

            message = ChatMessage(role="user", blocks=[TextBlock(text=prompt)])

            instructions = """You are a professional travel fashion stylist and packing expert. Your task is to create an optimized travel suitcase that:
1. MINIMIZES the number of clothing items to pack
2. MAXIMIZES the number of outfit combinations possible
3. Ensures all planned occasions/activities are covered
4. Considers the destination's typical weather and cultural norms

You must return ONLY a valid JSON object. Do not include any conversational text, markdown formatting, or prefixes."""

            message_with_instructions = ChatMessage(role="system", text=instructions)
            response = await llm.achat([message_with_instructions, message])
            print(f"LLM response: {response}")

            # Extract JSON from response
            content = response.message.content
            json_start = content.find("{")
            json_end = content.rfind("}") + 1

            if json_start != -1 and json_end != -1:
                json_str = content[json_start:json_end]
            else:
                json_str = content.strip()

            # Parse the response
            try:
                result = json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"Failed to parse JSON: {json_str}")
                raise e

            print(f"Parsed LLM result: {result}")

            # Map and validate the results
            validated_result = self._validate_and_map_results(result, wardrobe_items)

            return validated_result

        except Exception as e:
            print(f"Error generating travel suitcase: {str(e)}")
            raise e

    def _format_wardrobe(self, wardrobe_items: List[Dict]) -> List[Dict]:
        """Format wardrobe items for the prompt."""
        return [
            {
                "id": str(item["_id"]),
                "type": item["type"],
                "category": item["category"],
                "fit": item.get("fit"),
                "color": item["color"],
                "material": item.get("material"),
                "notes": item.get("notes"),
                "seasons": item.get("seasons", [])
            }
            for item in wardrobe_items
        ]

    def _format_styles(self, styles: List[Dict]) -> List[Dict]:
        """Format styles for the prompt."""
        if not styles:
            return []
        return [
            {
                "name": style.get("name", ""),
                "description": style.get("description", ""),
            }
            for style in styles
        ]

    def _analyze_saved_outfits(self, saved_outfits: List[Dict]) -> List[str]:
        """
        Analyze saved outfits to find frequently used items.
        Returns list of item IDs that appear most frequently.
        """
        if not saved_outfits:
            return []

        item_frequency = {}
        for outfit in saved_outfits:
            for item_id in outfit.get("items", []):
                item_frequency[item_id] = item_frequency.get(item_id, 0) + 1

        # Sort by frequency and return top items
        sorted_items = sorted(item_frequency.items(), key=lambda x: x[1], reverse=True)
        return [item_id for item_id, _ in sorted_items[:10]]

    def _build_suitcase_prompt(
        self,
        wardrobe_items: List[Dict],
        destination: str,
        start_date: datetime,
        end_date: datetime,
        duration_days: int,
        occasions: List[str],
        styles: List[Dict],
        favorite_items: List[str],
        user_preferences: Dict
    ) -> str:
        """Build a JSON-structured prompt for the LLM."""

        # Format dates as strings
        start_str = start_date.strftime("%B %d, %Y")
        end_str = end_date.strftime("%B %d, %Y")
        month = start_date.strftime("%B")

        # Build style description
        style_info = None
        if styles:
            style_names = [s["name"] for s in styles]
            style_descriptions = [f"{s['name']}: {s['description']}" for s in styles if s.get('description')]
            style_info = {
                "selected_styles": style_names,
                "style_descriptions": style_descriptions if style_descriptions else None,
                "variety_note": "Mix these styles across the trip for variety while maintaining cohesion" if len(styles) > 1 else None
            }

        prompt_data = {
            "task": {
                "action": "create_travel_suitcase",
                "output_format": "json_only"
            },
            "trip": {
                "destination": destination,
                "start_date": start_str,
                "end_date": end_str,
                "duration_days": duration_days,
                "month": month,
                "occasions": occasions
            },
            "wardrobe_items": wardrobe_items,
            "style_preferences": style_info,
            "user_context": {
                "favorite_item_ids": favorite_items if favorite_items else None,
                "preferences": {
                    "preferred_colors": user_preferences.get("preferred_colors", []),
                    "disliked_colors": user_preferences.get("disliked_colors", []),
                    "preferred_fits": user_preferences.get("preferred_fits", []),
                    "style_notes": user_preferences.get("style_notes", "")
                } if user_preferences else None
            },
            "constraints": {
                "minimize_items": True,
                "maximize_versatility": True,
                "ensure_occasion_coverage": True,
                "consider_weather": True,
                "consider_cultural_norms": True,
                "align_with_styles": True if styles else False
            },
            "instructions": [
                f"Analyze typical weather for {destination} in {month}",
                "Consider rain likelihood and temperature ranges",
                "Consider cultural dress codes if applicable (e.g., modest dress for religious sites)",
                "Ensure items can be mixed and matched for multiple outfits",
                "Prioritize user's favorite items if provided",
                "If styles are specified, ensure outfits align with those aesthetic preferences",
                "For multiple styles, vary the daily outfits to incorporate different styles throughout the trip",
                "Create one outfit suggestion per day covering all occasions",
                "Include layering options for variable weather if needed",
                "RETURN ONLY VALID JSON - no conversational text"
            ],
            "guidelines": {
                "versatility": "Select neutral colors that pair well together, with a few statement pieces and accent colors",
                "layering": "Include layers for temperature changes",
                "practicality": "Consider comfort for planned activities",
                "formality": "Ensure appropriate items for each occasion type",
                "weather_appropriate": "Match clothing to typical weather conditions",
                "base_items": "Make sure to include layering essentials like a white/black t-shirt etc."
            },
            "response_schema": {
                "destination_summary": {
                    "weather": "description of typical weather",
                    "temperature_range": "e.g., 15-22°C",
                    "packing_notes": "key considerations for this destination"
                },
                "packing_list": [
                    {
                        "item_id": "string - must match an id from wardrobe_items",
                        "reason": "why this item was selected"
                    }
                ],
                "daily_outfits": [
                    {
                        "day": 1,
                        "date": "formatted date string",
                        "occasion": "string - from occasions list",
                        "items": ["item_id_1", "item_id_2"],
                        "reasoning": "why this outfit works"
                    }
                ],
                "versatility_insights": "string explaining how many outfits can be created with packed items"
            }
        }

        # Clean None values recursively
        def clean_none(obj):
            if isinstance(obj, dict):
                return {k: clean_none(v) for k, v in obj.items() if v is not None}
            return obj

        return json.dumps(clean_none(prompt_data), indent=2)

    def _validate_and_map_results(self, result: Dict, wardrobe_items: List[Dict]) -> Dict:
        """Validate all item IDs exist in wardrobe and map results."""
        # Create a lookup dictionary
        item_lookup = {str(item['_id']): item for item in wardrobe_items}

        # Validate packing list
        validated_packing_list = []
        for pack_item in result.get("packing_list", []):
            item_id = pack_item.get("item_id")
            if item_id and item_id in item_lookup:
                validated_packing_list.append({
                    "item_id": item_id,
                    "reason": pack_item.get("reason", "")
                })
            else:
                print(f"Warning: Item {item_id} not found in wardrobe, skipping")

        # Validate daily outfits
        validated_outfits = []
        for outfit in result.get("daily_outfits", []):
            valid_items = [item_id for item_id in outfit.get("items", []) if item_id in item_lookup]
            if valid_items:
                validated_outfits.append({
                    "day": outfit.get("day"),
                    "date": outfit.get("date"),
                    "occasion": outfit.get("occasion"),
                    "items": valid_items,
                    "reasoning": outfit.get("reasoning", "")
                })

        return {
            "destination_summary": result.get("destination_summary", {}),
            "packing_list": validated_packing_list,
            "daily_outfits": validated_outfits,
            "versatility_insights": result.get("versatility_insights", "")
        }
