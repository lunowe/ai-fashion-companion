import { api } from "@/lib/api";
import type { CatalogItem } from "@/types";

// Omit _id for creation
export type CatalogItemCreate = Omit<CatalogItem, "_id">;

// Allow partial updates for all fields
export type CatalogItemUpdate = Partial<Omit<CatalogItem, "_id">>;

// --- API Methods ---

export async function listCatalogItems(
  category?: string
): Promise<CatalogItem[]> {
  // Passes ?category=tops if provided, otherwise gets all
  const params = category ? { category } : undefined;
  const { data } = await api.get("/api/catalog/", { params });
  return data;
}

export async function getCatalogItem(id: string): Promise<CatalogItem> {
  const { data } = await api.get(`/api/catalog/${id}`);
  return data;
}

export async function createCatalogItem(
  payload: CatalogItemCreate
): Promise<CatalogItem> {
  const { data } = await api.post("/api/catalog/", payload);
  return data;
}

export async function updateCatalogItem(
  id: string,
  patch: CatalogItemUpdate
): Promise<CatalogItem> {
  const { data } = await api.put(`/api/catalog/${id}`, patch);
  return data;
}

export async function deleteCatalogItem(id: string): Promise<void> {
  await api.delete(`/api/catalog/${id}`);
}

// Helper to reset/fill DB with defaults
export async function seedCatalog(): Promise<{ message: string }> {
  const { data } = await api.post("/api/catalog/seed");
  return data;
}
