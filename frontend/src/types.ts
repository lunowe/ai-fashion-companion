// User & Usage Types
export type UsageCounts = {
  outfit_generation: number;
  suitcase_generation: number;
  visualization: number;
};

export type FeatureType =
  | "outfit_generation"
  | "suitcase_generation"
  | "visualization";

export type ResourceType = "wardrobe_size" | "saved_outfits" | "custom_styles";

export type FeatureLimits = Record<FeatureType, Record<string, number>>;
export type ResourceLimits = Record<ResourceType, Record<string, number>>;

// Daily limits (reset each day)
export const FEATURE_LIMITS: FeatureLimits = {
  outfit_generation: { free: 5, premium: 50, byok: Infinity },
  suitcase_generation: { free: 0, premium: 10, byok: Infinity },
  visualization: { free: 3, premium: 15, byok: Infinity },
};

// Resource limits (total counts)
export const RESOURCE_LIMITS: ResourceLimits = {
  wardrobe_size: { free: 75, premium: 250, byok: Infinity },
  saved_outfits: { free: 15, premium: Infinity, byok: Infinity },
  custom_styles: { free: 1, premium: 10, byok: Infinity },
};

export type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  usage_counts: UsageCounts;
  last_reset_date: string;
  api_key?: string;
};

export type ClothingItem = {
  _id: string;
  user_id?: string;
  category: string;
  type: string;
  color: string;
  color_code?: string;
  fit: string;
  icon_id?: string;
  icon_aspect_ratio?: string;
  material?: string;
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
  visualization_key?: string;
  visualization_url?: string;
  visualization_status?: "none" | "pending" | "completed" | "failed";
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
  model?: string;
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
    style_id?: string;
    occasion?: string;
    weather?: string;
    description?: string;
  };
  outfits: GeneratedOutfit[];
}

export type IconOverride = {
  match: { fit?: string; material?: string };
  icon_id: string;
};

export interface CatalogItem {
  _id: string;
  category: string;
  type: string;
  icon?: string;
  icon_id?: string;
  icon_aspect_ratio?: string;
  icon_overrides?: IconOverride[];
  allowed_colors: string[];
  allowed_fits: string[];
  allowed_materials: string[];
  default_seasons?: string[];
  formality_level?: number;
}

// Travel Suitcase Types
export type SuitcaseGenRequest = {
  destination: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  occasions: string[];
  style_ids?: string[]; // 1-3 style IDs for variety
  model?: string;
};

export type PackingItem = {
  item_id: string;
  reason?: string;
};

export type DailyOutfit = {
  day: number;
  date?: string;
  occasion: string;
  items: string[];
  reasoning?: string;
};

export type DestinationSummary = {
  weather?: string;
  temperature_range?: string;
  packing_notes?: string;
};

export type SuitcaseGenResponse = {
  destination_summary: DestinationSummary;
  packing_list: PackingItem[];
  daily_outfits: DailyOutfit[];
  versatility_insights: string;
};

// Saved Suitcase Types
export type TravelSuitcase = {
  _id: string;
  user_id?: string;
  name?: string;
  destination: string;
  start_date: string;
  end_date: string;
  occasions: string[];
  style_ids?: string[];
  destination_summary?: DestinationSummary;
  packing_list: PackingItem[];
  daily_outfits: DailyOutfit[];
  versatility_insights?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type TravelSuitcaseCreate = Omit<
  TravelSuitcase,
  "_id" | "user_id" | "created_at" | "updated_at"
>;

export type TravelSuitcaseUpdate = Partial<TravelSuitcaseCreate>;

// Subscription & Billing Types
export type BillingInterval = "monthly" | "yearly";

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "none";

export type Subscription = {
  plan: string; // 'free' | 'premium' | 'byok'
  status: SubscriptionStatus;
  billing_interval?: BillingInterval;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
};

export type PaymentHistoryItem = {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: "succeeded" | "pending" | "failed" | "refunded";
  description: string;
  invoice_url?: string;
};

export type PlanPricing = {
  monthly: number;
  yearly: number;
};

// LLM Model Selection
export type LLMModel = {
  id: string;
  name: string;
  provider: string;
};

export const LLM_MODELS: LLMModel[] = [
  { id: "anthropic/claude-sonnet-4.6", name: "Claude Sonnet 4.6", provider: "Anthropic" },
  { id: "moonshotai/kimi-k2", name: "Kimi K2", provider: "Moonshot" },
  { id: "moonshotai/kimi-k2.5", name: "Kimi K2.5", provider: "Moonshot" },
  { id: "google/gemini-3.1-flash", name: "Gemini 3.1 Flash", provider: "Google" },
  { id: "openai/gpt-5.4", name: "GPT-5.4", provider: "OpenAI" },
  { id: "x-ai/grok-4.20-beta", name: "Grok 4.20 Beta", provider: "xAI" },
];
