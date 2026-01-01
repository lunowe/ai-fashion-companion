// components/WardrobeCardView.tsx
import { useState, useMemo } from "react";
import { Search, Loader2 } from "lucide-react";
import type { ClothingItem } from "@/types";
import { WardrobeCard } from "./WardrobeCard";
import { useColors, useCategories } from "@/hooks/useCatalogData";
import { ClothingIcon } from "@/lib/icons";

interface WardrobeCardViewProps {
  items: ClothingItem[] | undefined;
  onEdit: (item: ClothingItem) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const CategoryIcons = {
  all: { name: "All", icon_id: "✦" },
  tops: { name: "Tops", icon_id: "👕" },
  bottoms: { name: "Bottoms", icon_id: "👖" },
  sweaters: { name: "Sweaters", icon_id: "🧶" },
  outerwear: { name: "Outerwear", icon_id: "🧥" },
  shoes: { name: "Shoes", icon_id: "👟" },
  accessories: { name: "Accessories", icon_id: "⌚" },
};

export default function WardrobeCardView({
  items,
  onEdit,
  onDelete,
  isLoading,
}: WardrobeCardViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [gridCols, setGridCols] = useState<1 | 2 | 3>(2);

  // Fetch from DB
  const { data: colors = [], isLoading: colorsLoading } = useColors();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  // Color lookup helper
  const getColorHex = (colorOrSlug: string): string => {
    if (!colorOrSlug) return "#CCCCCC";
    const lower = colorOrSlug.toLowerCase();
    // Try exact slug match first
    const bySlug = colors.find((c) => c.slug === lower);
    if (bySlug) return bySlug.hex;
    // Try name match
    const byName = colors.find((c) => c.name.toLowerCase() === lower);
    if (byName) return byName.hex;
    return "#CCCCCC";
  };

  // Get category icon_id for a given category slug
  const getCategoryIconId = (
    categorySlug: string | undefined
  ): string | undefined => {
    if (!categorySlug) return undefined;
    const cat = categories.find((c) => c.slug === categorySlug.toLowerCase());
    return cat?.icon_id;
  };

  // Filter and search logic
  const filteredItems = useMemo(() => {
    if (!items) return [];

    let filtered = items;

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (item) =>
          item.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.type?.toLowerCase().includes(query) ||
          item.color?.toLowerCase().includes(query) ||
          item.fit?.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [items, selectedCategory, searchQuery]);

  // Count items per category
  const categoryCounts = useMemo(() => {
    if (!items) return { all: 0 };
    const counts: Record<string, number> = { all: items.length };
    items.forEach((item) => {
      const cat = item.category?.toLowerCase();
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    return counts;
  }, [items]);

  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
  }[gridCols];

  const isLoadingData = isLoading || colorsLoading || categoriesLoading;

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading your wardrobe...
      </div>
    );
  }

  // Build category filter options: "All" + categories from DB
  const categoryFilters = [
    { slug: "all", name: "All", icon_id: undefined },
    ...categories,
  ];

  return (
    <div className="space-y-6 pt-4">
      {/* Header with filters and search */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((cat) => {
              const count = categoryCounts[cat.slug] || 0;
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/70 text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {cat.slug === "all" ? (
                    <span className="w-4 h-4 flex items-center justify-center">
                      ✦
                    </span>
                  ) : (
                    // <ClothingIcon iconId={cat.icon_id} className="w-4 h-4" />
                    <span className="w-4 h-4 flex items-center justify-center">
                      {
                        CategoryIcons[cat.slug as keyof typeof CategoryIcons]
                          ?.icon_id
                      }
                    </span>
                  )}
                  <span>{cat.name}</span>
                  <span
                    className={`text-xs ${
                      isActive ? "opacity-90" : "opacity-60"
                    }`}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wardrobe..."
              className="w-full py-2 pl-10 pr-4 text-sm border rounded-lg border-border bg-muted/70 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Grid Controls (Mobile Only) */}
        <div className="flex items-center justify-between sm:hidden">
          <span className="text-sm text-muted-foreground">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"}
          </span>
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <button
              onClick={() => setGridCols(1)}
              className={`p-1.5 rounded-md transition-all ${
                gridCols === 1
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50 text-muted-foreground"
              }`}
            >
              <div className="w-4 h-4 border-2 border-current rounded-[2px]" />
            </button>
            <button
              onClick={() => setGridCols(2)}
              className={`p-1.5 rounded-md transition-all ${
                gridCols === 2
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50 text-muted-foreground"
              }`}
            >
              <div className="flex gap-0.5 w-4 h-4">
                <div className="w-full h-full border-2 border-current rounded-[1px]" />
                <div className="w-full h-full border-2 border-current rounded-[1px]" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Results count (Desktop) */}
      <div className="hidden sm:block text-sm text-muted-foreground">
        {filteredItems.length === 0 ? (
          <span>No items found</span>
        ) : (
          <span>
            Showing {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"}
            {selectedCategory !== "all" &&
              ` in ${
                categories.find((c) => c.slug === selectedCategory)?.name ??
                selectedCategory
              }`}
          </span>
        )}
      </div>

      {/* Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 p-6 rounded-full bg-muted/30">
            <ClothingIcon
              iconId="shirt"
              className="w-16 h-16 text-muted-foreground/50"
            />
          </div>
          <div className="text-lg font-medium text-muted-foreground">
            No items in your wardrobe yet
          </div>
          <div className="text-sm text-muted-foreground">
            Use the "Quick Add" tab to start building your wardrobe
          </div>
        </div>
      ) : (
        <div
          className={`grid gap-4 ${gridClass} sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`}
        >
          {filteredItems.map((item) => (
            <WardrobeCard
              key={item._id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              getColorHex={getColorHex}
              getCategoryIconId={getCategoryIconId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
