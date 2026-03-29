import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Palette,
  Shuffle,
  Bot,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import type {
  ClothingItem,
  ClosetCheckRequest,
  ClosetCheckResponse,
  AnalyzedItem,
  ClosetCheckResult,
} from "@/types";
import { LLM_MODELS } from "@/types";
import { checkClosetFit } from "@/services/itemAnalysis";
import ImageCapture from "@/components/ImageCapture";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useColors, useEffectiveIconId } from "@/hooks/useCatalogData";
import { ClothingIcon } from "@/lib/icons";

const LOADING_MESSAGES = [
  "Analyzing the clothing item...",
  "Identifying colors and materials...",
  "Scanning your wardrobe...",
  "Checking color harmony...",
  "Evaluating versatility...",
  "Finding potential pairings...",
  "Assessing wardrobe gaps...",
  "Preparing your report...",
];

interface ClosetCheckSectionProps {
  wardrobe: ClothingItem[];
  disabled: boolean;
}

export default function ClosetCheckSection({
  wardrobe,
  disabled,
}: ClosetCheckSectionProps) {
  const [image, setImage] = useState<string | null>(null);
  const [model, setModel] = useState(LLM_MODELS[0].id);
  const [result, setResult] = useState<ClosetCheckResponse | null>(null);

  // Loading message rotation
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const mutation = useMutation({
    mutationFn: checkClosetFit,
    onSuccess: (data) => {
      setResult(data);
      toast.success("Analysis complete!");
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.detail || "Failed to analyze item. Please try again.";
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
    const payload: ClosetCheckRequest = {
      image_base64: image,
      model,
    };
    mutation.mutate(payload);
  };

  const handleClear = () => {
    setImage(null);
    setResult(null);
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
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
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
          <Button
            onClick={handleSubmit}
            disabled={disabled || mutation.isPending}
            className="gap-2"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Check Closet Fit
              </>
            )}
          </Button>
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
          <AnalyzedItemCard item={result.analyzed_item} imageUrl={image} />
          <ClosetCheckResults
            check={result.closet_check}
            wardrobe={wardrobe}
          />

          {/* Reset button */}
          <Button variant="outline" onClick={handleClear} className="w-full">
            Check Another Item
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
          {item.seasons && item.seasons.length > 0 && (
            <span className="text-muted-foreground">
              {item.seasons.join(", ")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Closet Check Results ───────────────────────────────────────────

function ClosetCheckResults({
  check,
  wardrobe,
}: {
  check: ClosetCheckResult;
  wardrobe: ClothingItem[];
}) {
  const wardrobeMap = new Map(wardrobe.map((item) => [item._id, item]));

  return (
    <div className="space-y-4">
      {/* Verdict + Buy Recommendation */}
      <div
        className={`rounded-lg border p-4 ${
          check.recommendation.should_buy
            ? "bg-green-500/5 border-green-500/20"
            : "bg-amber-500/5 border-amber-500/20"
        }`}
      >
        <div className="flex items-start gap-3">
          {check.recommendation.should_buy ? (
            <ThumbsUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <ThumbsDown className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="font-semibold text-sm">
              {check.recommendation.should_buy ? "Recommended" : "Think Twice"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{check.verdict}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {check.recommendation.reasoning}
            </p>
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Palette className="w-3 h-3" /> Compatibility
            </span>
            <span className="text-sm font-bold">{check.compatibility_score}/10</span>
          </div>
          <Progress value={check.compatibility_score * 10} className="h-2" />
        </div>
        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Shuffle className="w-3 h-3" /> Versatility
            </span>
            <span className="text-sm font-bold">{check.versatility_score}/10</span>
          </div>
          <Progress value={check.versatility_score * 10} className="h-2" />
        </div>
      </div>

      {/* Color Harmony */}
      {check.color_harmony && (
        <div className="rounded-lg border p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
            <Palette className="w-3 h-3" /> Color Harmony
          </p>
          <p className="text-sm">{check.color_harmony}</p>
        </div>
      )}

      {/* Fills Gaps */}
      {check.fills_gaps && check.fills_gaps.length > 0 && (
        <div className="rounded-lg border p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" /> Fills Gaps
          </p>
          <ul className="space-y-1">
            {check.fills_gaps.map((gap, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Redundancies */}
      {check.redundancies && check.redundancies.length > 0 && (
        <div className="rounded-lg border p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-500" /> Redundancies
          </p>
          <ul className="space-y-1">
            {check.redundancies.map((item, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Pairings */}
      {check.suggested_pairings && check.suggested_pairings.length > 0 && (
        <div className="rounded-lg border p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Pairs Well With
          </p>
          <div className="flex flex-wrap gap-2">
            {check.suggested_pairings.map((id) => {
              const item = wardrobeMap.get(id);
              if (!item) return null;
              return (
                <PairingChip key={id} item={item} />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PairingChip({ item }: { item: ClothingItem }) {
  const { data: colors } = useColors();
  const getEffectiveIconId = useEffectiveIconId();
  const colorObj = colors?.find((c: any) => c.slug === item.color);
  const hex = item.color_code || colorObj?.hex || "#888";
  const iconId = getEffectiveIconId(item.icon_id, item.category);

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-md border bg-card text-xs">
      <div className="w-6 h-6 flex-shrink-0">
        <ClothingIcon iconId={iconId || ""} colorHex={hex} />
      </div>
      <span className="capitalize">{item.color} {item.type}</span>
    </div>
  );
}
