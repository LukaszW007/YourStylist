// src/lib/logic/sartorial-physics.ts

import { MATERIAL_DB } from './materials-db';
import { calculateCLO } from './garment-taxonomy';
import { 
  GarmentBase, 
  MaterialPhysics, 
  SuitabilityReport, 
  UserContext, 
  WeatherContext, 
  WeaveType 
} from './types';
import { normalizeLayerType } from '../utils/garment-guards';

/**
 * Wykrywa fizykę ubrania używając 3-faktorowej formuły CLO
 * FORMUŁA: FINAL_CLO = GARMENT_BASE × MATERIAL_MOD × WEAVE_MOD
 */
function detectPhysics(garment: GarmentBase): { 
  physics: MaterialPhysics, 
  estimatedClo: number, 
  weaveModifier: WeaveType 
} {
  const nameLower = (garment.full_name + " " + (garment.subcategory || "")).toLowerCase();
  
  // 1. NOWY SYSTEM CLO - 3 czynniki
  const cloResult = calculateCLO(
    garment.subcategory || '',
    garment.full_name,
    Array.isArray(garment.material) ? garment.material : [],
    garment.fabric_weave ?? undefined
  );
  
  // console.log(`🔬 [CLO] ${garment.full_name}: base=${cloResult.baseClo.toFixed(2)} × mat=${cloResult.materialMod.toFixed(2)} × weave=${cloResult.weaveMod.toFixed(2)} = ${cloResult.finalClo.toFixed(3)} (type: ${cloResult.garmentType})`);
  
  // 2. Detekcja typu splotu dla WeaveType
  let weaveModifier: WeaveType = 'standard';
  let breathabilityBoost = 1.0;

  if (nameLower.includes('seersucker')) {
    weaveModifier = 'seersucker';
    breathabilityBoost = 1.4;
  } else if (nameLower.includes('fresco') || nameLower.includes('tropical') || nameLower.includes('high twist')) {
    weaveModifier = 'fresco';
    breathabilityBoost = 1.5;
  } else if (nameLower.includes('flannel')) {
    weaveModifier = 'flannel';
    breathabilityBoost = 0.8;
  } else if (nameLower.includes('tweed') || nameLower.includes('donegal')) {
    weaveModifier = 'tweed';
    breathabilityBoost = 0.6;
  }

  // 3. Baza Materiałowa dla właściwości fizycznych
  const mainMaterial = (Array.isArray(garment.material) && garment.material.length > 0)
    ? garment.material[0].toLowerCase() 
    : 'cotton';
  
  const materialKey = Object.keys(MATERIAL_DB).find(k => mainMaterial.includes(k)) || 'cotton';
  const basePhysics = MATERIAL_DB[materialKey];

  // 4. Aplikacja modyfikatorów oddychalności
  const finalPhysics = { ...basePhysics };
  finalPhysics.breathability = Math.min(1.0, finalPhysics.breathability * breathabilityBoost);
  if (weaveModifier === 'seersucker') finalPhysics.contact_reduction = true;

  return { 
    physics: finalPhysics, 
    estimatedClo: cloResult.finalClo, 
    weaveModifier 
  };
}

/**
 * Oblicza temperaturę odczuwalną (Wind Chill / Heat Index)
 * [cite: 275-288] - Modele NOAA/Steadmana
 */
export function calculateApparentTemperature(w: WeatherContext): number {
  const t = w.temp_c;
  
  // 1. Wind Chill (T <= 10°C, W > 4.8 km/h)
  if (t <= 10 && w.wind_kph > 4.8) {
    return 13.12 + 0.6215 * t - 11.37 * Math.pow(w.wind_kph, 0.16) + 0.3965 * t * Math.pow(w.wind_kph, 0.16);
  }
  
  // 2. Heat Index approximation (T >= 27°C)
  if (t >= 27 && w.humidity_percent > 40) {
    // Prosta aproksymacja Steadmana dla wilgotności
    return t + 0.33 * (w.humidity_percent / 100 * 6.105 * Math.exp(17.27 * t / (237.7 + t))) - 4.0;
  }

  return t;
}

/**
 * Oblicza korektę sezonową (Histereza)
 * [cite: 33-39, 289-304]
 */
function calculateSeasonalBias(w: WeatherContext): number {
  // Jeśli mamy dane o aklimatyzacji (średnia z 14 dni)
  if (w.acclimatization_temp_c !== undefined) {
     const diff = w.acclimatization_temp_c - w.temp_c;
     // Jeśli jesteśmy przyzwyczajeni do ciepła (jesień), a jest zimniej -> czujemy większe zimno -> potrzebujemy więcej CLO
     if (diff > 5) return 0.2; 
     // Jeśli jesteśmy przyzwyczajeni do zimna (wiosna), a jest cieplej -> czujemy większe ciepło -> potrzebujemy mniej CLO
     if (diff < -5) return -0.2;
     return 0;
  }

  // Fallback do kalendarza [cite: 35]
  if (w.season === 'Spring' && w.temp_c > 8) return -0.15; // Wiosenna euforia
  if (w.season === 'Autumn' && w.temp_c < 15) return 0.15; // Jesienna depresja termiczna
  return 0;
}

/**
 * GŁÓWNA FUNKCJA ANALITYCZNA //TODO: LEGACY CODE - REMOVE
 */
export function analyzeGarmentPhysics(
  garment: GarmentBase, 
  weather: WeatherContext,
  user: UserContext = { activity_level: 'moderate' }
): SuitabilityReport {
  
  const { physics, estimatedClo, weaveModifier } = detectPhysics(garment);
  const layerType = normalizeLayerType(garment.category, garment.subcategory); // Użycie zewnętrznego guarda

  // console.log("Layer type: ", layerType);
  const t_app = calculateApparentTemperature(weather);
  const seasonalBias = calculateSeasonalBias(weather);
  
  // Obliczenie adjustowanej temperatury dla logiki decyzyjnej
  // (Dodatni bias oznacza, że potrzebujemy cieplej, więc "symulujemy" że jest zimniej)
  const logicTemp = t_app - (seasonalBias * 10); 

  let score = 100;
  const warnings: string[] = [];

  // --- REGUŁY "KILLER" I PARADOKSY ---

  const isWetCold = (weather.precipitation || (weather.humidity_percent > 85 && logicTemp < 10));

  // 1. COTTON KILLS [cite: 246-256]
  // Bawełna w zimnej wilgoci traci izolację i wychładza
  if (isWetCold && physics.hydrophilic && !physics.insulates_wet && layerType !== 'base') {
    score -= 80;
    warnings.push("COTTON KILLS: Bawełna traci izolację w wilgoci, ryzyko wychłodzenia.");
  }

  // 2. PARADOKS PUCHÓWKI / PRZEGRZANIE [cite: 329-331]
  // Jeśli jest > 15°C, a ubranie to ciężka izolacja lub akryl o słabej oddychalności
  const isHeavyInsulation = estimatedClo > 0.8 || garment.thermal_profile === 'Insulated';
  if (weather.temp_c > 15 && isHeavyInsulation) {
    score = 0;
    warnings.push("PRZEGRZANIE: Zbyt ciepłe na obecną pogodę.");
  }

  // 3. AKRYL VS WYSIŁEK [cite: 43-54]
  // Akryl grzeje, ale słabo oddycha (niska sorpcja). Przy wysiłku to sauna.
  if (user.activity_level === 'high' && physics.sorption_heat === false && physics.breathability < 0.6) {
    score -= 40;
    warnings.push("AKRYL/POT: Słabe zarządzanie wilgocią przy wysiłku.");
  }

  // 4. SHEARLING (KOŻUCH) [cite: 82-90]
  // Tylko na mrozy.
  if (nameLowerIncludes(garment, 'shearling')) {
    if (t_app > 5) {
      score = 0;
      warnings.push("SHEARLING: Zbyt ciepły (>5°C).");
    } else {
      score += 50; // Król zimy
    }
  }

  // --- BONUSY I KARY ŚRODOWISKOWE ---

  // A. WIATR (Wind Chill Vulnerability) [cite: 281-284]
  if (weather.wind_kph > 20 && layerType === 'outer') {
    if (physics.wind_resistance < 0.4) {
      // Przewiewne (Wełna, Fresco, Luźne swetry)
      score -= 30;
      warnings.push(`WIATR: Materiał przewiewny, wiatr niszczy izolację.`);
    } else if (physics.wind_resistance > 0.8) {
      // Wiatroszczelne (Skóra, Nylon, Shearling)
      score += 20;
      warnings.push("WIATROSZCZELNOŚĆ: Dobra ochrona przed wiatrem.");
    }
  }

  // B. SORPCJA (Wełna w wilgotnym zimnie) [cite: 237-245]
  if (isWetCold && physics.sorption_heat) {
    score += 15;
    warnings.push("SORPCJA: Materiał generuje ciepło w wilgoci.");
  }

  // C. LATO / UPAŁY (>25°C) [cite: 145-151]
  if (weather.temp_c > 25) {
    // SEERSUCKER BONUS (Contact Reduction)
    if (physics.contact_reduction) {
      score += 25;
      warnings.push("STRUKTURA 3D: Minimalny styk ze skórą (Seersucker).");
    }
    // FRESCO BONUS (Breathability + Wind)
    if (weaveModifier === 'fresco') {
      score += 20;
      warnings.push("FRESCO: Otwarty splot zapewnia wentylację.");
    }
    // AKRYL/POLIESTER PENALTY
    if (physics.breathability < 0.5) {
      score -= 50;
      warnings.push("DUSZNO: Syntetyk o słabej oddychalności.");
    }
  }

  // --- LAYERING-AWARE Temperature Validation ---
  // [RULE] Only outerwear and shoes must meet strict min temp requirements directly.
  // Base/Mid layers are assumed to be worn under outer layers in cold weather.
  const isCritical = isCriticalWeatherLayer(garment.category, garment.subcategory);
  
  if (garment.comfort_min_c != null && garment.comfort_max_c != null) {
    const margin = 5;
    
    // MAX TEMP CHECK - applies to ALL categories
    // (No wool turtleneck in +30°C, regardless of layering)
    if (t_app > garment.comfort_max_c + margin) {
      score -= 60;
      warnings.push(`TOO HOT: Above comfort range (max ${garment.comfort_max_c}°C).`);
    }
    
    // MIN TEMP CHECK - STRICT for outerwear/shoes, RELAXED for layerable items
    if (isCritical) {
      // HARD DISQUALIFIER: Outerwear/shoes below their comfort_min_c are NEVER suitable.
      // This is an absolute rule — no wind resistance bonus or other factor can override it.
      // A summer jacket at -18°C is dangerous regardless of how windproof it is.
      if (t_app < garment.comfort_min_c - margin) {
        warnings.push(`OUTERWEAR/SHOES TOO COLD: Below comfort range (min ${garment.comfort_min_c}°C). Hard disqualified.`);
        return {
          is_suitable: false,
          score: 0,
          reasoning: warnings,
          debug: {
            base_clo: estimatedClo,
            effective_clo: estimatedClo,
            weave_modifier: weaveModifier,
            penalties: warnings
          }
        };
      }
    } else {
      // Base/Mid layers: only apply min temp check if temp is ABOVE 15°C
      // Below 15°C we assume layering provides protection from outer layers
      if (t_app >= 15 && t_app < garment.comfort_min_c - margin) {
        score -= 40;
        warnings.push(`LAYERABLE: Below standalone range at ${t_app.toFixed(0)}°C.`);
      }
      // Below 15°C: ALLOW all base/mid layers (layering assumption active)
      // This is the key fix - shirts/trousers won't be rejected in winter
    }
  }

  return {
    is_suitable: score >= 50,
    score: Math.max(0, Math.min(100, score)),
    reasoning: warnings,
    debug: {
      base_clo: estimatedClo,
      effective_clo: estimatedClo, // Tutaj można dodać logikę redukcji przez wiatr
      weave_modifier: weaveModifier,
      penalties: warnings
    }
  };
}

// Helper utility
function nameLowerIncludes(g: GarmentBase, term: string): boolean {
  return (g.full_name + " " + (g.subcategory || "")).toLowerCase().includes(term);
}

/**
 * Determines if a garment is in a category that must meet strict temperature requirements.
 * Outerwear and shoes are exposed directly to weather - they need proper insulation.
 * Base/Mid layers can rely on outer layers for warmth, so we're more lenient.
 */
function isCriticalWeatherLayer(category: string, subcategory?: string | null): boolean {
  const text = `${category} ${subcategory || ''}`.toLowerCase();
  // Outerwear: coats, jackets, parkas - directly exposed to elements
  if (subcategory?.match(/coat|jacket|parka|puffer|outer|rain|down|shearling/) && category.toLowerCase() === 'outerwear') return true;
  // Footwear: must handle ground temperature and conditions
  if (text.match(/shoe|boot|sneaker|loafer|footwear/)) return true;
  return false;
}