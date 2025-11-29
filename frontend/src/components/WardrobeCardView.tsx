import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { ClothingItem } from "@/types";
import { WardrobeCard } from "./WardrobeCard";

// Category configuration
const CATEGORIES = [
  { id: "all", name: "All", icon: "👔" },
  { id: "tops", name: "Tops", icon: "👕" },
  { id: "sweaters", name: "Sweaters & Knits", icon: "🧶" },
  { id: "outerwear", name: "Outerwear", icon: "🧥" },
  { id: "bottoms", name: "Bottoms", icon: "👖" },
  { id: "shoes", name: "Shoes", icon: "👟" },
  { id: "accessories", name: "Accessories", icon: "🎩" },
];

const COLOR_MAP = {
  black: "#000000",
  white: "#FFFFFF",
  grey: "#808080",
  gray: "#808080",
  navy: "#000080",
  red: "#DC2626",
  green: "#16A34A",
  blue: "#2563EB",
  "light blue": "#93C5FD",
  maroon: "#7F1D1D",
  burgundy: "#991B1B",
  olive: "#65A30D",
  beige: "#D4A574",
  brown: "#92400E",
  tan: "#D2B48C",
  khaki: "#C7B299",
  camel: "#C19A6B",
  charcoal: "#36454F",
  tortoise: "#8B4513",
  silver: "#C0C0C0",
};

interface CategoryIconMap {
  tops: string;
  top: string;
  outerwear: string;
  bottoms: string;
  bottom: string;
  shoes: string;
  shoe: string;
  accessories: string;
  accessory: string;
}

const getCategoryIcon = (category: string | undefined): string => {
  const icons: CategoryIconMap = {
    tops: "👕",
    top: "👕",
    outerwear: "🧥",
    bottoms: "👖",
    bottom: "👖",
    shoes: "👟",
    shoe: "👟",
    accessories: "🎩",
    accessory: "🎩",
  };
  return icons[category?.toLowerCase() as keyof CategoryIconMap] || "👔";
};

const getColorHex = (colorName: string) => {
  const lowerColorName = colorName?.toLowerCase() as keyof typeof COLOR_MAP;
  return COLOR_MAP[lowerColorName] || "#CCCCCC";
};

interface WardrobeCardViewProps {
  items: ClothingItem[] | undefined;
  onEdit: (item: ClothingItem) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export default function WardrobeCardView({
  items,
  onEdit,
  onDelete,
  isLoading,
}: WardrobeCardViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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
    if (!items) return {};
    const counts: { [key: string]: number } = { all: items.length };
    items.forEach((item) => {
      const cat = item.category?.toLowerCase();
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [items]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading your wardrobe...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      {/* Header with filters and search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted/70 text-secondary-foreground hover:bg-muted"
                }`}
              >
                <span>{cat.icon}</span>
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

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredItems.length === 0 ? (
          <span>No items found</span>
        ) : (
          <span>
            Showing {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"}
            {selectedCategory !== "all" && ` in ${selectedCategory}`}
          </span>
        )}
      </div>

      {/* Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 text-6xl opacity-50">👕</div>
          <div className="text-lg font-medium text-muted-foreground">
            No items in your wardrobe yet
          </div>
          <div className="text-sm text-muted-foreground">
            Use the "Quick Add" tab to start building your wardrobe
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredItems.map((item) => (
            <WardrobeCard
              key={item._id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              getCategoryIcon={getCategoryIcon}
              getColorHex={getColorHex}
            />
          ))}
        </div>
      )}
    </div>
  );
}
