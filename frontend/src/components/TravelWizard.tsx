"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import { Sparkles, ArrowLeft, MapPin, Calendar, Check, Luggage, ChevronLeft, ChevronRight, Save, Crown, History, Pencil } from "lucide-react";

import type { ClothingItem, Style, SuitcaseGenRequest, SuitcaseGenResponse, TravelSuitcase, TravelSuitcaseCreate, TravelSuitcaseUpdate, OutfitCreate } from "@/types";
import { SuitcaseEditorDialog } from "@/components/SuitcaseEditorDialog";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const OCCASION_PRESETS = [
    { id: "sightseeing", label: "Sightseeing", icon: "🏛️" },
    { id: "business", label: "Business", icon: "💼" },
    { id: "beach", label: "Beach/Pool", icon: "🏖️" },
    { id: "formal-dinner", label: "Formal Dinner", icon: "🍽️" },
    { id: "nightlife", label: "Nightlife", icon: "🎉" },
    { id: "hiking", label: "Hiking/Outdoor", icon: "🥾" },
    { id: "religious", label: "Religious Sites", icon: "⛪" },
    { id: "casual", label: "Casual Day", icon: "☕" },
];

const LOADING_MESSAGES = [
    "Analyzing your wardrobe...",
    "Checking weather patterns...",
    "Finding versatile pieces...",
    "Optimizing packing list...",
    "Creating outfit combinations...",
    "Finishing touches...",
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
    const parts = [item.color, item.type].filter(Boolean);
    const label = parts.join(" ");
    return label || "Item";
};

interface TravelWizardProps {
    wardrobe: ClothingItem[];
    styles: Style[];
    savedSuitcases: TravelSuitcase[];
    isPro: boolean;
    onGenerate: (params: SuitcaseGenRequest) => Promise<SuitcaseGenResponse>;
    onSaveSuitcase: (suitcase: TravelSuitcaseCreate) => Promise<TravelSuitcase>;
    onUpdateSuitcase?: (id: string, data: TravelSuitcaseUpdate) => Promise<void>;
    onSaveOutfit: (outfit: OutfitCreate) => void;
    onDeleteSuitcase?: (id: string) => Promise<void>;
    disabled?: boolean;
}

type Step = 1 | 2 | 3;
type View = "create" | "saved";

export default function TravelWizard({
    wardrobe,
    styles,
    savedSuitcases,
    isPro,
    onGenerate,
    onSaveSuitcase,
    onUpdateSuitcase,
    onSaveOutfit,
    onDeleteSuitcase,
    disabled
}: TravelWizardProps) {
    const [view, setView] = useState<View>("create");
    const [step, setStep] = useState<Step>(1);

    // Form state
    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

    // Results
    const [suitcaseResult, setSuitcaseResult] = useState<SuitcaseGenResponse | null>(null);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);

    // Save dialog
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [suitcaseName, setSuitcaseName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Viewing saved suitcase
    const [viewingSuitcase, setViewingSuitcase] = useState<TravelSuitcase | null>(null);

    // Edit dialog
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Calculate duration
    const duration = startDate && endDate
        ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)
        : 0;

    // Rotate loading text only during step 2
    useEffect(() => {
        if (step !== 2) return;
        const id = setInterval(() => {
            setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2000);
        return () => clearInterval(id);
    }, [step]);

    const toggleOccasion = (occasionId: string) => {
        setSelectedOccasions((prev) => {
            if (prev.includes(occasionId)) {
                return prev.filter((o) => o !== occasionId);
            }
            return [...prev, occasionId];
        });
    };

    const toggleStyle = (styleId: string) => {
        setSelectedStyles((prev) => {
            if (prev.includes(styleId)) {
                return prev.filter((s) => s !== styleId);
            }
            // Max 3 styles
            if (prev.length >= 3) {
                return prev;
            }
            return [...prev, styleId];
        });
    };

    const getOccasionLabels = () => {
        return selectedOccasions.map((id) => {
            const preset = OCCASION_PRESETS.find((p) => p.id === id);
            return preset ? preset.label : id;
        });
    };

    const canGenerate = destination.trim() && startDate && endDate && selectedOccasions.length > 0 && duration > 0 && duration <= 30 && isPro;

    const handleGenerate = async () => {
        if (!canGenerate || disabled) return;

        try {
            setStep(2);
            const request: SuitcaseGenRequest = {
                destination,
                start_date: new Date(startDate).toISOString(),
                end_date: new Date(endDate).toISOString(),
                occasions: getOccasionLabels(),
                style_ids: selectedStyles,
            };

            const res = await onGenerate(request);
            setSuitcaseResult(res);
            setCurrentOutfitIndex(0);
            setStep(3);
        } catch (e: any) {
            console.error("Failed to generate suitcase:", e);
            setStep(1);
        }
    };

    const handleReset = () => {
        setSuitcaseResult(null);
        setCurrentOutfitIndex(0);
        setStep(1);
    };

    const handleSaveSuitcase = async () => {
        if (!suitcaseResult) return;

        setIsSaving(true);
        try {
            const suitcaseData: TravelSuitcaseCreate = {
                name: suitcaseName || `${destination} (${duration} days)`,
                destination,
                start_date: new Date(startDate).toISOString(),
                end_date: new Date(endDate).toISOString(),
                occasions: getOccasionLabels(),
                style_ids: selectedStyles,
                destination_summary: suitcaseResult.destination_summary,
                packing_list: suitcaseResult.packing_list,
                daily_outfits: suitcaseResult.daily_outfits,
                versatility_insights: suitcaseResult.versatility_insights,
            };

            await onSaveSuitcase(suitcaseData);
            setShowSaveDialog(false);
            setSuitcaseName("");
        } catch (e) {
            console.error("Failed to save suitcase:", e);
        } finally {
            setIsSaving(false);
        }
    };

    const getClothingItem = (itemId: string): ClothingItem | undefined => {
        return wardrobe.find((item) => item._id === itemId);
    };

    const viewSavedSuitcase = (suitcase: TravelSuitcase) => {
        setViewingSuitcase(suitcase);
    };

    const handleUpdateSuitcase = async (id: string, data: TravelSuitcaseUpdate) => {
        if (!onUpdateSuitcase) return;

        setIsUpdating(true);
        try {
            await onUpdateSuitcase(id, data);
            // Update local viewing state with the new data
            if (viewingSuitcase && viewingSuitcase._id === id) {
                setViewingSuitcase({
                    ...viewingSuitcase,
                    ...data,
                    name: data.name ?? viewingSuitcase.name,
                    notes: data.notes ?? viewingSuitcase.notes,
                    packing_list: data.packing_list ?? viewingSuitcase.packing_list,
                    daily_outfits: data.daily_outfits ?? viewingSuitcase.daily_outfits,
                });
            }
        } catch (e) {
            console.error("Failed to update suitcase:", e);
        } finally {
            setIsUpdating(false);
        }
    };

    // Render saved suitcase view
    if (viewingSuitcase) {
        const suitcaseDuration = Math.ceil(
            (new Date(viewingSuitcase.end_date).getTime() - new Date(viewingSuitcase.start_date).getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

        return (
            <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/50">
                <header className="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingSuitcase(null)}
                        className="cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                    </Button>
                    <div className="flex items-center gap-2">
                        {onUpdateSuitcase && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowEditDialog(true)}
                                className="cursor-pointer"
                            >
                                <Pencil className="w-4 h-4 mr-1" />
                                Edit
                            </Button>
                        )}
                        {onDeleteSuitcase && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                    await onDeleteSuitcase(viewingSuitcase._id);
                                    setViewingSuitcase(null);
                                }}
                            >
                                Delete
                            </Button>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-4 pb-8 space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold">{viewingSuitcase.name || viewingSuitcase.destination}</h2>
                        <p className="text-xs text-muted-foreground">
                            {new Date(viewingSuitcase.start_date).toLocaleDateString()} - {new Date(viewingSuitcase.end_date).toLocaleDateString()} ({suitcaseDuration} days)
                        </p>
                    </div>

                    {viewingSuitcase.destination_summary && (
                        <Card className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 border-blue-200 dark:border-blue-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {viewingSuitcase.destination}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-xs">
                                {viewingSuitcase.destination_summary.weather && (
                                    <p><strong>Weather:</strong> {viewingSuitcase.destination_summary.weather}</p>
                                )}
                                {viewingSuitcase.destination_summary.temperature_range && (
                                    <p><strong>Temperature:</strong> {viewingSuitcase.destination_summary.temperature_range}</p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <section className="space-y-3">
                        <h3 className="text-sm font-semibold">Packing List ({viewingSuitcase.packing_list.length} items)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {viewingSuitcase.packing_list.map((packItem, idx) => {
                                const item = getClothingItem(packItem.item_id);
                                if (!item) return null;
                                return (
                                    <div key={idx} className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2">
                                        <span className="text-2xl">{getPieceEmoji(item.category)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium truncate">{getPieceLabel(item)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-sm font-semibold">Daily Outfits</h3>
                        {viewingSuitcase.daily_outfits.map((outfit, idx) => {
                            const outfitItems = outfit.items.map(getClothingItem).filter(Boolean) as ClothingItem[];
                            return (
                                <Card key={idx} className="border bg-card/95">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Day {outfit.day}: {outfit.occasion}</CardTitle>
                                        {outfit.reasoning && <CardDescription className="text-xs">{outfit.reasoning}</CardDescription>}
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {outfitItems.map((item, iIdx) => (
                                            <div key={iIdx} className="flex items-center gap-3 rounded-xl border bg-background/80 px-3 py-2">
                                                <span className="text-xl">{getPieceEmoji(item.category)}</span>
                                                <span className="text-xs font-medium">{getPieceLabel(item)}</span>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </section>
                </main>

                {/* Suitcase Editor Dialog */}
                <SuitcaseEditorDialog
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                    suitcase={viewingSuitcase}
                    onSave={handleUpdateSuitcase}
                    isSaving={isUpdating}
                />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/50">
            {/* Top bar */}
            <header className="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                        <Luggage className="w-5 h-5" />
                        Pack for Trip
                        {!isPro && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-medium">
                                <Crown className="w-3 h-3" />
                                PRO
                            </span>
                        )}
                    </h1>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                        Smart packing with minimal items
                    </p>
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                    <button
                        onClick={() => setView("create")}
                        className={`cursor-pointer px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            view === "create" ? "bg-background shadow-sm" : "text-muted-foreground"
                        }`}
                    >
                        Create
                    </button>
                    <button
                        onClick={() => setView("saved")}
                        className={`cursor-pointer px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                            view === "saved" ? "bg-background shadow-sm" : "text-muted-foreground"
                        }`}
                    >
                        <History className="w-3 h-3" />
                        Saved ({savedSuitcases.length})
                    </button>
                </div>
            </header>

            {/* Pro upgrade prompt - blocks entire view for free users */}
            {!isPro && view === "create" && (
                <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
                    <div className="max-w-sm w-full text-center space-y-6">
                        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50 flex items-center justify-center">
                            <Crown className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">Premium Feature</h2>
                            <p className="text-sm text-muted-foreground">
                                Travel Suitcase is available for Pro users. Get AI-powered packing lists that maximize outfit combinations while minimizing items.
                            </p>
                        </div>

                        <div className="space-y-3 text-left bg-muted/50 rounded-xl p-4">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">What you get:</p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                    <span>Smart packing lists optimized for your trip</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                    <span>Daily outfit suggestions for each occasion</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                    <span>Weather-aware recommendations</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                    <span>Save and edit trips for later</span>
                                </li>
                            </ul>
                        </div>

                        <Button
                            className="w-full cursor-pointer"
                            size="lg"
                            onClick={() => window.location.href = "/settings"}
                        >
                            <Crown className="w-4 h-4 mr-2" />
                            Upgrade to Pro
                        </Button>

                        <p className="text-xs text-muted-foreground">
                            Already have an API key?{" "}
                            <a href="/settings" className="underline hover:text-foreground">
                                Add it in settings
                            </a>
                        </p>
                    </div>
                </main>
            )}

            {/* Saved suitcases view */}
            {view === "saved" && (
                <main className="flex-1 overflow-y-auto px-4 pb-8">
                    {savedSuitcases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Luggage className="w-12 h-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-sm font-medium text-muted-foreground">No saved suitcases yet</h3>
                            <p className="text-xs text-muted-foreground mt-1">Create and save a trip to see it here</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => setView("create")}
                            >
                                Create a trip
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {savedSuitcases.map((suitcase) => {
                                const suitcaseDuration = Math.ceil(
                                    (new Date(suitcase.end_date).getTime() - new Date(suitcase.start_date).getTime()) / (1000 * 60 * 60 * 24)
                                ) + 1;
                                return (
                                    <Card
                                        key={suitcase._id}
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => viewSavedSuitcase(suitcase)}
                                    >
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                {suitcase.name || suitcase.destination}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                {new Date(suitcase.start_date).toLocaleDateString()} - {new Date(suitcase.end_date).toLocaleDateString()}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="text-xs text-muted-foreground">
                                            <p>{suitcaseDuration} days • {suitcase.packing_list.length} items • {suitcase.daily_outfits.length} outfits</p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </main>
            )}

            {/* Create view - only for Pro users */}
            {view === "create" && isPro && (
                <>
                    {/* Step indicator */}
                    <div className="px-4 pb-2">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                            <span className={`px-2 py-1 rounded-full ${step === 1 ? "bg-primary/10 text-primary" : "bg-muted"}`}>
                                1. Trip Details
                            </span>
                            <span className={`px-2 py-1 rounded-full ${step === 2 ? "bg-primary/10 text-primary" : "bg-muted"}`}>
                                2. Packing
                            </span>
                            <span className={`px-2 py-1 rounded-full ${step === 3 ? "bg-primary/10 text-primary" : "bg-muted"}`}>
                                3. Suitcase
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
                                    {/* Destination */}
                                    <section className="space-y-3">
                                        <Label className="text-xs font-medium flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Where are you going?
                                        </Label>
                                        <Input
                                            value={destination}
                                            onChange={(e) => setDestination(e.target.value)}
                                            placeholder="e.g. Paris, France"
                                            className="text-sm"
                                            disabled={!isPro}
                                        />
                                    </section>

                                    {/* Dates */}
                                    <section className="space-y-3">
                                        <Label className="text-xs font-medium flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            When?
                                        </Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-[10px] text-muted-foreground">From</Label>
                                                <Input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="text-sm"
                                                    disabled={!isPro}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-[10px] text-muted-foreground">To</Label>
                                                <Input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    min={startDate}
                                                    className="text-sm"
                                                    disabled={!isPro}
                                                />
                                            </div>
                                        </div>
                                        {duration > 0 && (
                                            <p className="text-[11px] text-muted-foreground">
                                                {duration} day{duration !== 1 ? "s" : ""} trip
                                                {duration > 30 && <span className="text-destructive ml-1">(max 30 days)</span>}
                                            </p>
                                        )}
                                    </section>

                                    {/* Occasions */}
                                    <section className="space-y-3">
                                        <Label className="text-xs font-medium">What will you be doing?</Label>
                                        <p className="text-[11px] text-muted-foreground">
                                            Select all activities planned for your trip
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {OCCASION_PRESETS.map((preset) => {
                                                const active = selectedOccasions.includes(preset.id);
                                                return (
                                                    <button
                                                        key={preset.id}
                                                        type="button"
                                                        onClick={() => isPro && toggleOccasion(preset.id)}
                                                        disabled={!isPro}
                                                        className={`cursor-pointer relative flex flex-col items-center gap-2 rounded-2xl px-3 py-4 text-xs border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                                            active
                                                                ? "bg-primary/10 border-primary text-primary"
                                                                : "bg-card border-border/60 hover:border-primary/50"
                                                        }`}
                                                    >
                                                        {active && (
                                                            <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />
                                                        )}
                                                        <span className="text-2xl">{preset.icon}</span>
                                                        <span className="font-medium">{preset.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </section>

                                    {/* Styles Selection */}
                                    {styles.length > 0 && (
                                        <section className="space-y-3">
                                            <Label className="text-xs font-medium flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" />
                                                Style preferences (optional, max 3)
                                            </Label>
                                            <p className="text-[11px] text-muted-foreground">
                                                Select 1-3 styles to guide outfit creation. Multiple styles add variety.
                                            </p>
                                            <div className="-mx-4 px-4 flex gap-2 overflow-x-auto pb-1">
                                                {styles.map((style) => {
                                                    const active = selectedStyles.includes(style._id);
                                                    const atMax = selectedStyles.length >= 3 && !active;
                                                    return (
                                                        <button
                                                            key={style._id}
                                                            type="button"
                                                            onClick={() => isPro && toggleStyle(style._id)}
                                                            disabled={!isPro || atMax}
                                                            className={`cursor-pointer flex-shrink-0 rounded-2xl px-3 py-2 text-xs font-medium whitespace-nowrap border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                                                active
                                                                    ? "bg-primary/10 border-primary text-primary"
                                                                    : "bg-card border-border/60 hover:border-primary/50"
                                                            }`}
                                                        >
                                                            {active && <Check className="inline w-3 h-3 mr-1" />}
                                                            {style.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {selectedStyles.length > 0 && (
                                                <p className="text-[10px] text-muted-foreground">
                                                    {selectedStyles.length}/3 styles selected
                                                </p>
                                            )}
                                        </section>
                                    )}
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
                                            <Luggage className="w-12 h-12 text-primary animate-pulse" />
                                        </div>
                                    </div>

                                    <div className="text-center space-y-1">
                                        <h3 className="text-lg font-semibold">Packing your suitcase...</h3>
                                        <p className="text-sm text-muted-foreground">{LOADING_MESSAGES[loadingMessageIndex]}</p>
                                    </div>

                                    <div className="text-center text-xs text-muted-foreground">
                                        <p>{duration} day trip to {destination}</p>
                                        <p>{selectedOccasions.length} activities planned</p>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && suitcaseResult && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg sm:text-xl font-semibold">Your suitcase is ready!</h2>
                                            <p className="text-xs text-muted-foreground">
                                                {suitcaseResult.packing_list.length} items for {duration} days
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowSaveDialog(true)}
                                                className="cursor-pointer flex items-center gap-1"
                                            >
                                                <Save className="w-4 h-4" />
                                                Save
                                            </Button>
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
                                    </div>

                                    {/* Destination Summary */}
                                    {suitcaseResult.destination_summary && (
                                        <Card className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30 border-blue-200 dark:border-blue-800">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    {destination}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-1 text-xs">
                                                {suitcaseResult.destination_summary.weather && (
                                                    <p><strong>Weather:</strong> {suitcaseResult.destination_summary.weather}</p>
                                                )}
                                                {suitcaseResult.destination_summary.temperature_range && (
                                                    <p><strong>Temperature:</strong> {suitcaseResult.destination_summary.temperature_range}</p>
                                                )}
                                                {suitcaseResult.destination_summary.packing_notes && (
                                                    <p className="text-muted-foreground mt-2">{suitcaseResult.destination_summary.packing_notes}</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Packing List */}
                                    <section className="space-y-3">
                                        <h3 className="text-sm font-semibold flex items-center gap-2">
                                            <Luggage className="w-4 h-4" />
                                            Packing List ({suitcaseResult.packing_list.length} items)
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {suitcaseResult.packing_list.map((packItem, idx) => {
                                                const item = getClothingItem(packItem.item_id);
                                                if (!item) return null;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-3 py-2"
                                                    >
                                                        <span className="text-2xl">{getPieceEmoji(item.category)}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-medium truncate">{getPieceLabel(item)}</div>
                                                            {packItem.reason && (
                                                                <div className="text-[10px] text-muted-foreground truncate">
                                                                    {packItem.reason}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>

                                    {/* Versatility Insight */}
                                    {suitcaseResult.versatility_insights && (
                                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                                            <Sparkles className="w-4 h-4 text-primary inline mr-2" />
                                            {suitcaseResult.versatility_insights}
                                        </div>
                                    )}

                                    {/* Daily Outfits Carousel */}
                                    {suitcaseResult.daily_outfits.length > 0 && (
                                        <section className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-semibold">Daily Outfits</h3>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => setCurrentOutfitIndex((prev) => Math.max(0, prev - 1))}
                                                        disabled={currentOutfitIndex === 0}
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </Button>
                                                    <span className="text-xs text-muted-foreground">
                                                        Day {currentOutfitIndex + 1} of {suitcaseResult.daily_outfits.length}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => setCurrentOutfitIndex((prev) => Math.min(suitcaseResult.daily_outfits.length - 1, prev + 1))}
                                                        disabled={currentOutfitIndex === suitcaseResult.daily_outfits.length - 1}
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <AnimatePresence mode="wait">
                                                {suitcaseResult.daily_outfits.map((outfit, idx) => {
                                                    if (idx !== currentOutfitIndex) return null;
                                                    const outfitItems = outfit.items.map(getClothingItem).filter(Boolean) as ClothingItem[];
                                                    return (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: -20 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <Card className="border border-border/70 bg-card/95">
                                                                <CardHeader className="pb-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <CardTitle className="text-sm">
                                                                            Day {outfit.day}: {outfit.occasion}
                                                                        </CardTitle>
                                                                        {outfit.date && (
                                                                            <span className="text-[10px] text-muted-foreground">
                                                                                {outfit.date}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {outfit.reasoning && (
                                                                        <CardDescription className="text-xs">
                                                                            {outfit.reasoning}
                                                                        </CardDescription>
                                                                    )}
                                                                </CardHeader>
                                                                <CardContent className="space-y-2">
                                                                    {outfitItems.map((item, iIdx) => (
                                                                        <div
                                                                            key={iIdx}
                                                                            className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-2"
                                                                        >
                                                                            <span className="text-2xl">{getPieceEmoji(item.category)}</span>
                                                                            <div className="flex-1">
                                                                                <div className="text-xs font-medium">{getPieceLabel(item)}</div>
                                                                                {item.fit && (
                                                                                    <div className="text-[10px] text-muted-foreground capitalize">
                                                                                        {item.fit}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}

                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        className="cursor-pointer w-full text-xs mt-2"
                                                                        onClick={() => {
                                                                            onSaveOutfit({
                                                                                name: `${destination} - Day ${outfit.day}`,
                                                                                style_id: selectedStyles[0] || "",
                                                                                items: outfit.items,
                                                                                occasion: outfit.occasion,
                                                                                ai_generated_reasoning: outfit.reasoning,
                                                                            });
                                                                        }}
                                                                    >
                                                                        Save this outfit
                                                                    </Button>
                                                                </CardContent>
                                                            </Card>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </section>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>

                    {/* Sticky bottom bar (step 1 only) */}
                    {step === 1 && (
                        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex flex-col text-[10px] text-muted-foreground">
                                    {canGenerate ? (
                                        <>
                                            <span>Ready to pack!</span>
                                            <span>{duration} days, {selectedOccasions.length} activities{selectedStyles.length > 0 ? `, ${selectedStyles.length} styles` : ""}</span>
                                        </>
                                    ) : !isPro ? (
                                        <span>Upgrade to Pro to use this feature</span>
                                    ) : (
                                        <span>Fill in trip details to continue</span>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleGenerate}
                                    disabled={!canGenerate || disabled}
                                    className="cursor-pointer flex-1 sm:flex-none sm:px-6"
                                >
                                    <Luggage className="w-4 h-4 mr-1" />
                                    Pack My Suitcase
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Save Dialog */}
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Save Suitcase</DialogTitle>
                        <DialogDescription>
                            Save this trip for later reference
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Name (optional)</Label>
                            <Input
                                value={suitcaseName}
                                onChange={(e) => setSuitcaseName(e.target.value)}
                                placeholder={`${destination} (${duration} days)`}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveSuitcase} disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
