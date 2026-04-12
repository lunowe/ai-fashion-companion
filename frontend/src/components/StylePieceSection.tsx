import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Wand2,
  Loader2,
  Save,
  Bot,
  Shirt,
  Sparkles,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import type {
  ClothingItem,
  Style,
  OutfitCreate,
  StylePieceRequest,
  StylePieceResponse,
  AnalyzedItem,
  GeneratedOutfit,
} from "@/types";
import { LLM_MODELS } from "@/types";
import { stylePiece } from "@/services/itemAnalysis";
import ImageCapture from "@/components/ImageCapture";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useColors, useEffectiveIconId } from "@/hooks/useCatalogData";
import { ClothingIcon } from "@/lib/icons";

const LOADING_MESSAGES = [
  "Analyzing the clothing item...",
  "Identifying colors and style...",
  "Browsing your wardrobe...",
  "Matching complementary pieces...",
  "Creating outfit combinations...",
  "Styling your looks...",
  "Adding finishing touches...",
  "Finalizing outfits...",
];

const OCCASION_PRESETS = [
  { id: "casual", label: "Casual", icon: "😎" },
  { id: "work", label: "Work", icon: "💼" },
  { id: "date", label: "Date Night", icon: "❤️" },
  { id: "going-out", label: "Going Out", icon: "🎉" },
  { id: "gym", label: "Gym", icon: "🏋️" },
];

const WEATHER_PRESETS = [
  { id: "hot", label: "Hot", icon: "🌞" },
  { id: "warm", label: "Warm", icon: "☀️" },
  { id: "cool", label: "Cool", icon: "🌤️" },
  { id: "cold", label: "Cold", icon: "❄️" },
  { id: "rainy", label: "Rainy", icon: "🌧️" },
];

interface StylePieceSectionProps {
  wardrobe: ClothingItem[];
  styles: Style[];
  disabled: boolean;
  onSave: (outfit: OutfitCreate) => void;
}

export default function StylePieceSection({
  wardrobe,
  styles,
  disabled,
  onSave,
}: StylePieceSectionProps) {
  const [image, setImage] = useState<string | null>(null);
  const [model, setModel] = useState(LLM_MODELS[0].id);
  const [styleId, setStyleId] = useState<string>("");
  const [occasion, setOccasion] = useState<string>("");
  const [weather, setWeather] = useState<string>("");
  const [numOutfits, setNumOutfits] = useState(3);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<StylePieceResponse | null>(null);

  // Loading message rotation
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const mutation = useMutation({
    mutationFn: stylePiece,
    onSuccess: (data) => {
      setResult(data);
      toast.success(
        `Generated ${data.outfits.length} outfit${data.outfits.length !== 1 ? "s" : ""}!`
      );
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.detail || "Failed to style item. Please try again.";
      toast.error(msg);
    },
  });

  useEffect(() => {
    if (mutation.isPending) {
      setLoadingMsgIdx(0);
      intervalRef.current = setInterval(() => {
        setLoadingMsgIdx((prev) =>
          prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev
        );
      }, 3000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [mutation.isPending]);

  const handleSubmit = () => {
    if (!image) return;
    setResult(null);
    const payload: StylePieceRequest = {
      image_base64: image,
      model,
      style_id: styleId || undefined,
      occasion: occasion || undefined,
      weather: weather || undefined,
      num_outfits: numOutfits,
    };
    mutation.mutate(payload);
  };

  const handleClear = () => {
    setImage(null);
    setResult(null);
    setShowAdvanced(false);
  };

  const handleSaveOutfit = (outfit: GeneratedOutfit, analyzedItem: AnalyzedItem) => {
    const wardrobeItemIds = outfit.items.filter((id) => id !== "NEW_ITEM");
    onSave({
      name: outfit.name,
      style_id: styleId || "",
      items: wardrobeItemIds,
      occasion: occasion || undefined,
      weather: weather || undefined,
      ai_generated_reasoning: `[Styled with new ${analyzedItem.type}] ${outfit.ai_generated_reasoning}`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Image Upload */}
      <ImageCapture
        onImageCaptured={setImage}
        currentImage={image}
        onClear={handleClear}
        disabled={disabled || mutation.isPending}
        compact
      />

      {/* Controls — shown after image captured */}
      <AnimatePresence>
        {image && !result && !mutation.isPending && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {/* Quick-select chips: Occasion */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Occasion</Label>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none -mx-1 px-1">
                {OCCASION_PRESETS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setOccasion(occasion === o.id ? "" : o.id)}
                    className={`cursor-pointer flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      occasion === o.id
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted active:scale-95"
                    }`}
                  >
                    {o.icon} {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick-select chips: Weather */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Weather</Label>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none -mx-1 px-1">
                {WEATHER_PRESETS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWeather(weather === w.id ? "" : w.id)}
                    className={`cursor-pointer flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      weather === w.id
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted active:scale-95"
                    }`}
                  >
                    {w.icon} {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced options — collapsed on mobile */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="cursor-pointer flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Bot className="w-3 h-3" />
                  <span>More options</span>
                  <ChevronDown className="w-3 h-3 transition-transform [[data-state=open]>&]:rotate-180" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pt-2 grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      Style
                    </Label>
                    <Select
                      value={styleId || "none"}
                      onValueChange={(v) => setStyleId(v === "none" ? "" : v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Any style</SelectItem>
                        {styles.map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      Outfits
                    </Label>
                    <Select
                      value={String(numOutfits)}
                      onValueChange={(v) => setNumOutfits(Number(v))}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      Model
                    </Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LLM_MODELS.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Primary CTA — full width, prominent */}
            <Button
              onClick={handleSubmit}
              disabled={disabled}
              className="w-full gap-2 h-11"
              size="lg"
            >
              <Wand2 className="w-4 h-4" />
              Style This Piece
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      <AnimatePresence>
        {mutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border bg-muted/20 p-8 text-center space-y-4"
          >
            <div className="relative w-12 h-12 mx-auto">
              <Loader2 className="w-12 h-12 animate-spin text-primary/30" />
              <Wand2 className="w-5 h-5 absolute inset-0 m-auto text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {LOADING_MESSAGES[loadingMsgIdx]}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This usually takes 15-30 seconds
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Analyzed Item Summary */}
            <AnalyzedItemCard item={result.analyzed_item} imageUrl={image} />

            {/* Generated Outfits */}
            <div className="space-y-3">
              {result.outfits.map((outfit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <OutfitResultCard
                    outfit={outfit}
                    analyzedItem={result.analyzed_item}
                    wardrobe={wardrobe}
                    onSave={() => handleSaveOutfit(outfit, result.analyzed_item)}
                  />
                </motion.div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={handleClear}
              className="w-full gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Style Another Item
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Analyzed Item Card ─────────────────────────────────────────────

function AnalyzedItemCard({
  item,
  imageUrl,
}: {
  item: AnalyzedItem;
  imageUrl: string | null;
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-start gap-3 p-3 sm:p-4">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Analyzed item"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-semibold capitalize text-sm sm:text-base">
              {item.type}
            </h4>
            <Badge variant="secondary" className="capitalize text-[10px]">
              {item.category}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
          <div className="flex items-center gap-2 flex-wrap text-[11px] sm:text-xs text-muted-foreground">
            {item.color_code && (
              <span className="flex items-center gap-1 font-medium text-foreground">
                <span
                  className="w-2.5 h-2.5 rounded-full border inline-block"
                  style={{ backgroundColor: item.color_code }}
                />
                {item.color}
              </span>
            )}
            {item.material && <span className="capitalize">{item.material}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Outfit Result Card ─────────────────────────────────────────────

function OutfitResultCard({
  outfit,
  analyzedItem,
  wardrobe,
  onSave,
}: {
  outfit: GeneratedOutfit;
  analyzedItem: AnalyzedItem;
  wardrobe: ClothingItem[];
  onSave: () => void;
}) {
  const wardrobeMap = new Map(wardrobe.map((item) => [item._id, item]));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="truncate">{outfit.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2 px-3 sm:px-6">
        {/* Item chips — horizontally scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
          {outfit.items.map((itemId, idx) => {
            if (itemId === "NEW_ITEM") {
              return (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 border-primary/30 bg-primary/5 text-xs whitespace-nowrap flex-shrink-0"
                >
                  <Shirt className="w-4 h-4 text-primary" />
                  <span className="capitalize font-medium">
                    {analyzedItem.color} {analyzedItem.type}
                  </span>
                  <Badge variant="default" className="text-[9px] px-1.5 py-0 h-4">
                    New
                  </Badge>
                </div>
              );
            }
            const item = wardrobeMap.get(itemId);
            if (!item) return null;
            return <WardrobeItemChip key={idx} item={item} />;
          })}
        </div>

        {/* Reasoning */}
        {outfit.ai_generated_reasoning && (
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            {outfit.ai_generated_reasoning}
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-2 px-3 sm:px-6 pb-3 sm:pb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          className="gap-1.5 active:scale-95 transition-transform"
        >
          <Save className="w-3.5 h-3.5" />
          Save Outfit
        </Button>
      </CardFooter>
    </Card>
  );
}

function WardrobeItemChip({ item }: { item: ClothingItem }) {
  const { data: colors } = useColors();
  const getEffectiveIconId = useEffectiveIconId();
  const colorObj = colors?.find((c: any) => c.slug === item.color);
  const hex = item.color_code || colorObj?.hex || "#888";
  const iconId = getEffectiveIconId(item.icon_id, item.category);

  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border bg-card text-xs whitespace-nowrap flex-shrink-0">
      <div className="w-5 h-5 flex-shrink-0">
        <ClothingIcon iconId={iconId || ""} colorHex={hex} />
      </div>
      <span className="capitalize font-medium">
        {item.color} {item.type}
      </span>
    </div>
  );
}
