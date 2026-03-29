import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Wand2,
  Loader2,
  Save,
  Bot,
  Shirt,
  Sparkles,
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
  const [result, setResult] = useState<StylePieceResponse | null>(null);

  // Loading message rotation
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const mutation = useMutation({
    mutationFn: stylePiece,
    onSuccess: (data) => {
      setResult(data);
      toast.success(`Generated ${data.outfits.length} outfit${data.outfits.length !== 1 ? "s" : ""}!`);
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
  };

  const handleSaveOutfit = (outfit: GeneratedOutfit, analyzedItem: AnalyzedItem) => {
    // Filter out NEW_ITEM from the items array since it's not in the wardrobe
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
      />

      {/* Controls */}
      {image && !result && (
        <div className="space-y-3">
          {/* Row 1: Style + Model */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Style (optional)</Label>
              <Select value={styleId || "none"} onValueChange={(v) => setStyleId(v === "none" ? "" : v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Any style" />
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
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Bot className="w-3 h-3" /> Model
              </Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="h-9">
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

          {/* Row 2: Occasion chips */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Occasion (optional)</Label>
            <div className="flex flex-wrap gap-1.5">
              {OCCASION_PRESETS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setOccasion(occasion === o.id ? "" : o.id)}
                  className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    occasion === o.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  }`}
                >
                  {o.icon} {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Weather chips */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Weather (optional)</Label>
            <div className="flex flex-wrap gap-1.5">
              {WEATHER_PRESETS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWeather(weather === w.id ? "" : w.id)}
                  className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    weather === w.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  }`}
                >
                  {w.icon} {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: Outfits count + Submit */}
          <div className="flex items-end gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Outfits</Label>
              <Select
                value={String(numOutfits)}
                onValueChange={(v) => setNumOutfits(Number(v))}
              >
                <SelectTrigger className="h-9 w-20">
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
            <Button
              onClick={handleSubmit}
              disabled={disabled || mutation.isPending}
              className="gap-2 flex-1"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Styling...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Style This Piece
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      <AnimatePresence>
        {mutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border bg-muted/30 p-6 text-center space-y-3"
          >
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground font-medium">
              {LOADING_MESSAGES[loadingMsgIdx]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Analyzed Item Summary */}
          <AnalyzedItemCard item={result.analyzed_item} imageUrl={image} />

          {/* Generated Outfits */}
          <div className="space-y-3">
            {result.outfits.map((outfit, idx) => (
              <OutfitResultCard
                key={idx}
                outfit={outfit}
                analyzedItem={result.analyzed_item}
                wardrobe={wardrobe}
                onSave={() => handleSaveOutfit(outfit, result.analyzed_item)}
              />
            ))}
          </div>

          {/* Reset button */}
          <Button variant="outline" onClick={handleClear} className="w-full">
            Style Another Item
          </Button>
        </motion.div>
      )}
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
    <div className="rounded-lg border bg-card p-4 flex gap-4">
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Analyzed item"
          className="w-20 h-20 rounded-md object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold capitalize">{item.type}</h4>
          <Badge variant="secondary" className="capitalize">
            {item.category}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {item.fit}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{item.description}</p>
        <div className="flex items-center gap-3 flex-wrap text-xs">
          {item.color_code && (
            <span className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: item.color_code }}
              />
              {item.color}
            </span>
          )}
          {item.material && (
            <span className="text-muted-foreground capitalize">
              {item.material}
            </span>
          )}
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          {outfit.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        {/* Item chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {outfit.items.map((itemId, idx) => {
            if (itemId === "NEW_ITEM") {
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-2 py-1 rounded-md border-2 border-primary/40 bg-primary/5 text-xs"
                >
                  <Shirt className="w-4 h-4 text-primary" />
                  <span className="capitalize font-medium">
                    {analyzedItem.color} {analyzedItem.type}
                  </span>
                  <Badge
                    variant="default"
                    className="text-[10px] px-1.5 py-0"
                  >
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
          <p className="text-xs text-muted-foreground leading-relaxed">
            {outfit.ai_generated_reasoning}
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" onClick={onSave} className="gap-1.5">
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
    <div className="flex items-center gap-2 px-2 py-1 rounded-md border bg-card text-xs">
      <div className="w-5 h-5 flex-shrink-0">
        <ClothingIcon iconId={iconId || ""} colorHex={hex} />
      </div>
      <span className="capitalize">
        {item.color} {item.type}
      </span>
    </div>
  );
}
