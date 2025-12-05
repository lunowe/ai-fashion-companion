// services/categories.ts
import { api } from "@/lib/api";

export type Category = {
  _id: string;
  name: string;
  slug: string;
  icon_id?: string;
  sort_order: number;
};

export type CategoryCreate = Omit<Category, "_id">;
export type CategoryUpdate = Partial<CategoryCreate>;

export async function listCategories(): Promise<Category[]> {
  const { data } = await api.get("/api/categories/");
  return data;
}

export async function createCategory(
  payload: CategoryCreate
): Promise<Category> {
  const { data } = await api.post("/api/categories/", payload);
  return data;
}

export async function updateCategory(
  id: string,
  payload: CategoryUpdate
): Promise<Category> {
  const { data } = await api.put(`/api/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/api/categories/${id}`);
}

export async function seedCategories(): Promise<{ message: string }> {
  const { data } = await api.post("/api/categories/seed");
  return data;
}
