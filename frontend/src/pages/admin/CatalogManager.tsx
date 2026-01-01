// components/admin/CatalogManager.tsx
import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Save,
  Trash2,
  X,
  AlertCircle,
  Check,
  Palette,
  Loader2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import {
  listCatalogItems,
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
} from "@/services/catalog";
import {
  useColors,
  useCategories,
  useColorMutations,
} from "@/hooks/useCatalogData";
import type { CatalogItem, IconOverride } from "@/types";
import type { Color } from "@/services/colors";
import type { Category } from "@/services/categories";
import { ClothingIcon, AVAILABLE_ICONS } from "@/lib/icons";

// === Types ===
type EditingCatalogItem = Partial<CatalogItem> & {
  category: string;
  type: string;
  icon_id: string;
  icon_overrides: IconOverride[];
  allowed_colors: string[];
  allowed_fits: string[];
  allowed_materials: string[];
};

const DEFAULT_ITEM: EditingCatalogItem = {
  category: "",
  type: "",
  icon_id: "",
  icon_overrides: [],
  allowed_colors: [],
  allowed_fits: [],
  allowed_materials: [],
};

// === Color Picker Component ===
function ColorPicker({
  selectedSlugs,
  onChange,
  colors,
  onAddCustom,
}: {
  selectedSlugs: string[];
  onChange: (slugs: string[]) => void;
  colors: Color[];
  onAddCustom: (color: Omit<Color, "_id">) => Promise<void>;
}) {
  const [customName, setCustomName] = useState("");
  const [customHex, setCustomHex] = useState("#000000");
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // Group colors by family
  const colorsByFamily = useMemo(() => {
    const groups: Record<string, Color[]> = {};
    colors.forEach((c) => {
      const family = c.family || "other";
      if (!groups[family]) groups[family] = [];
      groups[family].push(c);
    });
    return groups;
  }, [colors]);

  const toggleColor = (slug: string) => {
    if (selectedSlugs.includes(slug)) {
      onChange(selectedSlugs.filter((s) => s !== slug));
    } else {
      onChange([...selectedSlugs, slug]);
    }
  };

  const handleAddCustom = async () => {
    if (!customName.trim()) return;

    const slug = customName.toLowerCase().replace(/\s+/g, "-");
    setIsAddingCustom(true);

    try {
      await onAddCustom({
        name: customName.trim(),
        slug,
        hex: customHex,
        family: "custom",
      });
      // Auto-select the new color
      onChange([...selectedSlugs, slug]);
      setCustomName("");
      setCustomHex("#000000");
      toast.success(`Added "${customName}"`);
    } catch (err) {
      toast.error("Failed to add color");
    } finally {
      setIsAddingCustom(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Color Grid by Family */}
      <ScrollArea className="h-[280px] pr-4">
        <div className="space-y-4">
          {Object.entries(colorsByFamily).map(([family, familyColors]) => (
            <div key={family}>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {family}
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {familyColors.map((color) => {
                  const isSelected = selectedSlugs.includes(color.slug);
                  return (
                    <button
                      key={color.slug}
                      type="button"
                      onClick={() => toggleColor(color.slug)}
                      className={cn(
                        "group relative flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-transparent hover:border-muted-foreground/30 hover:bg-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full border-2 shadow-sm transition-transform",
                          isSelected
                            ? "scale-110 border-primary"
                            : "border-border group-hover:scale-105"
                        )}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[10px] font-medium truncate w-full text-center">
                        {color.name}
                      </span>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
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

      {/* Selected Colors Display */}
      {selectedSlugs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-3 bg-muted/30 rounded-lg">
          {selectedSlugs.map((slug) => {
            const color = colors.find((c) => c.slug === slug);
            return (
              <Badge
                key={slug}
                variant="secondary"
                className="gap-1.5 pl-1.5 pr-1 py-1 cursor-pointer hover:bg-destructive/20"
                onClick={() => toggleColor(slug)}
              >
                <div
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: color?.hex ?? "#ccc" }}
                />
                <span className="text-xs">{color?.name ?? slug}</span>
                <X className="w-3 h-3" />
              </Badge>
            );
          })}
        </div>
      )}

      {/* Add Custom Color */}
      <div className="flex gap-2 pt-2 border-t">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative">
            <input
              type="color"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              className="w-9 h-9 rounded cursor-pointer border-2 border-border"
            />
          </div>
          <Input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="New color name..."
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddCustom}
          disabled={!customName.trim() || isAddingCustom}
        >
          {isAddingCustom ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

// === Array Input for Fits/Materials ===
function ArrayInput({
  label,
  values = [],
  onChange,
  suggestions = [],
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  suggestions?: string[];
}) {
  const [input, setInput] = useState("");

  const add = (value?: string) => {
    const v = (value ?? input).trim().toLowerCase();
    if (v && !values.includes(v)) {
      onChange([...values, v]);
      setInput("");
    }
  };

  const unusedSuggestions = suggestions.filter((s) => !values.includes(s));

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={`Add ${label.toLowerCase()}...`}
        />
        <Button
          onClick={() => add()}
          type="button"
          size="sm"
          variant="secondary"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick suggestions */}
      {unusedSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {unusedSuggestions.slice(0, 6).map((s) => (
            <Badge
              key={s}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
              onClick={() => add(s)}
            >
              + {s}
            </Badge>
          ))}
        </div>
      )}

      {/* Selected values */}
      <div className="flex flex-wrap gap-1 min-h-[2rem]">
        {values.map((v) => (
          <Badge
            key={v}
            variant="secondary"
            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors pl-2 pr-1"
            onClick={() => onChange(values.filter((x) => x !== v))}
          >
            {v} <X className="w-3 h-3 ml-1" />
          </Badge>
        ))}
      </div>
    </div>
  );
}

// === Colors Manager Component ===
function ColorsManager({
  colors,
  colorMutations,
}: {
  colors: Color[];
  colorMutations: ReturnType<typeof useColorMutations>;
}) {
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [newColor, setNewColor] = useState({ name: "", hex: "#000000", family: "custom" });
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Group colors by family
  const colorsByFamily = useMemo(() => {
    const groups: Record<string, Color[]> = {};
    colors.forEach((c) => {
      const family = c.family || "other";
      if (!groups[family]) groups[family] = [];
      groups[family].push(c);
    });
    return groups;
  }, [colors]);

  const handleAddColor = async () => {
    if (!newColor.name.trim()) return;
    const slug = newColor.name.toLowerCase().replace(/\s+/g, "-");

    try {
      await colorMutations.create.mutateAsync({
        name: newColor.name.trim(),
        slug,
        hex: newColor.hex,
        family: newColor.family,
      });
      setNewColor({ name: "", hex: "#000000", family: "custom" });
      setIsAddingNew(false);
      toast.success("Color added");
    } catch {
      toast.error("Failed to add color");
    }
  };

  const handleUpdateColor = async () => {
    if (!editingColor) return;

    try {
      await colorMutations.update.mutateAsync({
        slug: editingColor.slug,
        data: {
          name: editingColor.name,
          hex: editingColor.hex,
          family: editingColor.family,
        },
      });
      setEditingColor(null);
      toast.success("Color updated");
    } catch {
      toast.error("Failed to update color");
    }
  };

  const handleDeleteColor = async (slug: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This may affect catalog items using this color.`)) return;

    try {
      await colorMutations.remove.mutateAsync(slug);
      toast.success("Color deleted");
    } catch {
      toast.error("Failed to delete color");
    }
  };

  const familyOptions = ["neutrals", "blues", "reds", "greens", "browns", "custom", "other"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Color Palette</h2>
          <p className="text-sm text-muted-foreground">
            {colors.length} colors across {Object.keys(colorsByFamily).length} families
          </p>
        </div>
        <Button onClick={() => setIsAddingNew(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Color
        </Button>
      </div>

      {/* Colors Grid by Family */}
      {Object.entries(colorsByFamily).map(([family, familyColors]) => (
        <Card key={family}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {family} ({familyColors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {familyColors.map((color) => (
                <div
                  key={color._id}
                  className="group relative flex items-center gap-2 p-2 rounded-lg border hover:border-primary/50 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{color.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditingColor(color)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteColor(color.slug, color.name)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add New Color Dialog */}
      <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Color</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="color"
                  value={newColor.hex}
                  onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                  className="w-16 h-16 rounded-lg cursor-pointer border-2 border-border"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label>Color Name</Label>
                <Input
                  value={newColor.name}
                  onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                  placeholder="e.g. Sage Green"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Hex Code</Label>
              <Input
                value={newColor.hex}
                onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                placeholder="#000000"
              />
            </div>
            <div className="space-y-2">
              <Label>Family</Label>
              <Select
                value={newColor.family}
                onValueChange={(v) => setNewColor({ ...newColor, family: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {familyOptions.map((f) => (
                    <SelectItem key={f} value={f} className="capitalize">
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingNew(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddColor}
              disabled={!newColor.name.trim() || colorMutations.create.isPending}
            >
              {colorMutations.create.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Color
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Color Dialog */}
      <Dialog open={!!editingColor} onOpenChange={(open) => !open && setEditingColor(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Color</DialogTitle>
          </DialogHeader>
          {editingColor && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="color"
                    value={editingColor.hex}
                    onChange={(e) => setEditingColor({ ...editingColor, hex: e.target.value })}
                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-border"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Color Name</Label>
                  <Input
                    value={editingColor.name}
                    onChange={(e) => setEditingColor({ ...editingColor, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hex Code</Label>
                <Input
                  value={editingColor.hex}
                  onChange={(e) => setEditingColor({ ...editingColor, hex: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Family</Label>
                <Select
                  value={editingColor.family || "other"}
                  onValueChange={(v) => setEditingColor({ ...editingColor, family: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {familyOptions.map((f) => (
                      <SelectItem key={f} value={f} className="capitalize">
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-muted-foreground">
                Slug: <code className="bg-muted px-1 py-0.5 rounded">{editingColor.slug}</code>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingColor(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateColor}
              disabled={colorMutations.update.isPending}
            >
              {colorMutations.update.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// === Main Component ===
export default function CatalogManager() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [editingItem, setEditingItem] = useState<EditingCatalogItem | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [activeTab, setActiveTab] = useState<"catalog" | "colors">("catalog");

  // Fetch colors and categories from DB
  const { data: colors = [], isLoading: colorsLoading } = useColors();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const colorMutations = useColorMutations();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await listCatalogItems();
      setItems(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load catalog", err);
      setError("Failed to load catalog items.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (item: EditingCatalogItem) => {
    if (!item.category || !item.type) {
      toast.error("Category and type are required");
      return;
    }

    setIsSaving(true);
    try {
      if (item._id) {
        const updated = await updateCatalogItem(item._id, item);
        setItems((prev) =>
          prev.map((i) => (i._id === updated._id ? updated : i))
        );
        toast.success("Updated successfully");
      } else {
        const created = await createCatalogItem(item as any);
        setItems((prev) => [...prev, created]);
        toast.success("Created successfully");
      }
      setEditingItem(null);
    } catch (err: any) {
      console.error("Failed to save item", err);
      toast.error(err?.response?.data?.detail || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this catalog definition?")) return;

    try {
      await deleteCatalogItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success("Deleted");
    } catch (err) {
      console.error("Failed to delete item", err);
      toast.error("Failed to delete");
    }
  };

  const handleAddCustomColor = async (color: Omit<Color, "_id">) => {
    await colorMutations.create.mutateAsync(color);
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    if (filterCategory === "all") return items;
    return items.filter((i) => i.category === filterCategory);
  }, [items, filterCategory]);

  // Group items by category for display
  const itemsByCategory = useMemo(() => {
    const groups: Record<string, CatalogItem[]> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const getColorHex = (slug: string) =>
    colors.find((c) => c.slug === slug)?.hex ?? "#ccc";
  const getCategoryName = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name ?? slug;

  if (isLoading || colorsLoading || categoriesLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive flex items-center justify-center gap-2">
        <AlertCircle /> {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalog Manager</h1>
          <p className="text-muted-foreground">
            Define item types and their allowed attributes.
          </p>
        </div>
      </div>

      {/* Top-level Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "catalog" | "colors")} className="space-y-6">
        <TabsList>
          <TabsTrigger value="catalog">Catalog Items</TabsTrigger>
          <TabsTrigger value="colors" className="gap-2">
            <Palette className="w-4 h-4" />
            Colors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="mt-0">
          <ColorsManager colors={colors} colorMutations={colorMutations} />
        </TabsContent>

        <TabsContent value="catalog" className="mt-0 space-y-6">
          {/* Add Button */}
          <div className="flex justify-end">
            <Button
              onClick={() =>
                setEditingItem({
                  ...DEFAULT_ITEM,
                  category: categories[0]?.slug ?? "",
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Add Definition
            </Button>
          </div>

          {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterCategory("all")}
        >
          All ({items.length})
        </Button>
        {categories.map((cat) => {
          const count = items.filter((i) => i.category === cat.slug).length;
          return (
            <Button
              key={cat._id}
              variant={filterCategory === cat.slug ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(cat.slug)}
              className="gap-2"
            >
              <ClothingIcon iconId={cat.icon_id} className="w-4 h-4" />
              {cat.name} ({count})
            </Button>
          );
        })}
      </div>

      {/* Items Grid */}
      {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
        <div key={category} className="space-y-3">
          <h2 className="text-lg font-semibold capitalize flex items-center gap-2">
            <ClothingIcon
              iconId={categories.find((c) => c.slug === category)?.icon_id}
              className="w-5 h-5"
            />
            {getCategoryName(category)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryItems.map((item) => (
              <Card
                key={item._id}
                className="group overflow-hidden hover:border-primary/50 transition-colors"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                  <CardTitle className="text-sm font-medium capitalize">
                    {item.type}
                  </CardTitle>
                  <ClothingIcon
                    iconId={item.icon_id}
                    className="w-8 h-8 text-muted-foreground"
                  />
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {/* Color swatches */}
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Colors
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.allowed_colors.slice(0, 8).map((slug) => (
                        <div
                          key={slug}
                          className="w-5 h-5 rounded-full border shadow-sm"
                          style={{ backgroundColor: getColorHex(slug) }}
                          title={slug}
                        />
                      ))}
                      {item.allowed_colors.length > 8 && (
                        <span className="text-xs text-muted-foreground self-center ml-1">
                          +{item.allowed_colors.length - 8}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                    <div className="flex justify-between">
                      <span>Fits</span>
                      <span className="font-mono">
                        {item.allowed_fits?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Materials</span>
                      <span className="font-mono">
                        {item.allowed_materials?.length || 0}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditingItem(item as EditingCatalogItem)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 px-2"
                      onClick={() => handleDelete(item._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No catalog items found. Add one to get started.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>
              {editingItem?._id
                ? `Edit ${editingItem.type}`
                : "New Catalog Item"}
            </DialogTitle>
          </DialogHeader>

          <Tabs
            defaultValue="basic"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="mx-6 mt-2 w-fit">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="icons">
                Icons ({(editingItem?.icon_overrides?.length || 0) + (editingItem?.icon_id ? 1 : 0)})
              </TabsTrigger>
              <TabsTrigger value="colors">
                Colors ({editingItem?.allowed_colors.length || 0})
              </TabsTrigger>
              <TabsTrigger value="attributes">Fits & Materials</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 px-6 py-4">
              <TabsContent value="basic" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={editingItem?.category}
                      onValueChange={(v) =>
                        setEditingItem({ ...editingItem!, category: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat.slug}>
                            <div className="flex items-center gap-2">
                              <ClothingIcon
                                iconId={cat.icon_id}
                                className="w-4 h-4"
                              />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Item Type Name</Label>
                  <Input
                    value={editingItem?.type || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem!, type: e.target.value })
                    }
                    placeholder="e.g. Oxford Shirt, Chinos, Bomber Jacket"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Formality (1-10)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={editingItem?.formality_level || 5}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem!,
                          formality_level: parseInt(e.target.value) || 5,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Seasons</Label>
                    <Select
                      value={editingItem?.default_seasons?.[0] || "all"}
                      onValueChange={(v) =>
                        setEditingItem({
                          ...editingItem!,
                          default_seasons: [v],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["all", "spring", "summer", "fall", "winter"].map(
                          (s) => (
                            <SelectItem
                              key={s}
                              value={s}
                              className="capitalize"
                            >
                              {s}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="icons" className="mt-0 space-y-6">
                {/* Default Icon */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Default Icon</Label>
                  <p className="text-sm text-muted-foreground">
                    Select or type an icon ID. This is used when no override matches.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={editingItem?.icon_id || ""}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem!, icon_id: e.target.value })
                      }
                      placeholder="Enter icon ID or select below"
                      className="flex-1"
                    />
                    {editingItem?.icon_id && (
                      <div className="flex items-center justify-center w-10 h-10 border rounded-md bg-muted/30">
                        <ClothingIcon
                          iconId={editingItem.icon_id}
                          className="w-6 h-6"
                        />
                      </div>
                    )}
                  </div>
                  <ScrollArea className="h-[140px] border rounded-md p-2">
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {AVAILABLE_ICONS.map((iconId) => (
                        <button
                          key={iconId}
                          type="button"
                          onClick={() =>
                            setEditingItem({ ...editingItem!, icon_id: iconId })
                          }
                          className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                            editingItem?.icon_id === iconId
                              ? "border-primary bg-primary/10"
                              : "border-transparent hover:border-muted-foreground/30 hover:bg-muted/50"
                          )}
                        >
                          <ClothingIcon iconId={iconId} className="w-6 h-6" />
                          <span className="text-[9px] font-medium truncate w-full text-center">
                            {iconId}
                          </span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Icon Overrides */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Icon Overrides</Label>
                      <p className="text-sm text-muted-foreground">
                        Use different icons for specific fits or materials.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setEditingItem({
                          ...editingItem!,
                          icon_overrides: [
                            ...(editingItem?.icon_overrides || []),
                            { match: {}, icon_id: "" },
                          ],
                        })
                      }
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Override
                    </Button>
                  </div>

                  {(editingItem?.icon_overrides || []).length === 0 && (
                    <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                      No overrides yet. Add one to use different icons for specific fits or materials.
                    </div>
                  )}

                  <div className="space-y-3">
                    {(editingItem?.icon_overrides || []).map((override, idx) => (
                      <Card key={idx} className="p-4">
                        <div className="flex gap-4 items-start">
                          {/* Match conditions */}
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">When Fit =</Label>
                                <Select
                                  value={override.match.fit || ""}
                                  onValueChange={(v) => {
                                    const newOverrides = [...(editingItem?.icon_overrides || [])];
                                    newOverrides[idx] = {
                                      ...newOverrides[idx],
                                      match: { ...newOverrides[idx].match, fit: v || undefined },
                                    };
                                    setEditingItem({ ...editingItem!, icon_overrides: newOverrides });
                                  }}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Any fit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">Any fit</SelectItem>
                                    {(editingItem?.allowed_fits || []).map((f) => (
                                      <SelectItem key={f} value={f} className="capitalize">
                                        {f}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">When Material =</Label>
                                <Select
                                  value={override.match.material || ""}
                                  onValueChange={(v) => {
                                    const newOverrides = [...(editingItem?.icon_overrides || [])];
                                    newOverrides[idx] = {
                                      ...newOverrides[idx],
                                      match: { ...newOverrides[idx].match, material: v || undefined },
                                    };
                                    setEditingItem({ ...editingItem!, icon_overrides: newOverrides });
                                  }}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Any material" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">Any material</SelectItem>
                                    {(editingItem?.allowed_materials || []).map((m) => (
                                      <SelectItem key={m} value={m} className="capitalize">
                                        {m}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Use Icon</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={override.icon_id}
                                  onChange={(e) => {
                                    const newOverrides = [...(editingItem?.icon_overrides || [])];
                                    newOverrides[idx] = { ...newOverrides[idx], icon_id: e.target.value };
                                    setEditingItem({ ...editingItem!, icon_overrides: newOverrides });
                                  }}
                                  placeholder="Icon ID"
                                  className="flex-1 h-8"
                                />
                                <Select
                                  value={override.icon_id}
                                  onValueChange={(v) => {
                                    const newOverrides = [...(editingItem?.icon_overrides || [])];
                                    newOverrides[idx] = { ...newOverrides[idx], icon_id: v };
                                    setEditingItem({ ...editingItem!, icon_overrides: newOverrides });
                                  }}
                                >
                                  <SelectTrigger className="w-[100px] h-8">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {AVAILABLE_ICONS.map((iconId) => (
                                      <SelectItem key={iconId} value={iconId}>
                                        <div className="flex items-center gap-2">
                                          <ClothingIcon iconId={iconId} className="w-4 h-4" />
                                          {iconId}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          {/* Preview and Delete */}
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 border rounded-md bg-muted/30 flex items-center justify-center">
                              <ClothingIcon iconId={override.icon_id} className="w-8 h-8" />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                const newOverrides = (editingItem?.icon_overrides || []).filter(
                                  (_, i) => i !== idx
                                );
                                setEditingItem({ ...editingItem!, icon_overrides: newOverrides });
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="colors" className="mt-0">
                <ColorPicker
                  selectedSlugs={editingItem?.allowed_colors || []}
                  onChange={(slugs) =>
                    setEditingItem({ ...editingItem!, allowed_colors: slugs })
                  }
                  colors={colors}
                  onAddCustom={handleAddCustomColor}
                />
              </TabsContent>

              <TabsContent value="attributes" className="mt-0 space-y-6">
                <ArrayInput
                  label="Allowed Fits"
                  values={editingItem?.allowed_fits || []}
                  onChange={(v) =>
                    setEditingItem({ ...editingItem!, allowed_fits: v })
                  }
                  suggestions={[
                    "slim",
                    "regular",
                    "relaxed",
                    "oversized",
                    "cropped",
                    "wide",
                    "straight",
                    "tapered",
                  ]}
                />
                <ArrayInput
                  label="Allowed Materials"
                  values={editingItem?.allowed_materials || []}
                  onChange={(v) =>
                    setEditingItem({ ...editingItem!, allowed_materials: v })
                  }
                  suggestions={[
                    "cotton",
                    "linen",
                    "wool",
                    "polyester",
                    "denim",
                    "leather",
                    "suede",
                    "cashmere",
                    "silk",
                  ]}
                />
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <DialogFooter className="p-4 border-t bg-muted/20">
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => editingItem && handleSave(editingItem)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
