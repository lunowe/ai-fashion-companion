import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listOutfits, deleteOutfit } from "@/services/outfits";
import { listClothing } from "@/services/clothing";
import { listStyles } from "@/services/styles";
import type { Outfit, ClothingItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";

type OutfitForm = Omit<Outfit, "_id">;

export default function OutfitsListPage() {
    const qc = useQueryClient();
    const [open, setOpen] = useState(false);
    const [viewOutfit, setViewOutfit] = useState<OutfitForm | null>(null);
    const { data, isLoading } = useQuery({ queryKey: ["outfits"], queryFn: listOutfits });
    // Load all clothing once; we'll resolve outfit.items (ids) against this list
    const { data: clothing, isLoading: isClothingLoading } = useQuery({
        queryKey: ["clothing"],
        queryFn: listClothing,
    });
    // Load styles to resolve style_id -> style.name
    const { data: styles } = useQuery({ queryKey: ["styles"], queryFn: () => listStyles(false) });
    const delMut = useMutation({
        mutationFn: deleteOutfit,
        onSuccess: () => {
            toast("Outfit gelöscht");
            qc.invalidateQueries({ queryKey: ["outfits"] });
        },
        onError: () => toast("Fehler"),
    });

    const { reset } = useForm<OutfitForm>({
        defaultValues: { name: "", style_id: "", items: [] },
    });

    function onOpenView(item: OutfitForm) {
        reset({ ...item });
        setViewOutfit(item);
        setOpen(true);
    }

    // Resolve selected clothing for the currently viewed outfit
    const selectedClothing: ClothingItem[] = (viewOutfit?.items ?? []).length
        ? (clothing ?? []).filter((c) => (viewOutfit?.items ?? []).includes(c._id))
        : [];

    // Helper to get style name by id
    const styleNameById = (id?: string) => (styles ?? []).find((s) => s._id === id)?.name ?? id ?? "-";

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gespeicherte Outfits</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-sm text-muted-foreground">Lade…</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Style</TableHead>
                                <TableHead>Items (#)</TableHead>
                                <TableHead className="w-[1%] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(data ?? []).map((o: Outfit) => (
                                <TableRow key={o._id}>
                                    <TableCell>{o.name ?? "-"}</TableCell>
                                    <TableCell>{styleNameById(o.style_id)}</TableCell>
                                    <TableCell>{o.items?.length ?? 0}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            className="mr-2 cursor-pointer"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                onOpenView(o);
                                            }}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            className="cursor-pointer"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => delMut.mutate(o._id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <div className="space-y-3">
                            <div>
                                <strong>Name:</strong> {viewOutfit?.name ?? "-"}
                            </div>
                            <div>
                                <strong>Occasion:</strong> {viewOutfit?.occasion ?? "-"}
                            </div>
                            <div>
                                <strong>Weather:</strong> {viewOutfit?.weather ?? "-"}
                            </div>
                            <div>
                                <strong>Reasoning:</strong> {viewOutfit?.ai_generated_reasoning ?? "-"}
                            </div>
                            <div>
                                <strong>Style:</strong> {styleNameById(viewOutfit?.style_id)}
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Clothing items resolved from IDs */}
                    <div className="mt-4">
                        <div className="mb-2 font-medium">Clothing Items</div>
                        {isClothingLoading ? (
                            <div className="text-sm text-muted-foreground">Loading clothing items…</div>
                        ) : selectedClothing.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No clothing items found</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Color</TableHead>
                                        <TableHead>Fit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedClothing.map((item) => (
                                        <TableRow key={item._id}>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>{item.type}</TableCell>
                                            <TableCell>{item.color ?? "-"}</TableCell>
                                            <TableCell>{item.fit ?? "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            className="cursor-pointer"
                            variant="outline"
                            type="button"
                            onClick={() => setOpen(false)}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
