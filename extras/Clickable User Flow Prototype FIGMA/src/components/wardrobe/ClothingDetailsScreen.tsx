import { Edit, Trash2, Heart, Eye } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useState } from "react";

interface ClothingDetailsScreenProps {
  item: any;
  onSeeOutfits: () => void;
  onMarkToGiveAway: () => void;
  onDelete: () => void;
  onBackToGallery: () => void;
}

const categories = ["Tops", "Bottoms", "Shoes", "Outerwear", "Accessories"];
const colors = ["Black", "White", "Blue", "Gray", "Brown", "Red", "Green", "Yellow", "Pink", "Purple"];
const seasons = ["All", "Spring", "Summer", "Fall", "Winter"];

export function ClothingDetailsScreen({ 
  item, 
  onSeeOutfits, 
  onMarkToGiveAway, 
  onDelete, 
  onBackToGallery 
}: ClothingDetailsScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(item);

  const handleSave = () => {
    // In a real app, this would save to database
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedItem(item);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between">
        <Button variant="ghost" onClick={onBackToGallery}>
          ← Back
        </Button>
        <Button
          variant="ghost"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="w-4 h-4 mr-2" />
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* Item Image */}
        <div className="aspect-square max-w-sm mx-auto rounded-lg overflow-hidden bg-muted">
          <ImageWithFallback
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Item Details */}
        <Card className="p-6 space-y-4">
          {isEditing ? (
            <>
              {/* Editable Fields */}
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={editedItem.name}
                  onChange={(e) => setEditedItem({...editedItem, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={editedItem.category} onValueChange={(value) => setEditedItem({...editedItem, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <Select value={editedItem.color} onValueChange={(value) => setEditedItem({...editedItem, color: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color} value={color}>{color}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Season</Label>
                  <Select value={editedItem.season} onValueChange={(value) => setEditedItem({...editedItem, season: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons.map((season) => (
                        <SelectItem key={season} value={season}>{season}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={editedItem.brand}
                    onChange={(e) => setEditedItem({...editedItem, brand: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="e.g., matches jeans perfectly, great for casual Fridays..."
                  value={editedItem.notes || ""}
                  onChange={(e) => setEditedItem({...editedItem, notes: e.target.value})}
                  rows={3}
                />
              </div>

              {/* Save/Cancel Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Display Mode */}
              <div className="space-y-3">
                <h1 className="text-xl">{item.name}</h1>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p>{item.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Color</p>
                    <p>{item.color}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Season</p>
                    <p>{item.season}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Brand</p>
                    <p>{item.brand}</p>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm mb-1">Last worn</p>
                  <p className="text-sm">{item.lastWorn}</p>
                </div>

                {item.notes && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Notes</p>
                    <p className="text-sm">{item.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={onSeeOutfits}
                  className="w-full"
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  See outfits with this item
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={onMarkToGiveAway}
                    variant="outline"
                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Give away
                  </Button>
                  
                  <Button 
                    onClick={onDelete}
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive/5"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}