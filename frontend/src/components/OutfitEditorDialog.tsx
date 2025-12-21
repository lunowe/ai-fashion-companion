import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { listClothing } from "@/services/clothing";
import { listStyles } from "@/services/styles";
import type { Outfit, OutfitCreate, ClothingItem } from "@/types"; // Removed unused imports

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Check, Search } from "lucide-react";
import { ClothingIcon } from "@/lib/icons";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility

type EditorMode = "create" | "edit";

interface OutfitEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outfit?: Outfit | null;
  onSave: (data: OutfitCreate) => Promise<void>;
  isSaving?: boolean;
}

const OCCASIONS = [
  "Casual",
  "Work",
  "Formal",
  "Date Night",
  "Party",
  "Sport",
  "Travel",
];
const WEATHER_OPTIONS = ["Hot", "Warm", "Mild", "Cool", "Cold", "Rainy"];

export function OutfitEditorDialog({
  open,
  onOpenChange,
  outfit,
  onSave,
  isSaving,
}: OutfitEditorDialogProps) {
  const mode: EditorMode = outfit ? "edit" : "create";

  // Form state
  const [name, setName] = useState("");
  const [styleId, setStyleId] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [occasion, setOccasion] = useState("");
  const [weather, setWeather] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Data queries
  const { data: clothing } = useQuery({
    queryKey: ["clothing"],
    queryFn: listClothing,
  });

  const { data: styles } = useQuery({
    queryKey: ["styles"],
    queryFn: () => listStyles(false),
  });

  // Reset form when outfit changes or dialog opens
  useEffect(() => {
    if (open) {
      if (outfit) {
        setName(outfit.name || "");
        setStyleId(outfit.style_id || "");
        setSelectedItems(outfit.items || []);
        setOccasion(outfit.occasion || "");
        setWeather(outfit.weather || "");
      } else {
        setName("");
        setStyleId(styles?.[0]?._id || "");
        setSelectedItems([]);
        setOccasion("");
        setWeather("");
      }
      setSearchQuery("");
    }
  }, [open, outfit, styles]);

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async () => {
    await onSave({
      name: name.trim() || "Untitled Outfit",
      style_id: styleId,
      items: selectedItems,
      occasion: occasion || undefined,
      weather: weather || undefined,
    });
  };

  const filteredClothing = clothing?.filter(
    (item) =>
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category &&
        item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.color &&
        item.color.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const clothingByCategory = (filteredClothing || []).reduce<
    Record<string, ClothingItem[]>
  >((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const isValid = styleId && selectedItems.length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:h-auto max-h-[85vh] sm:max-w-[700px] flex flex-col p-0 gap-0 rounded-lg overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b shrink-0 bg-background z-10">
          <DialogTitle>
            {mode === "edit" ? "Edit Outfit" : "Create New Outfit"}
          </DialogTitle>
          <DialogDescription className="hidden">
            Make changes to your outfit here.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="flex flex-col h-full px-4 py-4 space-y-6">
            {/* --- Top Controls --- */}
            <div className="space-y-4 shrink-0">
              <div className="space-y-2">
                <Label htmlFor="name">Outfit Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer Date Night"
                  className="bg-muted"
                />
              </div>

              {/* Grid: 1 col on mobile, 3 on desktop for logic */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Style takes full width on mobile grid line 1 */}
                <div className="flex flex-col flex-1 col-span-2 sm:col-span-1 space-y-2">
                  <Label>Style</Label>
                  <Select value={styleId} onValueChange={setStyleId}>
                    <SelectTrigger className="bg-muted w-full">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {(styles || []).map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Occasion & Weather share a row on mobile */}
                <div className="space-y-2 flex flex-col flex-1">
                  <Label>Occasion</Label>
                  <Select value={occasion} onValueChange={setOccasion}>
                    <SelectTrigger className="bg-muted w-full">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      {OCCASIONS.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Weather</Label>
                  <Select value={weather} onValueChange={setWeather}>
                    <SelectTrigger className="bg-muted w-full">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      {WEATHER_OPTIONS.map((w) => (
                        <SelectItem key={w} value={w}>
                          {w}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* --- Selected Items Chips --- */}
            {selectedItems.length > 0 && (
              <div className="space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Selected ({selectedItems.length})
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => setSelectedItems([])}
                  >
                    Clear all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((id) => {
                    const item = clothing?.find((c) => c._id === id);
                    if (!item) return null;
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="pl-2 pr-1 py-1 gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                        onClick={() => toggleItem(id)}
                      >
                        <ClothingIcon
                          iconId={item.icon_id}
                          className="w-3 h-3"
                          color={item.color_code}
                        />
                        <span className="capitalize">{item.type}</span>
                        <X className="w-3 h-3 ml-1 opacity-50" />
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- Item Picker Section --- */}
            <div className="flex flex-col flex-1 min-h-[300px]">
              <div className="sticky top-0 bg-background pb-3 z-10 space-y-2">
                <Label>Select Items</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search your wardrobe..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <ScrollArea className="flex-1 -mr-3 pr-3">
                <div className="space-y-6 pb-2">
                  {Object.entries(clothingByCategory).length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                      No clothing items found matching your search.
                    </div>
                  ) : (
                    Object.entries(clothingByCategory).map(
                      ([category, items]) => (
                        <div key={category}>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 sticky top-0 bg-background/95 backdrop-blur-sm py-1 z-0">
                            {category}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
                            {items.map((item) => {
                              const isSelected = selectedItems.includes(
                                item._id
                              );
                              return (
                                <button
                                  key={item._id}
                                  type="button"
                                  onClick={() => toggleItem(item._id)}
                                  className={cn(
                                    "group relative flex flex-col items-center justify-between p-3 pt-0 rounded-xl border transition-all duration-200 text-center",
                                    "aspect-[4/5] sm:aspect-square",
                                    isSelected
                                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                                      : "border-border hover:border-primary/50 hover:shadow-sm"
                                  )}
                                >
                                  {isSelected && (
                                    <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm animate-in zoom-in-50 duration-200">
                                      <Check className="w-3 h-3" />
                                    </div>
                                  )}

                                  <div className="flex-1 flex items-center justify-center w-full">
                                    <ClothingIcon
                                      iconId={item.icon_id}
                                      color={item.color_code}
                                      className="w-18 h-18 drop-shadow-sm transition-transform group-hover:scale-110"
                                    />
                                  </div>

                                  <div className="w-full space-y-1 flex flex-col">
                                    <h3 className="capitalize text-sm font-medium leading-tight truncate px-1">
                                      {item.type}
                                    </h3>
                                    <div className="flex flex-row w-full justify-center">
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] h-5 px-1.5 font-normal border-muted-foreground/30 capitalize truncate"
                                      >
                                        {item.fit}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                      <div
                                        className="w-3 h-3 rounded-full border shadow-sm"
                                        style={{
                                          backgroundColor: item.color_code,
                                        }}
                                        title={item.color}
                                      />
                                      <span className="capitalize">
                                        {item.color}
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t bg-background p-4 flex-row gap-3 sm:gap-2 justify-end shrink-0">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            onClick={handleSubmit}
            disabled={!isValid || isSaving}
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {mode === "edit" ? "Save Changes" : "Create Outfit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
