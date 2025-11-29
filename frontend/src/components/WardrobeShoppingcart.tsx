import { useState } from "react";
import { ShoppingCart, Plus, X, Check, ArrowLeft, Palette } from "lucide-react";

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
    // Neutrals
    black: "#000000",
    white: "#FFFFFF",
    grey: "#808080",
    charcoal: "#36454F",
    silver: "#C0C0C0",

    // Blues
    navy: "#000080",
    blue: "#2563EB",
    "light blue": "#93C5FD",
    denim: "#1E3A8A",

    // Reds & Pinks
    red: "#DC2626",
    burgundy: "#991B1B",
    maroon: "#7F1D1D",
    pink: "#FFC0CB",

    // Greens
    green: "#16A34A",
    olive: "#65A30D",
    forest: "#228B22",

    // Earth Tones
    brown: "#92400E",
    tan: "#D2B48C",
    beige: "#D4A574",
    khaki: "#C7B299",
    camel: "#C19A6B",
    tortoise: "#8B4513",

    // Pastels & Light
    cream: "#FFFDD0",
    ivory: "#FFFFF0",
    lavender: "#E6E6FA",

    // Metallics
    gold: "#FFD700",

    // Bright Colors
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

    // Open item selection modal
    interface CategoryItem {
        id: string;
        type: string;
        icon: string;
        colors: string[];
        fits: string[];
    }

    interface SelectedItemData extends CategoryItem {
        categoryId: string;
        isCustom: boolean;
    }

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

    // Add custom color
    const addCustomColor = () => {
        if (customColor.trim()) {
            setSelectedColors([...selectedColors, customColor.trim().toLowerCase()]);
            setCustomColor("");
        }
    };

    // Add custom fit
    const addCustomFit = () => {
        if (customFit.trim()) {
            setSelectedFits([...selectedFits, customFit.trim().toLowerCase()]);
            setCustomFit("");
        }
    };

    // Add selected variants to cart
    const addToCart = () => {
        const itemType = selectedItem.isCustom ? customItemName.trim() : selectedItem.type;

        if (!itemType) {
            alert("Please enter an item name");
            return;
        }

        if (selectedColors.length === 0 || selectedFits.length === 0) {
            alert("Please select at least one color and one fit");
            return;
        }

        const newItems: Array<{
            id: string;
            category: string;
            type: string;
            color: string;
            color_code: string;
            fit: string;
            notes: string;
            icon: string;
        }> = [];
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
        setCustomItemName("");
        setSelectedColors([]);
        setCustomColor("");
        setSelectedFits([]);
        setCustomFit("");
        setNotes("");
    };

    // Remove item from cart
    const removeFromCart = (id: string): void => {
        setCart(cart.filter((item) => item.id !== id));
    };

    // Save all to wardrobe
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

    // Reset to category view
    const backToCategories = () => {
        setSelectedCategory(null);
    };

    // Current view
    const currentCategory = CATEGORIES.find((c) => c.id === selectedCategory);

    return (
        <div className="max-h-screen p-4 bg-background">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Add New Items To Your Wardrobe</h1>
                        <p className="text-sm text-muted-foreground">
                            {selectedCategory
                                ? "Select an item or add a custom one"
                                : "Choose a category to get started"}
                        </p>
                    </div>
                </div>

                {/* Back button when in category view */}
                {selectedCategory && (
                    <button
                        onClick={backToCategories}
                        className="cursor-pointer flex items-center gap-2 mb-4 text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Categories
                    </button>
                )}

                {/* Categories Grid */}
                {!selectedCategory && (
                    <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-3 md:grid-cols-5">
                        {CATEGORIES.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className="cursor-pointer flex flex-col items-center gap-3 p-8 transition-all bg-white border-2 rounded-lg dark:bg-card hover:border-primary hover:shadow-lg"
                            >
                                <span className="text-6xl">{category.icon}</span>
                                <span className="text-base font-semibold">{category.name}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Items Grid (when category selected) */}
                {selectedCategory && currentCategory && (
                    <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {currentCategory.items.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => openItemModal(item, currentCategory.id, false)}
                                className="cursor-pointer flex flex-col items-center gap-2 p-6 transition-all bg-white border-2 rounded-lg dark:bg-card hover:border-primary hover:shadow-lg"
                            >
                                <span className="text-5xl">{item.icon}</span>
                                <span className="text-sm font-medium text-center capitalize">{item.type}</span>
                            </button>
                        ))}

                        {/* Custom Item Slot */}
                        <button
                            onClick={() =>
                                openItemModal(
                                    {
                                        id: "custom",
                                        type: "custom",
                                        icon: currentCategory.icon,
                                        colors: [],
                                        fits: [],
                                    },
                                    currentCategory.id,
                                    true
                                )
                            }
                            className="cursor-pointer flex flex-col items-center gap-2 p-6 transition-all border-2 border-dashed rounded-lg bg-muted/50 hover:border-primary hover:bg-muted"
                        >
                            <Plus className="w-12 h-12 text-muted-foreground" />
                            <span className="text-sm font-medium text-center text-muted-foreground">Custom Item</span>
                        </button>
                    </div>
                )}

                {/* Cart */}
                {cart.length > 0 && (
                    <div className="p-4 border rounded-lg bg-card">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5" />
                                <h2 className="text-lg font-semibold">Cart ({cart.length} items)</h2>
                            </div>
                            <button
                                onClick={saveToWardrobe}
                                className="cursor-pointer px-4 py-2 text-sm font-medium transition-colors rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Save All to Wardrobe
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 border rounded-lg bg-background"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{item.icon}</span>
                                        <div className="text-sm">
                                            <div className="font-medium capitalize">
                                                {item.color} {item.fit} {item.type}
                                            </div>
                                            {item.notes && (
                                                <div className="text-xs text-muted-foreground italic">{item.notes}</div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="cursor-pointer p-1 transition-colors rounded hover:bg-destructive/10"
                                    >
                                        <X className="w-4 h-4 text-destructive" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Item Selection Modal */}
                {selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="w-full max-w-2xl p-6 rounded-lg shadow-xl bg-card max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">{selectedItem.icon}</span>
                                    <div>
                                        {selectedItem.isCustom ? (
                                            <input
                                                type="text"
                                                value={customItemName}
                                                onChange={(e) => setCustomItemName(e.target.value)}
                                                placeholder="Enter item name (e.g., puffer jacket)"
                                                className="w-full p-2 text-xl font-bold border-2 rounded-lg border-border focus:border-primary focus:outline-none"
                                            />
                                        ) : (
                                            <h2 className="text-2xl font-bold capitalize">{selectedItem.type}</h2>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Select colors and fits to add
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="cursor-pointer p-2 transition-colors rounded-lg hover:bg-muted"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Colors */}
                            <div className="mb-6">
                                <h3 className="mb-3 font-semibold">Colors (select multiple)</h3>

                                {/* Preset Colors */}
                                {!selectedItem.isCustom && selectedItem.colors.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mb-3 sm:grid-cols-4">
                                        {selectedItem.colors.map((color: any) => (
                                            <button
                                                key={color}
                                                onClick={() =>
                                                    toggleSelection(color, selectedColors, setSelectedColors)
                                                }
                                                className={`cursor-pointer flex items-center gap-2 p-3 border-2 rounded-lg transition-all ${
                                                    selectedColors.includes(color)
                                                        ? "border-primary bg-primary/10"
                                                        : "border-border hover:border-primary/50"
                                                }`}
                                            >
                                                <div
                                                    className="w-6 h-6 border-2 rounded-full border-border"
                                                    style={{
                                                        backgroundColor:
                                                            COLOR_MAP[color as keyof typeof COLOR_MAP] || "#CCCCCC",
                                                    }}
                                                />
                                                <span className="text-sm font-medium capitalize">{color}</span>
                                                {selectedColors.includes(color) && (
                                                    <Check className="w-4 h-4 ml-auto text-primary" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Custom Color Input */}
                                <div className="p-3 border-2 border-dashed rounded-lg border-border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Palette className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Add Custom Color</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={customColor}
                                            onChange={(e) => setCustomColor(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && addCustomColor()}
                                            placeholder="e.g., sage green"
                                            className="flex-1 p-2 text-sm border rounded-lg border-border focus:border-primary focus:outline-none"
                                        />
                                        <input
                                            type="color"
                                            value={customColorHex}
                                            onChange={(e) => setCustomColorHex(e.target.value)}
                                            className="w-12 h-10 border rounded-lg cursor-pointer border-border"
                                        />
                                        <button
                                            onClick={addCustomColor}
                                            className="cursor-pointer px-3 py-2 text-sm font-medium transition-colors rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* Selected Colors Display */}
                                {selectedColors.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {selectedColors.map((color) => (
                                            <div
                                                key={color}
                                                className="flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary"
                                            >
                                                <span className="capitalize">{color}</span>
                                                <button
                                                    onClick={() =>
                                                        setSelectedColors(selectedColors.filter((c) => c !== color))
                                                    }
                                                    className="cursor-pointer hover:text-primary/70"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Fits */}
                            <div className="mb-6">
                                <h3 className="mb-3 font-semibold">Fits (select multiple)</h3>

                                {/* Preset Fits */}
                                {!selectedItem.isCustom && selectedItem.fits.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-3">
                                        {selectedItem.fits.map((fit: any) => (
                                            <button
                                                key={fit}
                                                onClick={() => toggleSelection(fit, selectedFits, setSelectedFits)}
                                                className={`cursor-pointer flex items-center justify-between p-3 border-2 rounded-lg transition-all ${
                                                    selectedFits.includes(fit)
                                                        ? "border-primary bg-primary/10"
                                                        : "border-border hover:border-primary/50"
                                                }`}
                                            >
                                                <span className="text-sm font-medium capitalize">{fit}</span>
                                                {selectedFits.includes(fit) && (
                                                    <Check className="w-4 h-4 text-primary" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Custom Fit Input */}
                                <div className="p-3 border-2 border-dashed rounded-lg border-border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Plus className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Add Custom Fit</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={customFit}
                                            onChange={(e) => setCustomFit(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && addCustomFit()}
                                            placeholder="e.g., athletic fit"
                                            className="flex-1 p-2 text-sm border rounded-lg border-border focus:border-primary focus:outline-none"
                                        />
                                        <button
                                            onClick={addCustomFit}
                                            className="cursor-pointer 3px-3 py-2 text-sm font-medium transition-colors rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* Selected Fits Display */}
                                {selectedFits.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {selectedFits.map((fit) => (
                                            <div
                                                key={fit}
                                                className="flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary"
                                            >
                                                <span className="capitalize">{fit}</span>
                                                <button
                                                    onClick={() =>
                                                        setSelectedFits(selectedFits.filter((f) => f !== fit))
                                                    }
                                                    className="cursor-pointer hover:text-primary/70"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            <div className="mb-6">
                                <h3 className="mb-3 font-semibold">Notes (optional)</h3>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="e.g., extra thick, wool blend, waterproof"
                                    className="w-full p-3 text-sm border-2 rounded-lg border-border focus:border-primary focus:outline-none"
                                />
                            </div>

                            {/* Summary */}
                            {selectedColors.length > 0 && selectedFits.length > 0 && (
                                <div className="p-3 mb-6 rounded-lg bg-muted">
                                    <p className="text-sm font-medium">
                                        This will add{" "}
                                        <span className="text-primary">
                                            {selectedColors.length * selectedFits.length} items
                                        </span>{" "}
                                        ({selectedColors.length} colors × {selectedFits.length} fits)
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="cursor-pointer flex-1 px-4 py-2 font-medium transition-colors border-2 rounded-lg border-border hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={addToCart}
                                    className="cursor-pointer flex-1 px-4 py-2 font-medium transition-colors rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
