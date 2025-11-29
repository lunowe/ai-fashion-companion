import { useState, useEffect } from "react";
import { X, Palette, Check } from "lucide-react";
import type { ClothingItem } from "@/types";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    { id: "tops", name: "Tops", icon: "👕" },
    { id: "sweaters", name: "Sweaters & Knits", icon: "🧶" },
    { id: "outerwear", name: "Outerwear", icon: "🧥" },
    { id: "bottoms", name: "Bottoms", icon: "👖" },
    { id: "shoes", name: "Shoes", icon: "👟" },
    { id: "accessories", name: "Accessories", icon: "🎩" },
];

const COMMON_COLORS = [
    "black",
    "white",
    "grey",
    "navy",
    "blue",
    "light blue",
    "red",
    "burgundy",
    "maroon",
    "green",
    "olive",
    "brown",
    "tan",
    "beige",
    "khaki",
    "camel",
    "charcoal",
    "silver",
];

const COMMON_FITS = ["slim", "regular", "oversized", "relaxed", "straight", "wide", "cropped", "tapered", "athletic"];

const COLOR_MAP: Record<string, string> = {
    black: "#000000",
    white: "#FFFFFF",
    grey: "#808080",
    gray: "#808080",
    navy: "#000080",
    red: "#DC2626",
    green: "#16A34A",
    blue: "#2563EB",
    "light blue": "#93C5FD",
    maroon: "#7F1D1D",
    burgundy: "#991B1B",
    olive: "#65A30D",
    beige: "#D4A574",
    brown: "#92400E",
    tan: "#D2B48C",
    khaki: "#C7B299",
    camel: "#C19A6B",
    charcoal: "#36454F",
    tortoise: "#8B4513",
    silver: "#C0C0C0",
};

interface WardrobeEditModalProps {
    item: ClothingItem | null;
    open: boolean;
    onClose: () => void;
    onSave: (updates: Partial<ClothingItem>) => void;
}

export default function WardrobeEditModal({ item, open, onClose, onSave }: WardrobeEditModalProps) {
    const [category, setCategory] = useState("");
    const [type, setType] = useState("");
    const [color, setColor] = useState("");
    const [colorCode, setColorCode] = useState("#000000");
    const [fit, setFit] = useState("");
    const [notes, setNotes] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    // Populate form when item changes
    useEffect(() => {
        if (item) {
            setCategory(item.category || "");
            setType(item.type || "");
            setColor(item.color || "");
            setColorCode(item.color_code || COLOR_MAP[item.color?.toLowerCase()] || "#000000");
            setFit(item.fit || "");
            setNotes(item.notes || "");
            setImageUrl(item.image_url || "");
        }
    }, [item]);

    const handleSave = () => {
        // Basic validation
        if (!type.trim() || !color.trim() || !fit.trim() || !category) {
            // You might want to use a toast here instead of alert in a real app
            alert("Please fill in all required fields (Category, Name, Color, Fit)");
            return;
        }

        onSave({
            category,
            type: type.trim(),
            color: color.trim(),
            color_code: colorCode,
            fit: fit.trim(),
            notes: notes.trim(),
            image_url: imageUrl.trim(),
        });
        onClose();
    };

    const getCategoryIcon = (catId: string) => {
        return CATEGORIES.find((c) => c.id === catId)?.icon || "👔";
    };

    // If using Dialog from shadcn, we handle the 'open' state via the root component
    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2 border-b">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 text-2xl bg-primary/10 rounded-full">
                            {getCategoryIcon(category)}
                        </div>
                        <div>
                            <DialogTitle>Edit Item</DialogTitle>
                            <DialogDescription>Update the details of your wardrobe item.</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-6">
                        {/* Category Selection */}
                        <div className="space-y-3">
                            <Label>Category</Label>
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                                {CATEGORIES.map((cat) => (
                                    <div
                                        key={cat.id}
                                        onClick={() => setCategory(cat.id)}
                                        className={cn(
                                            "cursor-pointer flex flex-col items-center justify-center gap-1 p-2 border rounded-md transition-all hover:bg-accent hover:text-accent-foreground",
                                            category === cat.id
                                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                : "border-input bg-card"
                                        )}
                                    >
                                        <span className="text-xl">{cat.icon}</span>
                                        <span className="text-xs font-medium text-center truncate w-full">
                                            {cat.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Item Name */}
                        <div className="space-y-3">
                            <Label htmlFor="item-name">Item Name</Label>
                            <Input
                                id="item-name"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                placeholder="e.g., Vintage T-Shirt"
                            />
                        </div>

                        {/* Color Selection */}
                        <div className="space-y-3">
                            <Label>Color</Label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {COMMON_COLORS.map((c) => {
                                    const isSelected = color === c;
                                    return (
                                        <div
                                            key={c}
                                            onClick={() => {
                                                setColor(c);
                                                setColorCode(COLOR_MAP[c] || "#CCCCCC");
                                            }}
                                            className={cn(
                                                "cursor-pointer flex items-center gap-2 p-2 border rounded-md transition-all hover:bg-accent",
                                                isSelected
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                    : "border-input"
                                            )}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full border shadow-sm shrink-0"
                                                style={{ backgroundColor: COLOR_MAP[c] || "#CCCCCC" }}
                                            />
                                            <span className="text-xs font-medium capitalize truncate">{c}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Custom Color Input */}
                            <div className="p-3 border border-dashed rounded-lg bg-muted/30">
                                <Label className="text-xs text-muted-foreground mb-2 block">Custom Color</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Palette className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            placeholder="e.g., Sage Green"
                                            className="pl-9 h-10"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 border rounded-md p-1 bg-background h-10 w-16 justify-center">
                                        <input
                                            type="color"
                                            value={colorCode}
                                            onChange={(e) => setColorCode(e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fit Selection */}
                        <div className="space-y-3">
                            <Label>Fit</Label>
                            <div className="flex flex-wrap gap-2">
                                {COMMON_FITS.map((f) => (
                                    <Button
                                        key={f}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFit(f)}
                                        className={cn(
                                            "capitalize",
                                            fit === f &&
                                                "border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                                        )}
                                    >
                                        {fit === f && <Check className="w-3 h-3 mr-1" />}
                                        {f}
                                    </Button>
                                ))}
                            </div>

                            <Input
                                value={fit}
                                onChange={(e) => setFit(e.target.value)}
                                placeholder="Or type a custom fit..."
                                className="mt-2"
                            />
                        </div>

                        {/* Image URL */}
                        <div className="space-y-3">
                            <Label htmlFor="image-url">Image URL (Optional)</Label>
                            <Input
                                id="image-url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-3">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Material details, care instructions, etc."
                                className="resize-none min-h-[80px]"
                            />
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="px-6 py-2 border-t mt-auto">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
