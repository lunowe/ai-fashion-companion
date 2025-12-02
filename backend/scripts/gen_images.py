import os
import time
import re
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()

os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_GENAI_API_KEY")
# =================CONFIGURATION=================
OUTPUT_DIR = "generated_fashion_emojis"
MODEL_NAME = "imagen-4.0-ultra-generate-001"
# ===============================================
client = genai.Client()

def safe_filename(text):
    """Helper to make strings safe for filenames."""
    # Replace non-alphanumeric characters with hyphens, lowercase
    s = re.sub(r'[^a-z0-9]', '-', text.lower())
    # Remove duplicate hyphens
    s = re.sub(r'-+', '-', s)
    return s.strip('-')


def generate_and_save_image(prompt, output_path):
    """Generates image using Vertex AI and saves to disk."""
    print(f"Generating prompt: {prompt}...")
    try:
        # Using aspect_ratio="1:1" for emoji-like square images.
        # While the prompt asks for transparency, Imagen-4 sometimes needs
        # a nudge. We hope the model respects the prompt request.
        # Currently, the API doesn't have a strict "png_alpha" parameter,
        # it relies on the prompt instruction.
        # images = client.models.generate_images(
        #     model=MODEL_NAME,
        #     prompt=prompt,
        #     config=types.GenerateImagesConfig(
        #         number_of_images= 1,
        #         aspect_ratio="1:1",
        #     ),
        # )
        base_image_1 = Image.open("base_image_1.png")
        base_image_2 = Image.open("base_image_2.png")
        base_image_3 = Image.open("base_image_3.png")
        base_image_4 = Image.open("base_image_4.png")
        base_image_5 = Image.open("base_image_5.png")
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[prompt, base_image_1, base_image_2, base_image_3, base_image_4, base_image_5],
        )

        for part in response.parts:
            if part.text is not None:
                print(part.text)
            elif part.inline_data is not None:
                image = part.as_image()
                image.save(output_path)
                print(f"Successfully saved to: {output_path}")
                return True
            else:
                print("Warning: No image returned by the model.")
                return False

        # for generated_image in images.generated_images:
        #     generated_image.image.save(output_path)
        # # if images and images[0]:
        # #     # Save the generated image to the local file system
        # #     images[0].save(location=output_path, include_generation_parameters=False)
        #     print(f"Successfully saved to: {output_path}")
        #     return True
        # else:
        #     print("Warning: No image returned by the model.")
        #     return False

    except Exception as e:
        print(f"Error generating image: {e}")
        # Optional: Add specific error handling quotas, content filters, etc.
        if "429" in str(e):
             print("Quota exceeded. Pausing for 60 seconds...")
             time.sleep(60)
        if "blocked" in str(e).lower():
             print("Image generation blocked by safety filters.")
        return False


# --- Data Structure (Translated from your JS) ---
CATEGORIES = [
    {
        "id": "tops", "name": "Tops", "icon": "👕",
        "items": [
            {"id": "tshirt", "type": "t-shirt", "icon": "👕", "colors": ["black"], "fits": ["slim", "regular", "oversized", "cropped"]},
            {"id": "longsleeve", "type": "longsleeve", "icon": "👔", "colors": ["black"], "fits": ["slim", "regular", "oversized"]},
            {"id": "polo", "type": "polo shirt", "icon": "👕", "colors": ["black"], "fits": ["slim", "regular"]},
            {"id": "dress-shirt", "type": "dress shirt", "icon": "👔", "colors": ["black"], "fits": ["slim", "regular", "relaxed"]},
            {"id": "button-up", "type": "button-up shirt", "icon": "👔", "colors": ["black"], "fits": ["slim", "regular", "oversized"]},
            {"id": "henley", "type": "henley", "icon": "👕", "colors": ["black"], "fits": ["slim", "regular"]},
            {"id": "tank", "type": "tank top", "icon": "🎽", "colors": ["black"], "fits": ["slim", "regular"]},
        ],
    },
    {
        "id": "sweaters", "name": "Sweaters & Knits", "icon": "🧶",
        "items": [
            {"id": "hoodie", "type": "hoodie", "icon": "🧥", "colors": ["black"], "fits": ["regular", "oversized"]},
            {"id": "knit-sweater", "type": "knit sweater", "icon": "🧶", "colors": ["black"], "fits": ["slim", "regular", "oversized"]},
            {"id": "cardigan", "type": "cardigan", "icon": "🧥", "colors": ["black"], "fits": ["slim", "regular", "oversized"]},
            {"id": "sweatshirt", "type": "sweatshirt", "icon": "👕", "colors": ["black"], "fits": ["regular", "oversized"]},
            {"id": "quarter-zip", "type": "quarter-zip", "icon": "👕", "colors": ["black"], "fits": ["regular", "oversized"]},
            {"id": "turtleneck", "type": "turtleneck", "icon": "🧶", "colors": ["black"], "fits": ["slim", "regular"]},
            {"id": "vest-sweater", "type": "sweater vest", "icon": "🦺", "colors": ["black"], "fits": ["slim", "regular"]},
        ],
    },
     {
        "id": "outerwear", "name": "Outerwear", "icon": "🧥",
        "items": [
            {"id": "blazer", "type": "blazer", "icon": "🤵", "colors": ["black"], "fits": ["slim", "regular", "oversized"]},
            {"id": "coat", "type": "coat", "icon": "🧥", "colors": ["black"], "fits": ["regular", "oversized"]},
            {"id": "trench", "type": "trench coat", "icon": "🧥", "colors": ["black"], "fits": ["regular", "oversized"]},
            {"id": "parka", "type": "parka", "icon": "🧥", "colors": ["black"], "fits": ["regular", "oversized"]},
            {"id": "bomber", "type": "bomber jacket", "icon": "🧥", "colors": ["black"], "fits": ["regular", "oversized"]},
            {"id": "denim-jacket", "type": "denim jacket", "icon": "🧥", "colors": ["black"], "fits": ["slim", "regular", "oversized"]},
            {"id": "leather-jacket", "type": "leather jacket", "icon": "🧥", "colors": ["black"], "fits": ["slim", "regular", "oversized"]},
            {"id": "windbreaker", "type": "windbreaker", "icon": "🧥", "colors": ["black"], "fits": ["regular", "oversized"]},
            {"id": "puffer-jacket", "type": "puffer jacket", "icon": "🧥", "colors": ["black"], "fits": ["regular", "oversized"]},
            {"id": "puffer-vest", "type": "puffer vest", "icon": "🦺", "colors": ["black"], "fits": ["regular", "oversized"]},
        ],
    },
    {
        "id": "bottoms", "name": "Bottoms", "icon": "👖",
        "items": [
            {"id": "jeans", "type": "jeans", "icon": "👖", "colors": ["black"], "fits": ["slim", "straight", "relaxed", "wide"]},
            {"id": "chinos", "type": "chinos", "icon": "👖", "colors": ["black"], "fits": ["slim", "straight", "relaxed"]},
            {"id": "dress-pants", "type": "dress pants", "icon": "👔", "colors": ["black"], "fits": ["slim", "straight", "relaxed"]},
            {"id": "cargo-pants", "type": "cargo pants", "icon": "👖", "colors": ["black"], "fits": ["regular", "relaxed", "tapered"]},
            {"id": "joggers", "type": "joggers", "icon": "👖", "colors": ["black"], "fits": ["slim", "regular", "relaxed"]},
            {"id": "shorts", "type": "shorts", "icon": "🩳", "colors": ["black"], "fits": ["slim", "regular", "relaxed"]},
            {"id": "sweatpants", "type": "sweatpants", "icon": "👖", "colors": ["black"], "fits": ["slim", "regular", "relaxed"]},
        ],
    },
    {
        "id": "shoes", "name": "Shoes", "icon": "👟",
        "items": [
            {"id": "sneakers", "type": "sneakers", "icon": "👟", "colors": ["black"], "fits": ["low-top", "high-top"]},
            {"id": "dress-shoes", "type": "dress shoes", "icon": "👞", "colors": ["black"], "fits": ["oxford", "derby"]},
            {"id": "loafers", "type": "loafers", "icon": "👞", "colors": ["black"], "fits": ["penny", "tassel", "horsebit"]},
            {"id": "boots", "type": "boots", "icon": "🥾", "colors": ["black"], "fits": ["chelsea", "combat", "work", "chukka"]},
            {"id": "slip-ons", "type": "slip-ons", "icon": "👟", "colors": ["black"], "fits": ["canvas", "leather"]},
            {"id": "sandals", "type": "sandals", "icon": "👡", "colors": ["black"], "fits": ["slides", "strappy"]},
            {"id": "espadrilles", "type": "espadrilles", "icon": "👟", "colors": ["black"], "fits": ["regular"]},
        ],
    },
    {
        "id": "accessories", "name": "Accessories", "icon": "🎩",
        "items": [
            {"id": "hat", "type": "hat", "icon": "🧢", "colors": ["black"], "fits": ["cap", "beanie", "bucket"]},
            {"id": "belt", "type": "belt", "icon": "👔", "colors": ["black"], "fits": ["leather", "canvas", "woven"]},
            {"id": "bag", "type": "bag", "icon": "🎒", "colors": ["black"], "fits": ["backpack", "messenger", "tote", "duffel"]},
            {"id": "scarf", "type": "scarf", "icon": "🧣", "colors": ["black"], "fits": ["regular"]},
            {"id": "sunglasses", "type": "sunglasses", "icon": "🕶️", "colors": ["black"], "fits": ["aviator", "wayfarer", "round", "rectangular"]},
            {"id": "watch", "type": "watch", "icon": "⌚", "colors": ["black"], "fits": ["leather", "metal", "nato"]},
            {"id": "gloves", "type": "gloves", "icon": "🧤", "colors": ["black"], "fits": ["leather", "knit"]},
            {"id": "tie", "type": "tie", "icon": "👔", "colors": ["black"], "fits": ["regular", "slim"]},
            {"id": "pocket-square", "type": "pocket square", "icon": "🎩", "colors": ["black"], "fits": ["regular"]},
            {"id": "socks", "type": "socks", "icon": "🧦", "colors": ["black"], "fits": ["ankle", "crew", "dress"]},
        ],
    },
]
# ------------------------------------------------

# Main execution loop
if __name__ == "__main__":
    # Ensure output directory exists
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created output directory: {OUTPUT_DIR}")

    total_count = 0
    success_count = 0

    print("Starting generation process...")

    for category in CATEGORIES:
        cat_name = category['name']
        cat_id = category['id']
        print(f"\n--- Processing Category: {cat_name} ---")

        # Create subdirectory for category to keep things organized
        cat_dir = os.path.join(OUTPUT_DIR, safe_filename(cat_id))
        if not os.path.exists(cat_dir):
            os.makedirs(cat_dir)

        for item in category['items']:
            item_type = item['type']
            item_id = item['id']
            
            # Create subdirectory for specific item type
            item_dir = os.path.join(cat_dir, safe_filename(item_id))
            if not os.path.exists(item_dir):
                os.makedirs(item_dir)

            for color in item['colors']:
                total_count += 1

                # Construct the prompt based on your template
                # Added extra emphasis on "isolated" and "png" for transparency
                prompt_text = f"""Generate a picture for a fashion app of the following clothing item in the style of apple emojis with a white background. The item should be isolated cleanly centered in the frame.
Clothing item:
Category: {cat_name}
Type: {item_type}
Color: black
"""

                # Create a unique filename
                filename = f"{safe_filename(color)}.png"
                full_output_path = os.path.join(item_dir, filename)

                # Check if file exists to skip (helpful if script crashes and restarts)
                if os.path.exists(full_output_path):
                    print(f"Skipping {filename} (already exists).")
                    continue

                # Call generator
                success = generate_and_save_image(prompt_text, full_output_path)
                if success:
                    success_count += 1
                
                # Add a small delay to avoid hitting API rate limits too forcefully
                time.sleep(1.5)
                
                # --- TESTING LIMITER: Uncomment these lines to only run a few items for testing ---
                if total_count >= 3: break

    print(total_count)
    # print(f"\nCompleted. Successfully generated {success_count} out of {total_count} attempted items.")
    # print(f"Check the '{OUTPUT_DIR}' directory.")