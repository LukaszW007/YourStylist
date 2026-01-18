// src/lib/logic/materials-db.ts
import { MaterialPhysics } from './types';

// Baza właściwości fizykochemicznych włókien [cite: 4, 9, 41, 111-122]
export const MATERIAL_DB: Record<string, MaterialPhysics> = {
  // --- NATURALNE ---
  'cotton':    { hydrophilic: true,  insulates_wet: false, sorption_heat: false, wind_resistance: 0.15, breathability: 0.85, thermal_efficiency: 1.0, contact_reduction: false, drying_speed: 0.2 },
  'linen':     { hydrophilic: true,  insulates_wet: false, sorption_heat: false, wind_resistance: 0.05, breathability: 0.98, thermal_efficiency: 0.6, contact_reduction: false, drying_speed: 0.9 },
  'wool':      { hydrophilic: true,  insulates_wet: true,  sorption_heat: true,  wind_resistance: 0.30, breathability: 0.70, thermal_efficiency: 1.4, contact_reduction: false, drying_speed: 0.3 },
  'merino':    { hydrophilic: true,  insulates_wet: true,  sorption_heat: true,  wind_resistance: 0.25, breathability: 0.80, thermal_efficiency: 1.3, contact_reduction: false, drying_speed: 0.4 },
  'cashmere':  { hydrophilic: true,  insulates_wet: true,  sorption_heat: true,  wind_resistance: 0.25, breathability: 0.60, thermal_efficiency: 1.8, contact_reduction: false, drying_speed: 0.3 },
  'silk':      { hydrophilic: true,  insulates_wet: false, sorption_heat: false, wind_resistance: 0.10, breathability: 0.90, thermal_efficiency: 0.8, contact_reduction: false, drying_speed: 0.7 },
  'leather':   { hydrophilic: false, insulates_wet: true,  sorption_heat: false, wind_resistance: 0.98, breathability: 0.05, thermal_efficiency: 1.1, contact_reduction: false, drying_speed: 0.5 },
  'suede':     { hydrophilic: false, insulates_wet: true,  sorption_heat: false, wind_resistance: 0.98, breathability: 0.05, thermal_efficiency: 1.1, contact_reduction: false, drying_speed: 0.5 },
  'shearling': { hydrophilic: false, insulates_wet: true,  sorption_heat: true,  wind_resistance: 0.98, breathability: 0.20, thermal_efficiency: 2.5, contact_reduction: false, drying_speed: 0.4 },

  // --- SYNTETYKI I PRZETWORZONE ---
  'polyester': { hydrophilic: false, insulates_wet: true,  sorption_heat: false, wind_resistance: 0.50, breathability: 0.40, thermal_efficiency: 1.1, contact_reduction: false, drying_speed: 0.9 },
  'nylon':     { hydrophilic: false, insulates_wet: true,  sorption_heat: false, wind_resistance: 0.80, breathability: 0.30, thermal_efficiency: 1.0, contact_reduction: false, drying_speed: 0.9 },
  'acrylic':   { hydrophilic: false, insulates_wet: true,  sorption_heat: false, wind_resistance: 0.40, breathability: 0.50, thermal_efficiency: 1.2, contact_reduction: false, drying_speed: 0.8 }, 
  // [cite: 43-54] Imituje wełnę, ale brak ciepła sorpcji
  'elastane':  { hydrophilic: false, insulates_wet: true,  sorption_heat: false, wind_resistance: 0.10, breathability: 0.50, thermal_efficiency: 1.0, contact_reduction: false, drying_speed: 0.8 },
  'viscose':   { hydrophilic: true,  insulates_wet: false, sorption_heat: false, wind_resistance: 0.20, breathability: 0.80, thermal_efficiency: 0.9, contact_reduction: false, drying_speed: 0.3 }, 
  // [cite: 74-76] Zachowuje się jak bawełna
  'lyocell':   { hydrophilic: true,  insulates_wet: false, sorption_heat: false, wind_resistance: 0.20, breathability: 0.85, thermal_efficiency: 0.9, contact_reduction: false, drying_speed: 0.6 }, 
  // [cite: 77-79] Lepsze zarządzanie wilgocią

  // --- TECHNICZNE ---
  'gore-tex':  { hydrophilic: false, insulates_wet: true,  sorption_heat: false, wind_resistance: 1.00, breathability: 0.30, thermal_efficiency: 1.0, contact_reduction: false, drying_speed: 0.9 },
  'down':      { hydrophilic: true,  insulates_wet: false, sorption_heat: false, wind_resistance: 0.60, breathability: 0.60, thermal_efficiency: 3.0, contact_reduction: false, drying_speed: 0.3 },
};

// Hierarchiczna tabela CLO (Intrinsic Clo) [cite: 126-130]
// Klucze to frazy, które będą wyszukiwane w nazwie/kategorii ubrania
export const GARMENT_SPECS: Record<string, number> = {
  // --- KOSZULE ---
  'linen shirt': 0.12,
  'seersucker shirt': 0.14,
  'poplin shirt': 0.18,
  'oxford shirt': 0.21,
  'twill shirt': 0.24,
  'denim shirt': 0.28,
  'flannel shirt': 0.34,
  'overshirt': 0.40,

  // --- DZIANINY ---
  'merino sweater': 0.25,
  'cotton sweater': 0.28,
  'cashmere sweater': 0.35,
  'shetland sweater': 0.40,
  'v-neck sweater': 0.32,
  'cardigan': 0.45,
  'zip-up cardigan': 0.50,
  'shawl cardigan': 0.75, // [cite: 99-105]
  'aran sweater': 0.70,
  'acrylic sweater': 0.35,

  // --- SPODNIE ---
  'linen trousers': 0.15,
  'fresco trousers': 0.18,
  'tropical wool trousers': 0.19,
  'chinos': 0.22,
  'jeans': 0.25,
  'corduroy trousers': 0.35,
  'flannel trousers': 0.38,
  'moleskin trousers': 0.40,

  // --- MARYNARKI ---
  'linen blazer': 0.25,
  'seersucker blazer': 0.28,
  'hopsack blazer': 0.32,
  'cotton blazer': 0.35,
  'tweed blazer': 0.55,
  'flannel blazer': 0.50,

  // --- OKRYCIA WIERZCHNIE ---
  'safari jacket linen': 0.35,
  'safari jacket cotton': 0.45, // [cite: 91-98]
  'denim jacket': 0.50,
  'trench coat': 0.60,
  'leather jacket': 0.65, // [cite: 266-272]
  'quilted jacket': 0.80,
  'pea coat': 1.20, // [cite: 238]
  'overcoat': 1.10,
  'duffle coat': 1.30,
  'shearling jacket': 2.20, // [cite: 82-90]
  'puffer jacket': 1.80, // [cite: 257-264]
  'parka': 2.50,
};