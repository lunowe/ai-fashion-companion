// components/WardrobeCard.tsx
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
import { ClothingIcon } from "@/lib/icons";

interface WardrobeCardProps {
  item: ClothingItem;
  onEdit: (item: ClothingItem) => void;
  onDelete: (id: string) => void;
  getColorHex: (color: string) => string;
}

export const WardrobeCard = ({
  item,
  onEdit,
  onDelete,
  getColorHex,
}: WardrobeCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const colorHex = item.color_code || getColorHex(item.color);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
          {/* Image / Icon Area */}
          <div className="aspect-[4/3] w-full overflow-hidden rounded-t-lg">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={`${item.type} - ${item.color}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-4">
                <ClothingIcon
                  iconId={item.icon_id}
                  color={colorHex}
                  containerClassName="w-32 h-32"
                  strokeColor="#ffffff"
                  strokeWidth={2}
                  className="text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors"
                />
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              {/* Title & Fit */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold capitalize leading-tight truncate">
                    {item.type}
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {item.category}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize shrink-0">
                  {item.fit}
                </Badge>
              </div>

              {/* Color */}
              <div className="flex items-center gap-2">
                <div
                  className="h-5 w-5 shrink-0 rounded-full border-2 border-border shadow-sm"
                  style={{ backgroundColor: colorHex }}
                />
                <span className="text-sm font-medium capitalize">
                  {item.color}
                </span>
              </div>

              {/* Seasons */}
              {item.seasons && item.seasons.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.seasons.map((season) => (
                    <Badge
                      key={season}
                      variant="secondary"
                      className="text-xs capitalize"
                    >
                      {season}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Notes */}
              {item.notes && (
                <p className="text-sm italic text-muted-foreground line-clamp-2">
                  {item.notes}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </DrawerTrigger>

      {/* Mobile Drawer Detail View */}
      <DrawerContent className="h-[75vh] px-4">
        <DrawerHeader className="text-left px-0">
          <DrawerTitle className="text-2xl font-bold capitalize">
            {item.type}
          </DrawerTitle>
          <DrawerDescription className="text-lg capitalize">
            {item.category}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col h-full overflow-y-auto pb-8">
          {/* Large Image / Icon */}
          <div className="aspect-square w-full relative overflow-hidden rounded-lg mb-6">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={`${item.type} - ${item.color}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg">
                <ClothingIcon
                  iconId={item.icon_id}
                  color={colorHex}
                  strokeColor="#000000"
                  containerClassName="w-64 h-64"
                  strokeWidth={3}
                  className="text-muted-foreground/30"
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Color
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-full border-2 border-border shadow-sm"
                    style={{ backgroundColor: colorHex }}
                  />
                  <span className="capitalize">{item.color}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Fit
                </span>
                <div>
                  <Badge
                    variant="outline"
                    className="capitalize text-base py-1 px-3"
                  >
                    {item.fit}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Seasons */}
            {item.seasons && item.seasons.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Seasons
                </span>
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

            {/* Notes */}
            {item.notes && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Notes
                </span>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="italic text-muted-foreground">{item.notes}</p>
                </div>
              </div>
            )}

            {/* Actions */}
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
