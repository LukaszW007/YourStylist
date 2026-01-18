import { LayerType } from "@/types/garment";

export function isValidLayerType(value: string | null | undefined): value is LayerType {
  if (!value) return false;
  // Dodano 'accessory' dla szalików/czapek
  const validTypes: LayerType[] = ["base", "mid", "outer", "bottom", "shoes", "accessory"];
  return validTypes.includes(value as LayerType);
}

/**
 * Inteligentnie mapuje surowe nazwy kategorii/podkategorii na system warstw Stylo.
 * Implementuje hierarchię "Sartorial Logic" - np. Blazer jest domyślnie 'mid',
 * aby umożliwić założenie na niego płaszcza.
 */
export function normalizeLayerType(
  category: string | null | undefined, 
  subcategory: string | null | undefined = ""
): LayerType {
  if (!category) return 'base'; // Fail-safe

  // Łączymy, aby szukać w obu polach (np. Cat: "Tops", Sub: "Overshirt")
  const text = `${category} ${subcategory}`.toLowerCase().trim();

  // 1. FOOTWEAR (Najłatwiejsze)
  if (text.match(/shoe|boot|sneaker|loafer|monk|derby|oxford|brogue|trainer|sandals/)) {
    return 'shoes';
  }

  // 2. BOTTOMS
  if (text.match(/pant|jean|trouser|chino|short|swim|jogger/)) {
    return 'bottom';
  }

  // 3. ACCESSORIES
  if (text.match(/scarf|glove|hat|beanie|belt|tie|pocket square|cap/)) {
    return 'accessory';
  }

  // 4. TRUE OUTERWEAR (Warstwa Ochronna)
  // To są rzeczy, na które rzadko cokolwiek zakładasz.
  if (text.match(/parka|trench|overcoat|pea coat|duffle|rain|winter jacket|down jacket|puffer|shearling|coat/)) {
    return 'outer';
  }

  // 5. MID LAYERS (Izolacja / Struktura)
  // UWAGA: Blazer/Suit Jacket to MID layer w kontekście pełnego ubioru zimowego.
  // Możesz go nosić jako outer w lecie, ale systemowo to warstwa środkowa.
  if (text.match(/blazer|suit jacket|sport coat|jacket/)) {
     // Wyjątek: "Leather Jacket", "Bomber", "Harrington" to często Outer w okresach przejściowych,
     // ale mogą być Mid pod płaszczem. Bezpieczniej dać 'outer' dla kurtek, 'mid' dla marynarek.
     if (text.includes('leather') || text.includes('bomber') || text.includes('denim jacket') || text.includes('harrington')) {
        return 'outer'; 
     }
     return 'mid';
  }

  if (text.match(/sweater|cardigan|hoodie|fleece|vest|waistcoat|pullover|jumper|turtleneck|rollneck/)) {
    // Turtleneck to ciekawy przypadek (Base vs Mid). Zazwyczaj traktujemy jako Mid (sweter) lub gruby Base.
    // Dla bezpieczeństwa 'mid', chyba że to 'thin turtleneck'.
    return 'mid';
  }

  // Overshirty i "Shackets"
  if (text.includes('overshirt') || text.includes('shacket') || text.includes('flannel shirt')) {
    // Flanela często działa jako warstwa wierzchnia na t-shirt
    return 'mid';
  }

  // 6. BASE LAYERS (Przy ciele)
  if (text.match(/shirt|polo|tee|henley|top|blouse/)) {
    return 'base';
  }

  // 7. Fallback dla niejasnych przypadków (np. samo "Jacket")
  if (text.includes('jacket')) return 'outer'; 

  return 'base';
}