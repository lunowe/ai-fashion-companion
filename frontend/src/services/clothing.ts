import { api } from "@/lib/api";
import type { ClothingItem } from "@/types";

export async function listClothing(): Promise<ClothingItem[]> {
    const { data } = await api.get("/api/clothing/");
    return data;
}

export async function createClothing(payload: Omit<ClothingItem, "_id">): Promise<ClothingItem> {
    console.log("Creating clothing item", payload);
    const { data } = await api.post("/api/clothing/", payload);
    return data;
}

export async function updateClothing(id: string, patch: Partial<ClothingItem>): Promise<ClothingItem> {
    const { data } = await api.put(`/api/clothing/${id}`, patch);
    return data;
}

export async function deleteClothing(id: string): Promise<void> {
    await api.delete(`/api/clothing/${id}`);
}
