// src/lib/logic/types.ts

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';
export type LayerType = 'base' | 'mid' | 'outer' | 'shoes' | 'accessory';
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

// Minimalny interfejs ubrania wymagany przez silnik
export interface GarmentBase {
  id: string;
  name: string;
  category: string;
  subcategory?: string | null;
  material?: string[] | null; // np. ["Merino Wool", "Elastane"]
  layer_type?: string | null; // Surowy string z bazy, będzie normalizowany
  thermal_profile?: ThermalProfile | string | null;
  main_color_name?: string | null;
  fabric_weave?: string | null; // e.g. "seersucker", "fresco", "flannel"
  comfort_min_c?: number | null;
  comfort_max_c?: number | null;
}

// =====================================================
// TEMPLATE SLOT (for strict layering validation)
// =====================================================

export interface TemplateSlot {
  slot_name: string;                  // e.g., "base_layer", "mid_layer", "outer_layer"
  allowed_subcategories: string[];    // e.g., ["Cardigan", "Shawl Cardigan"]
  required: boolean;                  // Must have this slot filled?
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
