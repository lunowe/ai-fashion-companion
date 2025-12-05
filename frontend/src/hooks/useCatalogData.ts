// hooks/useCatalogData.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listColors,
  createColor,
  deleteColor,
  type Color,
  type ColorCreate,
} from "@/services/colors";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
  type CategoryCreate,
} from "@/services/categories";

export function useColors() {
  return useQuery({
    queryKey: ["colors"],
    queryFn: () => listColors(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useColorMutations() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (color: ColorCreate) => createColor(color),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["colors"] }),
  });

  const remove = useMutation({
    mutationFn: (slug: string) => deleteColor(slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["colors"] }),
  });

  return { create, remove };
}

export function useCategoryMutations() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: (cat: CategoryCreate) => createCategory(cat),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryCreate> }) =>
      updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  return { create, update, remove };
}

// Utility hook for color lookup
export function useColorMap() {
  const { data: colors } = useColors();

  return (slug: string): string => {
    const color = colors?.find((c) => c.slug === slug);
    return color?.hex ?? "#CCCCCC";
  };
}
