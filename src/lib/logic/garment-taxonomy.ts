/**
 * Comprehensive garment type taxonomy for CLO calculation
 * Sources: ISO 9920, clo_taxonomy_research.md, Polish Menswear Taxonomy
 * 
 * FORMULA: FINAL_CLO = GARMENT_BASE × MATERIAL_MOD × WEAVE_MOD
 */

// ============================================================
// PART 1: GARMENT BASE CLO (Pure Construction)
// ============================================================

export const GARMENT_BASE_CLO: Record<string, number> = {
  // ===== FORMAL TAILORING =====
  'tailcoat': 0.55,
  'tuxedo': 0.48,
  'morning_coat': 0.50,
  'suit_jacket': 0.40,
  'blazer': 0.38,
  'sport_coat': 0.36,
  'unstructured_blazer': 0.32,
  'structured_blazer': 0.40,
  
  // ===== SHIRTS / BASE LAYER =====
  'tank_top': 0.08,
  'sleeveless_shirt': 0.10,
  'short_sleeve_tshirt': 0.15,
  'long_sleeve_tshirt': 0.20,
  'polo_short_sleeve': 0.18,
  'polo_long_sleeve': 0.23,
  'dress_shirt': 0.20,
  'casual_shirt': 0.22,
  'overshirt': 0.35,
  'hoodie': 0.32,
  
  // ===== KNITWEAR =====
  'sweater': 0.30,
  'v_neck_sweater': 0.28,
  'crew_neck_sweater': 0.32,
  'turtleneck': 0.35,
  'rollneck': 0.33,
  'cardigan': 0.38,
  'shawl_cardigan': 0.50,
  'zip_cardigan': 0.42,
  'sweater_vest': 0.18,
  'gilet': 0.35,
  
  // ===== COATS =====
  'chesterfield': 1.00,
  'covert_coat': 0.90,
  'pea_coat': 1.10,
  'trench_coat': 0.55,
  'mac_coat': 0.50,
  'duffle_coat': 1.20,
  'ulster_coat': 1.15,
  'polo_coat': 1.05,
  'car_coat': 0.65,
  'overcoat': 1.00,
  'topcoat': 0.80,
  
  // ===== JACKETS =====
  'bomber_jacket': 0.52,
  'biker_jacket': 0.55,
  'shearling_jacket': 2.20,
  'field_jacket': 0.45,
  'harrington_jacket': 0.50,
  'waxed_jacket': 0.55,
  'waxed_jacket_lined': 0.75,
  'husky_jacket': 0.70,
  'quilted_jacket': 0.70,
  'puffer_jacket': 1.50,
  'parka': 2.00,
  'trucker_jacket': 0.48,
  'denim_jacket': 0.48,
  'varsity_jacket': 0.55,
  'safari_jacket': 0.38,
  'norfolk_jacket': 0.42,
  'chore_jacket': 0.40,
  'anorak': 0.80,
  'windbreaker': 0.40,
  'leather_jacket': 0.55,
  'suede_jacket': 0.50,
  
  // ===== TROUSERS =====
  'shorts': 0.08,
  'lightweight_trousers': 0.18,
  'dress_trousers': 0.22,
  'odd_trousers': 0.24,
  'flannel_trousers': 0.34,
  'chinos': 0.24,
  'jeans': 0.26,
  'cargo_pants': 0.28,
  'corduroys': 0.32,
  'moleskin_trousers': 0.35,
  'joggers': 0.22,
  
  // ===== SHOES =====
  'oxford_shoes': 0.06,
  'wholecut': 0.06,
  'derby_shoes': 0.05,
  'monk_strap': 0.05,
  'loafers': 0.04,
  'chelsea_boots': 0.07,
  'chukka_boots': 0.08,
  'dress_boots': 0.08,
  'work_boots': 0.10,
  'winter_boots': 0.15,
  'sneakers': 0.05,
  'sandals': 0.02,
  'hiking_boots': 0.12,
  
  // ===== ACCESSORIES =====
  'flat_cap': 0.12,
  'fedora': 0.10,
  'beanie': 0.12,
  'scarf': 0.15,
  'gloves': 0.08,
  'belt': 0.00,
};

// ============================================================
// PART 2: MATERIAL CLO MULTIPLIERS
// ============================================================

export const MATERIAL_CLO_MULTIPLIER: Record<string, number> = {
  // === Natural Plant Fibers ===
  'cotton': 1.00,
  'linen': 0.70,
  'hemp': 0.80,
  
  // === Wool Family (SPECIFIC TYPES) ===
  'wool': 1.35,              // Generic wool → use merino as default
  'merino': 1.30,
  'merino wool': 1.30,
  'lambswool': 1.40,
  'lambs wool': 1.40,
  'shetland': 1.35,
  'shetland wool': 1.35,
  'cashmere': 1.70,
  'mohair': 1.45,
  'alpaca': 1.50,
  'alpaca wool': 1.50,
  'vicuna': 1.80,
  'angora': 1.60,
  'camel': 1.50,
  'camel hair': 1.50,
  'yak': 1.55,
  
  // === Other Animal Fibers ===
  'silk': 0.75,
  'leather': 1.10,
  'suede': 1.05,
  'nubuck': 1.05,
  
  // === Regenerated Fibers ===
  'viscose': 0.90,
  'rayon': 0.90,
  'lyocell': 0.95,
  'tencel': 0.95,
  'modal': 0.92,
  'cupro': 0.90,
  
  // === Synthetic Fibers ===
  'polyester': 0.95,
  'nylon': 0.98,
  'acrylic': 1.10,
  'elastane': 1.00,
  'spandex': 1.00,
  
  // === Technical / Insulation ===
  'fleece': 1.50,
  'polar': 1.50,
  'down': 2.80,
  'synthetic fill': 2.20,
  'primaloft': 2.10,
  'thinsulate': 1.80,
  'shearling': 2.40,
  'gore-tex': 1.00,
  'waxed cotton': 1.08,
  
  // === Blends (PENALTY RULES) ===
  'wool blend': 1.15,              // Wool + synthetic penalty
  'wool_synthetic_blend': 1.15,    // Explicit blend
  'cotton blend': 0.95,
  'blend': 0.90,                   // Generic unknown blend
};

// ============================================================
// PART 3: WEAVE / FABRIC CLO MODIFIERS
// ============================================================

export const WEAVE_CLO_MODIFIER: Record<string, number> = {
  // === Basic Weaves ===
  'standard': 1.00,
  'plain_weave': 1.00,
  'twill': 1.05,
  'satin': 0.90,
  'basket_weave': 1.02,
  
  // === Shirt Fabrics ===
  'poplin': 0.95,
  'oxford': 1.08,
  'pinpoint': 1.00,
  'broadcloth': 0.92,
  'chambray': 1.02,
  'voile': 0.80,
  'seersucker': 0.75,
  
  // === Suiting Fabrics ===
  'worsted': 1.00,
  'flannel': 1.25,
  'tweed': 1.20,
  'hopsack': 0.95,
  'fresco': 0.80,
  'tropical': 0.85,
  'gabardine': 1.08,
  'herringbone': 1.05,
  'sharkskin': 0.98,
  'chino': 1.05,
  
  // === Knits (GAUGE MODIFIERS) ===
  'knit_fine': 1.00,
  'knit_chunky': 1.35,
  'jersey': 0.95,
  'rib_knit': 1.05,
  'cable_knit': 1.30,
  'waffle_knit': 1.15,
  'pique': 1.05,
  
  // === Textured Fabrics ===
  'corduroy': 1.25,
  'velvet': 1.20,
  'velour': 1.18,
  'moleskin': 1.20,
  'boucle': 1.15,
  'terry': 1.10,
  'denim': 1.12,
  'canvas': 1.05,
  
  // === Finishes ===
  'waxed': 1.10,
  'brushed': 1.15,
  'quilted': 1.30,
  'insulated': 2.00,
};

// ============================================================
// PART 4: GARMENT ALIASES (Polish → English)
// ============================================================

export const GARMENT_ALIASES: Record<string, string> = {
  // Formal
  'frak': 'tailcoat',
  'smoking': 'tuxedo',
  'żakiet': 'morning_coat',
  'jaskółka': 'morning_coat',
  'marynarka': 'blazer',
  
  // Trousers
  'chino': 'chinos',
  'chinosy': 'chinos',
  'jeansy': 'jeans',
  'sztruksy': 'corduroys',
  'bojówki': 'cargo_pants',
  'spodnie': 'dress_trousers',
  
  // Tops
  't-shirt': 'short_sleeve_tshirt',
  'tshirt': 'short_sleeve_tshirt',
  'koszulka': 'short_sleeve_tshirt',
  'longsleeve': 'long_sleeve_tshirt',
  'polo': 'polo_short_sleeve',
  'golf': 'turtleneck',
  'półgolf': 'rollneck',
  'sweter': 'sweater',
  'bluza': 'hoodie',
  'kardigan': 'cardigan',
  
  // Coats
  'dyplomatka': 'chesterfield',
  'bosmanka': 'pea_coat',
  'trencz': 'trench_coat',
  'budrysówka': 'duffle_coat',
  'płaszcz': 'overcoat',
  
  // Jackets
  'ramoneska': 'biker_jacket',
  'pilotka': 'shearling_jacket',
  'harringtonka': 'harrington_jacket',
  'katana': 'trucker_jacket',
  'jeansówka': 'denim_jacket',
  'husky': 'husky_jacket',
  'puchówka': 'puffer_jacket',
  'wiatrówka': 'windbreaker',
  'kurtka': 'jacket',
  
  // Shoes
  'wiedenki': 'oxford_shoes',
  'angielki': 'derby_shoes',
  'monki': 'monk_strap',
  'mokasyny': 'loafers',
  'lotniki': 'wholecut',
  'sztyblety': 'chelsea_boots',
  'trzewiki': 'dress_boots',
  'sneakersy': 'sneakers',
  'buty': 'shoes',
};

// ============================================================
// PART 5: HELPER FUNCTIONS
// ============================================================

/**
 * Detect garment type from subcategory or name
 * Returns the key for GARMENT_BASE_CLO lookup
 */
export function detectGarmentType(subcategory: string, name: string): string {
  const combined = `${subcategory} ${name}`.toLowerCase();
  
  // 1. Check aliases first (Polish → English)
  for (const [alias, garmentType] of Object.entries(GARMENT_ALIASES)) {
    if (combined.includes(alias)) {
      return garmentType;
    }
  }
  
  // 2. Direct match in GARMENT_BASE_CLO
  const sortedKeys = Object.keys(GARMENT_BASE_CLO).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    const searchKey = key.replace(/_/g, ' ');
    if (combined.includes(searchKey) || combined.includes(key)) {
      return key;
    }
  }
  
  // 3. Fallback to generic category detection
  if (combined.includes('shirt')) return 'casual_shirt';
  if (combined.includes('sweater') || combined.includes('sweter')) return 'sweater';
  if (combined.includes('jacket') || combined.includes('kurtka')) return 'field_jacket';
  if (combined.includes('coat') || combined.includes('płaszcz')) return 'overcoat';
  if (combined.includes('trousers') || combined.includes('pants') || combined.includes('spodnie')) return 'dress_trousers';
  if (combined.includes('boot') || combined.includes('buty')) return 'chelsea_boots';
  if (combined.includes('shoe')) return 'derby_shoes';
  
  return 'casual_shirt'; // Ultimate fallback
}

/**
 * Get material CLO modifier from material array
 * Handles blend detection and wool-synthetic downgrade
 */
export function getMaterialModifier(materials: string[]): number {
  if (!materials || materials.length === 0) {
    return 1.0; // Cotton baseline
  }
  
  const materialsLower = materials.map(m => m.toLowerCase());
  
  // Define material categories
  const woolTypes = ['wool', 'merino', 'cashmere', 'mohair', 'alpaca', 'angora', 'lambswool', 'shetland', 'vicuna', 'camel', 'yak'];
  const syntheticTypes = ['polyester', 'nylon', 'acrylic', 'elastane', 'spandex', 'synthetic'];
  
  const hasWool = materialsLower.some(m => woolTypes.some(w => m.includes(w)));
  const hasSynthetic = materialsLower.some(m => syntheticTypes.some(s => m.includes(s)));
  
  // BLEND DETECTION: Wool + Synthetic = penalty
  if (hasWool && hasSynthetic) {
    console.log('[CLO] Wool-synthetic blend detected, applying penalty (1.15)');
    return MATERIAL_CLO_MULTIPLIER['wool_synthetic_blend'];
  }
  
  // Single material lookup (first match wins)
  for (const material of materialsLower) {
    // Check for exact match first
    if (MATERIAL_CLO_MULTIPLIER[material]) {
      return MATERIAL_CLO_MULTIPLIER[material];
    }
    
    // Check for partial match
    for (const [key, value] of Object.entries(MATERIAL_CLO_MULTIPLIER)) {
      if (material.includes(key) || key.includes(material)) {
        return value;
      }
    }
  }
  
  // Default to cotton if nothing matches
  return 1.0;
}

/**
 * Get weave/fabric CLO modifier from fabric_weave field or name
 */
export function getWeaveModifier(fabricWeave: string | undefined, name: string): number {
  const combined = `${fabricWeave || ''} ${name}`.toLowerCase();
  
  // Check knit gauge first (for knitwear)
  if (combined.includes('chunky') || combined.includes('cable') || combined.includes('aran')) {
    return WEAVE_CLO_MODIFIER['knit_chunky'];
  }
  if (combined.includes('fine gauge') || combined.includes('merino') || combined.includes('thin knit')) {
    return WEAVE_CLO_MODIFIER['knit_fine'];
  }
  
  // Check fabric_weave directly
  if (fabricWeave) {
    const weaveKey = fabricWeave.toLowerCase().replace(/\s+/g, '_');
    if (WEAVE_CLO_MODIFIER[weaveKey]) {
      return WEAVE_CLO_MODIFIER[weaveKey];
    }
  }
  
  // Check name for weave indicators
  for (const [key, value] of Object.entries(WEAVE_CLO_MODIFIER)) {
    const searchKey = key.replace(/_/g, ' ');
    if (combined.includes(searchKey)) {
      return value;
    }
  }
  
  return 1.0; // Standard weave
}

/**
 * Calculate final CLO using 3-factor formula
 * FINAL_CLO = GARMENT_BASE × MATERIAL_MOD × WEAVE_MOD
 */
export function calculateCLO(
  subcategory: string,
  name: string,
  materials: string[],
  fabricWeave?: string
): { finalClo: number; baseClo: number; materialMod: number; weaveMod: number; garmentType: string } {
  const garmentType = detectGarmentType(subcategory, name);
  const baseClo = GARMENT_BASE_CLO[garmentType] || 0.20;
  const materialMod = getMaterialModifier(materials);
  const weaveMod = getWeaveModifier(fabricWeave, name);
  
  const finalClo = baseClo * materialMod * weaveMod;
  
  return {
    finalClo,
    baseClo,
    materialMod,
    weaveMod,
    garmentType
  };
}
