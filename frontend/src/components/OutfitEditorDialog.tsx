import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { listClothing } from "@/services/clothing";
import { listStyles } from "@/services/styles";
import type { Outfit, OutfitCreate, ClothingItem, Style } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Loader2, X, Check } from "lucide-react";
import { ClothingIcon } from "@/lib/icons";

type EditorMode = "create" | "edit";

interface OutfitEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outfit?: Outfit | null; // If provided, edit mode
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

  // Group clothing by category
  const clothingByCategory = (clothing || []).reduce<
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
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Outfit" : "Create New Outfit"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Summer casual look..."
            />
          </div>

          {/* Style + Occasion + Weather Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Style</Label>
              <Select value={styleId} onValueChange={setStyleId}>
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label>Occasion</Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
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
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
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

          {/* Selected Items Preview */}
          {selectedItems.length > 0 && (
            <div className="space-y-2">
              <Label>Selected ({selectedItems.length})</Label>
              <div className="flex flex-wrap gap-2">
                {selectedItems.map((id) => {
                  const item = clothing?.find((c) => c._id === id);
                  if (!item) return null;
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="gap-1 pr-1 cursor-pointer hover:bg-destructive/20"
                      onClick={() => toggleItem(id)}
                    >
                      <span className="capitalize">{item.type}</span>
                      <X className="w-3 h-3" />
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clothing Picker */}
          <div className="space-y-2">
            <Label>Select Items (min 2)</Label>
            <ScrollArea className="h-64 border rounded-lg p-3">
              <div className="space-y-4">
                {Object.entries(clothingByCategory).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {category}
                    </h4>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {items.map((item) => {
                        const isSelected = selectedItems.includes(item._id);
                        return (
                          <button
                            key={item._id}
                            type="button"
                            onClick={() => toggleItem(item._id)}
                            className={`relative aspect-square rounded-lg border-2 p-2 flex flex-col items-center justify-center transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <ClothingIcon
                              iconId={item.icon_id}
                              color={item.color_code}
                              className="w-8 h-8"
                            />
                            <span className="text-[9px] text-muted-foreground truncate w-full text-center mt-1">
                              {item.type}
                            </span>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                                <Check className="w-3 h-3" />
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
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {mode === "edit" ? "Save Changes" : "Create Outfit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
