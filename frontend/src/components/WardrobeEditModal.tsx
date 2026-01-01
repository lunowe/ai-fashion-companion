// components/WardrobeEditModal.tsx
import { useState, useEffect, useMemo } from "react";
import { Palette, Check, Loader2 } from "lucide-react";
import type { ClothingItem } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { listCatalogItems } from "@/services/catalog";
import { useColors, useCategories } from "@/hooks/useCatalogData";
import { ClothingIcon } from "@/lib/icons";
import type { Color } from "@/services/colors";
import type { CatalogItem } from "@/types";

// Common fits as suggestions (could also come from DB eventually)
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
  // Form state
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [color, setColor] = useState("");
  const [colorCode, setColorCode] = useState("#000000");
  const [fit, setFit] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Catalog definition for the current item type (for filtering colors/fits)
  const [catalogDefinition, setCatalogDefinition] = useState<CatalogItem | null>(null);

  // Fetch from DB
  const { data: colors = [], isLoading: colorsLoading } = useColors();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  // Fetch catalog definition when item changes
  useEffect(() => {
    if (item?.type && item?.category) {
      listCatalogItems().then((items) => {
        const match = items.find(
          (cat) =>
            cat.type.toLowerCase() === item.type.toLowerCase() &&
            cat.category === item.category
        );
        setCatalogDefinition(match || null);
      });
    } else {
      setCatalogDefinition(null);
    }
  }, [item?.type, item?.category]);

  // Filter colors based on catalog definition
  const filteredColors = useMemo(() => {
    if (!catalogDefinition?.allowed_colors?.length) {
      return colors; // Show all if no restrictions
    }
    return colors.filter((c) => catalogDefinition.allowed_colors.includes(c.slug));
  }, [colors, catalogDefinition]);

  // Available fits based on catalog definition
  const availableFits = useMemo(() => {
    if (catalogDefinition?.allowed_fits?.length) {
      return catalogDefinition.allowed_fits;
    }
    return COMMON_FITS; // Fallback to defaults
  }, [catalogDefinition]);

  // Group colors by family for display
  const colorsByFamily = useMemo(() => {
    const groups: Record<string, Color[]> = {};
    filteredColors.forEach((c) => {
      const family = c.family || "other";
      if (!groups[family]) groups[family] = [];
      groups[family].push(c);
    });
    return groups;
  }, [filteredColors]);

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

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setCategory(item.category || "");
      setType(item.type || "");
      setColor(item.color || "");
      setColorCode(item.color_code || getColorHex(item.color) || "#000000");
      setFit(item.fit || "");
      setNotes(item.notes || "");
      setImageUrl(item.image_url || "");
    }
  }, [item, colors]);

  const handleSave = () => {
    if (!type.trim() || !color.trim() || !fit.trim() || !category) {
      toast.error(
        "Please fill in all required fields (Category, Name, Color, Fit)"
      );
      return;
    }

    onSave({
      category,
      _id: item?._id,
      type: type.trim(),
      color: color.trim(),
      color_code: colorCode,
      fit: fit.trim(),
      material: item?.material || "",
      icon_id: item?.icon_id || "",
      notes: notes.trim(),
      image_url: imageUrl.trim(),
    });
    onClose();
  };

  const handleColorSelect = (selectedColor: Color) => {
    setColor(selectedColor.name);
    setColorCode(selectedColor.hex);
  };

  const isLoading = colorsLoading || categoriesLoading;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
              <ClothingIcon
                iconId={item?.icon_id || undefined}
                color={getColorHex(item?.color || "")}
                strokeColor="#000000"
                strokeWidth={2}
                className="w-6 h-6 text-primary"
              />
            </div>
            <div>
              <DialogTitle>Edit Item</DialogTitle>
              <DialogDescription>
                Update the details of your wardrobe item.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading...
          </div>
        ) : (
          <ScrollArea className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-3">
                <Label>Category</Label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => setCategory(cat.slug)}
                      className={cn(
                        "cursor-pointer flex flex-col items-center justify-center gap-2 p-3 border rounded-lg transition-all hover:bg-accent",
                        category === cat.slug
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-input bg-card"
                      )}
                    >
                      <ClothingIcon
                        iconId={cat.icon_id}
                        className={cn(
                          "w-6 h-6",
                          category === cat.slug
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                      <span className="text-xs font-medium text-center truncate w-full">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Item Name */}
              <div className="space-y-2">
                <Label htmlFor="item-name">Item Name</Label>
                <Input
                  id="item-name"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="e.g., Vintage T-Shirt"
                />
              </div>

              {/* Color Selection */}
              <div className="space-y-3">
                <Label>Color</Label>

                {/* Color Grid by Family */}
                <ScrollArea className="h-[180px] pr-2">
                  <div className="space-y-3">
                    {Object.entries(colorsByFamily).map(
                      ([family, familyColors]) => (
                        <div key={family}>
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            {family}
                          </h4>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {familyColors.map((c) => {
                              const isSelected =
                                color.toLowerCase() === c.name.toLowerCase() ||
                                color.toLowerCase() === c.slug;
                              return (
                                <button
                                  key={c.slug}
                                  type="button"
                                  onClick={() => handleColorSelect(c)}
                                  className={cn(
                                    "group relative flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all",
                                    isSelected
                                      ? "border-primary bg-primary/10"
                                      : "border-transparent hover:border-muted-foreground/30 hover:bg-muted/50"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "w-6 h-6 rounded-full border shadow-sm",
                                      isSelected &&
                                        "ring-2 ring-primary ring-offset-1"
                                    )}
                                    style={{ backgroundColor: c.hex }}
                                  />
                                  <span className="text-[10px] font-medium truncate w-full text-center">
                                    {c.name}
                                  </span>
                                  {isSelected && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </ScrollArea>

                {/* Custom Color Input */}
                <div className="p-3 border border-dashed rounded-lg bg-muted/30">
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Custom Color
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Palette className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="e.g., Sage Green"
                        className="pl-9 h-10"
                      />
                    </div>
                    <div className="flex items-center gap-2 border rounded-md p-1 bg-background h-10 w-16 justify-center">
                      <input
                        type="color"
                        value={colorCode}
                        onChange={(e) => setColorCode(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Selected color preview */}
                {color && (
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-border shadow-sm"
                      style={{ backgroundColor: colorCode }}
                    />
                    <span className="text-sm font-medium capitalize">
                      {color}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto font-mono">
                      {colorCode}
                    </span>
                  </div>
                )}
              </div>

              {/* Fit Selection */}
              <div className="space-y-3">
                <Label>Fit</Label>
                <div className="flex flex-wrap gap-2">
                  {availableFits.map((f) => (
                    <Button
                      key={f}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFit(f)}
                      className={cn(
                        "capitalize",
                        fit === f &&
                          "border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                      )}
                    >
                      {fit === f && <Check className="w-3 h-3 mr-1" />}
                      {f}
                    </Button>
                  ))}
                </div>

                {/* Custom fit input - always available */}
                <Input
                  value={fit}
                  onChange={(e) => setFit(e.target.value)}
                  placeholder="Or type a custom fit..."
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL (Optional)</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
                {imageUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border bg-muted/30 aspect-video max-w-[200px]">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Material details, care instructions, etc."
                  className="resize-none min-h-[80px]"
                />
              </div>
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="px-6 py-4 border-t mt-auto bg-muted/20">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
