export type ClothingItem = {
    _id: string;
    user_id?: string;
    category: string;
    type: string;
    color: string;
    color_code?: string;
    fit: string;
    seasons?: string[];
    image_url?: string;
    notes?: string;
};

export type Style = {
    _id: string;
    name: string;
    description?: string;
    user_id?: string | null;
    is_custom?: boolean;
    reference_images?: string[];
    style_prompt?: string;
};

export type Outfit = {
    _id: string;
    name?: string;
    style_id: string;
    items: string[];
    occasion?: string;
    weather?: string;
    ai_generated_reasoning?: string;
    user_id?: string;
    notes?: string;
};

export type OutfitCreate = Omit<Outfit, "_id">;

export type OutfitGenRequest = {
    style_id: string;
    occasion?: string;
    weather?: string;
    description?: string;
    required_items: string[];
    exclude_items?: string[];
    num_outfits: number;
};

/** Unklare Struktur serverseitiger Generierung robust behandeln */
export type GeneratedOutfit = {
    items: ClothingItem["_id"][];
    name: string;
    ai_generated_reasoning: string;
};

export interface HistoryEntry {
    generated_at: string; // ISO Date string
    request_details: {
        style_name?: string;
        occasion?: string;
        weather?: string;
        description?: string;
    };
    outfits: GeneratedOutfit[];
}
