import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ClothingItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
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
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                <Card
                    key={item._id}
                    className="group bg-muted relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
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
                            {item.notes && (
                                <p className="text-sm italic text-muted-foreground line-clamp-2">{item.notes}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="hidden md:flex items-center justify-between p-4 transition-all duration-300 md:absolute md:inset-x-0 md:bottom-0 md:translate-y-full md:opacity-0 md:border-t md:bg-background/95 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(item);
                            }}
                            className="cursor-pointer flex-1 gap-1 text-xs hover:bg-muted"
                        >
                            <Edit className="h-3 w-3" />
                            Edit
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item._id);
                            }}
                            className="cursor-pointer flex-1 gap-1 text-xs text-destructive hover:bg-muted hover:text-destructive"
                        >
                            <Trash2 className="h-3 w-3" />
                            Delete
                        </Button>
                    </CardFooter>
                </Card>
            </DrawerTrigger>
            <DrawerContent className="h-[75vh] px-4">
                <DrawerHeader className="text-left px-0">
                    <DrawerTitle className="text-2xl font-bold capitalize">{item.type}</DrawerTitle>
                    <DrawerDescription className="text-lg capitalize">{item.category}</DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col h-full overflow-y-auto pb-8">
                    <div className="aspect-square w-full relative overflow-hidden rounded-lg mb-6">
                        {item.image_url ? (
                            <img
                                src={item.image_url}
                                alt={`${item.type} - ${item.color}`}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted rounded-lg">
                                <div className="text-9xl text-muted-foreground">{getCategoryIcon(item.category)}</div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Color</span>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-6 w-6 rounded-full border-2 border-border"
                                        style={{
                                            backgroundColor: item.color_code
                                                ? item.color_code
                                                : getColorHex(item.color),
                                        }}
                                    />
                                    <span className="capitalize">{item.color}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Fit</span>
                                <div>
                                    <Badge variant="outline" className="capitalize text-base py-1 px-3">
                                        {item.fit}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {item.seasons && item.seasons.length > 0 && (
                            <div className="space-y-2">
                                <span className="text-sm font-medium text-muted-foreground">Seasons</span>
                                <div className="flex flex-wrap gap-2">
                                    {item.seasons.map((season) => (
                                        <Badge
                                            key={season}
                                            variant="secondary"
                                            className="capitalize text-sm py-1 px-3"
                                        >
                                            {season}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {item.notes && (
                            <div className="space-y-2">
                                <span className="text-sm font-medium text-muted-foreground">Notes</span>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="italic text-muted-foreground">{item.notes}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4 mt-auto">
                            <Button
                                className="flex-1 gap-2"
                                onClick={() => {
                                    setIsOpen(false);
                                    onEdit(item);
                                }}
                            >
                                <Edit className="w-4 h-4" />
                                Edit Item
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1 gap-2"
                                onClick={() => {
                                    setIsOpen(false);
                                    onDelete(item._id);
                                }}
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Item
                            </Button>
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
