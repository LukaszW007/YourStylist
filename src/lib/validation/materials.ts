/**
 * Material normalization and validation utilities
 * Handles LLM output variations, synonyms, and unknown materials
 */

// Master list of valid materials (matches ConfirmationScreen.tsx)
export const VALID_MATERIALS = [
  "Acrylic",
  "Acetate",
  "Alpaca Wool",
  "Angora",
  "Blend",
  "Canvas",
  "Cashmere",
  "Cotton",
  "Cupro",
  "Denim",
  "Faux Fur",
  "Faux Leather",
  "Flannel",
  "Fleece",
  "Hemp",
  "Jute",
  "Lambs Wool",
  "Leather",
  "Linen",
  "Merino Wool",
  "Modal",
  "Mohair",
  "Nylon",
  "Polyester",
  "Rayon",
  "Silk",
  "Spandex",
  "Suede",
  "Synthetic",
  "Terry Cloth",
  "Velvet",
  "Vicuna Wool",
  "Viscose",
  "Wool",
] as const;

// Mapping for common variations and synonyms
const MATERIAL_SYNONYMS: Record<string, string> = {
  // Wool variations
  "Merino": "Merino Wool",
  "Alpaca": "Alpaca Wool",
  "Lamb": "Lambs Wool",
  "Lamb's Wool": "Lambs Wool",
  "Vicuna": "Vicuna Wool",
  "Vicuña": "Vicuna Wool",
  
  // Synthetic synonyms
  "Elastane": "Spandex",
  "Lycra": "Spandex",
  "Polyamide": "Nylon",
  "PA": "Nylon",
  
  // Cellulose fibers
  "Lyocell": "Modal",
  "Tencel": "Modal",
  "Bamboo": "Rayon",
  "Bamboo Fiber": "Rayon",
  
  // Common variations
  "PU Leather": "Faux Leather",
  "Vegan Leather": "Faux Leather",
  "Pleather": "Faux Leather",
  "Fake Fur": "Faux Fur",
  "Imitation Fur": "Faux Fur",
  
  // Abbreviations
  "Poly": "Polyester",
  "PET": "Polyester",
  
  // Generic fallbacks
  "Unknown": "Blend",
  "Mixed": "Blend",
  "Other": "Synthetic",
};

/**
 * Normalizes a material name to match VALID_MATERIALS
 * - Checks synonyms mapping
 * - Verifies against valid list
 * - Falls back to 'Synthetic' for unknowns
 * 
 * @param material - Raw material string from LLM or user input
 * @param logUnknown - Whether to log unknown materials (default: true)
 * @returns Normalized material name from VALID_MATERIALS
 */
export function normalizeMaterial(
  material: string | null | undefined,
  logUnknown: boolean = true
): string {
  if (!material) return "Synthetic";
  
  const trimmed = material.trim();
  
  // Check synonyms first
  if (MATERIAL_SYNONYMS[trimmed]) {
    return MATERIAL_SYNONYMS[trimmed];
  }
  
  // Check if already valid (case-sensitive)
  if (VALID_MATERIALS.includes(trimmed as any)) {
    return trimmed;
  }
  
  // Try case-insensitive match
  const caseInsensitiveMatch = VALID_MATERIALS.find(
    vm => vm.toLowerCase() === trimmed.toLowerCase()
  );
  
  if (caseInsensitiveMatch) {
    return caseInsensitiveMatch;
  }
  
  // Unknown material - log and fallback
  if (logUnknown) {
    console.warn(
      `[Material Validation] Unknown material: "${material}" → falling back to "Synthetic"`
    );
  }
  
  return "Synthetic";
}

/**
 * Normalizes an array of materials
 * - Removes duplicates
 * - Filters out invalid materials
 * - Returns array of valid materials
 * 
 * @param materials - Array of raw material strings
 * @returns Array of normalized, deduplicated materials
 */
export function normalizeMaterialArray(
  materials: (string | null | undefined)[] | null | undefined
): string[] {
  if (!materials || materials.length === 0) return [];
  
  const normalized = materials
    .filter((m): m is string => !!m)
    .map(m => normalizeMaterial(m))
    .filter((m, index, self) => self.indexOf(m) === index); // Deduplicate
  
  return normalized.length > 0 ? normalized : [];
}

/**
 * Validates that all materials in array are valid
 * Useful for strict validation before database save
 * 
 * @param materials - Array of material strings to validate
 * @returns Object with validation result and invalid materials
 */
export function validateMaterials(materials: string[]): {
  isValid: boolean;
  invalidMaterials: string[];
} {
  const invalid = materials.filter(m => !VALID_MATERIALS.includes(m as any));
  
  return {
    isValid: invalid.length === 0,
    invalidMaterials: invalid,
  };
}
