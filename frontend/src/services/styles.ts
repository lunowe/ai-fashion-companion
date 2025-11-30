import { api } from "@/lib/api";
import type { Style } from "@/types";

export async function listStyles(customOnly = false): Promise<Style[]> {
    const { data } = await api.get("/api/styles/", { params: { custom_only: customOnly } });
    return data;
}

export async function createStyle(payload: Omit<Style, "_id">): Promise<Style> {
    const sanitized: Omit<Style, "_id"> = {
        ...payload,
        reference_images: Array.isArray(payload.reference_images) ? payload.reference_images : [],
    };
    console.log("sanitized", sanitized);
    const { data } = await api.post("/api/styles/", sanitized);
    return data;
}

export async function updateStyle(id: string, patch: Partial<Style>): Promise<Style> {
    const { data } = await api.put(`/api/styles/${id}`, patch);
    return data;
}

export async function deleteStyle(id: string): Promise<void> {
    await api.delete(`/api/styles/${id}`);
}
