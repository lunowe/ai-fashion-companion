from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types
import json
import io
import base64
import os
from rembg import remove
from PIL import Image
from config import settings

class OutfitVisualizer:
    # We move the high-level style definition here, but it will be injected into the JSON
    VISUAL_STYLE = "Apple Emoji Style"
    
    def __init__(self):
        # Initialize the client from settings
        self.client = genai.Client(api_key=settings.GOOGLE_GENAI_API_KEY)

    def _load_local_references(self) -> List[Image.Image]:
        """
        Loads reference images and composites them onto a neutral grey background
        to simulate a studio environment for the AI.
        """
        # Define path relative to this file
        base_path = os.path.dirname(os.path.abspath(__file__))
        ref_folder = os.path.join(base_path, "..", "assets", "style_refs")
        
        images = []
        valid_extensions = {".jpg", ".jpeg", ".png", ".webp"}
        
        # The specific light grey used in standard studio setups
        # This matches the "Neutral, clean studio background" in your text prompt
        STUDIO_GREY = (242, 242, 242) 

        if not os.path.exists(ref_folder):
            print(f"Warning: Reference folder not found at {ref_folder}")
            return []

        for filename in sorted(os.listdir(ref_folder)):
            ext = os.path.splitext(filename)[1].lower()
            if ext in valid_extensions:
                try:
                    path = os.path.join(ref_folder, filename)
                    
                    # 1. Open the image
                    img = Image.open(path).convert("RGBA")
                    
                    # 2. Create a solid grey background of the same size
                    background = Image.new("RGB", img.size, STUDIO_GREY)
                    
                    # 3. Paste the transparent outfit onto the grey background
                    # The third argument 'img' acts as the transparency mask
                    background.paste(img, (0, 0), img)
                    
                    images.append(background)
                    
                except Exception as e:
                    print(f"Failed to load local reference {filename}: {e}")
        
        return images
    
    def build_prompt(
        self,
        items: List[Dict[str, Any]],
        reasoning: Optional[str] = None,
        style_name: Optional[str] = None,
        occasion: Optional[str] = None,
        weather: Optional[str] = None,
        has_references: bool = False
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

        reference_instruction = ""
        if has_references:
            reference_instruction = (
                "CRITICAL: I have provided reference images. "
                "You MUST exactly match the lighting, camera angle, mannequin style, "
                "and background color (plain grey studio) of these provided examples. "
                "Do not copy the clothes in the reference, only the visual presentation style."
            )

        # 2. Build the structured dictionary
        prompt_structure = {
            "directives": {
                "task": "Outfit Mockup Generation",
                "reference_instruction": reference_instruction,
                "artistic_style": self.VISUAL_STYLE,
                "render_quality": "High definition, vector-like aesthetic, soft gradients",
                "subject_display": "Worn by a neutral dummy model (faceless/mannequin)",
                "background": "Neutral, clean studio background (plain, light grey)",
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
        api_key: Optional[str] = None,
        use_style_references: bool = True
    ) -> Optional[bytes]:
        """
        Generate outfit visualization image, returns image bytes.
        """
        # Generate the JSON prompt
        prompt = self.build_prompt(items, reasoning, style_name, occasion, weather, use_style_references)
        
        client = self.client
        if api_key:
            client = genai.Client(api_key=api_key)
        
        try:
            contents = [prompt]

            if use_style_references:
                print("Loading local style references...")
                ref_images = self._load_local_references()
                if ref_images:
                    contents.extend(ref_images)
                else:
                    print("No local reference images found, proceeding without them.")

            response = client.models.generate_content(
                model="gemini-2.5-flash-image", 
                contents=contents,
            )
            
            # Extract image data (handling may vary based on exact API response structure)
            raw_image_bytes = None
            for part in response.candidates[0].content.parts:
                if part.inline_data is not None:
                    raw_image_bytes = part.inline_data.data
                    break
            
            if not raw_image_bytes:
                return None
            
            # 2. Post-Process: Remove Background immediately
            # 'rembg' takes bytes and returns bytes (transparent PNG)
            print("Processing background removal...")
            processed_image_bytes = remove(raw_image_bytes)

            return processed_image_bytes

        except Exception as e:
            print(f"Error generating visualization: {e}")
            # Optional: Print the prompt that failed for debugging
            # print(f"Failed Prompt Payload: {prompt}")
            raise