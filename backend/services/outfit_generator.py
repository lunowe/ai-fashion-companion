import json
import openai
from typing import List, Dict, Any, Optional
from config import settings
from models.clothing import ClothingItem
from models.style import Style
from llama_index.llms.openai import OpenAIResponses
from llama_index.llms.google_genai import GoogleGenAI
from llama_index.core.llms import ChatMessage, TextBlock, ImageBlock
from pathlib import Path
import os
import traceback
import tempfile
from utils.s3_service import s3_service

class OutfitGenerator:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        # os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_GENAI_API_KEY

    async def generate_outfits(
        self,
        wardrobe_items: List[Dict],
        style: Dict,
        occasion: str,
        weather: str,
        required_items: List[Dict] = [],
        exclude_items: List[str] = [],
        description: str = None,
        user_preferences: Dict = None,
        num_outfits: int = 3,
        api_key: str = None
    ) -> List[Dict]:
        """
        Generate outfit combinations based on wardrobe items, style, and constraints.
        
        Args:
            wardrobe_items: List of clothing items in the wardrobe
            style: The style to use for outfit generation
            occasion: The occasion or use case for the outfit
            weather: Weather conditions to consider
            required_items: 0-2 items that must be included in the outfit
            exclude_items: List of item IDs to exclude
            description: Specific user description/request
            user_preferences: User's style preferences
            num_outfits: Number of outfits to generate
            api_key: Optional API key for BYOK tier
            
        Returns:
            List of generated outfits with items and reasoning
        """
        # Filter out excluded items
        if exclude_items:
            wardrobe_items = [item for item in wardrobe_items if str(item['_id']) not in exclude_items]

        # Format the wardrobe items for the prompt
        formatted_wardrobe = self._format_wardrobe(wardrobe_items)
        
        # Format required items
        formatted_required = self._format_required_items(required_items)
        
        # Build the prompt
        prompt = self._build_generation_prompt(
            wardrobe_items,
            style,
            occasion,
            weather,
            required_items,
            description,
            user_preferences,
            num_outfits
        )

        print(f"Generated prompt for outfit generation:\n{prompt}\n")        
        try:
            # Use user's API key if provided (BYOK), otherwise use system key
            genai_key = api_key if api_key else settings.GOOGLE_GENAI_API_KEY
            
            llm = GoogleGenAI(
                model="gemini-2.5-flash",
                api_key=genai_key
            )

            # genai_key = api_key if api_key else settings.OPENAI_API_KEY
            # llm = OpenAIResponses(
            #     model="gpt-5.1",
            #     reasoning_options={"effort": "medium"},
            #     api_key=genai_key
            # )

            blocks = []
            if style.get('reference_images'):
                for img_key_or_url in style['reference_images']:
                    try:
                        file_path = await self._url_to_filepath(img_key_or_url)
                        blocks.append(ImageBlock(path=file_path))
                    except Exception as e:
                        # Skip images that can't be downloaded (deleted or missing)
                        print(f"Warning: Skipping reference image {img_key_or_url}: {e}")
                        continue
            message = ChatMessage(role="user", blocks=blocks + [TextBlock(text=prompt)])
            
            instructions = "You are a professional fashion stylist AI. Your task is to create outfits based on available clothing items, style preferences, and contextual factors. You must return ONLY a valid JSON object. Do not include any conversational text, markdown formatting, or prefixes like 'assistant:'."
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
            
            # Map the generated outfits back to clothing item IDs
            outfits = self._map_outfits_to_ids(result.get("outfits", []), wardrobe_items)
            
            return outfits
            
        except Exception as e:
            print(f"Error generating outfits: {str(e)}")
            return []
        
    async def _url_to_filepath(self, url_or_key: str) -> Path:
        """
        Convert a URL or S3 key to a local file path.
        For S3 keys, generate pre-signed URL and download to temp file.
        For local paths, use them directly.
        """
        # Check if it's an S3 key (not a URL, not a local path)
        if not url_or_key.startswith("http") and not url_or_key.startswith("/"):
            # It's an S3 key - download to temp file
            extension = url_or_key.split('.')[-1]
            if extension not in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                extension = 'jpg'
            
            # Create temp file
            temp_file = tempfile.NamedTemporaryFile(
                delete=False, 
                suffix=f".{extension}",
                dir=tempfile.gettempdir()
            )
            temp_path = temp_file.name
            temp_file.close()
            
            try:
                # Download from S3 using the key
                await s3_service.download_to_temp(url_or_key, temp_path)
                return Path(temp_path)
            except Exception as e:
                print(f"Error downloading from S3: {e}")
                raise ValueError(f"Cannot download S3 image: {url_or_key}")
        
        # Check if it's a pre-signed S3 URL
        elif url_or_key.startswith("https://") and ".s3." in url_or_key and ".amazonaws.com/" in url_or_key:
            # S3 URL (possibly pre-signed) - download to temp file
            extension = url_or_key.split('.')[-1].split('?')[0]  # Handle query params
            if extension not in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                extension = 'jpg'
            
            # Create temp file
            temp_file = tempfile.NamedTemporaryFile(
                delete=False, 
                suffix=f".{extension}",
                dir=tempfile.gettempdir()
            )
            temp_path = temp_file.name
            temp_file.close()
            
            # Download from S3
            try:
                await s3_service.download_to_temp(url_or_key, temp_path)
                return Path(temp_path)
            except Exception as e:
                print(f"Error downloading from S3: {e}")
                raise ValueError(f"Cannot download S3 image: {url_or_key}")
        
        elif url_or_key.startswith("http"):
            # External URL (not S3) - unsupported
            raise ValueError(f"Cannot use external URL as file path: {url_or_key}")
        
        elif url_or_key.startswith("/static/styles"):
            # Legacy local path
            filename = url_or_key.replace("/static/styles/", "")
            return Path("static/styles") / filename
        
        else:
            # Assume it's already a file path
            return Path(url_or_key)
            
    def _format_wardrobe(self, wardrobe_items: List[Dict]) -> List[Dict]:
        """Format wardrobe items for the prompt."""
        return [
            {
                "id": str(item["_id"]),
                "type": item["type"],
                "category": item["category"],
                "fit": item["fit"],
                "color": item["color"],
                "notes": item.get("notes"),
                "seasons": item.get("seasons")
            }
            for item in wardrobe_items
        ]

    def _format_required_items(self, required_items: List[Dict]) -> List[Dict] | None:
        """Format required items for the prompt."""
        if not required_items:
            return None
        
        return [
            {
                "id": str(item["_id"]),
                "type": item["type"],
                "fit": item["fit"],
                "color": item["color"],
                "notes": item.get("notes")
            }
            for item in required_items
        ]
        

    def _build_generation_prompt(
        self,
        wardrobe_items: List[Dict],
        style: Dict,
        occasion: str,
        weather: str,
        required_items: List[Dict] | None,
        description: str,
        user_preferences: Dict,
        num_outfits: int
    ) -> str:
        """Build a JSON-structured prompt for the LLM."""
        import json
        
        prompt_data = {
            "task": {
                "action": "create_outfits",
                "count": num_outfits,
                "output_format": "json_only"
            },
            "wardrobe_items": self._format_wardrobe(wardrobe_items),
            "constraints": {
                "style": {
                    "name": style["name"],
                    "description": style["description"],
                    "has_reference_images": bool(style.get("reference_images"))
                },
                "occasion": occasion,
                "weather": weather,
                "required_items": self._format_required_items(required_items)
            },
            "user_preferences": {
                "preferred_colors": user_preferences.get("preferred_colors", []),
                "disliked_colors": user_preferences.get("disliked_colors", []),
                "preferred_fits": user_preferences.get("preferred_fits", []),
                "style_notes": user_preferences.get("style_notes", "")
            } if user_preferences else None,
            "user_request": description or None,
            "instructions": [
                f"Create {num_outfits} distinct outfits matching style '{style['name']}' for '{occasion}' in '{weather}' weather",
                "If reference images provided, align outfits with visual cues",
                "Include all required items in each outfit",
                "Ensure color coordination, fit combination, and style cohesion",
                "Provide brief reasoning for each outfit",
                "Ensure variety between outfits",
                "PRIORITIZE user preferences; AVOID disliked colors/styles",
                "User request/description takes priority over general rules",
                "RETURN ONLY VALID JSON - no conversational text"
            ],
            "guidelines": {
                "layering": "lighter colors under darker colors",
                "silhouette": "avoid slim bottoms with bulky tops",
                "color_balance": "balance bold colors with neutrals",
                "accessories": "enhance without clashing",
                "practicality": "appropriate for weather conditions",
                "appropriateness": "suitable for the occasion"
            },
            "priority_order": [
                "user_request (if provided)",
                "required_items",
                "user_preferences (avoid disliked, favor preferred)",
                "style alignment",
                "occasion/weather appropriateness"
            ],
            "response_schema": {
                "outfits": [
                    {
                        "outfit_name": "string",
                        "items": ["item_id_1", "item_id_2"],
                        "reasoning": "string"
                    }
                ]
            }
        }
        
        # Clean None values recursively
        def clean_none(obj):
            if isinstance(obj, dict):
                return {k: clean_none(v) for k, v in obj.items() if v is not None}
            return obj
        
        return json.dumps(clean_none(prompt_data), indent=2)
        
    def _map_outfits_to_ids(self, generated_outfits: List[Dict], wardrobe_items: List[Dict]) -> List[Dict]:
        """Map the generated outfits to actual clothing item IDs."""
        # Create a lookup dictionary for easier item ID retrieval
        item_lookup = {str(item['_id']): item for item in wardrobe_items}
        
        mapped_outfits = []
        for outfit in generated_outfits:
            # Verify all items exist in the wardrobe
            valid_item_ids = [item_id for item_id in outfit['items'] if item_id in item_lookup]
            
            if valid_item_ids:
                mapped_outfits.append({
                    "name": outfit.get('outfit_name', 'Unnamed Outfit'),
                    "items": valid_item_ids,
                    "ai_generated_reasoning": outfit.get('reasoning', '')
                })
                
        return mapped_outfits