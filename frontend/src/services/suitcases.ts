import { api } from "@/lib/api";
import type {
  SuitcaseGenRequest,
  SuitcaseGenResponse,
  TravelSuitcase,
  TravelSuitcaseCreate,
  TravelSuitcaseUpdate,
} from "@/types";

export async function generateSuitcase(
  payload: SuitcaseGenRequest
): Promise<SuitcaseGenResponse> {
  console.log("Generating travel suitcase with payload:", payload);
  const { data } = await api.post("/api/suitcases/generate", payload);
  console.log("Generated suitcase response:", data);
  return data;
}

export async function saveSuitcase(
  payload: TravelSuitcaseCreate
): Promise<TravelSuitcase> {
  console.log("Saving suitcase with payload:", payload);
  const { data } = await api.post("/api/suitcases/", payload);
  return data;
}

export async function listSuitcases(): Promise<TravelSuitcase[]> {
  const { data } = await api.get("/api/suitcases/");
  return data;
}

export async function getSuitcase(id: string): Promise<TravelSuitcase> {
  const { data } = await api.get(`/api/suitcases/${id}`);
  return data;
}

export async function updateSuitcase(
  id: string,
  payload: TravelSuitcaseUpdate
): Promise<TravelSuitcase> {
  const { data } = await api.put(`/api/suitcases/${id}`, payload);
  return data;
}

export async function deleteSuitcase(id: string): Promise<void> {
  await api.delete(`/api/suitcases/${id}`);
}
