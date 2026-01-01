// components/WardrobeShoppingFlow.tsx
import { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  Plus,
  X,
  Check,
  ArrowLeft,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { listCatalogItems } from "@/services/catalog";
import { useColors, useCategories } from "@/hooks/useCatalogData";
import { ClothingIcon } from "@/lib/icons";
import type { CatalogItem } from "@/types";
import type { Color } from "@/services/colors";
import type { Category } from "@/services/categories";

// === Types ===
type CartItem = {
  id: string;
  category: string;
  type: string;
  color: string;
  color_hex: string;
  fit: string;
  material: string;
  notes: string;
  icon_id: string;
  icon_aspect_ratio: string;
};

type SelectedCatalogItem = CatalogItem & {
  categorySlug: string;
  isCustom: boolean;
};

// === Color Selector Component ===
function ColorSelector({
  availableColorSlugs,
  selectedColors,
  onChange,
  allColors,
}: {
  availableColorSlugs: string[];
  selectedColors: string[];
  onChange: (colors: string[]) => void;
  allColors: Color[];
}) {
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#000000");

  // Filter to only show colors that are allowed for this item
  const availableColors = useMemo(() => {
    if (availableColorSlugs.length === 0) return allColors; // Custom item - show all
    return allColors.filter((c) => availableColorSlugs.includes(c.slug));
  }, [availableColorSlugs, allColors]);

  // Group by family
  const colorsByFamily = useMemo(() => {
    const groups: Record<string, Color[]> = {};
    availableColors.forEach((c) => {
      const family = c.family || "other";
      if (!groups[family]) groups[family] = [];
      groups[family].push(c);
    });
    return groups;
  }, [availableColors]);

  const toggleColor = (slug: string) => {
    if (selectedColors.includes(slug)) {
      onChange(selectedColors.filter((s) => s !== slug));
    } else {
      onChange([...selectedColors, slug]);
    }
  };

  const addCustomColor = () => {
    if (!customColorName.trim()) return;
    const slug = `custom-${customColorName.toLowerCase().replace(/\s+/g, "-")}`;
    // For custom colors, we store the name as slug (will be handled specially)
    onChange([...selectedColors, slug]);
    setCustomColorName("");
  };

  const getColorHex = (slug: string) => {
    if (slug.startsWith("custom-")) return customColorHex;
    return allColors.find((c) => c.slug === slug)?.hex ?? "#ccc";
  };

  const getColorName = (slug: string) => {
    if (slug.startsWith("custom-"))
      return slug.replace("custom-", "").replace(/-/g, " ");
    return allColors.find((c) => c.slug === slug)?.name ?? slug;
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[200px] pr-2">
        <div className="space-y-3">
          {Object.entries(colorsByFamily).map(([family, familyColors]) => (
            <div key={family}>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {family}
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {familyColors.map((color) => {
                  const isSelected = selectedColors.includes(color.slug);
                  return (
                    <button
                      key={color.slug}
                      type="button"
                      onClick={() => toggleColor(color.slug)}
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
                          isSelected && "ring-2 ring-primary ring-offset-1"
                        )}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[10px] font-medium truncate w-full text-center">
                        {color.name}
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
          ))}
        </div>
      </ScrollArea>

      {/* Selected colors */}
      {selectedColors.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-muted/30 rounded-lg">
          {selectedColors.map((slug) => (
            <Badge
              key={slug}
              variant="secondary"
              className="gap-1.5 pl-1.5 pr-1 py-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => toggleColor(slug)}
            >
              <div
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: getColorHex(slug) }}
              />
              <span className="text-xs capitalize">{getColorName(slug)}</span>
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
      )}

      {/* Custom color input - always available */}
      <div className="flex gap-2 pt-2 border-t">
        <input
          type="color"
          value={customColorHex}
          onChange={(e) => setCustomColorHex(e.target.value)}
          className="w-9 h-9 rounded cursor-pointer border"
        />
        <Input
          value={customColorName}
          onChange={(e) => setCustomColorName(e.target.value)}
          placeholder="Custom color name..."
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && addCustomColor()}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addCustomColor}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// === Fit Selector Component ===
function FitSelector({
  availableFits,
  selectedFits,
  onChange,
}: {
  availableFits: string[];
  selectedFits: string[];
  onChange: (fits: string[]) => void;
}) {
  const [customFit, setCustomFit] = useState("");

  const toggleFit = (fit: string) => {
    if (selectedFits.includes(fit)) {
      onChange(selectedFits.filter((f) => f !== fit));
    } else {
      onChange([...selectedFits, fit]);
    }
  };

  const addCustomFit = () => {
    if (!customFit.trim()) return;
    const fit = customFit.trim().toLowerCase();
    if (!selectedFits.includes(fit)) {
      onChange([...selectedFits, fit]);
    }
    setCustomFit("");
  };

  return (
    <div className="space-y-3">
      {availableFits.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableFits.map((fit) => {
            const isSelected = selectedFits.includes(fit);
            return (
              <Button
                key={fit}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFit(fit)}
                className="capitalize"
              >
                {fit}
                {isSelected && <Check className="w-3 h-3 ml-2" />}
              </Button>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={customFit}
          onChange={(e) => setCustomFit(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), addCustomFit())
          }
          placeholder="Add custom fit..."
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addCustomFit}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {selectedFits.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedFits.map((fit) => (
            <Badge
              key={fit}
              variant="outline"
              className="gap-1 pr-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => toggleFit(fit)}
            >
              {fit}
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// === Material Selector Component ===
function MaterialSelector({
  availableMaterials,
  selectedMaterials,
  onChange,
}: {
  availableMaterials: string[];
  selectedMaterials: string[];
  onChange: (materials: string[]) => void;
}) {
  const [customMaterial, setCustomMaterial] = useState("");

  const toggleMaterial = (mat: string) => {
    if (selectedMaterials.includes(mat)) {
      onChange(selectedMaterials.filter((m) => m !== mat));
    } else {
      onChange([...selectedMaterials, mat]);
    }
  };

  const addCustomMaterial = () => {
    if (!customMaterial.trim()) return;
    const mat = customMaterial.trim().toLowerCase();
    if (!selectedMaterials.includes(mat)) {
      onChange([...selectedMaterials, mat]);
    }
    setCustomMaterial("");
  };

  return (
    <div className="space-y-3">
      {availableMaterials.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableMaterials.map((mat) => {
            const isSelected = selectedMaterials.includes(mat);
            return (
              <Button
                key={mat}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMaterial(mat)}
                className="capitalize"
              >
                {mat}
                {isSelected && <Check className="w-3 h-3 ml-2" />}
              </Button>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={customMaterial}
          onChange={(e) => setCustomMaterial(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), addCustomMaterial())
          }
          placeholder="Add custom material..."
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addCustomMaterial}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {selectedMaterials.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedMaterials.map((mat) => (
            <Badge
              key={mat}
              variant="outline"
              className="gap-1 pr-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => toggleMaterial(mat)}
            >
              {mat}
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// === Main Component ===
export default function WardrobeShoppingFlow({
  onSave,
}: {
  onSave: (items: any[]) => Promise<void>;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedCatalogItem | null>(
    null
  );
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  // Form state
  const [customItemName, setCustomItemName] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFits, setSelectedFits] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch colors and categories from DB
  const { data: colors = [], isLoading: colorsLoading } = useColors();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  // Load catalog items
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setIsLoadingCatalog(true);
        const items = await listCatalogItems();
        setCatalogItems(items);
      } catch (err) {
        console.error("Failed to load catalog", err);
        toast.error("Failed to load catalog");
      } finally {
        setIsLoadingCatalog(false);
      }
    };
    fetchCatalog();
  }, []);

  // Group catalog items by category
  const itemsByCategory = useMemo(() => {
    const groups: Record<string, CatalogItem[]> = {};
    catalogItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [catalogItems]);

  // Get current category data
  const currentCategory = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((c) => c.slug === selectedCategory) ?? null;
  }, [selectedCategory, categories]);

  const currentCategoryItems = selectedCategory
    ? itemsByCategory[selectedCategory] ?? []
    : [];

  // Helpers
  const getColorHex = (slug: string) => {
    if (slug.startsWith("custom-")) return "#888888"; // Fallback for custom
    return colors.find((c) => c.slug === slug)?.hex ?? "#ccc";
  };

  const getColorName = (slug: string) => {
    if (slug.startsWith("custom-"))
      return slug.replace("custom-", "").replace(/-/g, " ");
    return colors.find((c) => c.slug === slug)?.name ?? slug;
  };

  // Open item modal
  const openItemModal = (item: CatalogItem, isCustom: boolean = false) => {
    setSelectedItem({
      ...item,
      categorySlug: selectedCategory!,
      isCustom,
    });
    setCustomItemName(isCustom ? "" : item.type);
    setSelectedColors([]);
    setSelectedFits([]);
    setSelectedMaterials([]);
    setNotes("");
  };

  // Add to cart - creates combinations
  const addToCart = () => {
    if (!selectedItem) return;

    const itemType = selectedItem.isCustom
      ? customItemName.trim()
      : selectedItem.type;
    if (!itemType) {
      toast.error("Please enter an item name");
      return;
    }
    if (selectedColors.length === 0) {
      toast.error("Please select at least one color");
      return;
    }
    if (selectedFits.length === 0) {
      toast.error("Please select at least one fit");
      return;
    }

    const newItems: CartItem[] = [];
    const materialList =
      selectedMaterials.length > 0 ? selectedMaterials : ["unspecified"];

    selectedColors.forEach((color) => {
      selectedFits.forEach((fit) => {
        materialList.forEach((material) => {
          newItems.push({
            id: `${
              selectedItem._id
            }-${color}-${fit}-${material}-${Date.now()}-${Math.random()}`,
            category: selectedItem.categorySlug,
            type: itemType,
            color: getColorName(color),
            color_hex: getColorHex(color),
            fit,
            material,
            notes: notes.trim(),
            icon_id: selectedItem.icon_id || "",
            icon_aspect_ratio: selectedItem.icon_aspect_ratio || "",
          });
        });
      });
    });

    setCart([...cart, ...newItems]);
    setSelectedItem(null);
    toast.success(
      `Added ${newItems.length} item${newItems.length > 1 ? "s" : ""} to cart`
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm("Clear all items from cart?")) {
      setCart([]);
    }
  };

  const saveToWardrobe = async () => {
    if (cart.length === 0) return;
    setIsSaving(true);
    try {
      console.log("Saving to wardrobe:", cart),
        await onSave(
          cart.map((item) => ({
            category: item.category,
            type: item.type,
            color: item.color,
            color_code: item.color_hex,
            fit: item.fit,
            material: item.material,
            icon_id: item.icon_id,
            icon_aspect_ratio: item.icon_aspect_ratio,
            notes: item.notes,
          }))
        );
      setCart([]);
      toast.success(`Saved ${cart.length} items to wardrobe!`);
    } catch (error) {
      console.error("Error saving to wardrobe:", error);
      toast.error("Failed to save items");
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingCatalog || colorsLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading catalog...
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-4">
        <AlertCircle className="w-8 h-8" />
        <p>No categories found. Please seed the database first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-background">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Add New Items</h1>
          <p className="text-muted-foreground">
            {selectedCategory
              ? `Select items from ${currentCategory?.name} to customize and add.`
              : "Choose a category to get started."}
          </p>
        </div>

        {/* Back Button */}
        {selectedCategory && (
          <Button
            variant="ghost"
            className="mb-6 -ml-2 gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedCategory(null)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Button>
        )}

        {/* Category Grid */}
        {!selectedCategory && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {categories.map((category) => {
              const itemCount = itemsByCategory[category.slug]?.length ?? 0;
              return (
                <Card
                  key={category._id}
                  className="cursor-pointer transition-all hover:border-primary hover:shadow-md hover:bg-accent/50 group"
                  onClick={() => setSelectedCategory(category.slug)}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 gap-3 h-full">
                    <div className="p-3 rounded-xl bg-muted/50 group-hover:bg-primary/10 transition-colors">
                      <ClothingIcon
                        iconId={category.icon_id}
                        className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors"
                      />
                    </div>
                    <div className="text-center">
                      <span className="font-semibold block">
                        {category.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {itemCount} type{itemCount !== 1 && "s"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Items Grid */}
        {selectedCategory && (
          <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 animate-in fade-in duration-500">
            {currentCategoryItems.map((item) => (
              <Card
                key={item._id}
                className="cursor-pointer transition-all hover:border-primary hover:shadow-md hover:bg-accent/50 group"
                onClick={() => openItemModal(item, false)}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                  <div className="p-2 rounded-lg bg-muted/30 group-hover:bg-primary/10 transition-colors">
                    <ClothingIcon
                      iconId={item.icon_id}
                      className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors"
                    />
                  </div>
                  <span className="text-sm font-medium text-center capitalize">
                    {item.type}
                  </span>
                  {/* Color preview dots */}
                  <div className="flex gap-0.5 flex-wrap justify-center max-w-full">
                    {item.allowed_colors.slice(0, 5).map((slug) => (
                      <div
                        key={slug}
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: getColorHex(slug) }}
                      />
                    ))}
                    {item.allowed_colors.length > 5 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{item.allowed_colors.length - 5}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Custom Item Button */}
            <button
              onClick={() =>
                openItemModal(
                  {
                    _id: "custom",
                    type: "",
                    icon_id: currentCategory?.icon_id || "",
                    allowed_colors: [],
                    allowed_fits: [],
                    allowed_materials: [],
                    category: selectedCategory,
                    default_seasons: [],
                    formality_level: 5,
                  },
                  true
                )
              }
              className="flex flex-col items-center justify-center p-6 gap-3 border-2 border-dashed rounded-xl hover:border-primary hover:bg-accent/50 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Custom Item
              </span>
            </button>
          </div>
        )}

        {/* Cart Section */}
        {cart.length > 0 && (
          <Card className="mt-12 border-primary/20">
            <div className="p-6 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Shopping Cart</h2>
                  <p className="text-sm text-muted-foreground">
                    {cart.length} item{cart.length !== 1 && "s"} ready to save
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="flex-1 sm:flex-none"
                >
                  Clear
                </Button>
                <Button
                  onClick={saveToWardrobe}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save to Wardrobe"
                  )}
                </Button>
              </div>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 bg-muted/10 max-h-[400px] overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-background border rounded-lg shadow-sm gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className="w-8 h-8 rounded-full border-2 shrink-0"
                      style={{ backgroundColor: item.color_hex }}
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate capitalize">
                        {item.color} {item.fit} {item.type}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.material !== "unspecified" && item.material}
                        {item.notes && ` • ${item.notes}`}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Item Configuration Dialog */}
      <Dialog
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted/30 rounded-xl">
                <ClothingIcon
                  iconId={selectedItem?.icon_id}
                  className="w-8 h-8 text-muted-foreground"
                />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl">
                  {selectedItem?.isCustom ? (
                    "Add Custom Item"
                  ) : (
                    <span className="capitalize">{selectedItem?.type}</span>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Configure colors, fits, and materials to generate wardrobe
                  items.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Custom Item Name */}
              {selectedItem?.isCustom && (
                <div className="space-y-2">
                  <Label>Item Name</Label>
                  <Input
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    placeholder="e.g. Vintage Leather Jacket"
                    className="text-lg"
                  />
                </div>
              )}

              {/* Colors */}
              <div className="space-y-2">
                <Label>
                  Colors{" "}
                  <span className="text-muted-foreground font-normal">
                    ({selectedColors.length} selected)
                  </span>
                </Label>
                <ColorSelector
                  availableColorSlugs={selectedItem?.allowed_colors ?? []}
                  selectedColors={selectedColors}
                  onChange={setSelectedColors}
                  allColors={colors}
                />
              </div>

              <Separator />

              {/* Fits */}
              <div className="space-y-2">
                <Label>
                  Fits{" "}
                  <span className="text-muted-foreground font-normal">
                    ({selectedFits.length} selected)
                  </span>
                </Label>
                <FitSelector
                  availableFits={selectedItem?.allowed_fits ?? []}
                  selectedFits={selectedFits}
                  onChange={setSelectedFits}
                />
              </div>

              <Separator />

              {/* Materials */}
              <div className="space-y-2">
                <Label>
                  Materials{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <MaterialSelector
                  availableMaterials={selectedItem?.allowed_materials ?? []}
                  selectedMaterials={selectedMaterials}
                  onChange={setSelectedMaterials}
                />
              </div>

              <Separator />

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Gift from mom, dry clean only..."
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 border-t bg-muted/20">
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground order-2 sm:order-1">
                {selectedColors.length > 0 && selectedFits.length > 0 ? (
                  <span>
                    Will create{" "}
                    <strong>
                      {selectedColors.length *
                        selectedFits.length *
                        Math.max(selectedMaterials.length, 1)}
                    </strong>{" "}
                    item
                    {selectedColors.length *
                      selectedFits.length *
                      Math.max(selectedMaterials.length, 1) !==
                      1 && "s"}
                  </span>
                ) : (
                  <span className="text-amber-600">
                    Select colors and fits to continue
                  </span>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button
                  disabled={
                    selectedColors.length === 0 || selectedFits.length === 0
                  }
                  onClick={addToCart}
                  className="flex-1 sm:flex-none"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
