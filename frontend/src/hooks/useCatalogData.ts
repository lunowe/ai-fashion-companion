// hooks/useCatalogData.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listColors,
  createColor,
  updateColor,
  deleteColor,
  type Color,
  type ColorCreate,
  type ColorUpdate,
} from "@/services/colors";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
  type CategoryCreate,
} from "@/services/categories";
import { AVAILABLE_ICONS } from "@/lib/icons";

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

  const update = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: ColorUpdate }) =>
      updateColor(slug, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["colors"] }),
  });

  const remove = useMutation({
    mutationFn: (slug: string) => deleteColor(slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["colors"] }),
  });

  return { create, update, remove };
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

// Utility hook for getting category icon (for fallback)
export function useCategoryIconMap() {
  const { data: categories } = useCategories();

  return (categorySlug: string | undefined): string | undefined => {
    if (!categorySlug) return undefined;
    const cat = categories?.find((c) => c.slug === categorySlug.toLowerCase());
    return cat?.icon_id;
  };
}

// Utility hook to get effective icon for a clothing item (with category fallback)
export function useEffectiveIconId() {
  const getCategoryIcon = useCategoryIconMap();

  return (
    itemIconId: string | undefined,
    category: string | undefined
  ): string | undefined => {
    if (itemIconId && AVAILABLE_ICONS.includes(itemIconId)) {
      return itemIconId;
    }
    return getCategoryIcon(category);
  };
}
