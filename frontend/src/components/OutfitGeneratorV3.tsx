"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import { Search, Sparkles, ArrowLeft, Check, X } from "lucide-react";

import type { ClothingItem, Style, GeneratedOutfit, OutfitCreate, OutfitGenRequest } from "@/types";

import { resolveItemObjects, normalizeGenerated } from "@/lib/outfit-utils";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const OCCASION_PRESETS = [
    { id: "casual", label: "Casual", icon: "😎" },
    { id: "work", label: "Work", icon: "💼" },
    { id: "date", label: "Date Night", icon: "❤️" },
    { id: "going-out", label: "Going Out", icon: "🎉" },
    { id: "gym", label: "Gym", icon: "🏋️" },
    { id: "home", label: "Home", icon: "🏠" },
];

const WEATHER_PRESETS = [
    { id: "hot", label: "Hot", temp: "25°C+", icon: "🌞" },
    { id: "warm", label: "Warm", temp: "15–25°C", icon: "☀️" },
    { id: "cool", label: "Cool", temp: "10–15°C", icon: "🌤️" },
    { id: "cold", label: "Cold", temp: "<10°C", icon: "❄️" },
    { id: "rainy", label: "Rainy", temp: "", icon: "🌧️" },
];

const LOADING_MESSAGES = [
    "Scanning your pieces…",
    "Balancing colors and proportions…",
    "Adding a little magic…",
    "Finishing touches…",
];

const CATEGORY_EMOJI: Record<string, string> = {
    tops: "👕",
    top: "👕",
    outerwear: "🧥",
    bottoms: "👖",
    bottom: "👖",
    shoes: "👟",
    shoe: "👟",
    accessories: "🧢",
};

const getPieceEmoji = (category?: string | null) => {
    if (!category) return "✨";
    return CATEGORY_EMOJI[category.toLowerCase()] ?? "✨";
};

const getPieceLabel = (item: ClothingItem) => {
    // This is where your abstraction shines:
    // if your data already uses "white oversized t-shirt", this will read nicely.
    const parts = [item.color, item.type].filter(Boolean);
    const label = parts.join(" ");
    return label || "Favorite piece";
};

interface OutfitGeneratorV3Props {
    styles: Style[];
    wardrobe: ClothingItem[];
    onGenerate: (params: OutfitGenRequest) => Promise<GeneratedOutfit[]>;
    onSave: (outfit: OutfitCreate) => void;
}

type Step = 1 | 2 | 3;

export default function OutfitGeneratorV3({ styles, wardrobe, onGenerate, onSave }: OutfitGeneratorV3Props) {
    const [step, setStep] = useState<Step>(1);

    // Form state
    const [freeText, setFreeText] = useState("");
    const [selectedStyle, setSelectedStyle] = useState("");
    const [selectedOccasion, setSelectedOccasion] = useState("");
    const [customOccasion, setCustomOccasion] = useState("");
    const [selectedWeather, setSelectedWeather] = useState("");
    const [customWeather, setCustomWeather] = useState("");
    const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
    const [numOutfits, setNumOutfits] = useState(3);
    const [itemSearch, setItemSearch] = useState("");

    // Results
    const [generatedOutfits, setGeneratedOutfits] = useState<GeneratedOutfit[]>([]);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

    // Rotate loading text only during step 2
    useEffect(() => {
        if (step !== 2) return;
        const id = setInterval(() => {
            setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 1500);
        return () => clearInterval(id);
    }, [step]);

    // Filter wardrobe
    const filteredWardrobe = useMemo(() => {
        if (!itemSearch.trim()) return wardrobe;
        const query = itemSearch.toLowerCase();
        return wardrobe.filter((item) => {
            const label = getPieceLabel(item).toLowerCase();
            const category = item.category?.toLowerCase() ?? "";
            return label.includes(query) || category.includes(query);
        });
    }, [wardrobe, itemSearch]);

    const toggleItem = (item: ClothingItem) => {
        setSelectedItems((prev) => {
            const exists = prev.some((i) => i._id === item._id);
            if (exists) {
                return prev.filter((i) => i._id !== item._id);
            }
            return [...prev, item];
        });
    };

    const getOccasionValue = () => {
        if (customOccasion.trim()) return customOccasion;
        const preset = OCCASION_PRESETS.find((p) => p.id === selectedOccasion);
        return preset ? preset.label : "";
    };

    const getWeatherValue = () => {
        if (customWeather.trim()) return customWeather;
        const preset = WEATHER_PRESETS.find((p) => p.id === selectedWeather);
        return preset ? `${preset.label} ${preset.temp}`.trim() : "";
    };

    const handleGenerate = async () => {
        if (!selectedStyle) return;

        try {
            setStep(2);
            const request: OutfitGenRequest = {
                style_id: selectedStyle,
                occasion: getOccasionValue(),
                weather: getWeatherValue(),
                description: freeText,
                required_items: selectedItems.map((item) => item._id),
                num_outfits: numOutfits,
            };

            const res = await onGenerate(request);
            setGeneratedOutfits(res.map(normalizeGenerated));
            setStep(3);
        } catch (e) {
            // If generation fails, just bounce back to step 1
            setStep(1);
        }
    };

    const handleReset = () => {
        setGeneratedOutfits([]);
        setStep(1);
    };

    const summaryStyle = styles.find((s) => s._id === selectedStyle);

    return (
        <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/50">
            {/* Top bar */}
            <header className="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg sm:text-xl font-semibold">Today&apos;s Outfit</h1>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                        Set the vibe. We&apos;ll do the styling ✨
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Tiny live "ghost" of selected pieces */}
                    {selectedItems.length > 0 && (
                        <div className="flex items-center gap-1 rounded-full bg-card/70 border px-2 py-1">
                            {selectedItems.slice(0, 3).map((item) => (
                                <span key={item._id} className="text-base">
                                    {getPieceEmoji(item.category)}
                                </span>
                            ))}
                            {selectedItems.length > 3 && (
                                <span className="text-[10px] text-muted-foreground">+{selectedItems.length - 3}</span>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Step indicator */}
            <div className="px-4 pb-2">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <span
                        className={`px-2 py-1 rounded-full ${step === 1 ? "bg-primary/10 text-primary" : "bg-muted"}`}
                    >
                        1. Set vibe
                    </span>
                    <span
                        className={`px-2 py-1 rounded-full ${step === 2 ? "bg-primary/10 text-primary" : "bg-muted"}`}
                    >
                        2. Magic
                    </span>
                    <span
                        className={`px-2 py-1 rounded-full ${step === 3 ? "bg-primary/10 text-primary" : "bg-muted"}`}
                    >
                        3. Outfits
                    </span>
                </div>
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto px-4 pb-28">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Intro + free text */}
                            <section className="space-y-3">
                                <Label className="text-xs font-medium">💬 What are you in the mood for?</Label>
                                <Textarea
                                    value={freeText}
                                    onChange={(e) => setFreeText(e.target.value)}
                                    placeholder={`e.g. "Something casual and warm for a coffee date"`}
                                    rows={3}
                                    className="w-full text-sm resize-none"
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    The more you tell me, the more personal the outfits will feel. You can also just use
                                    the filters below.
                                </p>
                            </section>

                            {/* Style chips */}
                            <section className="space-y-2">
                                <Label className="text-xs font-medium">✨ Style *</Label>
                                {styles.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">
                                        No styles yet. Add some in your profile to get tailored looks.
                                    </p>
                                ) : (
                                    <div className="-mx-4 px-4 flex gap-2 overflow-x-auto pb-1">
                                        {styles.map((style) => {
                                            const active = selectedStyle === style._id;
                                            return (
                                                <button
                                                    key={style._id}
                                                    type="button"
                                                    onClick={() => setSelectedStyle(style._id)}
                                                    className={`cursor-pointer flex-shrink-0 rounded-2xl px-3 py-2 text-xs font-medium whitespace-nowrap border ${
                                                        active
                                                            ? "bg-primary/10 border-primary text-primary"
                                                            : "bg-card border-border/60 hover:border-primary/50"
                                                    }`}
                                                >
                                                    {style.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>

                            {/* Occasion chips + custom */}
                            <section className="space-y-2">
                                <Label className="text-xs font-medium">📍 Occasion</Label>
                                <div className="-mx-4 px-4 flex gap-2 overflow-x-auto pb-1">
                                    {OCCASION_PRESETS.map((preset) => {
                                        const active = selectedOccasion === preset.id && !customOccasion;
                                        return (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedOccasion(preset.id);
                                                    setCustomOccasion("");
                                                }}
                                                className={`cursor-pointer flex items-center gap-2 rounded-full px-3 py-2 text-xs whitespace-nowrap border ${
                                                    active
                                                        ? "bg-primary/10 border-primary text-primary"
                                                        : "bg-card border-border/60 hover:border-primary/50"
                                                }`}
                                            >
                                                <span>{preset.icon}</span>
                                                <span>{preset.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <Input
                                    type="text"
                                    value={customOccasion}
                                    onChange={(e) => {
                                        setCustomOccasion(e.target.value);
                                        if (e.target.value) setSelectedOccasion("");
                                    }}
                                    placeholder="Or type a custom occasion (e.g. 'Gallery opening')"
                                    className="text-sm"
                                />
                            </section>

                            {/* Weather chips + custom */}
                            <section className="space-y-2">
                                <Label className="text-xs font-medium">🌤️ Weather</Label>
                                <div className="-mx-4 px-4 flex gap-2 overflow-x-auto pb-1">
                                    {WEATHER_PRESETS.map((preset) => {
                                        const active = selectedWeather === preset.id && !customWeather;
                                        return (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedWeather(preset.id);
                                                    setCustomWeather("");
                                                }}
                                                className={`cursor-pointer flex flex-col items-start gap-1 rounded-2xl px-3 py-2 text-xs whitespace-nowrap border ${
                                                    active
                                                        ? "bg-primary/10 border-primary text-primary"
                                                        : "bg-card border-border/60 hover:border-primary/50"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>{preset.icon}</span>
                                                    <span>{preset.label}</span>
                                                </div>
                                                {preset.temp && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {preset.temp}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <Input
                                    type="text"
                                    value={customWeather}
                                    onChange={(e) => {
                                        setCustomWeather(e.target.value);
                                        if (e.target.value) setSelectedWeather("");
                                    }}
                                    placeholder="Or describe the weather (e.g. 'windy but sunny')"
                                    className="text-sm"
                                />
                            </section>

                            {/* Must include pieces summary + sheet */}
                            <section className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <Label className="text-xs font-medium">👕 Must include pieces</Label>
                                        <p className="text-[11px] text-muted-foreground">
                                            Optional. Perfect if you really want to wear something specific today.
                                        </p>
                                    </div>
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="cursor-pointer text-[11px]"
                                            >
                                                Edit
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="bottom" className="h-[75vh] p-4">
                                            <SheetHeader className="mb-3">
                                                <SheetTitle className="text-sm">Must include pieces</SheetTitle>
                                            </SheetHeader>

                                            <div className="space-y-3">
                                                {/* Search */}
                                                <div className="relative">
                                                    <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                                                    <Input
                                                        type="text"
                                                        value={itemSearch}
                                                        onChange={(e) => setItemSearch(e.target.value)}
                                                        placeholder="Search your wardrobe…"
                                                        className="py-2 pl-9 text-sm"
                                                    />
                                                </div>

                                                {/* Grid */}
                                                <ScrollArea className="h-[55vh] rounded-lg border border-border">
                                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-3">
                                                        {filteredWardrobe.length === 0 ? (
                                                            <div className="col-span-full py-4 text-xs text-center text-muted-foreground">
                                                                {wardrobe.length === 0
                                                                    ? "No pieces in your wardrobe yet."
                                                                    : "No matching pieces."}
                                                            </div>
                                                        ) : (
                                                            filteredWardrobe.map((item) => {
                                                                const isSelected = selectedItems.some(
                                                                    (i) => i._id === item._id
                                                                );
                                                                const label = getPieceLabel(item);
                                                                const emoji = getPieceEmoji(item.category);

                                                                return (
                                                                    <button
                                                                        key={item._id}
                                                                        type="button"
                                                                        onClick={() => toggleItem(item)}
                                                                        className={`cursor-pointer relative flex flex-col items-center justify-center gap-1 rounded-2xl p-3 aspect-square text-[11px] border transition-all ${
                                                                            isSelected
                                                                                ? "bg-primary/10 border-primary"
                                                                                : "bg-card border-border/60 hover:border-primary/60"
                                                                        }`}
                                                                    >
                                                                        {isSelected && (
                                                                            <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />
                                                                        )}
                                                                        <span className="text-3xl">{emoji}</span>
                                                                        <span className="font-medium text-center leading-tight">
                                                                            {label}
                                                                        </span>
                                                                    </button>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        </SheetContent>
                                    </Sheet>
                                </div>

                                {/* Selected tags inline */}
                                <div className="min-h-[32px] flex flex-wrap gap-1">
                                    {selectedItems.length === 0 ? (
                                        <span className="text-[11px] text-muted-foreground">None selected</span>
                                    ) : (
                                        selectedItems.slice(0, 4).map((item) => (
                                            <span
                                                key={item._id}
                                                className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-1 text-[11px]"
                                            >
                                                <span>{getPieceEmoji(item.category)}</span>
                                                <span>{getPieceLabel(item)}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleItem(item)}
                                                    className="cursor-pointer hover:text-primary/70"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))
                                    )}
                                    {selectedItems.length > 4 && (
                                        <span className="text-[11px] text-muted-foreground">
                                            +{selectedItems.length - 4} more
                                        </span>
                                    )}
                                </div>
                            </section>

                            {/* Number of outfits (small stepper) */}
                            <section className="space-y-2">
                                <Label className="text-xs font-medium"># Number of outfits</Label>
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="cursor-pointer"
                                        onClick={() => setNumOutfits((n) => Math.max(1, Math.min(10, n - 1)))}
                                    >
                                        -
                                    </Button>
                                    <span className="w-10 text-center text-sm font-semibold">{numOutfits}</span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="cursor-pointer"
                                        onClick={() => setNumOutfits((n) => Math.max(1, Math.min(10, n + 1)))}
                                    >
                                        +
                                    </Button>
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center justify-center py-16 gap-6"
                        >
                            <div className="relative">
                                <div className="relative flex items-center justify-center w-32 h-32">
                                    <div className="absolute inset-0 border-4 rounded-full border-primary/20 animate-ping" />
                                    <div className="absolute inset-0 border-4 border-t-transparent rounded-full border-primary animate-spin" />
                                    <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                                </div>
                            </div>

                            <div className="text-center space-y-1">
                                <h3 className="text-lg font-semibold">Creating your outfits…</h3>
                                <p className="text-sm text-muted-foreground">{LOADING_MESSAGES[loadingMessageIndex]}</p>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Header + summary */}
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-semibold">Your outfits are ready ✨</h2>
                                    <p className="text-xs text-muted-foreground">
                                        {generatedOutfits.length} outfit
                                        {generatedOutfits.length !== 1 ? "s" : ""} generated
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReset}
                                    className="cursor-pointer flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    New
                                </Button>
                            </div>

                            {/* Context pills */}
                            <div className="flex flex-wrap gap-2 text-[11px]">
                                {summaryStyle && (
                                    <span className="px-2 py-1 rounded-full bg-card border border-border/60">
                                        Style: <span className="font-medium">{summaryStyle.name}</span>
                                    </span>
                                )}
                                {getOccasionValue() && (
                                    <span className="px-2 py-1 rounded-full bg-card border border-border/60">
                                        Occasion: <span className="font-medium">{getOccasionValue()}</span>
                                    </span>
                                )}
                                {getWeatherValue() && (
                                    <span className="px-2 py-1 rounded-full bg-card border border-border/60">
                                        Weather: <span className="font-medium">{getWeatherValue()}</span>
                                    </span>
                                )}
                            </div>

                            {/* Outfits grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {generatedOutfits.map((outfit, idx) => {
                                        const items = resolveItemObjects(outfit.items, wardrobe);
                                        return (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -16 }}
                                                transition={{ duration: 0.2, delay: idx * 0.05 }}
                                            >
                                                <Card className="flex flex-col h-full border border-border/70 bg-card/95 backdrop-blur">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-sm">{outfit.name}</CardTitle>
                                                        {outfit.ai_generated_reasoning && (
                                                            <CardDescription className="text-xs">
                                                                {outfit.ai_generated_reasoning}
                                                            </CardDescription>
                                                        )}
                                                    </CardHeader>
                                                    <CardContent className="flex-1 flex flex-col gap-3">
                                                        {/* Pieces */}
                                                        <div className="space-y-2">
                                                            {items.map((item, iIdx) => (
                                                                <div
                                                                    key={iIdx}
                                                                    className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-2"
                                                                >
                                                                    <span className="text-2xl">
                                                                        {getPieceEmoji(item.category)}
                                                                    </span>
                                                                    <div className="flex-1">
                                                                        <div className="text-xs font-medium">
                                                                            {getPieceLabel(item)}
                                                                        </div>
                                                                        {item.fit && (
                                                                            <div className="text-[10px] text-muted-foreground capitalize">
                                                                                {item.fit}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <Button
                                                            type="button"
                                                            className="cursor-pointer mt-auto w-full text-xs"
                                                            onClick={() =>
                                                                onSave({
                                                                    name: outfit.name,
                                                                    style_id: selectedStyle,
                                                                    items: outfit.items.map((it) =>
                                                                        typeof it === "string" ? it : (it as any)._id
                                                                    ),
                                                                    occasion: getOccasionValue(),
                                                                    weather: getWeatherValue(),
                                                                    ai_generated_reasoning:
                                                                        outfit.ai_generated_reasoning,
                                                                })
                                                            }
                                                        >
                                                            Save outfit
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Sticky bottom bar (step 1 only) */}
            {step === 1 && (
                <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-col text-[10px] text-muted-foreground">
                            <span>Ready when you are</span>
                            <span>
                                Generating {numOutfits} outfit
                                {numOutfits > 1 ? "s" : ""}
                            </span>
                        </div>
                        <Button
                            type="button"
                            onClick={handleGenerate}
                            disabled={!selectedStyle}
                            className="cursor-pointer flex-1 sm:flex-none sm:px-6"
                        >
                            <Sparkles className="w-4 h-4 mr-1" />
                            Generate
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
