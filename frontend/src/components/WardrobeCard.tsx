import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ClothingItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

const COLOR_MAP = {
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

export const WardrobeCard = ({
    item,
    onEdit,
    onDelete,
    getCategoryIcon,
    getColorHex,
}: {
    item: ClothingItem;
    onEdit: (item: ClothingItem) => void;
    onDelete: (id: string) => void;
    getCategoryIcon: (category: string) => React.ReactNode;
    getColorHex: (color: string) => string;
}) => (
    <Card
        key={item._id}
        className="group bg-muted relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
        <div className="aspect-[4/3] w-full overflow-hidden rounded-t-lg">
            {item.image_url ? (
                <img
                    src={item.image_url}
                    alt={`${item.type} - ${item.color}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <div className="text-8xl text-muted-foreground p-8 rounded-[10rem]">
                        {getCategoryIcon(item.category)}
                    </div>
                </div>
            )}
        </div>
        <CardContent className="p-4">
            <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-semibold capitalize leading-tight">{item.type}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                    </div>
                    <Badge variant="default" className="capitalize">
                        {item.fit}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className="h-5 w-5 shrink-0 rounded-full border-2 border-border"
                        style={{
                            backgroundColor: item.color_code ? item.color_code : getColorHex(item.color),
                        }}
                    />
                    <span className="text-sm font-medium capitalize">{item.color}</span>
                </div>
                {item.seasons && item.seasons.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {item.seasons.map((season) => (
                            <Badge key={season} variant="default" className="text-xs capitalize">
                                {season}
                            </Badge>
                        ))}
                    </div>
                )}
                {item.notes && <p className="text-sm italic text-muted-foreground line-clamp-2">{item.notes}</p>}
            </div>
        </CardContent>
        <CardFooter className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between border-t bg-background/95 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item)}
                className="cursor-pointer flex-1 gap-1 text-xs hover:bg-muted"
            >
                <Edit className="h-3 w-3" />
                Edit
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(item._id)}
                className="cursor-pointer flex-1 gap-1 text-xs text-destructive hover:bg-muted hover:text-destructive"
            >
                <Trash2 className="h-3 w-3" />
                Delete
            </Button>
        </CardFooter>
    </Card>
);
