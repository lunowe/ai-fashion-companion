import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listStyles } from "@/services/styles";
import { listClothing } from "@/services/clothing";
import {
  generateOutfits,
  saveOutfit,
  getGenerationHistory,
  triggerVisualization,
} from "@/services/outfits";
import type { OutfitCreate, GeneratedOutfit, OutfitGenRequest } from "@/types";
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
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Sparkles, Loader2 } from "lucide-react";

export default function OutfitGeneratorPage() {
  const { user } = useAuth();
  const LIMITS: Record<string, number> = {
    free: 5,
    premium: 50,
    byok: Infinity,
  };
  const limit = user ? LIMITS[user.role] || 5 : 5;
  const isLimitReached = !!(
    user &&
    limit !== Infinity &&
    user.generation_count >= limit
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
      {isLimitReached && (
        <div
          className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-4 rounded shadow-sm"
          role="alert"
        >
          <p className="font-bold">Daily Limit Reached</p>
          <p>
            You have used all {limit} generations for today.
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

      <OutfitGeneratorV2
        styles={styles || []}
        wardrobe={wardrobe || []}
        onGenerate={handleGenerate}
        onSave={handleSave}
        disabled={isLimitReached}
        history={history || []}
      />
      {/* <OutfitGeneratorV3
                styles={styles || []}
                wardrobe={wardrobe || []}
                onGenerate={handleGenerate}
                onSave={handleSave}
            /> */}

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
