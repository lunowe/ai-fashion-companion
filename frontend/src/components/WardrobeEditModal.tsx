import { useState, useEffect } from "react";
import { X, Palette } from "lucide-react";
import type { ClothingItem } from "@/types";

const CATEGORIES = [
  { id: "tops", name: "Tops", icon: "👕" },
  { id: "sweaters", name: "Sweaters & Knits", icon: "🧶" },
  { id: "outerwear", name: "Outerwear", icon: "🧥" },
  { id: "bottoms", name: "Bottoms", icon: "👖" },
  { id: "shoes", name: "Shoes", icon: "👟" },
  { id: "accessories", name: "Accessories", icon: "🎩" },
];

const COMMON_COLORS = [
  "black",
  "white",
  "grey",
  "navy",
  "blue",
  "light blue",
  "red",
  "burgundy",
  "maroon",
  "green",
  "olive",
  "brown",
  "tan",
  "beige",
  "khaki",
  "camel",
  "charcoal",
  "silver",
];

const COMMON_FITS = [
  "slim",
  "regular",
  "oversized",
  "relaxed",
  "straight",
  "wide",
  "cropped",
  "tapered",
  "athletic",
];

const COLOR_MAP: Record<string, string> = {
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

interface WardrobeEditModalProps {
  item: ClothingItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<ClothingItem>) => void;
}

export default function WardrobeEditModal({
  item,
  open,
  onClose,
  onSave,
}: WardrobeEditModalProps) {
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [color, setColor] = useState("");
  const [colorCode, setColorCode] = useState("#000000");
  const [fit, setFit] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setCategory(item.category || "");
      setType(item.type || "");
      setColor(item.color || "");
      setColorCode(
        item.color_code || COLOR_MAP[item.color?.toLowerCase()] || "#000000"
      );
      setFit(item.fit || "");
      setNotes(item.notes || "");
      setImageUrl(item.image_url || "");
    }
  }, [item]);

  const handleSave = () => {
    if (!type.trim()) {
      alert("Please enter an item name");
      return;
    }
    if (!color.trim()) {
      alert("Please select or enter a color");
      return;
    }
    if (!fit.trim()) {
      alert("Please select or enter a fit");
      return;
    }
    if (!category) {
      alert("Please select a category");
      return;
    }

    onSave({
      category,
      type: type.trim(),
      color: color.trim(),
      color_code: colorCode,
      fit: fit.trim(),
      notes: notes.trim(),
      image_url: imageUrl.trim(),
    });
  };

  const getCategoryIcon = (catId: string) => {
    return CATEGORIES.find((c) => c.id === catId)?.icon || "👔";
  };

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl p-6 rounded-lg shadow-xl bg-card max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getCategoryIcon(category)}</span>
            <div>
              <h2 className="text-2xl font-bold">Edit Item</h2>
              <p className="text-sm text-muted-foreground">
                Update your wardrobe item details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 transition-colors rounded-lg hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category */}
        <div className="mb-6">
          <h3 className="mb-3 font-semibold">Category</h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`cursor-pointer flex flex-col items-center gap-1 p-3 border-2 rounded-lg transition-all ${
                  category === cat.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-center">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Item Name */}
        <div className="mb-6">
          <h3 className="mb-3 font-semibold">Item Name</h3>
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="e.g., t-shirt, jeans, sneakers"
            className="w-full p-3 text-sm border-2 rounded-lg border-border focus:border-primary focus:outline-none"
          />
        </div>

        {/* Color */}
        <div className="mb-6">
          <h3 className="mb-3 font-semibold">Color</h3>

          {/* Common Colors */}
          <div className="grid grid-cols-3 gap-2 mb-3 sm:grid-cols-4">
            {COMMON_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setColorCode(COLOR_MAP[c] || "#CCCCCC");
                }}
                className={`cursor-pointer flex items-center gap-2 p-3 border-2 rounded-lg transition-all ${
                  color === c
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div
                  className="w-6 h-6 border-2 rounded-full border-border"
                  style={{
                    backgroundColor: COLOR_MAP[c] || "#CCCCCC",
                  }}
                />
                <span className="text-sm font-medium capitalize">{c}</span>
              </button>
            ))}
          </div>

          {/* Custom Color */}
          <div className="p-3 border-2 border-dashed rounded-lg border-border">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Custom Color</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g., sage green"
                className="flex-1 p-2 text-sm border rounded-lg border-border focus:border-primary focus:outline-none"
              />
              <input
                type="color"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                className="w-12 h-10 border rounded-lg cursor-pointer border-border"
              />
            </div>
          </div>
        </div>

        {/* Fit */}
        <div className="mb-6">
          <h3 className="mb-3 font-semibold">Fit</h3>

          {/* Common Fits */}
          <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-3">
            {COMMON_FITS.map((f) => (
              <button
                key={f}
                onClick={() => setFit(f)}
                className={`cursor-pointer flex items-center justify-center p-3 border-2 rounded-lg transition-all ${
                  fit === f
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="text-sm font-medium capitalize">{f}</span>
              </button>
            ))}
          </div>

          {/* Custom Fit */}
          <div className="p-3 border-2 border-dashed rounded-lg border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Custom Fit</span>
            </div>
            <input
              type="text"
              value={fit}
              onChange={(e) => setFit(e.target.value)}
              placeholder="e.g., athletic fit"
              className="w-full p-2 text-sm border rounded-lg border-border focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Image URL */}
        <div className="mb-6">
          <h3 className="mb-3 font-semibold">Image URL (optional)</h3>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full p-3 text-sm border-2 rounded-lg border-border focus:border-primary focus:outline-none"
          />
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h3 className="mb-3 font-semibold">Notes (optional)</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., extra thick, wool blend, waterproof"
            rows={3}
            className="w-full p-3 text-sm border-2 rounded-lg border-border focus:border-primary focus:outline-none resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="cursor-pointer flex-1 px-4 py-2 font-medium transition-colors border-2 rounded-lg border-border hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="cursor-pointer flex-1 px-4 py-2 font-medium transition-colors rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
