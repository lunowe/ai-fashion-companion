import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listStyles, createStyle, deleteStyle, updateStyle } from "@/services/styles";
import type { Style } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

type StyleForm = Omit<Style, "_id" | "user_id">;

export default function StylesPage() {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ["styles"],
        queryFn: () => listStyles(false),
    });
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Style | null>(null);
    const { register, handleSubmit, reset, setValue, watch } = useForm<StyleForm>({
        defaultValues: {
            name: "",
            description: "",
            is_custom: true,
            style_prompt: "",
            reference_images: [],
        },
    });

    const createMut = useMutation({
        mutationFn: (p: StyleForm) => createStyle(p),
        onSuccess: () => {
            toast.success("Style angelegt");
            qc.invalidateQueries({ queryKey: ["styles"] });
            setOpen(false);
            reset();
        },
        onError: (e) => toast.error(`Error: ${e instanceof Error ? e.message : "Unknown error"}`),
    });

    const updateMut = useMutation({
        mutationFn: (p: Partial<Style>) => updateStyle(editing!._id, p),
        onSuccess: () => {
            toast.success("Style aktualisiert");
            qc.invalidateQueries({ queryKey: ["styles"] });
            setEditing(null);
            setOpen(false);
        },
        onError: (e) => toast.error(`Error: ${e instanceof Error ? e.message : "Unknown error"}`),
    });

    const delMut = useMutation({
        mutationFn: deleteStyle,
        onSuccess: () => {
            toast.success("Style deleted");
            qc.invalidateQueries({ queryKey: ["styles"] });
        },
        onError: (e) => toast.error(`Error: ${e instanceof Error ? e.message : "Unknown error"}`),
    });

    function onOpenNew() {
        reset({
            name: "",
            description: "",
            is_custom: true,
            style_prompt: "",
            reference_images: [],
        });
        setEditing(null);
        setOpen(true);
    }

    function onOpenEdit(s: Style) {
        reset({
            name: s.name ?? "",
            description: s.description ?? "",
            is_custom: s.is_custom ?? true,
            style_prompt: (s as any).style_prompt ?? "",
            reference_images: (s as any).reference_images ?? [],
        });
        setEditing(s);
        setOpen(true);
        console.log(s);
    }

    return (
        <div className="space-y-4 px-2">
            <div className="flex justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Styles</h2>
                    <p className="text-sm text-muted-foreground">Predefined + own styles</p>
                </div>
                <Button className="cursor-pointer" onClick={onOpenNew}>
                    + Add Own Style
                </Button>
            </div>

            {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {(data ?? []).map((s) => (
                        <Card key={s._id}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {s.name}
                                    {s.user_id ? (
                                        <Badge variant="default">Custom</Badge>
                                    ) : (
                                        <Badge variant="secondary">Predefined</Badge>
                                    )}
                                </CardTitle>
                                {s.description && (
                                    <CardDescription className="line-clamp-5">{s.description}</CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="flex justify-end gap-2">
                                {s.user_id ? (
                                    <>
                                        <Button
                                            className="cursor-pointer"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onOpenEdit(s)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            className="cursor-pointer"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => delMut.mutate(s._id)}
                                        >
                                            Delete
                                        </Button>
                                    </>
                                ) : (
                                    <></>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? "Eigenen Style bearbeiten" : "Eigenen Style anlegen"}</DialogTitle>
                    </DialogHeader>
                    <form
                        className="space-y-3"
                        onSubmit={handleSubmit((values) => {
                            // normalize inputs
                            const payload: StyleForm = {
                                name: (values.name ?? "").trim(),
                                description: (values.description ?? "").trim(),
                                is_custom: true,
                                style_prompt: (values.style_prompt ?? "").trim(),
                                reference_images: (values.reference_images ?? []).map((u: string) => u.trim()),
                            };
                            if (editing) updateMut.mutate(payload);
                            else createMut.mutate(payload);
                        })}
                    >
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <Label>Name*</Label>
                                <Input
                                    {...register("name", {
                                        required: true,
                                    })}
                                />
                            </div>
                            <div>
                                <Label>Description*</Label>
                                <Input
                                    {...register("description", {
                                        required: true,
                                    })}
                                />
                            </div>
                            <div>
                                <Label>Reference Images</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={async (e) => {
                                        const files = Array.from(e.currentTarget.files ?? []);
                                        const readAsDataUrl = (file: File) =>
                                            new Promise<string>((resolve, reject) => {
                                                const reader = new FileReader();
                                                reader.onload = () => resolve(String(reader.result));
                                                reader.onerror = () => reject(reader.error);
                                                reader.readAsDataURL(file);
                                            });
                                        const urls = await Promise.all(files.map(readAsDataUrl));
                                        setValue("reference_images", urls, {
                                            shouldValidate: true,
                                        });
                                    }}
                                />
                                {((watch("reference_images") as string[]) || []).length > 0 && (
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {(watch("reference_images") as string[]).map((src, i) => (
                                            <img
                                                key={i}
                                                src={
                                                    src.startsWith("data:")
                                                        ? src
                                                        : src.startsWith("https://")
                                                        ? src
                                                        : `${api.getUri()}${src}`
                                                }
                                                alt={`ref-${i}`}
                                                className="object-cover w-16 h-16 rounded"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                className="cursor-pointer"
                                variant="outline"
                                type="button"
                                onClick={() => setOpen(false)}
                            >
                                Abbrechen
                            </Button>
                            <Button
                                className="cursor-pointer"
                                type="submit"
                                disabled={createMut.isPending || updateMut.isPending}
                            >
                                {editing ? "Speichern" : "Anlegen"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
