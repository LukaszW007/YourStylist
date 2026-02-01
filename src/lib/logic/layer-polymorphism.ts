// src/lib/logic/layer-polymorphism.ts
import type { GarmentBase, LayerType } from "@/types/garment";

/**
 * Definicja ubrań, które mogą pełnić wiele ról w zależności od stylizacji.
 */

interface PolymorphicRule {
  layers: LayerType[];
  context: Partial<Record<LayerType, string>>; // Opis kontekstu dla danej warstwy
}

const POLYMORPHIC_RULES: Record<string, PolymorphicRule> = {
  // --- KOSZULE ---
  'flannel': {
    layers: ['base', 'mid'],
    context: {
      'base': 'Buttoned up (High Warmth)',
      'mid': 'Unbuttoned over T-shirt (Moderate Warmth)'
    }
  },
  'denim shirt': {
    layers: ['base', 'mid'],
    context: {
      'base': 'Buttoned up',
      'mid': 'Unbuttoned over T-shirt'
    }
  },
  'linen shirt': {
    layers: ['base', 'mid'],
    context: {
      'base': 'Buttoned (Cooling)',
      'mid': 'Unbuttoned over tank-top (Summer Layering)'
    }
  },
  'overshirt': {
    layers: ['mid', 'outer'],
    context: {
      'mid': 'Under a coat',
      'outer': 'As a jacket'
    }
  },

  // --- DZIANINY ---
  'cardigan': {
    layers: ['mid'],
    context: { 'mid': 'Standard Layer' }
  },
  'shawl cardigan': {
    layers: ['mid', 'outer'],
    context: { 'mid': 'Worn over T-shirt or shirt', 'outer': 'As a jacket or blazer' }
  },
  'sweater': {
    layers: ['base', 'mid'],
    context: { 'base': 'Standard layer', 'mid': 'Worn over shirt' }
  },
  'turtleneck': {
    layers: ['base'],
    context: {
      'base': 'Worn next to skin (e.g. under blazer)',
    }
  },
  
  // --- MARYNARKI ---
  'blazer': {
    layers: ['mid', 'outer'],
    context: {
      'mid': 'Under Overcoat (Winter)',
      'outer': 'Outer Layer (Spring/Autumn)'
    }
  }
};

/**
 * Funkcja "rozmnażająca" ubrania.
 * Jeśli ubranie jest polimorficzne, zwraca jego kopie z różnymi layer_type.
 */
export function expandGarmentPossibilities(garment: any): GarmentBase[] {
  const text = (garment.subcategory + " " + garment.name + " " + (garment.material?.join(" ") || "")).toLowerCase();
  
  let matchingRule: PolymorphicRule | null = null;

  // Szukamy pasującej reguły
  for (const [key, rule] of Object.entries(POLYMORPHIC_RULES)) {
    if (text.includes(key)) {
      matchingRule = rule;
      break; 
    }
  }

  // Jeśli brak reguły specjalnej, zwracamy oryginał (bez zmian)
  if (!matchingRule) {
    return [garment];
  }

  // Generujemy warianty
  // Jeśli w bazie jest np. 'mid', a reguła pozwala na ['base', 'mid'], to generujemy oba.
  return matchingRule.layers.map(layer => {
    const contextNote = matchingRule!.context[layer] || "";
    
    return {
      ...garment,
      layer_type: layer, // Nadpisujemy warstwę
      // Modyfikujemy nazwę dla AI, żeby wiedziało JAK tego użyć
      // Np. "Red Flannel Shirt [Unbuttoned over T-shirt]"
      name: `${garment.name} [${contextNote}]`, 
      id: `${garment.id}_${layer}` // Wirtualne ID
    };
  });
}