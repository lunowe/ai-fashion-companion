import { useState } from "react";
import { ShoppingCart, Plus, X, Check, ArrowLeft, Palette, Trash2 } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Organized by category
const CATEGORIES = [
    {
        id: "tops",
        name: "Tops",
        icon: "👕",
        items: [
            {
                id: "tshirt",
                type: "t-shirt",
                icon: "👕",
                colors: ["black", "white", "grey", "navy", "red", "green", "beige", "brown"],
                fits: ["slim", "regular", "oversized", "cropped"],
            },
            {
                id: "longsleeve",
                type: "longsleeve",
                icon: "👔",
                colors: ["black", "white", "grey", "navy", "olive", "burgundy"],
                fits: ["slim", "regular", "oversized"],
            },
            {
                id: "polo",
                type: "polo shirt",
                icon: "👕",
                colors: ["black", "white", "navy", "grey", "red"],
                fits: ["slim", "regular"],
            },
            {
                id: "dress-shirt",
                type: "dress shirt",
                icon: "👔",
                colors: ["white", "light blue", "pink", "lavender", "grey"],
                fits: ["slim", "regular", "relaxed"],
            },
            {
                id: "button-up",
                type: "button-up shirt",
                icon: "👔",
                colors: ["white", "black", "navy", "olive", "burgundy", "denim"],
                fits: ["slim", "regular", "oversized"],
            },
            {
                id: "henley",
                type: "henley",
                icon: "👕",
                colors: ["black", "white", "grey", "navy", "olive"],
                fits: ["slim", "regular"],
            },
            {
                id: "tank",
                type: "tank top",
                icon: "🎽",
                colors: ["black", "white", "grey", "navy"],
                fits: ["slim", "regular"],
            },
        ],
    },
    {
        id: "sweaters",
        name: "Sweaters & Knits",
        icon: "🧶",
        items: [
            {
                id: "hoodie",
                type: "hoodie",
                icon: "🧥",
                colors: ["black", "grey", "navy", "maroon", "olive", "beige"],
                fits: ["regular", "oversized"],
            },
            {
                id: "knit-sweater",
                type: "knit sweater",
                icon: "🧶",
                colors: ["black", "grey", "navy", "burgundy", "cream", "camel", "forest"],
                fits: ["slim", "regular", "oversized"],
            },
            {
                id: "cardigan",
                type: "cardigan",
                icon: "🧥",
                colors: ["black", "grey", "navy", "camel", "cream", "olive"],
                fits: ["slim", "regular", "oversized"],
            },
            {
                id: "sweatshirt",
                type: "sweatshirt",
                icon: "👕",
                colors: ["black", "grey", "navy", "maroon", "olive", "white"],
                fits: ["regular", "oversized"],
            },
            {
                id: "quarter-zip",
                type: "quarter-zip",
                icon: "👕",
                colors: ["black", "grey", "navy", "maroon", "olive", "white", "beige"],
                fits: ["regular", "oversized"],
            },
            {
                id: "turtleneck",
                type: "turtleneck",
                icon: "🧶",
                colors: ["black", "white", "grey", "navy", "cream", "burgundy"],
                fits: ["slim", "regular"],
            },
            {
                id: "vest-sweater",
                type: "sweater vest",
                icon: "🦺",
                colors: ["black", "grey", "navy", "burgundy", "camel", "cream"],
                fits: ["slim", "regular"],
            },
        ],
    },
    {
        id: "outerwear",
        name: "Outerwear",
        icon: "🧥",
        items: [
            {
                id: "blazer",
                type: "blazer",
                icon: "🤵",
                colors: ["black", "navy", "grey", "charcoal", "camel"],
                fits: ["slim", "regular", "oversized"],
            },
            {
                id: "coat",
                type: "coat",
                icon: "🧥",
                colors: ["black", "navy", "grey", "camel"],
                fits: ["regular", "oversized"],
            },
            {
                id: "trench",
                type: "trench coat",
                icon: "🧥",
                colors: ["khaki", "black", "navy", "beige"],
                fits: ["regular", "oversized"],
            },
            {
                id: "parka",
                type: "parka",
                icon: "🧥",
                colors: ["black", "navy", "olive", "khaki"],
                fits: ["regular", "oversized"],
            },
            {
                id: "bomber",
                type: "bomber jacket",
                icon: "🧥",
                colors: ["black", "navy", "olive", "burgundy"],
                fits: ["regular", "oversized"],
            },
            {
                id: "denim-jacket",
                type: "denim jacket",
                icon: "🧥",
                colors: ["blue", "black", "light blue"],
                fits: ["slim", "regular", "oversized"],
            },
            {
                id: "leather-jacket",
                type: "leather jacket",
                icon: "🧥",
                colors: ["black", "brown", "tan"],
                fits: ["slim", "regular", "oversized"],
            },
            {
                id: "windbreaker",
                type: "windbreaker",
                icon: "🧥",
                colors: ["black", "navy", "grey", "olive", "orange"],
                fits: ["regular", "oversized"],
            },
            {
                id: "puffer-jacket",
                type: "puffer jacket",
                icon: "🧥",
                colors: ["black", "navy", "grey", "olive", "brown"],
                fits: ["regular", "oversized"],
            },
            {
                id: "puffer-vest",
                type: "puffer vest",
                icon: "🦺",
                colors: ["black", "navy", "grey", "olive"],
                fits: ["regular", "oversized"],
            },
        ],
    },
    {
        id: "bottoms",
        name: "Bottoms",
        icon: "👖",
        items: [
            {
                id: "jeans",
                type: "jeans",
                icon: "👖",
                colors: ["black", "blue", "light blue", "grey"],
                fits: ["slim", "straight", "relaxed", "wide"],
            },
            {
                id: "chinos",
                type: "chinos",
                icon: "👖",
                colors: ["black", "navy", "khaki", "beige", "olive"],
                fits: ["slim", "straight", "relaxed"],
            },
            {
                id: "dress-pants",
                type: "dress pants",
                icon: "👔",
                colors: ["black", "grey", "navy", "charcoal"],
                fits: ["slim", "straight", "relaxed"],
            },
            {
                id: "cargo-pants",
                type: "cargo pants",
                icon: "👖",
                colors: ["black", "olive", "khaki", "grey", "navy"],
                fits: ["regular", "relaxed", "tapered"],
            },
            {
                id: "joggers",
                type: "joggers",
                icon: "👖",
                colors: ["black", "grey", "navy", "olive"],
                fits: ["slim", "regular", "relaxed"],
            },
            {
                id: "shorts",
                type: "shorts",
                icon: "🩳",
                colors: ["black", "navy", "khaki", "grey", "beige"],
                fits: ["slim", "regular", "relaxed"],
            },
            {
                id: "sweatpants",
                type: "sweatpants",
                icon: "👖",
                colors: ["black", "grey", "navy"],
                fits: ["slim", "regular", "relaxed"],
            },
        ],
    },
    {
        id: "shoes",
        name: "Shoes",
        icon: "👟",
        items: [
            {
                id: "sneakers",
                type: "sneakers",
                icon: "👟",
                colors: ["white", "black", "grey", "navy"],
                fits: ["low-top", "high-top"],
            },
            {
                id: "dress-shoes",
                type: "dress shoes",
                icon: "👞",
                colors: ["black", "brown", "tan"],
                fits: ["oxford", "derby"],
            },
            {
                id: "loafers",
                type: "loafers",
                icon: "👞",
                colors: ["black", "brown", "tan", "burgundy"],
                fits: ["penny", "tassel", "horsebit"],
            },
            {
                id: "boots",
                type: "boots",
                icon: "🥾",
                colors: ["black", "brown", "tan"],
                fits: ["chelsea", "combat", "work", "chukka"],
            },
            {
                id: "slip-ons",
                type: "slip-ons",
                icon: "👟",
                colors: ["white", "black", "navy", "grey"],
                fits: ["canvas", "leather"],
            },
            {
                id: "sandals",
                type: "sandals",
                icon: "👡",
                colors: ["black", "brown", "tan"],
                fits: ["slides", "strappy"],
            },
            {
                id: "espadrilles",
                type: "espadrilles",
                icon: "👟",
                colors: ["navy", "beige", "grey", "white"],
                fits: ["regular"],
            },
        ],
    },
    {
        id: "accessories",
        name: "Accessories",
        icon: "🎩",
        items: [
            {
                id: "hat",
                type: "hat",
                icon: "🧢",
                colors: ["black", "navy", "grey", "beige", "white"],
                fits: ["cap", "beanie", "bucket"],
            },
            {
                id: "belt",
                type: "belt",
                icon: "👔",
                colors: ["black", "brown", "tan"],
                fits: ["leather", "canvas", "woven"],
            },
            {
                id: "bag",
                type: "bag",
                icon: "🎒",
                colors: ["black", "navy", "grey", "brown"],
                fits: ["backpack", "messenger", "tote", "duffel"],
            },
            {
                id: "scarf",
                type: "scarf",
                icon: "🧣",
                colors: ["black", "grey", "navy", "burgundy", "camel"],
                fits: ["regular"],
            },
            {
                id: "sunglasses",
                type: "sunglasses",
                icon: "🕶️",
                colors: ["black", "tortoise", "silver", "gold"],
                fits: ["aviator", "wayfarer", "round", "rectangular"],
            },
            {
                id: "watch",
                type: "watch",
                icon: "⌚",
                colors: ["silver", "gold", "black", "brown"],
                fits: ["leather", "metal", "nato"],
            },
            {
                id: "gloves",
                type: "gloves",
                icon: "🧤",
                colors: ["black", "brown", "grey", "navy"],
                fits: ["leather", "knit"],
            },
            {
                id: "tie",
                type: "tie",
                icon: "👔",
                colors: ["navy", "burgundy", "black", "grey", "red"],
                fits: ["regular", "slim"],
            },
            {
                id: "pocket-square",
                type: "pocket square",
                icon: "🎩",
                colors: ["white", "navy", "burgundy", "grey"],
                fits: ["regular"],
            },
            {
                id: "socks",
                type: "socks",
                icon: "🧦",
                colors: ["black", "white", "navy", "grey"],
                fits: ["ankle", "crew", "dress"],
            },
        ],
    },
];

const COLOR_MAP = {
    black: "#000000",
    white: "#FFFFFF",
    grey: "#808080",
    charcoal: "#36454F",
    silver: "#C0C0C0",
    navy: "#000080",
    blue: "#2563EB",
    "light blue": "#93C5FD",
    denim: "#1E3A8A",
    red: "#DC2626",
    burgundy: "#991B1B",
    maroon: "#7F1D1D",
    pink: "#FFC0CB",
    green: "#16A34A",
    olive: "#65A30D",
    forest: "#228B22",
    brown: "#92400E",
    tan: "#D2B48C",
    beige: "#D4A574",
    khaki: "#C7B299",
    camel: "#C19A6B",
    tortoise: "#8B4513",
    cream: "#FFFDD0",
    ivory: "#FFFFF0",
    lavender: "#E6E6FA",
    gold: "#FFD700",
    orange: "#FB923C",
    yellow: "#FDE047",
    purple: "#9333EA",
};

export default function WardrobeShoppingFlow({ onSave }: { onSave: (items: any[]) => Promise<void> }) {
    const [cart, setCart] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [customItemName, setCustomItemName] = useState("");
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [customColor, setCustomColor] = useState("");
    const [customColorHex, setCustomColorHex] = useState("#000000");
    const [selectedFits, setSelectedFits] = useState<string[]>([]);
    const [customFit, setCustomFit] = useState("");
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Interfaces
    interface CategoryItem {
        id: string;
        type: string;
        icon: string;
        colors: string[];
        fits: string[];
    }

    // Open item selection modal
    const openItemModal = (item: CategoryItem, categoryId: string, isCustom: boolean = false): void => {
        setSelectedItem({ ...item, categoryId, isCustom });
        setCustomItemName(isCustom ? "" : item.type);
        setSelectedColors([]);
        setCustomColor("");
        setCustomColorHex("#000000");
        setSelectedFits([]);
        setCustomFit("");
        setNotes("");
    };

    // Toggle selection
    const toggleSelection = <T,>(value: T, list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>): void => {
        if (list.includes(value)) {
            setList(list.filter((v: T) => v !== value));
        } else {
            setList([...list, value]);
        }
    };

    const addCustomColor = () => {
        if (customColor.trim()) {
            setSelectedColors([...selectedColors, customColor.trim().toLowerCase()]);
            setCustomColor("");
        }
    };

    const addCustomFit = () => {
        if (customFit.trim()) {
            setSelectedFits([...selectedFits, customFit.trim().toLowerCase()]);
            setCustomFit("");
        }
    };

    const addToCart = () => {
        const itemType = selectedItem.isCustom ? customItemName.trim() : selectedItem.type;

        if (!itemType) return;
        if (selectedColors.length === 0 || selectedFits.length === 0) return;

        const newItems: Array<any> = [];
        selectedColors.forEach((color) => {
            selectedFits.forEach((fit) => {
                newItems.push({
                    id: `${selectedItem.id}-${color}-${fit}-${Date.now()}-${Math.random()}`,
                    category: selectedItem.categoryId,
                    type: itemType,
                    color,
                    color_code: COLOR_MAP[color as keyof typeof COLOR_MAP] || customColorHex,
                    fit,
                    notes: notes.trim(),
                    icon: selectedItem.icon,
                });
            });
        });

        setCart([...cart, ...newItems]);
        setSelectedItem(null);
    };

    const removeFromCart = (id: string): void => {
        setCart(cart.filter((item) => item.id !== id));
    };

    const saveToWardrobe = async () => {
        if (cart.length === 0) return;
        setIsSaving(true);
        try {
            await onSave(cart);
            setCart([]);
        } catch (error) {
            console.error("Error saving to wardrobe:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const currentCategory = CATEGORIES.find((c) => c.id === selectedCategory);

    return (
        <div className="min-h-screen p-4 sm:p-6 bg-background">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Add New Items</h1>
                    <p className="text-muted-foreground">
                        {selectedCategory
                            ? "Select items to customize and add to your cart."
                            : "Choose a category to get started."}
                    </p>
                </div>

                {/* Back Button */}
                {selectedCategory && (
                    <Button
                        variant="ghost"
                        className="mb-6 -ml-2 gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setSelectedCategory(null)}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Categories
                    </Button>
                )}

                {/* Categories Grid */}
                {!selectedCategory && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {CATEGORIES.map((category) => (
                            <Card
                                key={category.id}
                                className="cursor-pointer transition-all hover:border-primary hover:shadow-md hover:bg-accent/50 group"
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-6 gap-4 h-full">
                                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                                        {category.icon}
                                    </span>
                                    <span className="font-semibold text-center">{category.name}</span>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Items Grid */}
                {selectedCategory && currentCategory && (
                    <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 animate-in fade-in duration-500">
                        {currentCategory.items.map((item) => (
                            <Card
                                key={item.id}
                                className="cursor-pointer transition-all hover:border-primary hover:shadow-md hover:bg-accent/50"
                                onClick={() => openItemModal(item, currentCategory.id, false)}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                                    <span className="text-4xl">{item.icon}</span>
                                    <span className="text-sm font-medium text-center capitalize">{item.type}</span>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Custom Item Button */}
                        <button
                            onClick={() =>
                                openItemModal(
                                    { id: "custom", type: "custom", icon: currentCategory.icon, colors: [], fits: [] },
                                    currentCategory.id,
                                    true
                                )
                            }
                            className="flex flex-col items-center justify-center p-6 gap-3 border-2 border-dashed rounded-xl hover:border-primary hover:bg-accent/50 transition-colors"
                        >
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <Plus className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">Custom Item</span>
                        </button>
                    </div>
                )}

                {/* Cart Section */}
                {cart.length > 0 && (
                    <Card className="mt-12 border-primary/20">
                        <div className="p-6 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <ShoppingCart className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Shopping Cart</h2>
                                    <p className="text-sm text-muted-foreground">{cart.length} items ready to save</p>
                                </div>
                            </div>
                            <Button onClick={saveToWardrobe} disabled={isSaving} className="w-full sm:w-auto">
                                {isSaving ? "Saving..." : "Save to Wardrobe"}
                            </Button>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-muted/10">
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-background border rounded-lg shadow-sm"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className="text-xl shrink-0">{item.icon}</span>
                                        <div className="min-w-0">
                                            <div className="font-medium text-sm truncate capitalize">
                                                {item.color} {item.fit} {item.type}
                                            </div>
                                            {item.notes && (
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {item.notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>

            {/* Item Config Dialog */}
            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="sm:max-w-[600px] max-h-[75vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="p-6 pb-4 border-b">
                        <div className="flex items-center gap-4">
                            <div className="text-4xl bg-muted/30 p-2 rounded-lg">{selectedItem?.icon}</div>
                            <div className="flex-1">
                                <DialogTitle className="text-xl">
                                    {selectedItem?.isCustom ? (
                                        "Add Custom Item"
                                    ) : (
                                        <span className="capitalize">{selectedItem?.type}</span>
                                    )}
                                </DialogTitle>
                                <DialogDescription>
                                    Configure the details to generate specific wardrobe items.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <ScrollArea className="flex-1 p-6 overflow-y-auto">
                        <div className="space-y-8">
                            {selectedItem?.isCustom && (
                                <div className="space-y-3">
                                    <Label>Item Name</Label>
                                    <Input
                                        value={customItemName}
                                        onChange={(e) => setCustomItemName(e.target.value)}
                                        placeholder="e.g. Vintage Leather Jacket"
                                        className="text-lg"
                                    />
                                </div>
                            )}

                            {/* Colors Section */}
                            <div className="space-y-3">
                                <Label>Select Colors</Label>
                                {!selectedItem?.isCustom && selectedItem?.colors.length > 0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {selectedItem.colors.map((color: any) => {
                                            const isSelected = selectedColors.includes(color);
                                            return (
                                                <div
                                                    key={color}
                                                    onClick={() =>
                                                        toggleSelection(color, selectedColors, setSelectedColors)
                                                    }
                                                    className={cn(
                                                        "cursor-pointer flex items-center gap-2 p-2 border rounded-md transition-all hover:bg-accent",
                                                        isSelected
                                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                            : "border-input"
                                                    )}
                                                >
                                                    <div
                                                        className="w-4 h-4 rounded-full border shadow-sm shrink-0"
                                                        style={{
                                                            backgroundColor:
                                                                COLOR_MAP[color as keyof typeof COLOR_MAP] || "#CCCCCC",
                                                        }}
                                                    />
                                                    <span className="text-xs font-medium capitalize truncate">
                                                        {color}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Custom Color Input */}
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Palette className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={customColor}
                                            onChange={(e) => setCustomColor(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && addCustomColor()}
                                            placeholder="Add custom color..."
                                            className="pl-9"
                                        />
                                    </div>
                                    <div className="flex items-center justify-center border rounded-md w-10 bg-background">
                                        <input
                                            type="color"
                                            value={customColorHex}
                                            onChange={(e) => setCustomColorHex(e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                        />
                                    </div>
                                    <Button variant="secondary" onClick={addCustomColor}>
                                        Add
                                    </Button>
                                </div>

                                {/* Selected Tags */}
                                {selectedColors.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {selectedColors.map((color) => (
                                            <Badge
                                                key={color}
                                                variant="secondary"
                                                className="gap-1 pl-2 pr-1 py-1 text-xs uppercase tracking-wider"
                                            >
                                                <div
                                                    className="w-2 h-2 rounded-full mr-1 border"
                                                    style={{
                                                        backgroundColor:
                                                            COLOR_MAP[color as keyof typeof COLOR_MAP] || "#ccc",
                                                    }}
                                                />
                                                {color}
                                                <X
                                                    className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive"
                                                    onClick={() =>
                                                        setSelectedColors(selectedColors.filter((c) => c !== color))
                                                    }
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Fits Section */}
                            <div className="space-y-3">
                                <Label>Select Fits</Label>
                                {!selectedItem?.isCustom && selectedItem?.fits.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedItem.fits.map((fit: any) => {
                                            const isSelected = selectedFits.includes(fit);
                                            return (
                                                <Button
                                                    key={fit}
                                                    variant={isSelected ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => toggleSelection(fit, selectedFits, setSelectedFits)}
                                                    className="capitalize"
                                                >
                                                    {fit}
                                                    {isSelected && <Check className="w-3 h-3 ml-2" />}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Input
                                        value={customFit}
                                        onChange={(e) => setCustomFit(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && addCustomFit()}
                                        placeholder="Add custom fit (e.g. Athletic)..."
                                    />
                                    <Button variant="secondary" onClick={addCustomFit}>
                                        Add
                                    </Button>
                                </div>

                                {selectedFits.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {selectedFits.map((fit) => (
                                            <Badge key={fit} variant="outline" className="gap-1 pr-1 py-1">
                                                {fit}
                                                <X
                                                    className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive"
                                                    onClick={() =>
                                                        setSelectedFits(selectedFits.filter((f) => f !== fit))
                                                    }
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Label>Notes (Optional)</Label>
                                <Input
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="e.g. Waterproof, Wool blend..."
                                />
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="px-6 py-2 rounded-lg border-t bg-muted/20">
                        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-muted-foreground order-2 sm:order-1">
                                {selectedColors.length > 0 && selectedFits.length > 0 ? (
                                    <span>
                                        Generates <strong>{selectedColors.length * selectedFits.length}</strong> items
                                    </span>
                                ) : (
                                    <span>Select colors and fits</span>
                                )}
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedItem(null)}
                                    className="flex-1 sm:flex-none"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={selectedColors.length === 0 || selectedFits.length === 0}
                                    onClick={addToCart}
                                    className="flex-1 sm:flex-none"
                                >
                                    Add to Cart
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
