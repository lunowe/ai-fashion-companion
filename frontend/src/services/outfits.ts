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

export async function updateOutfit(
  id: string,
  patch: Partial<OutfitCreate>
): Promise<Outfit> {
  const { data } = await api.put(`/api/outfits/${id}`, patch);
  return data;
}

export async function listOutfits(): Promise<Outfit[]> {
  const { data } = await api.get("/api/outfits/");
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
  const { data } = await api.post(`/api/outfits/${id}/visualize`, null, {
    params: { regenerate },
  });
  return data;
}

export async function getVisualizationStatus(
  id: string
): Promise<{ status: string; visualization_url?: string }> {
  const { data } = await api.get(`/api/outfits/${id}/visualization-status`);
  return data;
}
