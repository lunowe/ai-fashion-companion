import { api } from "@/lib/api";
import type {
  Outfit,
  OutfitCreate,
  GeneratedOutfit,
  OutfitGenRequest,
  HistoryEntry,
} from "@/types";

export async function generateOutfits(
  payload: OutfitGenRequest
): Promise<GeneratedOutfit[]> {
  console.log("Generating outfits with payload:", payload);
  const { data } = await api.post("/api/outfits/generate", payload);
  console.log("Generated outfits response:", data);
  return data?.outfits ?? [];
}

export async function saveOutfit(payload: OutfitCreate): Promise<Outfit> {
  console.log("Saving outfit with payload:", payload);
  const { data } = await api.post("/api/outfits/", payload);
  return data;
}

export interface PaginatedOutfitsResponse {
  outfits: Outfit[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface ListOutfitsParams {
  cursor?: string | null;
  limit?: number;
  style_id?: string | null;
  search?: string | null;
}

export async function listOutfits(
  params: ListOutfitsParams = {}
): Promise<PaginatedOutfitsResponse> {
  const { cursor, limit = 12, style_id, search } = params;
  const urlParams = new URLSearchParams();

  if (cursor) urlParams.append("cursor", cursor);
  urlParams.append("limit", limit.toString());
  if (style_id) urlParams.append("style_id", style_id);
  if (search) urlParams.append("search", search);

  const { data } = await api.get(`/api/outfits/?${urlParams.toString()}`);
  return data;
}

export async function deleteOutfit(id: string): Promise<void> {
  await api.delete(`/api/outfits/${id}`);
}

export const getGenerationHistory = async (): Promise<HistoryEntry[]> => {
  const res = await api.get("/api/outfits/history"); // Adjust URL based on your router prefix
  return res.data;
};

export async function triggerVisualization(
  id: string,
  regenerate: boolean = false
): Promise<{ status: string; visualization_url?: string }> {
  const params = regenerate ? "?regenerate=true" : "";
  const { data } = await api.post(`/api/outfits/${id}/visualize${params}`);
  return data;
}

export async function getVisualizationStatus(
  id: string
): Promise<{ status: string; visualization_url?: string }> {
  const { data } = await api.get(`/api/outfits/${id}/visualization-status`);
  return data;
}
