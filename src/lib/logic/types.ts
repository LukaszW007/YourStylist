// src/lib/logic/types.ts

import type { GarmentBase, LayerType } from "@/types/garment";

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';
export type ThermalProfile = 'Cool' | 'Mid' | 'Warm' | 'Insulated' | 'Heavy' | 'Extreme' | null;
export type WeaveType = 'standard' | 'seersucker' | 'fresco' | 'flannel' | 'tweed' | 'poplin' | 'knit_chunky';

export interface MaterialPhysics {
  hydrophilic: boolean;       // Czy chłonie wodę? (np. Bawełna: Tak)
  insulates_wet: boolean;     // Czy grzeje mokre? (np. Wełna: Tak)
  sorption_heat: boolean;     // Czy generuje ciepło sorpcji? (Exothermic reaction)
  wind_resistance: number;    // 0.0 (Sito) - 1.0 (Mur)
  breathability: number;      // 0.0 (Folia) - 1.0 (Len)
  thermal_efficiency: number; // Mnożnik izolacji włókna (np. Puch = 3.0)
  contact_reduction: boolean; // Czy struktura 3D zmniejsza styk ze skórą? (Seersucker)
  drying_speed: number;       // 0.0 (Wolno) - 1.0 (Szybko)
}

export interface WeatherContext {
  temp_c: number;           // Temperatura powietrza
  wind_kph: number;         // Prędkość wiatru
  humidity_percent: number; // Wilgotność względna
  precipitation: boolean;   // Czy pada?
  is_sunny: boolean;        // Nasłonecznienie (wpływ na odczuwanie przy ciemnych kolorach)
  season: Season;
  acclimatization_temp_c?: number; // Średnia temp. z ostatnich 2 tygodni (Histereza)
}

export interface UserContext {
  activity_level: 'sedentary' | 'moderate' | 'high'; // Wpływa na MET
  personal_preference?: 'runs_cold' | 'runs_hot' | 'neutral';
}

export interface SuitabilityReport {
  is_suitable: boolean;
  score: number; // 0-100
  reasoning: string[];
  debug: {
    base_clo: number;
    effective_clo: number;
    weave_modifier: WeaveType;
    penalties: string[];
  };
}

// Re-export GarmentBase and LayerType from canonical source for convenience
export type { GarmentBase, LayerType };


// =====================================================
// TEMPLATE SLOT (for strict layering validation)
// =====================================================

export interface TemplateSlot {
  slot_name: string;                  // e.g., "base_layer", "mid_layer", "outer_layer"
  allowed_subcategories: string[];    // e.g., ["Cardigan", "Shawl Cardigan"]
  required: boolean;                  // Must have this slot filled?
  tucked_in?: 'always' | 'never' | 'optional';  // Should this layer be tucked into trousers?
  buttoning?: 'one_button_undone' | 'unbuttoned_over_base' | 'half_buttoned' | 'always_one_undone' | 'n/a';  // How should buttons be fastened?
}

export interface LayeringTemplate {
  name: string;
  min_temp_c: number;
  max_temp_c: number;
  layer_count: number;
  
  // OLD (deprecated but kept for backward compatibility):
  required_layers?: string[];
  
  // NEW (strict validation):
  slots?: TemplateSlot[];
  
  description: string;
}
