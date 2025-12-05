import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listClothing,
  createClothing,
  deleteClothing,
  updateClothing,
} from "@/services/clothing";
import type { ClothingItem } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import WardrobeShoppingFlow from "@/components/WardrobeShoppingcart";
import WardrobeCardView from "@/components/WardrobeCardView";
import WardrobeEditModal from "@/components/WardrobeEditModal";

type ClothingForm = Omit<ClothingItem, "_id">;

export default function ClothingListPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["clothing"],
    queryFn: listClothing,
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClothingItem | null>(null);

  const createMut = useMutation({
    mutationFn: (p: ClothingForm) => createClothing(p),
    onSuccess: () => {
      toast.success("Hinzugefügt");
      qc.invalidateQueries({ queryKey: ["clothing"] });
      setOpen(false);
    },
    onError: (e) =>
      toast.error(
        `Fehler: ${e instanceof Error ? e.message : "Unbekannter Fehler"}`
      ),
  });

  const updateMut = useMutation({
    mutationFn: (p: Partial<ClothingItem>) => updateClothing(p._id || "", p),
    onSuccess: () => {
      toast.success("Aktualisiert");
      qc.invalidateQueries({ queryKey: ["clothing"] });
      setEditing(null);
      setOpen(false);
    },
    onError: (e) => {
      console.error("Update error:", e);
      toast.error(
        `Fehler: ${e instanceof Error ? e.message : "Unbekannter Fehler"}`
      );
    },
  });

  const delMut = useMutation({
    mutationFn: deleteClothing,
    onSuccess: () => {
      toast.success("Gelöscht");
      qc.invalidateQueries({ queryKey: ["clothing"] });
    },
    onError: (e) =>
      toast.error(
        `Fehler: ${e instanceof Error ? e.message : "Unbekannter Fehler"}`
      ),
  });

  function onOpenEdit(item: ClothingItem) {
    setEditing(item);
  }

  const handleEditSave = (updates: Partial<ClothingItem>) => {
    console.log("Saving updates:", updates);
    updateMut.mutate(updates);
  };

  // Handler for bulk saving from shopping cart
  const handleBulkSave = async (cartItems: any[]) => {
    const promises = cartItems.map((item) =>
      createMut.mutateAsync({
        category: item.category,
        type: item.type,
        color: item.color,
        color_code: item.color_code || "",
        fit: item.fit,
        material: item.material || "",
        icon_id: item.icon_id,
        seasons: [], // No longer using seasons
        notes: item.notes || "",
        image_url: "",
      })
    );

    try {
      await Promise.all(promises);
      toast.success(`✅ Added ${cartItems.length} items to your wardrobe!`);
      qc.invalidateQueries({ queryKey: ["clothing"] });
    } catch (error) {
      toast.error("Failed to save some items");
      throw error;
    }
  };

  return (
    <div className="px-2">
      <Tabs defaultValue="my-wardrobe">
        <TabsList>
          <TabsTrigger value="my-wardrobe">My Wardrobe</TabsTrigger>
          <TabsTrigger value="quick-add">Quick Add</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-add">
          <WardrobeShoppingFlow onSave={handleBulkSave} />
        </TabsContent>

        <TabsContent value="my-wardrobe">
          <WardrobeCardView
            items={data}
            isLoading={isLoading}
            onEdit={onOpenEdit}
            onDelete={(id: string) => delMut.mutate(id)}
          />
        </TabsContent>
      </Tabs>
      {/* Edit Modal */}
      <WardrobeEditModal
        item={editing}
        open={!!editing}
        onClose={() => setEditing(null)}
        onSave={handleEditSave}
      />
    </div>
  );
}
