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

export async function listOutfits(
  cursor?: string | null,
  limit: number = 12
): Promise<PaginatedOutfitsResponse> {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  params.append("limit", limit.toString());

  const { data } = await api.get(`/api/outfits/?${params.toString()}`);
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
