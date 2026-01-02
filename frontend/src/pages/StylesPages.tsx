// StylesPage.tsx
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Plus,
  Search,
  Sparkles,
  Trash2,
  Palette,
  ImageIcon,
  Loader2,
  Lock,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import {
  listStyles,
  createStyle,
  deleteStyle,
  updateStyle,
} from "@/services/styles";
import type { Style } from "@/types";
import { api } from "@/lib/api";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ------------------------------------------------------------------
// Sub-Component: Style Visual Preview
// ------------------------------------------------------------------
const StyleVisualPreview = ({ style }: { style: Style }) => {
  const images = (style as any).reference_images || [];
  const hasImages = images.length > 0;
  const isSystem = !style.user_id;

  if (hasImages) {
    const displayImages = images.slice(0, 3);
    return (
      <div className="w-full h-full bg-muted/10 grid grid-cols-2 gap-0.5 relative overflow-hidden">
        {displayImages.map((src: string, i: number) => (
          <div
            key={i}
            className={`relative overflow-hidden ${
              i === 0 && displayImages.length === 3
                ? "row-span-2 h-full"
                : "h-full"
            }`}
          >
            <img
              src={
                src.startsWith("http") || src.startsWith("data:")
                  ? src
                  : `${api.getUri()}${src}`
              }
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              alt="Style reference"
              loading="lazy"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${
        isSystem
          ? "from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
          : "from-primary/5 via-primary/10 to-background"
      }`}
    >
      {isSystem ? (
        <Sparkles className="w-8 h-8 text-muted-foreground/30" />
      ) : (
        <Palette className="w-8 h-8 text-primary/30" />
      )}
    </div>
  );
};

// ------------------------------------------------------------------
// Sub-Component: Style Card
// ------------------------------------------------------------------
const StyleCard = ({
  style,
  onClick,
}: {
  style: Style;
  onClick: (s: Style) => void;
}) => {
  const isCustom = !!style.user_id;

  return (
    <Card
      onClick={() => onClick(style)}
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer flex flex-col h-full border-muted hover:border-primary/20"
    >
      <div className="aspect-[2/1] w-full overflow-hidden relative border-b border-border/40">
        <StyleVisualPreview style={style} />
        <div className="absolute top-2 right-2">
          {!isCustom && (
            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-sm shadow-sm text-[10px] px-2 h-5 hover:bg-background"
            >
              <Sparkles className="w-3 h-3 mr-1 text-purple-500" /> System
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4 flex flex-col flex-1 gap-1">
        <h3 className="font-semibold text-lg leading-tight truncate group-hover:text-primary transition-colors">
          {style.name}
        </h3>
        {style.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {style.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// ------------------------------------------------------------------
// Main Page Component
// ------------------------------------------------------------------

type StyleForm = Omit<Style, "_id" | "user_id">;

export default function StylesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Style | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "custom" | "system">(
    "all"
  );

  const { data: styles, isLoading } = useQuery({
    queryKey: ["styles"],
    queryFn: () => listStyles(false),
  });

  const { register, handleSubmit, reset, setValue, watch } = useForm<StyleForm>(
    {
      defaultValues: {
        name: "",
        description: "",
        is_custom: true,
        style_prompt: "",
        reference_images: [],
      },
    }
  );

  // Mutations
  const createMut = useMutation({
    mutationFn: (p: StyleForm) => createStyle(p),
    onSuccess: () => {
      toast.success("Style created successfully");
      qc.invalidateQueries({ queryKey: ["styles"] });
      setOpen(false);
      reset();
    },
    onError: (e) =>
      toast.error(`Error: ${e instanceof Error ? e.message : "Unknown error"}`),
  });

  const updateMut = useMutation({
    mutationFn: (p: Partial<Style>) => updateStyle(editing!._id, p),
    onSuccess: () => {
      toast.success("Style updated");
      qc.invalidateQueries({ queryKey: ["styles"] });
      setEditing(null);
      setOpen(false);
    },
    onError: (e) =>
      toast.error(`Error: ${e instanceof Error ? e.message : "Unknown error"}`),
  });

  const delMut = useMutation({
    mutationFn: deleteStyle,
    onSuccess: () => {
      toast.success("Style deleted");
      qc.invalidateQueries({ queryKey: ["styles"] });
      setOpen(false);
    },
    onError: (e) =>
      toast.error(`Error: ${e instanceof Error ? e.message : "Unknown error"}`),
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
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files ?? []);
    const readAsDataUrl = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

    const newUrls = await Promise.all(files.map(readAsDataUrl));
    const currentUrls = (watch("reference_images") as string[]) || [];
    setValue("reference_images", [...currentUrls, ...newUrls], {
      shouldValidate: true,
    });
  };

  const removeImage = (index: number) => {
    const currentUrls = (watch("reference_images") as string[]) || [];
    const newUrls = currentUrls.filter((_, i) => i !== index);
    setValue("reference_images", newUrls, { shouldValidate: true });
  };

  const filteredStyles = useMemo(() => {
    if (!styles) return [];
    let result = styles;
    if (filterType === "custom") result = result.filter((s) => !!s.user_id);
    if (filterType === "system") result = result.filter((s) => !s.user_id);
    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(lowerQ) ||
          (s.description && s.description.toLowerCase().includes(lowerQ))
      );
    }
    return result;
  }, [styles, filterType, searchQuery]);

  const watchedImages = (watch("reference_images") as string[]) || [];
  const isEditingSystem = editing && !editing.user_id;

  if (isLoading) {
    return (
      <div className="space-y-6 px-2">
        <Skeleton className="h-10 w-full md:w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 h-full px-2">
      {/* --- Header & Controls --- */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Style Library</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Aesthetics and presets for your outfits.
            </p>
          </div>
          <Button onClick={onOpenNew} className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> New Style
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Styles" },
              { id: "custom", label: "My Styles" },
              { id: "system", label: "System Presets" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all border ${
                  filterType === tab.id
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-transparent hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find a style..."
              className="w-full py-2 pl-10 pr-4 text-sm border rounded-lg border-border bg-muted/70 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* --- Grid Content --- */}
      {filteredStyles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-muted rounded-xl bg-muted/5">
          <div className="p-4 bg-muted/50 rounded-full mb-3">
            <Palette className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold">No styles found</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
            Try adjusting your search or filters.
          </p>
          {filterType !== "all" && (
            <Button
              variant="link"
              onClick={() => setFilterType("all")}
              className="mt-2"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
          {filteredStyles.map((style) => (
            <StyleCard key={style._id} style={style} onClick={onOpenEdit} />
          ))}
        </div>
      )}

      {/* --- Refined Dialog Form --- */}
      <Dialog open={open} onOpenChange={setOpen}>
        {/* Changed padding to p-0 to allow header/footer to be full width */}
        <DialogContent className="max-w-2xl max-h-[85vh] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          <form
            onSubmit={handleSubmit((values) => {
              if (isEditingSystem) return;
              const payload: StyleForm = {
                name: (values.name ?? "").trim(),
                description: (values.description ?? "").trim(),
                is_custom: true,
                style_prompt: (values.style_prompt ?? "").trim(),
                reference_images: values.reference_images ?? [],
              };
              if (editing) updateMut.mutate(payload);
              else createMut.mutate(payload);
            })}
            className="flex flex-col h-full"
          >
            {/* 1. Header (Fixed) */}
            <DialogHeader className="px-6 py-5 border-b bg-background z-10">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl">
                  {editing
                    ? isEditingSystem
                      ? "System Style Details"
                      : "Edit Style"
                    : "Create New Style"}
                </DialogTitle>
                {isEditingSystem && (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="w-3 h-3" /> Read Only
                  </Badge>
                )}
              </div>
              <DialogDescription className="mt-1.5">
                {isEditingSystem
                  ? "This preset is provided by the system and cannot be modified."
                  : "Configure the visual aesthetics and AI instructions."}
              </DialogDescription>
            </DialogHeader>

            {/* 2. Scrollable Body (Flex-1) */}
            <div className="flex-1 overflow-y-auto">
              <fieldset
                disabled={!!isEditingSystem}
                className="group-disabled:opacity-100 h-full flex flex-col"
              >
                <Tabs
                  defaultValue="basics"
                  className="w-full h-full flex flex-col"
                >
                  <div className="px-6 py-2 border-b bg-muted/5 sticky top-0 z-10 backdrop-blur-sm">
                    <TabsList className="grid w-full grid-cols-2 h-9">
                      <TabsTrigger value="basics">
                        Basic Info & Images
                      </TabsTrigger>
                      <TabsTrigger value="advanced">
                        AI Configuration
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-6">
                    {/* TAB: BASICS */}
                    <TabsContent
                      value="basics"
                      className="mt-0 space-y-6 outline-none"
                    >
                      <div className="grid gap-6">
                        <div className="space-y-2">
                          <Label>Style Name</Label>
                          <Input
                            {...register("name", { required: true })}
                            placeholder="e.g. Minimalist Streetwear"
                            className="bg-transparent"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            {...register("description", { required: true })}
                            placeholder="Briefly describe this style..."
                            className="resize-none bg-transparent min-h-[80px]"
                            rows={3}
                          />
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <Label>Reference Images</Label>
                            <span className="text-xs text-muted-foreground">
                              {watchedImages.length} images
                            </span>
                          </div>

                          <div className="bg-muted/10 border rounded-xl p-4">
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                              {watchedImages.map((src, i) => (
                                <div
                                  key={i}
                                  className="relative aspect-square group rounded-lg overflow-hidden border bg-background shadow-sm"
                                >
                                  <img
                                    src={
                                      src.startsWith("data:") ||
                                      src.startsWith("http")
                                        ? src
                                        : `${api.getUri()}${src}`
                                    }
                                    alt={`ref-${i}`}
                                    className="object-cover w-full h-full"
                                  />
                                  {!isEditingSystem && (
                                    <button
                                      type="button"
                                      onClick={() => removeImage(i)}
                                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                                    >
                                      <Trash2 className="w-5 h-5 text-white" />
                                    </button>
                                  )}
                                </div>
                              ))}

                              {!isEditingSystem && (
                                <label className="aspect-square border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 gap-2 group">
                                  <div className="p-2 rounded-full bg-muted group-hover:bg-background transition-colors">
                                    <Upload className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                  </div>
                                  <span className="text-[10px] font-medium text-muted-foreground">
                                    Upload
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageUpload}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* TAB: ADVANCED */}
                    <TabsContent
                      value="advanced"
                      className="mt-0 space-y-6 outline-none"
                    >
                      <div className="rounded-lg border bg-blue-50/50 dark:bg-blue-950/10 p-4">
                        <div className="flex gap-3">
                          <Sparkles className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">
                              System Prompt Override
                            </h4>
                            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                              This hidden prompt is sent to the AI to enforce
                              specific styling rules. Use this to define color
                              palettes, fit preferences, or specific fashion
                              eras.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Prompt Instructions</Label>
                        <Textarea
                          {...register("style_prompt")}
                          placeholder="e.g. Prioritize neutral tones, oversized fits, and matte textures..."
                          className="font-mono text-sm min-h-[250px] bg-muted/5 leading-relaxed"
                        />
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </fieldset>
            </div>

            {/* 3. Footer (Fixed) */}
            <DialogFooter className="px-6 py-4 border-t bg-muted/10 mt-auto">
              <div className="flex w-full items-center justify-between">
                {editing && !isEditingSystem ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => delMut.mutate(editing._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Style
                  </Button>
                ) : (
                  <div /> // Spacer
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  {!isEditingSystem && (
                    <Button
                      type="submit"
                      disabled={createMut.isPending || updateMut.isPending}
                    >
                      {(createMut.isPending || updateMut.isPending) && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {editing ? "Save Changes" : "Create Style"}
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
