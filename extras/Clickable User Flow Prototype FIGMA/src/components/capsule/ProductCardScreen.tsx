import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface ProductCardScreenProps {
  item: string;
  onMarkOwned: () => void;
}

const productData: Record<string, any> = {
  'Navy Blazer': {
    image: 'https://images.unsplash.com/photo-1626872640220-e5f4454198b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXZ5JTIwYmxhemVyJTIwbWVuc3dlYXJ8ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    material: {
      title: 'Material',
      content: 'Look for wool (all-season) or linen blends (for summer). Avoid polyester.'
    },
    cut: {
      title: 'Cut',
      content: 'Should fit snugly around the shoulders, and the button at the waist should close easily.'
    },
    outfits: [
      { name: 'With T-shirt', image: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNoaXJ0JTIwb3V0Zml0fGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
      { name: 'With Shirt', image: 'https://images.unsplash.com/photo-1618453292459-53424b66bb6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHQtc2hpcnQlMjBjbG90aGluZ3xlbnwxfHx8fDE3NTg2OTA5NzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
      { name: 'With Turtleneck', image: 'https://images.unsplash.com/photo-1509300936132-65ad921bad41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmF5JTIwc3dlYXRzaGlydCUyMGhvb2RpZXxlbnwxfHx8fDE3NTg2OTA5NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' }
    ],
    brands: ['Hugo Boss', 'Zara', 'Uniqlo']
  },
  'Beige Chinos': {
    image: 'https://images.unsplash.com/photo-1756009531697-51da316bfa3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWlnZSUyMGNoaW5vcyUyMHBhbnRzfGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    material: {
      title: 'Material',
      content: 'Cotton twill is ideal. Look for a slight stretch for comfort.'
    },
    cut: {
      title: 'Fit',
      content: 'Slim or straight fit works best. Should taper slightly from knee to ankle.'
    },
    outfits: [
      { name: 'Casual', image: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNoaXJ0JTIwb3V0Zml0fGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
      { name: 'Business Casual', image: 'https://images.unsplash.com/photo-1618453292459-53424b66bb6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHQtc2hpcnQlMjBjbG90aGluZ3xlbnwxfHx8fDE3NTg2OTA5NzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
      { name: 'Weekend', image: 'https://images.unsplash.com/photo-1509300936132-65ad921bad41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmF5JTIwc3dlYXRzaGlydCUyMGhvb2RpZXxlbnwxfHx8fDE3NTg2OTA5NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' }
    ],
    brands: ['J.Crew', 'Banana Republic', 'Bonobos']
  },
  'Leather Shoes': {
    image: 'https://images.unsplash.com/photo-1576792741377-eb0f4f6d1a47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwZHJlc3MlMjBzaG9lc3xlbnwxfHx8fDE3NTg2MzYwOTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    material: {
      title: 'Material',
      content: 'Full-grain leather is best. Look for goodyear welt construction for durability.'
    },
    cut: {
      title: 'Style',
      content: 'Oxford or Derby styles are most versatile. Choose brown for casual, black for formal.'
    },
    outfits: [
      { name: 'Business', image: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNoaXJ0JTIwb3V0Zml0fGVufDF8fHx8MTc1ODY5MTI0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
      { name: 'Smart Casual', image: 'https://images.unsplash.com/photo-1618453292459-53424b66bb6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHQtc2hpcnQlMjBjbG90aGluZ3xlbnwxfHx8fDE3NTg2OTA5NzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
      { name: 'Evening Out', image: 'https://images.unsplash.com/photo-1509300936132-65ad921bad41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmF5JTIwc3dlYXRzaGlydCUyMGhvb2RpZXxlbnwxfHx8fDE3NTg2OTA5NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' }
    ],
    brands: ['Cole Haan', 'Allen Edmonds', 'Clarks']
  }
};

export function ProductCardScreen({ item, onMarkOwned }: ProductCardScreenProps) {
  const product = productData[item] || productData['Navy Blazer']; // Fallback to Navy Blazer

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-2xl">{item}</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Product Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
          <ImageWithFallback
            src={product.image}
            alt={item}
            className="w-full h-full object-cover"
          />
        </div>

        {/* What to Look For Section */}
        <div className="space-y-6">
          <h2 className="text-xl">What to Look for?</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">{product.material.title}</h3>
              <p className="text-sm">{product.material.content}</p>
            </div>
            
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">{product.cut.title}</h3>
              <p className="text-sm">{product.cut.content}</p>
            </div>
          </div>
        </div>

        {/* How to Wear It Section */}
        <div className="space-y-4">
          <h2 className="text-xl">How to Wear It?</h2>
          
          <div className="grid grid-cols-3 gap-3">
            {product.outfits.map((outfit: any, index: number) => (
              <div key={index} className="text-center">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                  <ImageWithFallback
                    src={outfit.image}
                    alt={outfit.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{outfit.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Brands Section */}
        <div className="space-y-4">
          <h2 className="text-xl">Recommended Brands</h2>
          
          <div className="flex flex-wrap gap-3">
            {product.brands.map((brand: string, index: number) => (
              <Card key={index} className="px-4 py-2 cursor-pointer hover:shadow-md transition-shadow">
                <span className="text-sm">{brand}</span>
              </Card>
            ))}
          </div>
        </div>

        {/* Mark as Owned Button */}
        <Button 
          onClick={onMarkOwned}
          className="w-full h-12"
          size="lg"
        >
          Mark as Owned
        </Button>
      </div>
    </div>
  );
}