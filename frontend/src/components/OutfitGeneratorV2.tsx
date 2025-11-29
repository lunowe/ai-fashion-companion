import { useState, useMemo } from "react";
import { Search, Sparkles, ArrowLeft, Check, X, Shirt, Thermometer, Calendar, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ClothingItem, Style, GeneratedOutfit, OutfitCreate } from "@/types";
import { resolveItemObjects, normalizeGenerated } from "@/lib/outfit-utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// --- Configuration ---
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
    { id: "warm", label: "Warm", temp: "15-25°C", icon: "☀️" },
    { id: "cool", label: "Cool", temp: "10-15°C", icon: "🌤️" },
    { id: "cold", label: "Cold", temp: "<10°C", icon: "❄️" },
    { id: "rainy", label: "Rainy", temp: "Any", icon: "🌧️" },
];

const LOADING_MESSAGES = [
    "Analyzing your wardrobe...",
    "Matching colors and patterns...",
    "Checking the weather forecast...",
    "Generating outfit ideas...",
    "Refining outfit ideas...",
    "Consulting fashion archives...",
    "Adjusting for your style...",
    "Adjusting for your occasion...",
    "Finalizing your look...",
];

const getCategoryIcon = (category: string | undefined): string => {
    const map: Record<string, string> = {
        tops: "👕",
        top: "👕",
        outerwear: "🧥",
        bottoms: "👖",
        bottom: "👖",
        shoes: "👟",
        shoe: "👟",
        accessories: "👜",
    };
    return map[category?.toLowerCase() || ""] || "👔";
};

// --- Props ---
interface OutfitGeneratorProps {
    styles: Style[];
    wardrobe: ClothingItem[];
    onGenerate: (params: any) => Promise<GeneratedOutfit[]>;
    onSave: (outfit: OutfitCreate) => void;
    disabled?: boolean;
}

export default function OutfitGeneratorV2({ styles, wardrobe, onGenerate, onSave, disabled }: OutfitGeneratorProps) {
    // Step: 1=Config, 2=Loading, 3=Results
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // Form State
    const [freeText, setFreeText] = useState("");
    const [selectedStyle, setSelectedStyle] = useState("");
    const [selectedOccasion, setSelectedOccasion] = useState("");
    const [customOccasion, setCustomOccasion] = useState("");
    const [selectedWeather, setSelectedWeather] = useState("");
    const [customWeather, setCustomWeather] = useState("");
    const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
    const [numOutfits, setNumOutfits] = useState(3);
    const [itemSearch, setItemSearch] = useState("");
    const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

    // Results
    const [generatedOutfits, setGeneratedOutfits] = useState<GeneratedOutfit[]>([]);

    // Search Logic
    const filteredWardrobe = useMemo(() => {
        if (!itemSearch.trim()) return wardrobe;
        const query = itemSearch.toLowerCase();
        return wardrobe.filter(
            (item) =>
                item.type?.toLowerCase().includes(query) ||
                item.color?.toLowerCase().includes(query) ||
                item.category?.toLowerCase().includes(query)
        );
    }, [wardrobe, itemSearch]);

    // Handlers
    const toggleItem = (item: ClothingItem) => {
        setSelectedItems((prev) =>
            prev.find((i) => i._id === item._id) ? prev.filter((i) => i._id !== item._id) : [...prev, item]
        );
    };

    const getFinalValues = () => ({
        occasion: customOccasion.trim() || OCCASION_PRESETS.find((p) => p.id === selectedOccasion)?.label || "",
        weather:
            customWeather.trim() ||
            (selectedWeather
                ? `${WEATHER_PRESETS.find((p) => p.id === selectedWeather)?.label} ${
                      WEATHER_PRESETS.find((p) => p.id === selectedWeather)?.temp
                  }`
                : ""),
        style: selectedStyle,
        description: freeText.trim(),
        required_items: selectedItems.map((item) => item._id),
    });

    const handleGenerate = async () => {
        if (!selectedStyle) return; // Ideally show validation error

        setStep(2);
        // Cycle loading messages
        const msgInterval = setInterval(() => {
            setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 1500);

        try {
            const { occasion, weather } = getFinalValues();
            const res = await onGenerate({
                style_id: selectedStyle,
                occasion,
                weather,
                description: freeText,
                required_items: selectedItems.map((item) => item._id),
                num_outfits: numOutfits,
            });
            setGeneratedOutfits(res.map(normalizeGenerated));
            setStep(3);
        } catch (e) {
            console.error(e);
            setStep(1);
        } finally {
            clearInterval(msgInterval);
        }
    };

    const handleReset = () => {
        setStep(1);
        setGeneratedOutfits([]);
    };

    // --- Render Helpers ---

    return (
        <div className="max-w-5xl mx-auto py-6 px-4 md:px-0">
            <AnimatePresence mode="wait">
                {/* STEP 1: CONFIGURATION */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex flex-col items-center justify-center space-y-2 mb-8">
                            <h1 className="text-5xl font-bold tracking-tighter">
                                Hey,
                                <br /> Let's get dressed.
                            </h1>
                            {/* <p className="text-muted-foreground text-lg">Where are we going today?</p> */}
                        </div>

                        <div className="space-y-8">
                            {/* 1. Free Text & Style (The Core) */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 font-semibold text-base">
                                        <MessageSquare className="w-4 h-4" />
                                        What's on your mind?
                                    </Label>
                                    <Textarea
                                        value={freeText}
                                        onChange={(e) => setFreeText(e.target.value)}
                                        placeholder="Describe the vibe... (eg. 'I need a layered outfit for a chilly coffee date...')"
                                        className="min-h-[120px] resize-none bg-background text-base shadow-sm focus-visible:ring-primary"
                                    />
                                    {/* <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                                        <Textarea
                                            placeholder="Describe the vibe... (e.g., '90s coffee date but make it cozy')"
                                            value={freeText}
                                            onChange={(e) => setFreeText(e.target.value)}
                                            className="relative bg-background border-0 shadow-lg resize-none text-lg p-4 h-32 rounded-xl focus-visible:ring-0"
                                        />
                                    </div> */}
                                </div>

                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 font-semibold text-base">
                                        <Sparkles className="w-4 h-4" />
                                        Choose a Style Persona <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                                        <SelectTrigger className="h-[50px] bg-background shadow-sm w-full">
                                            <SelectValue placeholder="Select Aesthetic..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {styles.map((s) => (
                                                <SelectItem key={s._id} value={s._id} className="cursor-pointer">
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="pt-4">
                                        <Label className="mb-2 block text-sm text-muted-foreground">
                                            How many options?
                                        </Label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="1"
                                                max="5"
                                                value={numOutfits}
                                                onChange={(e) => setNumOutfits(parseInt(e.target.value))}
                                                className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                            />
                                            <span className="font-bold w-8 text-center">{numOutfits}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* 2. Context (Occasion & Weather) */}
                            <div className="space-y-6">
                                <div>
                                    <Label className="flex items-center gap-2 font-semibold text-base mb-4">
                                        <Calendar className="w-4 h-4" /> Occasion
                                    </Label>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                        {OCCASION_PRESETS.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setSelectedOccasion(p.id);
                                                    setCustomOccasion("");
                                                }}
                                                className={`group relative flex flex-col items-center p-3 rounded-xl border transition-all duration-200 hover:shadow-md ${
                                                    selectedOccasion === p.id && !customOccasion
                                                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                                                        : "border-border bg-background hover:border-primary/50"
                                                }`}
                                            >
                                                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                                                    {p.icon}
                                                </span>
                                                <span className="text-xs font-medium">{p.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <Input
                                        className="mt-3 bg-background"
                                        placeholder="Or type specific occasion..."
                                        value={customOccasion}
                                        onChange={(e) => {
                                            setCustomOccasion(e.target.value);
                                            if (e.target.value) setSelectedOccasion("");
                                        }}
                                    />
                                </div>

                                <div>
                                    <Label className="flex items-center gap-2 font-semibold text-base mb-4">
                                        <Thermometer className="w-4 h-4" /> Weather
                                    </Label>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                        {WEATHER_PRESETS.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setSelectedWeather(p.id);
                                                    setCustomWeather("");
                                                }}
                                                className={`group flex flex-col items-center p-3 rounded-xl border transition-all duration-200 hover:shadow-md ${
                                                    selectedWeather === p.id && !customWeather
                                                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                                                        : "border-border bg-background hover:border-blue-400/50"
                                                }`}
                                            >
                                                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                                                    {p.icon}
                                                </span>
                                                <span className="text-xs font-medium">{p.label}</span>
                                                <span className="text-[10px] text-muted-foreground">{p.temp}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <Input
                                        className="mt-3 bg-background"
                                        placeholder="Or type specific weather..."
                                        value={customWeather}
                                        onChange={(e) => {
                                            setCustomWeather(e.target.value);
                                            if (e.target.value) setSelectedWeather("");
                                        }}
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* 3. Specific Items (Wardrobe) */}
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <Label className="flex items-center gap-2 font-semibold text-base">
                                        <Shirt className="w-4 h-4" />
                                        Must Include Items
                                        {selectedItems.length > 0 && (
                                            <Badge variant="secondary" className="ml-2">
                                                {selectedItems.length}
                                            </Badge>
                                        )}
                                    </Label>
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search wardrobe..."
                                            value={itemSearch}
                                            onChange={(e) => setItemSearch(e.target.value)}
                                            className="pl-9 bg-background"
                                        />
                                    </div>
                                </div>

                                {/* Selected Chips */}
                                {selectedItems.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedItems.map((item) => (
                                            <Badge
                                                key={item._id}
                                                variant="outline"
                                                className="pl-2 pr-1 py-1 gap-1 bg-primary/5 border-primary/20 text-primary"
                                            >
                                                {getCategoryIcon(item.category)} {item.color} {item.type}
                                                <button
                                                    onClick={() => toggleItem(item)}
                                                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <ScrollArea className="h-[280px] border rounded-xl bg-muted/30 p-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {filteredWardrobe.length === 0 ? (
                                            <div className="col-span-full py-12 text-center text-muted-foreground">
                                                No items found matching "{itemSearch}"
                                            </div>
                                        ) : (
                                            filteredWardrobe.map((item) => {
                                                const isSelected = !!selectedItems.find((i) => i._id === item._id);
                                                return (
                                                    <button
                                                        key={item._id}
                                                        onClick={() => toggleItem(item)}
                                                        className={`group relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 bg-background ${
                                                            isSelected
                                                                ? "border-primary shadow-sm"
                                                                : "border-transparent hover:border-muted-foreground/20 shadow-sm"
                                                        }`}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                                                                <Check className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                        <span className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                                                            {getCategoryIcon(item.category)}
                                                        </span>
                                                        <div className="text-center w-full">
                                                            <p className="text-xs font-semibold truncate w-full capitalize">
                                                                {item.type}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground capitalize">
                                                                {item.color} • {item.fit}
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>

                        <div className="w-full p-6">
                            <Button
                                size="lg"
                                className="w-full text-lg h-14 shadow-lg hover:shadow-xl transition-all rounded-xl"
                                onClick={handleGenerate}
                                disabled={!selectedStyle || disabled}
                            >
                                {selectedStyle ? (
                                    <>
                                        <Sparkles className="mr-2 w-5 h-5 animate-pulse" />
                                        Generate {numOutfits} Outfit{numOutfits > 1 ? "s" : ""}
                                    </>
                                ) : (
                                    "Select a Style to Continue"
                                )}
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: LOADING */}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center min-h-[600px] text-center space-y-8"
                    >
                        <div className="relative w-32 h-32">
                            <div className="absolute inset-0 rounded-full border-4 border-muted" />
                            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-foreground">Curating Your Look</h3>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={loadingMsgIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-muted-foreground min-h-[1.5rem]"
                                >
                                    {LOADING_MESSAGES[loadingMsgIndex]}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: RESULTS */}
                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                                    Your Looks <span className="text-2xl">✨</span>
                                </h2>
                                <p className="text-muted-foreground mt-1">
                                    Based on {selectedStyle ? "your style" : "your input"} and {selectedItems.length}{" "}
                                    specific items, for the following constraints:
                                </p>
                                <ul className="list-disc list-inside">
                                    <li>Weather: {getFinalValues().weather}</li>
                                    <li>Occasion: {getFinalValues().occasion}</li>
                                    <li>Description: {getFinalValues().description}</li>
                                </ul>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={handleReset} className="gap-2">
                                    <ArrowLeft className="w-4 h-4" /> New Search
                                </Button>
                                <Button onClick={handleGenerate} className="gap-2">
                                    <Sparkles className="w-4 h-4" /> Regenerate
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {generatedOutfits.map((outfit, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <OutfitResultCard
                                        outfit={outfit}
                                        wardrobe={wardrobe}
                                        onSave={() =>
                                            onSave({
                                                name: outfit.name,
                                                style_id: selectedStyle,
                                                items: outfit.items.map((it) =>
                                                    typeof it === "string" ? it : (it as any)._id
                                                ),
                                                occasion: getFinalValues().occasion,
                                                weather: getFinalValues().weather,
                                                ai_generated_reasoning: outfit.ai_generated_reasoning,
                                            })
                                        }
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function OutfitResultCard({
    outfit,
    wardrobe,
    onSave,
}: {
    outfit: GeneratedOutfit;
    wardrobe: ClothingItem[];
    onSave: () => void;
}) {
    const items = resolveItemObjects(outfit.items, wardrobe);

    return (
        <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
            <CardHeader className="pb-4 bg-muted/20">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <CardTitle className="text-xl leading-tight">{outfit.name}</CardTitle>
                        <CardDescription className="mt-2 text-xs">
                            {outfit.ai_generated_reasoning || "Perfectly matched for your occasion."}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <div className="divide-y">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 hover:bg-muted/10 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center text-2xl shadow-sm border">
                                {getCategoryIcon(item.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate capitalize">
                                    {item.color} {item.type}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                    {item.category} • {item.fit}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 mt-4">
                <Button
                    onClick={onSave}
                    className="w-full gap-2 opacity-90 hover:opacity-100 group-hover:translate-y-0 transition-all"
                >
                    <Check className="w-4 h-4" /> Save to Profile
                </Button>
            </CardFooter>
        </Card>
    );
}
