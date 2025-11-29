import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listStyles } from "@/services/styles";
import { listClothing } from "@/services/clothing";
import { generateOutfits, saveOutfit } from "@/services/outfits";
import type { OutfitCreate, GeneratedOutfit, OutfitGenRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import OutfitGeneratorV2 from "@/components/OutfitGeneratorV2";
import OutfitGeneratorV3 from "@/components/OutfitGeneratorV3";

export default function OutfitGeneratorPage() {
    const qc = useQueryClient();
    const { data: styles } = useQuery({
        queryKey: ["styles-all"],
        queryFn: () => listStyles(false),
    });
    const { data: wardrobe } = useQuery({
        queryKey: ["clothing"],
        queryFn: listClothing,
    });

    const [saveOpen, setSaveOpen] = useState(false);
    const [toSave, setToSave] = useState<OutfitCreate | null>(null);

    const genMut = useMutation({
        mutationFn: generateOutfits,
        onError: () => toast.error("Failed to generate outfits"),
    });

    const saveMut = useMutation({
        mutationFn: (p: OutfitCreate) => saveOutfit(p),
        onSuccess: () => {
            toast.success("Outfit saved!");
            qc.invalidateQueries({ queryKey: ["outfits"] });
            setSaveOpen(false);
            setToSave(null);
        },
        onError: () => toast.error("Failed to save outfit"),
    });

    const handleGenerate = async (formData: OutfitGenRequest): Promise<GeneratedOutfit[]> => {
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
            <OutfitGeneratorV2
                styles={styles || []}
                wardrobe={wardrobe || []}
                onGenerate={handleGenerate}
                onSave={handleSave}
            />
            {/* <OutfitGeneratorV3
                styles={styles || []}
                wardrobe={wardrobe || []}
                onGenerate={handleGenerate}
                onSave={handleSave}
            /> */}

            {/* Save Dialog */}
            <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save Outfit</DialogTitle>
                    </DialogHeader>
                    <SaveOutfitForm
                        outfit={toSave}
                        onCancel={() => setSaveOpen(false)}
                        onSave={(name, notes) => {
                            if (!toSave) return;
                            const ids = toSave.items.map((it) => (typeof it === "string" ? it : (it as any)._id));
                            saveMut.mutate({
                                name,
                                notes,
                                style_id: toSave.style_id || "",
                                items: ids,
                                ai_generated_reasoning: toSave.ai_generated_reasoning,
                                occasion: toSave.occasion,
                                weather: toSave.weather,
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
}: {
    outfit: OutfitCreate | null;
    onCancel: () => void;
    onSave: (name?: string, notes?: string) => void;
}) {
    const { register, handleSubmit } = useForm<{ name?: string; notes?: string }>({
        defaultValues: { name: outfit?.name, notes: "" },
    });
    return (
        <form className="space-y-3" onSubmit={handleSubmit((v) => onSave(v.name, v.notes))}>
            <div>
                <Label>Name</Label>
                <Input {...register("name")} placeholder="z. B. Casual Friday" />
            </div>
            <div>
                <Label>Notizen</Label>
                <Input {...register("notes")} placeholder="Optionale Anmerkungen" />
            </div>
            <div className="flex justify-end gap-2">
                <Button className="cursor-pointer" type="button" variant="outline" onClick={onCancel}>
                    Abbrechen
                </Button>
                <Button className="cursor-pointer" type="submit">
                    Speichern
                </Button>
            </div>
        </form>
    );
}
