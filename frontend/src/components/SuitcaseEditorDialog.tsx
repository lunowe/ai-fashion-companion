import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { listClothing } from "@/services/clothing";
import type { TravelSuitcase, TravelSuitcaseUpdate, ClothingItem, PackingItem, DailyOutfit } from "@/types";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, X, Check, Search, Luggage, Calendar } from "lucide-react";
import { ClothingIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface SuitcaseEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suitcase: TravelSuitcase;
  onSave: (id: string, data: TravelSuitcaseUpdate) => Promise<void>;
  isSaving?: boolean;
}

export function SuitcaseEditorDialog({
  open,
  onOpenChange,
  suitcase,
  onSave,
  isSaving,
}: SuitcaseEditorDialogProps) {
  // Form state
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [packingList, setPackingList] = useState<PackingItem[]>([]);
  const [dailyOutfits, setDailyOutfits] = useState<DailyOutfit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"packing" | "outfits">("packing");
  const [editingOutfitIndex, setEditingOutfitIndex] = useState<number | null>(null);

  // Data queries
  const { data: clothing } = useQuery({
    queryKey: ["clothing"],
    queryFn: listClothing,
  });

  // Reset form when suitcase changes or dialog opens
  useEffect(() => {
    if (open && suitcase) {
      setName(suitcase.name || "");
      setNotes(suitcase.notes || "");
      setPackingList(suitcase.packing_list || []);
      setDailyOutfits(suitcase.daily_outfits || []);
      setSearchQuery("");
      setActiveTab("packing");
      setEditingOutfitIndex(null);
    }
  }, [open, suitcase]);

  const getPackingItemIds = () => packingList.map((p) => p.item_id);

  const togglePackingItem = (itemId: string) => {
    setPackingList((prev) => {
      const exists = prev.some((p) => p.item_id === itemId);
      if (exists) {
        return prev.filter((p) => p.item_id !== itemId);
      }
      return [...prev, { item_id: itemId }];
    });
  };

  const toggleOutfitItem = (outfitIndex: number, itemId: string) => {
    setDailyOutfits((prev) => {
      const newOutfits = [...prev];
      const outfit = { ...newOutfits[outfitIndex] };
      if (outfit.items.includes(itemId)) {
        outfit.items = outfit.items.filter((id) => id !== itemId);
      } else {
        outfit.items = [...outfit.items, itemId];
      }
      newOutfits[outfitIndex] = outfit;
      return newOutfits;
    });
  };

  const handleSubmit = async () => {
    await onSave(suitcase._id, {
      name: name.trim() || undefined,
      notes: notes.trim() || undefined,
      packing_list: packingList,
      daily_outfits: dailyOutfits,
    });
    onOpenChange(false);
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

  const getClothingItem = (itemId: string): ClothingItem | undefined => {
    return clothing?.find((item) => item._id === itemId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:h-auto max-h-[85vh] sm:max-w-[700px] flex flex-col p-0 gap-0 rounded-lg overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b shrink-0 bg-background z-10">
          <DialogTitle>Edit Suitcase</DialogTitle>
          <DialogDescription className="hidden">
            Make changes to your travel suitcase here.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="flex flex-col h-full px-4 py-4 space-y-4">
            {/* Name & Notes */}
            <div className="space-y-3 shrink-0">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={suitcase.destination}
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes about this trip"
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Tabs for Packing List / Daily Outfits */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "packing" | "outfits")} className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-2 shrink-0">
                <TabsTrigger value="packing" className="flex items-center gap-2">
                  <Luggage className="w-4 h-4" />
                  Packing List ({packingList.length})
                </TabsTrigger>
                <TabsTrigger value="outfits" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Daily Outfits ({dailyOutfits.length})
                </TabsTrigger>
              </TabsList>

              {/* Packing List Tab */}
              <TabsContent value="packing" className="flex-1 flex flex-col min-h-0 mt-4">
                {/* Selected Items */}
                {packingList.length > 0 && (
                  <div className="space-y-2 mb-4 shrink-0">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Packed Items ({packingList.length})
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => setPackingList([])}
                      >
                        Clear all
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {packingList.map((packItem) => {
                        const item = getClothingItem(packItem.item_id);
                        if (!item) return null;
                        return (
                          <Badge
                            key={packItem.item_id}
                            variant="secondary"
                            className="pl-2 pr-1 py-1 gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                            onClick={() => togglePackingItem(packItem.item_id)}
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

                {/* Item Picker */}
                <div className="flex flex-col flex-1 min-h-[250px]">
                  <div className="sticky top-0 bg-background pb-3 z-10 space-y-2">
                    <Label>Add/Remove Items</Label>
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
                    <div className="space-y-4 pb-2">
                      {Object.entries(clothingByCategory).length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground text-sm">
                          No clothing items found.
                        </div>
                      ) : (
                        Object.entries(clothingByCategory).map(([category, items]) => (
                          <div key={category}>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              {category}
                            </h4>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {items.map((item) => {
                                const isSelected = getPackingItemIds().includes(item._id);
                                return (
                                  <button
                                    key={item._id}
                                    type="button"
                                    onClick={() => togglePackingItem(item._id)}
                                    className={cn(
                                      "group relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all text-center aspect-square",
                                      isSelected
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "border-border hover:border-primary/50"
                                    )}
                                  >
                                    {isSelected && (
                                      <div className="absolute top-1 right-1 z-10 bg-primary text-primary-foreground rounded-full p-0.5">
                                        <Check className="w-2.5 h-2.5" />
                                      </div>
                                    )}
                                    <ClothingIcon
                                      iconId={item.icon_id}
                                      color={item.color_code}
                                      className="w-10 h-10"
                                    />
                                    <span className="text-[10px] capitalize truncate w-full mt-1">
                                      {item.type}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              {/* Daily Outfits Tab */}
              <TabsContent value="outfits" className="flex-1 flex flex-col min-h-0 mt-4">
                <ScrollArea className="flex-1 -mr-3 pr-3">
                  <div className="space-y-4 pb-2">
                    {dailyOutfits.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground text-sm">
                        No daily outfits in this suitcase.
                      </div>
                    ) : (
                      dailyOutfits.map((outfit, idx) => {
                        const isEditing = editingOutfitIndex === idx;
                        const outfitItems = outfit.items.map(getClothingItem).filter(Boolean) as ClothingItem[];

                        return (
                          <Card key={idx} className={cn("border", isEditing && "ring-2 ring-primary")}>
                            <CardHeader className="py-3 px-4">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">
                                  Day {outfit.day}: {outfit.occasion}
                                </CardTitle>
                                <Button
                                  variant={isEditing ? "secondary" : "ghost"}
                                  size="sm"
                                  onClick={() => setEditingOutfitIndex(isEditing ? null : idx)}
                                >
                                  {isEditing ? "Done" : "Edit"}
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="px-4 pb-3 space-y-3">
                              {/* Current outfit items */}
                              <div className="flex flex-wrap gap-2">
                                {outfitItems.map((item) => (
                                  <Badge
                                    key={item._id}
                                    variant="secondary"
                                    className={cn(
                                      "pl-2 pr-1 py-1 gap-1 transition-colors",
                                      isEditing && "cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                                    )}
                                    onClick={() => isEditing && toggleOutfitItem(idx, item._id)}
                                  >
                                    <ClothingIcon
                                      iconId={item.icon_id}
                                      className="w-3 h-3"
                                      color={item.color_code}
                                    />
                                    <span className="capitalize">{item.type}</span>
                                    {isEditing && <X className="w-3 h-3 ml-1 opacity-50" />}
                                  </Badge>
                                ))}
                              </div>

                              {/* Add items when editing */}
                              {isEditing && (
                                <div className="pt-2 border-t space-y-2">
                                  <Label className="text-xs">Add items from packing list:</Label>
                                  <div className="flex flex-wrap gap-2">
                                    {packingList
                                      .filter((p) => !outfit.items.includes(p.item_id))
                                      .map((packItem) => {
                                        const item = getClothingItem(packItem.item_id);
                                        if (!item) return null;
                                        return (
                                          <Badge
                                            key={packItem.item_id}
                                            variant="outline"
                                            className="pl-2 pr-2 py-1 gap-1 cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors"
                                            onClick={() => toggleOutfitItem(idx, packItem.item_id)}
                                          >
                                            <ClothingIcon
                                              iconId={item.icon_id}
                                              className="w-3 h-3"
                                              color={item.color_code}
                                            />
                                            <span className="capitalize">{item.type}</span>
                                            <Check className="w-3 h-3 ml-1 opacity-50" />
                                          </Badge>
                                        );
                                      })}
                                    {packingList.filter((p) => !outfit.items.includes(p.item_id)).length === 0 && (
                                      <span className="text-xs text-muted-foreground">
                                        All packed items are in this outfit
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
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
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
