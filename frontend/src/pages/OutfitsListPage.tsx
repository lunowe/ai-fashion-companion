// OutfitsListPage.tsx
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Trash2,
  Sparkles,
  Calendar,
  CloudSun,
  MoreHorizontal,
  Loader2,
  Search,
  ImagePlus,
  RefreshCw,
  Plus,
  Pencil,
} from "lucide-react";

import {
  listOutfits,
  deleteOutfit,
  updateOutfit,
  saveOutfit,
} from "@/services/outfits";
import { listClothing } from "@/services/clothing";
import { listStyles } from "@/services/styles";
import type { Outfit, ClothingItem, OutfitCreate } from "@/types";

import { useVisualization } from "@/hooks/useVisualization";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ClothingIcon } from "@/lib/icons";

import { OutfitEditorDialog } from "@/components/OutfitEditorDialog";

// ------------------------------------------------------------------
// Sub-Component: Outfit Detail Dialog Content
// ------------------------------------------------------------------
function OutfitDetailContent({
  outfit,
  getOutfitItems,
  getStyleName,
  onDelete,
  onClose,
}: {
  outfit: Outfit;
  getOutfitItems: (itemIds: string[]) => ClothingItem[];
  getStyleName: (id?: string) => string;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const { status, url, trigger } = useVisualization(
    outfit._id,
    outfit.visualization_status ||
      (outfit.visualization_key ? "completed" : "none")
  );

  const visualizationUrl = url || outfit.visualization_url;
  const hasVisual = status === "completed" && visualizationUrl;
  const isPending = status === "pending";

  // Default to visual tab when available
  const defaultTab = hasVisual ? "visual" : "grid";

  return (
    <div className="flex flex-col md:flex-row h-full w-full">
      {/* --- LEFT SIDE: VISUALS --- */}
      <div className="w-full md:w-[55%] h-80 md:h-full bg-muted/10 border-b md:border-b-0 md:border-r border-border/50 flex flex-col shrink-0">
        <Tabs defaultValue={defaultTab} className="w-full h-full flex flex-col">
          <div className="p-4 pb-0 shrink-0 flex items-center justify-between gap-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">Clothing Grid</TabsTrigger>
              <TabsTrigger value="visual">
                AI Render {hasVisual && "✨"}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden relative p-4">
            <TabsContent
              value="grid"
              className="h-full w-full m-0 data-[state=active]:flex items-center justify-center overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
                {getOutfitItems(outfit.items).map((item) => (
                  <div
                    key={item._id}
                    className="aspect-square bg-background rounded-xl border shadow-sm flex flex-col items-center justify-center p-3 transition-colors hover:border-primary/30"
                  >
                    <ClothingIcon
                      iconId={item.icon_id}
                      color={item.color_code}
                      className="w-12 h-12 md:w-16 md:h-16 mb-2"
                    />
                    <span className="text-[10px] md:text-xs font-medium text-center text-muted-foreground truncate w-full px-1">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent
              value="visual"
              className="h-full w-full m-0 data-[state=active]:flex flex-col items-center justify-center gap-4"
            >
              {isPending ? (
                <div className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-muted-foreground/25 rounded-xl w-full h-full max-h-96 bg-muted/30">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Generating visual...</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This may take a moment
                    </p>
                  </div>
                </div>
              ) : hasVisual ? (
                <>
                  <div className="relative w-full flex-1 flex items-center justify-center rounded-lg overflow-hidden border border-border/50 bg-black/5">
                    <img
                      src={visualizationUrl}
                      alt="AI Generated Outfit"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => trigger(true)}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate Visual
                  </Button>
                </>
              ) : (
                <div className="text-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-xl w-full h-full max-h-64 flex flex-col items-center justify-center bg-muted/30 gap-4">
                  <div className="p-4 bg-muted rounded-full">
                    <ImagePlus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">No visual yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Generate an AI visualization of this outfit
                    </p>
                  </div>
                  <Button onClick={() => trigger()} className="gap-2 mt-2">
                    <Sparkles className="w-4 h-4" />
                    Generate AI Visual
                  </Button>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* --- RIGHT SIDE: DETAILS --- */}
      <div className="flex-1 flex flex-col h-full min-h-0 bg-background relative">
        {/* Header (Sticky) */}
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className="px-2 py-0.5 text-xs font-normal"
                >
                  {getStyleName(outfit.style_id)}
                </Badge>
                {hasVisual && (
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800 px-2 py-0.5 text-xs font-normal">
                    AI Visual ✨
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-xl md:text-2xl font-bold leading-tight">
                {outfit.name || "Untitled Outfit"}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <ScrollArea className="flex-1 px-6 w-full">
          <div className="space-y-6 pb-6 pt-2">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 p-3 bg-muted/30 rounded-lg border border-border/50">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  Occasion
                </span>
                <div className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {outfit.occasion || "Not specified"}
                </div>
              </div>
              <div className="space-y-1 p-3 bg-muted/30 rounded-lg border border-border/50">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  Weather
                </span>
                <div className="text-sm font-medium flex items-center gap-2">
                  <CloudSun className="w-3.5 h-3.5 text-primary" />
                  {outfit.weather || "Not specified"}
                </div>
              </div>
            </div>

            {/* Stylist Reasoning */}
            {outfit.ai_generated_reasoning && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Stylist Notes
                </h4>
                <div className="text-sm leading-relaxed text-muted-foreground bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-lg border border-purple-100 dark:border-purple-800/50 shadow-sm">
                  {outfit.ai_generated_reasoning}
                </div>
              </div>
            )}

            <Separator className="bg-border/60" />

            {/* Items List */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="h-5 w-5 p-0 flex items-center justify-center rounded-full mr-1"
                >
                  {getOutfitItems(outfit.items).length}
                </Badge>{" "}
                Items
              </h4>
              <div className="space-y-2">
                {getOutfitItems(outfit.items).map((item) => (
                  <div
                    key={item._id}
                    className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-all border border-transparent hover:border-border/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-background rounded-md flex items-center justify-center border shadow-sm group-hover:scale-105 transition-transform">
                        <ClothingIcon
                          iconId={item.icon_id}
                          color={item.color}
                          className="w-6 h-6"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium capitalize">
                          {item.type}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {item.category} • {item.fit}
                        </span>
                      </div>
                    </div>

                    {item.color && (
                      <div
                        className="w-3 h-3 rounded-full border border-border/40 shadow-sm"
                        style={{ backgroundColor: item.color }}
                        title={item.color}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer (Sticky) */}
        <div className="p-4 md:p-6 border-t bg-background shrink-0 flex justify-between items-center z-10">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(outfit._id)}
            className="gap-2 hover:bg-destructive/90"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete Outfit</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Sub-Component: Mini Outfit Grid (The Visual Hero)
// ------------------------------------------------------------------
const MiniOutfitPreview = ({ items }: { items: ClothingItem[] }) => {
  const previewItems = items.slice(0, 4);
  const emptySlots = 4 - previewItems.length;

  return (
    <div className="w-full h-full bg-muted/10 grid grid-cols-2 gap-1 p-2">
      {previewItems.map((item) => (
        <div
          key={item._id}
          className="bg-background rounded-md flex items-center justify-center p-2 relative overflow-hidden border border-border/20"
        >
          <ClothingIcon
            iconId={item.icon_id}
            color={item.color_code}
            className="w-full h-full opacity-90"
            size="md"
          />
        </div>
      ))}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <div
          key={i}
          className="bg-muted/5 rounded-md flex items-center justify-center border border-dashed border-border/30"
        >
          <span className="text-muted-foreground/10 text-[10px]">•</span>
        </div>
      ))}
    </div>
  );
};

// ------------------------------------------------------------------
// Sub-Component: Outfit Card (Redesigned to match WardrobeCard)
// ------------------------------------------------------------------

function OutfitCard({
  outfit,
  items,
  styleName,
  onView,
  onDelete,
  onEdit,
}: {
  outfit: Outfit;
  items: ClothingItem[];
  styleName: string;
  onView: (outfit: Outfit) => void;
  onDelete: (id: string) => void;
  onEdit: (outfit: Outfit) => void;
}) {
  const { status, url, trigger } = useVisualization(
    outfit._id,
    outfit.visualization_status ||
      (outfit.visualization_key ? "completed" : "none")
  );

  const visualizationUrl = url || outfit.visualization_url;
  const isPending = status === "pending";
  const hasVisual = status === "completed" && visualizationUrl;

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer flex flex-col h-full"
      onClick={() => onView(outfit)}
    >
      {/* Image / Preview Area - Square aspect ratio for better fit display */}
      <div className="aspect-square w-full overflow-hidden border-b border-border/40 relative bg-muted/5">
        {hasVisual ? (
          <img
            src={visualizationUrl}
            alt={outfit.name}
            className="h-full w-full object-contain bg-muted/10 transition-transform duration-500"
            loading="lazy"
          />
        ) : isPending ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-muted/20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              Generating...
            </span>
          </div>
        ) : (
          <MiniOutfitPreview items={items} />
        )}

        {/* Floating Actions - Always visible on mobile, hover on desktop */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
          {/* Quick Generate Button (Mobile only when no visual) */}
          {status === "none" && (
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 shadow-sm bg-background/90 backdrop-blur-sm hover:bg-background sm:hidden"
              onClick={(e) => {
                e.stopPropagation();
                trigger();
              }}
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 shadow-sm bg-background/90 backdrop-blur-sm hover:bg-background"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {status === "none" && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    trigger();
                  }}
                >
                  <ImagePlus className="mr-2 h-4 w-4" /> Generate Visual
                </DropdownMenuItem>
              )}
              {status === "failed" && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    trigger();
                  }}
                >
                  <ImagePlus className="mr-2 h-4 w-4" /> Retry Generation
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(outfit);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(outfit._id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col gap-2">
        {/* Header Section */}
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3
              className="font-semibold text-lg leading-tight truncate group-hover:text-primary"
              title={outfit.name}
            >
              {outfit.name || "Untitled Outfit"}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {styleName}
            </p>
          </div>
        </div>

        {/* Chips/Metadata - Pushed to bottom */}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {outfit.occasion && (
            <Badge
              variant="secondary"
              className="text-[10px] font-normal px-2 py-0.5 h-5"
            >
              {outfit.occasion}
            </Badge>
          )}
          {outfit.weather && (
            <Badge
              variant="secondary"
              className="text-[10px] font-normal px-2 py-0.5 h-5"
            >
              {outfit.weather}
            </Badge>
          )}
          {hasVisual && (
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-[10px] font-normal px-2 py-0.5 h-5 shadow-none hover:bg-purple-100">
              AI Visual
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------------
// Main Page Component
// ------------------------------------------------------------------

export default function OutfitsListPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewOutfit, setViewOutfit] = useState<Outfit | null>(null);

  // Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("all");
  const [gridCols, setGridCols] = useState<1 | 2>(2); // Mobile grid toggle
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null);

  // 1. Fetch Data
  const { data: outfits, isLoading: isOutfitsLoading } = useQuery({
    queryKey: ["outfits"],
    queryFn: listOutfits,
  });

  const { data: clothing, isLoading: isClothingLoading } = useQuery({
    queryKey: ["clothing"],
    queryFn: listClothing,
  });

  const { data: styles } = useQuery({
    queryKey: ["styles"],
    queryFn: () => listStyles(false),
  });

  // 2. Mutations
  const delMut = useMutation({
    mutationFn: deleteOutfit,
    onSuccess: () => {
      toast.success("Outfit removed from your collection");
      qc.invalidateQueries({ queryKey: ["outfits"] });
      setOpen(false);
    },
    onError: () => toast.error("Could not delete outfit"),
  });

  const saveMut = useMutation({
    mutationFn: (data: OutfitCreate) => saveOutfit(data),
    onSuccess: () => {
      toast.success("Outfit created");
      qc.invalidateQueries({ queryKey: ["outfits"] });
      setEditorOpen(false);
    },
    onError: () => toast.error("Failed to create outfit"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OutfitCreate> }) =>
      updateOutfit(id, data),
    onSuccess: () => {
      toast.success("Outfit updated");
      qc.invalidateQueries({ queryKey: ["outfits"] });
      setEditorOpen(false);
      setEditingOutfit(null);
    },
    onError: () => toast.error("Failed to update outfit"),
  });

  // 3. Helpers
  const getStyleName = (id?: string) =>
    (styles ?? []).find((s) => s._id === id)?.name ?? "Unknown Style";

  const getOutfitItems = (itemIds: string[]): ClothingItem[] => {
    if (!clothing) return [];
    return clothing.filter((c) => itemIds.includes(c._id));
  };

  const handleOpenView = (outfit: Outfit) => {
    setViewOutfit(outfit);
    setOpen(true);
  };

  const handleCreate = () => {
    setEditingOutfit(null);
    setEditorOpen(true);
  };

  const handleEdit = (outfit: Outfit) => {
    setEditingOutfit(outfit);
    setEditorOpen(true);
  };

  const handleEditorSave = async (data: OutfitCreate) => {
    if (editingOutfit) {
      await updateMut.mutateAsync({ id: editingOutfit._id, data });
    } else {
      await saveMut.mutateAsync(data);
    }
  };

  // 4. Filtering Logic
  const filteredOutfits = useMemo(() => {
    if (!outfits) return [];

    let filtered = outfits;

    // Filter by Style Pill
    if (selectedStyle !== "all") {
      filtered = filtered.filter((o) => o.style_id === selectedStyle);
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.name?.toLowerCase().includes(query) ||
          o.occasion?.toLowerCase().includes(query) ||
          o.weather?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [outfits, selectedStyle, searchQuery]);

  // Loading State
  if (isOutfitsLoading || isClothingLoading) {
    return (
      <div className="space-y-6 px-2">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full md:w-1/2" />
          <div className="flex gap-2 overflow-hidden">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Filter Pills Setup
  const styleFilters = [
    { _id: "all", name: "All", icon: "✦" },
    ...(styles || []),
  ];

  return (
    <>
      <div className="space-y-6 pt-4 px-2">
        {/* --- Header & Filters --- */}
        <div className="flex flex-col gap-4">
          {/* Title & Stats */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Your Rotation</h1>
            {/* Mobile Grid Toggle */}

            <div className="flex items-center gap-2 sm:hidden">
              <span className="text-xs text-muted-foreground">
                {filteredOutfits.length} items
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
                  <div className="w-3.5 h-3.5 border-2 border-current rounded-[2px]" />
                </button>
                <button
                  onClick={() => setGridCols(2)}
                  className={`p-1.5 rounded-md transition-all ${
                    gridCols === 2
                      ? "bg-background shadow-sm"
                      : "hover:bg-background/50 text-muted-foreground"
                  }`}
                >
                  <div className="flex gap-0.5 w-3.5 h-3.5">
                    <div className="w-full h-full border-2 border-current rounded-[1px]" />
                    <div className="w-full h-full border-2 border-current rounded-[1px]" />
                  </div>
                </button>
              </div>
            </div>
            <Button onClick={handleCreate} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Outfit</span>
            </Button>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Style Pills */}
            <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              {styleFilters.map((style) => {
                const isActive = selectedStyle === style._id;
                return (
                  <button
                    key={style._id}
                    onClick={() => setSelectedStyle(style._id)}
                    className={`cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all
                                    ${
                                      isActive
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "bg-muted/70 text-secondary-foreground hover:bg-muted"
                                    }
                                `}
                  >
                    {style._id === "all" ? (
                      "✦"
                    ) : (
                      <span className="opacity-70">#</span>
                    )}
                    <span>{style.name}</span>
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
                placeholder="Search outfits..."
                className="w-full py-2 pl-10 pr-4 text-sm border rounded-lg border-border bg-muted/70 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* --- Results Count (Desktop) --- */}
        <div className="hidden sm:block text-sm text-muted-foreground">
          {filteredOutfits.length === 0
            ? "No outfits found"
            : `Showing ${filteredOutfits.length} ${
                filteredOutfits.length === 1 ? "outfit" : "outfits"
              }`}
        </div>

        {/* --- Grid --- */}
        {filteredOutfits.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4 rounded-xl border-2 border-dashed border-muted bg-muted/10 p-12">
            <div className="p-4 bg-muted rounded-full">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">
              No outfits found
            </h2>
            <p className="text-muted-foreground max-w-sm text-sm">
              Try adjusting your filters or search query, or generate a new
              outfit in the Stylist tab.
            </p>
            {selectedStyle !== "all" && (
              <Button variant="outline" onClick={() => setSelectedStyle("all")}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div
            className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
              gridCols === 1 ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {filteredOutfits.map((outfit) => (
              <OutfitCard
                key={outfit._id}
                outfit={outfit}
                items={getOutfitItems(outfit.items)}
                styleName={getStyleName(outfit.style_id)}
                onView={handleOpenView}
                onDelete={(id) => delMut.mutate(id)}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- Detail Dialog (Kept as Dialog for visual complexity) --- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl! p-0 overflow-hidden h-[85vh] flex flex-col gap-0">
          {viewOutfit && (
            <OutfitDetailContent
              outfit={viewOutfit}
              getOutfitItems={getOutfitItems}
              getStyleName={getStyleName}
              onDelete={(id) => delMut.mutate(id)}
              onClose={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      <OutfitEditorDialog
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) setEditingOutfit(null);
        }}
        outfit={editingOutfit}
        onSave={handleEditorSave}
        isSaving={saveMut.isPending || updateMut.isPending}
      />
    </>
  );
}
