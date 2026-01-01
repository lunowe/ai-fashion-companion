// services/colors.ts
import { api } from "@/lib/api";

export type Color = {
  _id: string;
  name: string;
  slug: string;
  hex: string;
  family?: string;
};

export type ColorCreate = Omit<Color, "_id">;
export type ColorUpdate = Partial<Omit<Color, "_id" | "slug">>;

export async function listColors(family?: string): Promise<Color[]> {
  const params = family ? { family } : undefined;
  const { data } = await api.get("/api/colors/", { params });
  return data;
}

export async function createColor(payload: ColorCreate): Promise<Color> {
  const { data } = await api.post("/api/colors/", payload);
  return data;
}

export async function updateColor(slug: string, payload: ColorUpdate): Promise<Color> {
  const { data } = await api.put(`/api/colors/${slug}`, payload);
  return data;
}

export async function deleteColor(slug: string): Promise<void> {
  await api.delete(`/api/colors/${slug}`);
}

export async function seedColors(): Promise<{ message: string }> {
  const { data } = await api.post("/api/colors/seed");
  return data;
}
