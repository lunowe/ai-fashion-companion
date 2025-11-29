import type { ClothingItem, GeneratedOutfit } from "@/types";

export function normalizeGenerated(o: any): GeneratedOutfit {
    const items = Array.isArray(o?.items) ? o.items : Array.isArray(o?.item_ids) ? o.item_ids : [];
    return {
        items,
        name: o?.name,
        ai_generated_reasoning: o?.ai_generated_reasoning,
    };
}

export function resolveItemObjects(items: (string | ClothingItem)[], wardrobe: ClothingItem[]): ClothingItem[] {
    return items
        .map((it) => (typeof it === "string" ? wardrobe.find((w) => w._id === it) : it))
        .filter(Boolean) as ClothingItem[];
}
