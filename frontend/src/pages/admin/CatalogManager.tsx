import { useState, useEffect } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Define your types
interface CatalogItem {
  _id?: string;
  category: string;
  type: string;
  icon: string;
  allowed_colors: string[];
  allowed_fits: string[];
  allowed_materials: string[];
}

export default function CatalogManager() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  // Mock API Call - Replace with your fetch('/api/catalog')
  useEffect(() => {
    // fetchCatalog().then(setItems);
    setItems([
      {
        _id: "1",
        category: "tops",
        type: "t-shirt",
        icon: "👕",
        allowed_colors: ["black", "white"],
        allowed_fits: ["slim"],
        allowed_materials: ["cotton"],
      },
    ]);
  }, []);

  const handleSave = async (item: CatalogItem) => {
    // await api.post('/catalog', item);
    console.log("Saving to DB:", item);
    setEditingItem(null);
  };

  const ArrayInput = ({
    label,
    values,
    onChange,
  }: {
    label: string;
    values: string[];
    onChange: (v: string[]) => void;
  }) => {
    const [input, setInput] = useState("");

    const add = () => {
      if (input && !values.includes(input)) {
        onChange([...values, input.toLowerCase()]);
        setInput("");
      }
    };

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder={`Add ${label}...`}
          />
          <Button onClick={add} type="button" size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {values.map((v) => (
            <Badge
              key={v}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive/20"
              onClick={() => onChange(values.filter((x) => x !== v))}
            >
              {v} <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ontology Admin</h1>
        <Button
          onClick={() =>
            setEditingItem({
              category: "tops",
              type: "",
              icon: "👕",
              allowed_colors: [],
              allowed_fits: [],
              allowed_materials: [],
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add Item Definition
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item._id} className="relative group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {item.category}
              </CardTitle>
              <span className="text-2xl">{item.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize mb-2">
                {item.type}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  {item.allowed_colors.length} Colors •{" "}
                  {item.allowed_fits.length} Fits
                </p>
                <p>{item.allowed_materials.length} Materials</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => setEditingItem(item)}
              >
                Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal/Form Area */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Item Ontology</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={editingItem.category}
                    onValueChange={(v) =>
                      setEditingItem({ ...editingItem, category: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "tops",
                        "bottoms",
                        "outerwear",
                        "shoes",
                        "accessories",
                      ].map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Item Type Name</Label>
                  <Input
                    value={editingItem.type}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, type: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emoji Icon</Label>
                  <Input
                    value={editingItem.icon}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, icon: e.target.value })
                    }
                  />
                </div>
              </div>

              <ArrayInput
                label="Allowed Colors"
                values={editingItem.allowed_colors}
                onChange={(v) =>
                  setEditingItem({ ...editingItem, allowed_colors: v })
                }
              />
              <ArrayInput
                label="Allowed Fits"
                values={editingItem.allowed_fits}
                onChange={(v) =>
                  setEditingItem({ ...editingItem, allowed_fits: v })
                }
              />
              <ArrayInput
                label="Materials"
                values={editingItem.allowed_materials}
                onChange={(v) =>
                  setEditingItem({ ...editingItem, allowed_materials: v })
                }
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleSave(editingItem)}>
                  <Save className="w-4 h-4 mr-2" /> Save Definition
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
