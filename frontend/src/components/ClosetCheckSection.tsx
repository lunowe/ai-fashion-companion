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
  ChevronDown,
  RotateCcw,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  const [showModelPicker, setShowModelPicker] = useState(false);
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
    mutation.mutate({ image_base64: image, model } satisfies ClosetCheckRequest);
  };

  const handleClear = () => {
    setImage(null);
    setResult(null);
    setShowModelPicker(false);
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

      {/* Controls — shown after image captured, hidden when results are in */}
      <AnimatePresence>
        {image && !result && !mutation.isPending && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {/* Model picker — collapsed by default on mobile for simplicity */}
            <Collapsible open={showModelPicker} onOpenChange={setShowModelPicker}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="cursor-pointer flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Bot className="w-3 h-3" />
                  <span>
                    {LLM_MODELS.find((m) => m.id === model)?.name || "Model"}
                  </span>
                  <ChevronDown className="w-3 h-3 transition-transform [[data-state=open]>&]:rotate-180" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pt-2">
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="h-9 text-sm">
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
              </CollapsibleContent>
            </Collapsible>

            {/* Primary CTA — full-width, prominent */}
            <Button
              onClick={handleSubmit}
              disabled={disabled}
              className="w-full gap-2 h-11"
              size="lg"
            >
              <Search className="w-4 h-4" />
              Check Closet Fit
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
              <Search className="w-5 h-5 absolute inset-0 m-auto text-primary" />
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
            <AnalyzedItemCard item={result.analyzed_item} imageUrl={image} />
            <ClosetCheckResults check={result.closet_check} wardrobe={wardrobe} />

            <Button
              variant="outline"
              onClick={handleClear}
              className="w-full gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Check Another Item
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
            {item.fit && <span className="capitalize">{item.fit} fit</span>}
            {item.material && <span className="capitalize">{item.material}</span>}
          </div>
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
  const isBuy = check.recommendation.should_buy;

  return (
    <div className="space-y-3">
      {/* Hero verdict card */}
      <div
        className={`rounded-xl p-4 sm:p-5 ${
          isBuy
            ? "bg-green-500/8 border border-green-500/20"
            : "bg-amber-500/8 border border-amber-500/20"
        }`}
      >
        <div className="flex gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isBuy ? "bg-green-500/15" : "bg-amber-500/15"
            }`}
          >
            {isBuy ? (
              <ThumbsUp className="w-5 h-5 text-green-600" />
            ) : (
              <ThumbsDown className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${isBuy ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
              {isBuy ? "Worth Getting" : "Think Twice"}
            </p>
            <p className="text-sm mt-1 leading-relaxed">{check.verdict}</p>
            {check.recommendation.reasoning && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {check.recommendation.reasoning}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Score bars — side by side */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <ScoreBar
          icon={<Palette className="w-3.5 h-3.5" />}
          label="Compatibility"
          score={check.compatibility_score}
        />
        <ScoreBar
          icon={<Shuffle className="w-3.5 h-3.5" />}
          label="Versatility"
          score={check.versatility_score}
        />
      </div>

      {/* Color Harmony */}
      {check.color_harmony && (
        <div className="rounded-xl border p-3 sm:p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Color Harmony
          </p>
          <p className="text-sm leading-relaxed">{check.color_harmony}</p>
        </div>
      )}

      {/* Fills Gaps & Redundancies — stacked */}
      {check.fills_gaps?.length > 0 && (
        <InsightList
          icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
          title="Fills Gaps in Your Wardrobe"
          items={check.fills_gaps}
          variant="positive"
        />
      )}

      {check.redundancies?.length > 0 && (
        <InsightList
          icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
          title="Similar Items You Already Own"
          items={check.redundancies}
          variant="warning"
        />
      )}

      {/* Suggested Pairings */}
      {check.suggested_pairings?.length > 0 && (
        <div className="rounded-xl border p-3 sm:p-4 space-y-2.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Pairs Well With
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {check.suggested_pairings.map((id) => {
              const item = wardrobeMap.get(id);
              if (!item) return null;
              return <PairingChip key={id} item={item} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reusable sub-components ────────────────────────────────────────

function ScoreBar({
  icon,
  label,
  score,
}: {
  icon: React.ReactNode;
  label: string;
  score: number;
}) {
  const pct = Math.max(0, Math.min(100, score * 10));
  return (
    <div className="rounded-xl border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] sm:text-xs font-medium text-muted-foreground flex items-center gap-1">
          {icon} {label}
        </span>
        <span className="text-sm font-bold tabular-nums">{score}/10</span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}

function InsightList({
  icon,
  title,
  items,
  variant,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  variant: "positive" | "warning";
}) {
  return (
    <div className="rounded-xl border p-3 sm:p-4 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        {icon} {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((text, i) => (
          <li key={i} className="text-sm flex items-start gap-2 leading-relaxed">
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                variant === "positive" ? "bg-green-500" : "bg-amber-500"
              }`}
            />
            {text}
          </li>
        ))}
      </ul>
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
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border bg-card text-xs whitespace-nowrap flex-shrink-0">
      <div className="w-6 h-6 flex-shrink-0">
        <ClothingIcon iconId={iconId || ""} colorHex={hex} />
      </div>
      <span className="capitalize font-medium">{item.color} {item.type}</span>
    </div>
  );
}
