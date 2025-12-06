from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types
import json
import io
import base64
import os
from config import settings

class OutfitVisualizer:
    # We move the high-level style definition here, but it will be injected into the JSON
    VISUAL_STYLE = "Apple Emoji Style"
    
    def __init__(self):
        # Initialize the client from settings
        self.client = genai.Client(api_key=settings.GOOGLE_GENAI_API_KEY)
    
    def build_prompt(
        self,
        items: List[Dict[str, Any]],
        reasoning: Optional[str] = None,
        style_name: Optional[str] = None,
        occasion: Optional[str] = None,
        weather: Optional[str] = None
    ) -> str:
        """
        Constructs a structured JSON prompt for the image generator.
        """
        
        # 1. compile context
        context_parts = []
        if style_name: context_parts.append(f"Style: {style_name}")
        if occasion: context_parts.append(f"Occasion: {occasion}")
        if weather: context_parts.append(f"Weather: {weather}")
        context_str = ", ".join(context_parts) if context_parts else "Everyday wear"

        # 2. Build the structured dictionary
        prompt_structure = {
            "directives": {
                "task": "Outfit Mockup Generation",
                "artistic_style": self.VISUAL_STYLE,
                "render_quality": "High definition, vector-like aesthetic, soft gradients",
                "subject_display": "Worn by a neutral dummy model (faceless/mannequin)",
                "background": "Neutral, clean studio background (plain)",
                "view": "Full outfit view"
            },
            "context": {
                "scenario": context_str,
                "styling_notes": reasoning or "Cohesive, stylish outfit visualization."
            },
            "inventory": items  # Passes the list of dicts directly
        }

        # 3. Return as a JSON string
        return json.dumps(prompt_structure, indent=4)

    async def generate_image(
        self,
        items: List[Dict[str, Any]],
        reasoning: Optional[str] = None,
        style_name: Optional[str] = None,
        occasion: Optional[str] = None,
        weather: Optional[str] = None,
        api_key: Optional[str] = None
    ) -> Optional[bytes]:
        """
        Generate outfit visualization image, returns image bytes.
        """
        # Generate the JSON prompt
        prompt = self.build_prompt(items, reasoning, style_name, occasion, weather)
        
        client = self.client
        if api_key:
            client = genai.Client(api_key=api_key)
        
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash-image", 
                contents=[prompt],
            )
            
            # Extract image data (handling may vary based on exact API response structure)
            for part in response.candidates[0].content.parts:
                if part.inline_data is not None:
                    return part.inline_data.data
            
            return None

        except Exception as e:
            print(f"Error generating visualization: {e}")
            # Optional: Print the prompt that failed for debugging
            # print(f"Failed Prompt Payload: {prompt}")
            raise