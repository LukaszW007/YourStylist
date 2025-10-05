import { Users, Heart, Briefcase, Building, Theater, Plane } from "lucide-react";
import { Card } from "../ui/card";
import { Header } from "../Header";

interface OccasionSelectionScreenProps {
  onOccasionSelect: (occasion: string) => void;
  onBack: () => void;
}

const occasions = [
  {
    id: 'wedding',
    name: 'Wedding',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1739526169655-0378b9aae5ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwZm9ybWFsJTIwZHJlc3N8ZW58MXx8fHwxNzU4Njk4MDQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'bg-pink-50 text-pink-600'
  },
  {
    id: 'date',
    name: 'Date',
    icon: Heart,
    image: 'https://images.unsplash.com/photo-1650118653814-482455dd4263?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRlJTIwbmlnaHQlMjBvdXRmaXR8ZW58MXx8fHwxNzU4Njk4MDQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'bg-red-50 text-red-600'
  },
  {
    id: 'interview',
    name: 'Job Interview',
    icon: Briefcase,
    image: 'https://images.unsplash.com/photo-1758518730264-9235a1e5416b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb2IlMjBpbnRlcnZpZXclMjBvdXRmaXR8ZW58MXx8fHwxNzU4Njk4MDQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    id: 'corporate',
    name: 'Corporate Event',
    icon: Building,
    image: 'https://images.unsplash.com/photo-1619042823674-4f4ad8484b08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGNhc3VhbCUyMG91dGZpdCUyMG1lbnxlbnwxfHx8fDE3NTg2OTEyNDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'bg-gray-50 text-gray-600'
  },
  {
    id: 'theater',
    name: 'Theater',
    icon: Theater,
    image: 'https://images.unsplash.com/photo-1742631193849-acc045ea5890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwZWxlZ2FudCUyMGZhc2hpb258ZW58MXx8fHwxNzU4NjkxMjQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    id: 'vacation',
    name: 'Vacation Trip',
    icon: Plane,
    image: 'https://images.unsplash.com/photo-1693901257178-b5fcb8f036a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwc3R5bGUlMjBjbG90aGluZ3xlbnwxfHx8fDE3NTg2OTEyNDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'bg-green-50 text-green-600'
  }
];

export function OccasionSelectionScreen({ onOccasionSelect, onBack }: OccasionSelectionScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Special Occasion Outfits" onBack={onBack} />
      
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl mb-2">Select the occasion</h2>
          <p className="text-muted-foreground text-sm">
            Get outfit suggestions tailored to your event
          </p>
        </div>

        {/* Occasion Grid */}
        <div className="grid grid-cols-2 gap-4">
          {occasions.map((occasion) => {
            const IconComponent = occasion.icon;
            return (
              <Card 
                key={occasion.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                onClick={() => onOccasionSelect(occasion.id)}
              >
                <div className="aspect-square relative">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${occasion.image})` }}
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${occasion.color} bg-opacity-20`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm text-center">{occasion.name}</h3>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}