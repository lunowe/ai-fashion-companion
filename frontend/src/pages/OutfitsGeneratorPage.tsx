import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listStyles } from "@/services/styles";
import { listClothing } from "@/services/clothing";
import {
  generateOutfits,
  saveOutfit,
  getGenerationHistory,
  triggerVisualization,
} from "@/services/outfits";
import {
  generateSuitcase,
  saveSuitcase,
  listSuitcases,
  updateSuitcase,
  deleteSuitcase,
} from "@/services/suitcases";
import type {
  OutfitCreate,
  GeneratedOutfit,
  OutfitGenRequest,
  SuitcaseGenRequest,
  SuitcaseGenResponse,
  TravelSuitcaseCreate,
  TravelSuitcaseUpdate,
} from "@/types";
import { FEATURE_LIMITS } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import OutfitGeneratorV2 from "@/components/OutfitGeneratorV2";
import TravelWizard from "@/components/TravelWizard";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Sparkles, Loader2, Luggage, Camera, Lock } from "lucide-react";
import ClosetCheckSection from "@/components/ClosetCheckSection";
import StylePieceSection from "@/components/StylePieceSection";
import { Separator } from "@/components/ui/separator";

type GeneratorMode = "outfit" | "suitcase" | "trypiece";

export default function OutfitGeneratorPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<GeneratorMode>("outfit");

  // Get limit for outfit generation feature
  const outfitLimit = user
    ? FEATURE_LIMITS.outfit_generation[user.role] ?? 5
    : 5;
  const outfitCount = user?.usage_counts?.outfit_generation ?? 0;
  const isLimitReached = !!(
    user &&
    outfitLimit !== Infinity &&
    outfitCount >= outfitLimit
  );

  const qc = useQueryClient();
  const { data: styles } = useQuery({
    queryKey: ["styles-all"],
    queryFn: () => listStyles(false),
  });
  const { data: wardrobe } = useQuery({
    queryKey: ["clothing"],
    queryFn: listClothing,
  });

  const { data: history } = useQuery({
    queryKey: ["generation-history"],
    queryFn: getGenerationHistory,
    refetchOnWindowFocus: false,
  });

  // Item analysis limits (premium-only)
  const analysisLimit = user
    ? FEATURE_LIMITS.item_analysis[user.role] ?? 0
    : 0;
  const analysisCount = user?.usage_counts?.item_analysis ?? 0;
  const isAnalysisLimitReached = !!(
    user &&
    analysisLimit !== Infinity &&
    analysisCount >= analysisLimit
  );

  // Check if user has pro access for suitcase feature
  const isPro = user?.role === "premium" || user?.role === "byok";

  // Only fetch saved suitcases if user is pro
  const { data: savedSuitcases } = useQuery({
    queryKey: ["saved-suitcases"],
    queryFn: listSuitcases,
    enabled: isPro,
    refetchOnWindowFocus: false,
  });

  const [saveOpen, setSaveOpen] = useState(false);
  const [toSave, setToSave] = useState<OutfitCreate | null>(null);

  const [visualizing, setVisualizing] = useState(false);
  const [visualizationUrl, setVisualizationUrl] = useState<string | null>(null);

  const genMut = useMutation({
    mutationFn: generateOutfits,
    onSuccess: () => {
      // When a new generation is successful, refresh the history list
      qc.invalidateQueries({ queryKey: ["generation-history"] });
    },
    onError: () => toast.error("Failed to generate outfits"),
  });

  const suitcaseMut = useMutation({
    mutationFn: generateSuitcase,
    onError: () => toast.error("Failed to generate travel suitcase"),
  });

  const handleGenerateSuitcase = async (
    formData: SuitcaseGenRequest
  ): Promise<SuitcaseGenResponse> => {
    return await suitcaseMut.mutateAsync(formData);
  };

  const saveSuitcaseMut = useMutation({
    mutationFn: saveSuitcase,
    onSuccess: () => {
      toast.success("Suitcase saved!");
      qc.invalidateQueries({ queryKey: ["saved-suitcases"] });
    },
    onError: () => toast.error("Failed to save suitcase"),
  });

  const handleSaveSuitcase = async (suitcaseData: TravelSuitcaseCreate) => {
    return await saveSuitcaseMut.mutateAsync(suitcaseData);
  };

  const updateSuitcaseMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TravelSuitcaseUpdate }) =>
      updateSuitcase(id, data),
    onSuccess: () => {
      toast.success("Suitcase updated!");
      qc.invalidateQueries({ queryKey: ["saved-suitcases"] });
    },
    onError: () => toast.error("Failed to update suitcase"),
  });

  const handleUpdateSuitcase = async (
    id: string,
    data: TravelSuitcaseUpdate
  ) => {
    await updateSuitcaseMut.mutateAsync({ id, data });
  };

  const deleteSuitcaseMut = useMutation({
    mutationFn: deleteSuitcase,
    onSuccess: () => {
      toast.success("Suitcase deleted");
      qc.invalidateQueries({ queryKey: ["saved-suitcases"] });
    },
    onError: () => toast.error("Failed to delete suitcase"),
  });

  const handleDeleteSuitcase = async (id: string) => {
    await deleteSuitcaseMut.mutateAsync(id);
  };

  const saveMut = useMutation({
    mutationFn: async (
      p: OutfitCreate & { generateVisualization?: boolean }
    ) => {
      const saved = await saveOutfit(p);

      // Fire and forget - trigger visualization in background
      if (p.generateVisualization && saved._id) {
        triggerVisualization(saved._id).catch(console.error);
      }
      return saved;
    },
    onSuccess: () => {
      toast.success("Outfit saved!");
      qc.invalidateQueries({ queryKey: ["outfits"] });
      setSaveOpen(false);
      setToSave(null);
    },
    onError: () => toast.error("Failed to save outfit"),
  });

  const handleGenerate = async (
    formData: OutfitGenRequest
  ): Promise<GeneratedOutfit[]> => {
    // Build the request from formData
    const request: OutfitGenRequest = {
      style_id: formData.style_id,
      occasion: formData.occasion,
      weather: formData.weather,
      description: formData.description,
      required_items: formData.required_items,
      num_outfits: formData.num_outfits,
    };

    return await genMut.mutateAsync(request);
  };

  const handleSave = (outfit: OutfitCreate) => {
    setToSave(outfit);
    setSaveOpen(true);
  };

  return (
    <>
      {/* Mode Toggle */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setMode("outfit")}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === "outfit"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Create Outfit
          </button>
          <button
            type="button"
            onClick={() => setMode("suitcase")}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === "suitcase"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Luggage className="w-4 h-4" />
            Pack for Trip
          </button>
          <button
            type="button"
            onClick={() => setMode("trypiece")}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === "trypiece"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Camera className="w-4 h-4" />
            Try a Piece
            {!isPro && <Lock className="w-3 h-3 ml-0.5 opacity-60" />}
          </button>
        </div>
      </div>

      {isLimitReached && (
        <div
          className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-4 mx-4 rounded shadow-sm"
          role="alert"
        >
          <p className="font-bold">Daily Limit Reached</p>
          <p>
            You have used all {outfitLimit} outfit generations for today.
            <Link
              to="/settings"
              className="underline ml-1 font-semibold hover:text-amber-900"
            >
              Upgrade your plan
            </Link>{" "}
            or wait until tomorrow.
          </p>
        </div>
      )}

      {mode === "outfit" ? (
        <OutfitGeneratorV2
          styles={styles || []}
          wardrobe={wardrobe || []}
          onGenerate={handleGenerate}
          onSave={handleSave}
          disabled={isLimitReached}
          history={history || []}
        />
      ) : mode === "suitcase" ? (
        <TravelWizard
          wardrobe={wardrobe || []}
          styles={styles || []}
          savedSuitcases={savedSuitcases || []}
          isPro={isPro}
          onGenerate={handleGenerateSuitcase}
          onSaveSuitcase={handleSaveSuitcase}
          onUpdateSuitcase={handleUpdateSuitcase}
          onSaveOutfit={handleSave}
          onDeleteSuitcase={handleDeleteSuitcase}
          disabled={isLimitReached}
        />
      ) : (
        /* Try a Piece mode */
        <div className="px-4 pb-4">
          {!isPro ? (
            /* Premium gate for free users */
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 p-8 text-center space-y-3">
              <Lock className="w-10 h-10 mx-auto text-muted-foreground/40" />
              <h3 className="font-semibold text-lg">Premium Feature</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Upload a photo of any clothing item to check if it fits your
                wardrobe or get styling suggestions with your existing pieces.
              </p>
              <Link to="/upgrade">
                <Button className="mt-2 gap-2">
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Premium
                </Button>
              </Link>
            </div>
          ) : isAnalysisLimitReached ? (
            /* Limit reached banner */
            <div
              className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded shadow-sm"
              role="alert"
            >
              <p className="font-bold">Daily Limit Reached</p>
              <p>
                You have used all {analysisLimit} item analyses for today. Come
                back tomorrow or{" "}
                <Link
                  to="/settings"
                  className="underline font-semibold hover:text-amber-900"
                >
                  upgrade your plan
                </Link>
                .
              </p>
            </div>
          ) : (
            /* Two feature sections */
            <div className="space-y-8">
              {/* Section 1: Closet Check */}
              <section className="space-y-3">
                <div>
                  <h3 className="font-semibold text-base">
                    Would this fit my closet?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a photo to see how a piece complements your wardrobe
                  </p>
                </div>
                <ClosetCheckSection
                  wardrobe={wardrobe || []}
                  disabled={isAnalysisLimitReached}
                />
              </section>

              <Separator />

              {/* Section 2: Style This Piece */}
              <section className="space-y-3">
                <div>
                  <h3 className="font-semibold text-base">
                    Style this piece with my closet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a photo to get outfit ideas combining it with what you
                    own
                  </p>
                </div>
                <StylePieceSection
                  wardrobe={wardrobe || []}
                  styles={styles || []}
                  disabled={isAnalysisLimitReached}
                  onSave={handleSave}
                />
              </section>
            </div>
          )}
        </div>
      )}

      {/* Save Dialog */}
      <Dialog
        open={saveOpen}
        onOpenChange={(open) => {
          setSaveOpen(open);
          if (!open) setVisualizationUrl(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Save Outfit</DialogTitle>
          </DialogHeader>
          {visualizationUrl && (
            <div className="rounded-lg overflow-hidden border mb-4">
              <img
                src={visualizationUrl}
                alt="Outfit visualization"
                className="w-full"
              />
            </div>
          )}
          <SaveOutfitForm
            outfit={toSave}
            onCancel={() => setSaveOpen(false)}
            isLoading={saveMut.isPending || visualizing}
            visualizing={visualizing}
            onSave={(name, notes, generateViz) => {
              if (!toSave) return;
              const ids = toSave.items.map((it) =>
                typeof it === "string" ? it : (it as any)._id
              );
              saveMut.mutate({
                name,
                notes,
                style_id: toSave.style_id || "",
                items: ids,
                ai_generated_reasoning: toSave.ai_generated_reasoning,
                occasion: toSave.occasion,
                weather: toSave.weather,
                generateVisualization: generateViz,
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function SaveOutfitForm({
  outfit,
  onCancel,
  onSave,
  isLoading,
  visualizing,
}: {
  outfit: OutfitCreate | null;
  onCancel: () => void;
  onSave: (
    name?: string,
    notes?: string,
    generateVisualization?: boolean
  ) => void;
  isLoading?: boolean;
  visualizing?: boolean;
}) {
  const { register, handleSubmit } = useForm<{ name?: string; notes?: string }>(
    {
      defaultValues: { name: outfit?.name, notes: "" },
    }
  );
  const [generateViz, setGenerateViz] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((v) => onSave(v.name, v.notes, generateViz))}
    >
      <div>
        <Label>Name</Label>
        <Input {...register("name")} placeholder="e.g. Casual Friday" />
      </div>
      <div>
        <Label>Notes</Label>
        <Input {...register("notes")} placeholder="Optional notes" />
      </div>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
        <input
          type="checkbox"
          id="generate-viz"
          checked={generateViz}
          onChange={(e) => setGenerateViz(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="generate-viz" className="cursor-pointer flex-1">
          <span className="font-medium">Generate visualization</span>
          <span className="block text-xs text-muted-foreground">
            Create an Apple Emoji-style mockup of this outfit
          </span>
        </Label>
        <Sparkles className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {visualizing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : isLoading ? (
            "Saving..."
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </form>
  );
}
