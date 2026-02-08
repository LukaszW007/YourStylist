/**
 * Comprehensive garment synonym dictionary
 * Maps canonical subcategory names to their alternative names
 * 
 * Usage:
 * - Template uses canonical name: "Sweater"
 * - LLM may use synonym: "pullover", "jumper"
 * - This lookup enables matching between them
 */

export const GARMENT_SYNONYMS: Record<string, string[]> = {
  // --- BASE LAYERS ---
  "White T-shirt": ["white tee", "white crewneck", "white base-layer", "undershirt"],
  "T-shirt": ["tee", "crewneck", "short-sleeve top", "graphic tee"],
  "Tank Top": ["singlet", "sleeveless tee", "wife-beater", "athletic vest"],
  "Henley": ["henley shirt", "button-neck tee", "grandad shirt", "henley long-sleeve"],
  "Polo": ["polo shirt", "tennis shirt", "golf shirt"],
  "Long Sleeve Merino Polo": ["knitted polo", "merino polo", "long-sleeve knit polo"],

  // --- SHIRTS ---
  "Cotton Shirt": ["dress shirt", "button-down", "button-up", "oxford shirt", "ocbd"],
  "Dress Shirt": ["formal shirt", "stiff collar shirt", "button-up"],
  "Oxford Shirt": ["ocbd", "oxford cloth button down"],
  "Flannel Shirt": ["plaid shirt", "checked shirt", "lumberjack shirt"],
  "Linen Shirt": ["flax shirt", "summer shirt", "breathable shirt"],
  "Short-sleeve Shirt": ["ss shirt", "casual short sleeve"],
  "Cuban Collar Shirt": ["camp collar shirt", "revere collar", "effortless summer shirt"],
  "Mandarin Collar Shirt": ["band collar shirt", "grandad collar", "modern collarless shirt", "bold statement shirt"],
  "Chambray Shirt": ["work shirt", "denim-look shirt", "light indigo shirt"],
  "Tuxedo Shirt": ["formal pleated shirt", "wingtip collar shirt", "evening shirt"],
  "Seersucker Shirt": ["puckered cotton shirt", "summer textured shirt"],
  "Hawaiian Shirt": ["aloha shirt", "printed summer shirt"],
  "Thin Wool Shirt": ["merino shirt"],

  // --- MID LAYERS ---
  "Sweater": ["pullover", "jumper", "knit", "crewneck sweater", "v-neck sweater"],
  "Troyer": ["quarter-zip", "half-zip", "zip-neck sweater"],
  "Turtleneck": ["roll-neck", "polo neck", "golf", "mock neck", "turtle"],
  "Cardigan": ["knit cardigan", "button-through sweater"],
  "Shawl Cardigan": ["shawl collar cardigan", "chunky cardigan", "thick knit"],
  "Blazer": ["sport coat", "sports jacket", "casual jacket", "lounge jacket"],
  "Double-Breasted Blazer": ["db blazer", "six-button jacket"],
  "Vest": ["gilet", "quilted gilet", "body warmer", "puffer vest", "down vest", "fleece vest"],
  "Waistcoat": ["suit vest", "formal vest", "odd waistcoat", "linen vest", "tuxedo waistcoat"],
  "Overshirt": ["shacket", "shirt jacket", "utility shirt", "cpo jacket"],

  // --- OUTERWEAR (Winter & Formal) ---
  // "Winter Outerwear": ["winter coat", "heavy jacket", "puffer", "down jacket"],
  "Puffer": ["puffer jacket", "down jacket", "puffer coat", "down coat", "winter jacket"],
  "Parka": ["anorak", "winter parka", "hooded heavy coat"],
  "Overcoat": ["topcoat", "greatcoat", "chesterfield", "long coat"],
  "Pea Coat": ["reefer jacket", "p-jacket", "naval coat"],
  "Duffel Coat": ["toggle coat", "duffle", "monty coat"],
  "Car Coat": ["driving coat", "mid-thigh coat"],
  "Shearling Jacket": ["shearling coat", "sheepskin jacket", "suede jacket"],

  // --- OUTERWEAR (Spring/Fall) ---
  "Quilted Jacket": ["husky jacket", "padded jacket", "diamond quilt coat"],
  "Trench": ["trench coat", "double-breasted raincoat"],
  "Mac Coat": ["mac", "raincoat", "waterproof coat", "mackintosh"],
  "Field Jacket": ["m-65", "utility jacket", "army jacket", "military jacket"], //military style
  "Waxed Jacket": ["barbour", "waxed cotton coat", "hunting jacket"], //british countryside style
  "Bomber": ["ma-1", "flight jacket", "bomber jacket"],
  "Harrington": ["baracuta", "g9 jacket", "blouson"],
  "Denim Jacket": ["jean jacket", "trucker jacket", "type III jacket"],
  "Safari Jacket": ["bush jacket", "tropical jacket", "belted field jacket"],
  "Chore Coat": ["french work jacket", "bleu de travail", "chore jacket"], //like field jacket but without lining
  "Varsity Jacket": ["letterman jacket", "baseball jacket"],
  "Coach Jacket": ["sideline jacket", "snap-front windbreaker"],
  "Leather Jacket": ["biker jacket", "double rider", "cafe racer", "moto jacket"],
  "Fleece Jacket": ["pile jacket", "polar fleece", "fleece zip-up", "fleece"],
  "Windbreaker": ["shell jacket", "light windbreaker", "rain jacket"],
  "CPO Jacket": ["chief petty officer jacket", "wool overshirt"],
  "Anorak": ["pullover jacket", "half-zip windbreaker"],
  "Technical Jacket": ["tech jacket", "waterproof jacket", "windproof jacket", "technical shell"],

  // --- OUTERWEAR (Summer & Formal) ---
  "Linen Blazer": ["summer blazer", "unstructured jacket"],
  "Fresco Wool Blazer": ["hopsack blazer", "high-twist wool jacket"],
};

/**
 * Checks if a garment subcategory matches an allowed subcategory
 * Supports synonym matching (case-insensitive)
 * 
 * @param garmentSubcategory - Subcategory from garment (e.g., "pullover", "Sweater")
 * @param allowedSubcategory - Allowed subcategory from template (e.g., "Sweater")
 * @returns true if match found (exact or via synonym)
 * 
 * @example
 * matchesAllowedSubcategory("pullover", "Sweater") // true (synonym match)
 * matchesAllowedSubcategory("Sweater", "Sweater") // true (exact match)
 * matchesAllowedSubcategory("jeans", "Sweater")   // false
 * matchesAllowedSubcategory("Chambray", "Chambray Shirt") // true (smart partial)
 */
export function matchesAllowedSubcategory(
  garmentSubcategory: string,
  allowedSubcategory: string
): boolean {
  const garmentLower = garmentSubcategory?.toLowerCase().trim() || '';
  const allowedLower = allowedSubcategory?.toLowerCase().trim() || '';
  
  // 1. EXACT MATCH (case-insensitive)
  if (garmentLower === allowedLower) {
    return true;
  }
  
  // 2. SYNONYM MATCH
  // Check if allowedSubcategory is a canonical name in our lookup
  const synonymsForAllowed = GARMENT_SYNONYMS[allowedSubcategory];
  
  if (synonymsForAllowed) {
    // Check if garment's subcategory is in the synonyms list
    const foundSynonym = synonymsForAllowed.some(
      synonym => synonym.toLowerCase() === garmentLower
    );
    
   if (foundSynonym) {
      return true;
    }
  }
  
  // 3. REVERSE CHECK: garment might be canonical, allowed might be synonym
  for (const [canonical, synonyms] of Object.entries(GARMENT_SYNONYMS)) {
    if (canonical.toLowerCase() === garmentLower) {
      // Garment is canonical, check if allowed is a synonym
      if (synonyms.some(syn => syn.toLowerCase() === allowedLower)) {
        return true;
      }
    }
  }
  
  // 4. SMART PARTIAL MATCH (for incomplete subcategories)
  // e.g., "Chambray" should match "Chambray Shirt"
  const garmentWords = garmentLower.split(/\s+/);
  const allowedWords = allowedLower.split(/\s+/);
  
  // Check if garment contains the main descriptor from allowed
  if (allowedWords.length > 1) {
    const mainDescriptor = allowedWords[0]; // e.g., "chambray"
    if (garmentWords.includes(mainDescriptor)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Ensures subcategory includes the garment type suffix
 * 
 * @param subcategory - Raw subcategory from LLM (e.g., "Chambray Button-down", "Oxford")
 * @param category - Garment category (e.g., "Shirt", "Jacket", "Sweater")
 * @returns Normalized subcategory with type suffix (e.g., "Chambray Shirt", "Oxford Shirt")
 * 
 * @example
 * normalizeSubcategory("Chambray Button-down", "Shirt") // "Chambray Shirt"
 * normalizeSubcategory("Oxford", "Shirt") // "Oxford Shirt"
 * normalizeSubcategory("Oxford Shirt", "Shirt") // "Oxford Shirt" (no change)
 * normalizeSubcategory("Bomber", "Jacket") // "Bomber Jacket"
 */
export function normalizeSubcategory(
  subcategory: string | null | undefined,
  category: string
): string {
  if (!subcategory) return category; // If null, return bare category
  
  const subLower = subcategory.toLowerCase().trim();
  const catLower = category.toLowerCase().trim();
  
  // Already has the type suffix? Return as-is
  if (subLower.endsWith(catLower) || subLower.includes(catLower)) {
    return subcategory.trim();
  }
  
  // Common descriptors to remove before adding type suffix
  const descriptorsToRemove = [
    'button-down', 'button-up', 'button down', 'button up',
    'slim fit', 'regular fit', 'relaxed fit',
    'low-top', 'high-top', 'mid-top'
  ];
  
  let cleaned = subLower;
  for (const desc of descriptorsToRemove) {
    cleaned = cleaned.replace(desc, '').trim();
  }
  
  // If cleaned is empty or just whitespace, return category
  if (!cleaned || cleaned.length === 0) {
    return category;
  }
  
  // Capitalize first letter of each word
  const titleCase = cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Add category suffix
  return `${titleCase} ${category}`;
}

/**
 * OUTERWEAR CATEGORY LOOKUPS
 * These functions enable matching garments to broad outerwear categories
 * used in layering templates (e.g., "Winter Outerwear", "Light Outerwear")
 */

/**
 * Lista zimowych okryć wierzchnich (canonical names)
 * Odpowiada sekcji: OUTERWEAR (Winter & Formal) w GARMENT_SYNONYMS
 */
const WINTER_OUTERWEAR_CANONICAL = [
  "Puffer",
  "Parka", 
  "Overcoat",
  "Pea Coat",
  "Duffel Coat",
  "Car Coat",
  "Shearling Jacket"
];

/**
 * Lista lekkich okryć wierzchnich (Spring/Fall/Summer)
 * Odpowiada sekcjom: OUTERWEAR (Spring/Fall) + OUTERWEAR (Summer & Formal)
 */
const LIGHT_OUTERWEAR_CANONICAL = [
  // Spring/Fall
  "Quilted Jacket",
  "Trench",
  "Field Jacket",
  "Waxed Jacket",
  "Bomber",
  "Harrington",
  "Denim Jacket",
  "Safari Jacket",
  "Chore Coat",
  "Varsity Jacket",
  "Coach Jacket",
  "Leather Jacket",
  "Fleece Jacket",
  "Windbreaker",
  "CPO Jacket",
  "Anorak",
  "Technical Jacket",
  // Summer & Formal
  "Linen Blazer",
  "Fresco Wool Blazer"
];

/**
 * Sprawdza czy ubranie jest zimowym okryciem wierzchnim
 * Używa systemu synonimów do dopasowania
 * 
 * @param subcategory - Subcategory ubrania (np. "Puffer Jacket", "Down Jacket")
 * @returns true jeśli ubranie pasuje do kategorii Winter Outerwear
 * 
 * @example
 * isWinterOuterwear("Puffer Jacket") // true (synonym "puffer jacket" → "Puffer")
 * isWinterOuterwear("Down Jacket")   // true (synonym "down jacket" → "Puffer")
 * isWinterOuterwear("Parka")         // true (exact match)
 * isWinterOuterwear("Bomber")        // false (Spring/Fall outerwear)
 */
export function isWinterOuterwear(subcategory: string): boolean {
  return WINTER_OUTERWEAR_CANONICAL.some(canonical => {
    return matchesAllowedSubcategory(subcategory, canonical)
  });
}

/**
 * Sprawdza czy ubranie jest lekkim okryciem wierzchnim (Spring/Fall/Summer)
 * Używa systemu synonimów do dopasowania
 * 
 * @param subcategory - Subcategory ubrania (np. "Bomber Jacket", "Trench Coat")
 * @returns true jeśli ubranie pasuje do kategorii Light Outerwear
 * 
 * @example
 * isLightOuterwear("Bomber Jacket")     // true (synonym "bomber jacket" → "Bomber")
 * isLightOuterwear("Trench Coat")       // true (synonym "trench coat" → "Trench")
 * isLightOuterwear("Linen Blazer")      // true (exact match)
 * isLightOuterwear("Puffer Jacket")     // false (Winter outerwear)
 */
export function isLightOuterwear(subcategory: string): boolean {
  return LIGHT_OUTERWEAR_CANONICAL.some(canonical => 
    matchesAllowedSubcategory(subcategory, canonical)
  );
}
