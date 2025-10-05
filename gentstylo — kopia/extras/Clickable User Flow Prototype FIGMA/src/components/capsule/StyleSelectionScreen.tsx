import { Card } from "../ui/card";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Header } from "../Header";

interface StyleSelectionScreenProps {
  onStyleSelect: (style: string) => void;
  onBack: () => void;
}

const styles = [
  {
    id: 'smart-casual',
    name: 'Smart Casual',
    image: 'https://images.unsplash.com/photo-1619042823674-4f4ad8484b08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGNhc3VhbCUyMG91dGZpdCUyMG1lbnxlbnwxfHx8fDE3NTg2OTEyNDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Professional yet relaxed'
  },
  {
    id: 'minimalism',
    name: 'Minimalism',
    image: 'https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwc3R5bGUlMjBjbG90aGluZ3xlbnwxfHx8fDE3NTg2OTEyNDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Clean lines and neutral tones'
  },
  {
    id: 'classic-elegance',
    name: 'Classic Elegance',
    image: 'https://images.unsplash.com/photo-1742631193849-acc045ea5890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwZWxlZ2FudCUyMGZhc2hpb258ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Timeless sophistication'
  }
];

export function StyleSelectionScreen({ onStyleSelect, onBack }: StyleSelectionScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Capsule Wardrobe" onBack={onBack} />
      
      {/* Header */}
      <div className="text-center py-6 px-6">
        <h2 className="text-xl mb-2">Build your ideal wardrobe</h2>
        <p className="text-muted-foreground text-sm">
          Choose the style you want to develop. We'll help you gather the necessary items.
        </p>
      </div>

      {/* Style Cards */}
      <div className="px-6 space-y-4">
        {styles.map((style) => (
          <Card 
            key={style.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            onClick={() => onStyleSelect(style.id)}
          >
            <div className="relative h-48">
              <ImageWithFallback
                src={style.image}
                alt={style.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h2 className="text-white text-2xl mb-1">{style.name}</h2>
                <p className="text-white/80 text-sm">{style.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}