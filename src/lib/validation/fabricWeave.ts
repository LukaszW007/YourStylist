/**
 * Material and Fabric Weave validation utilities
 * Handles automatic correction and warnings for material/weave combinations
 */

import { VALID_MATERIALS } from './materials';

// Materials that typically indicate fine knit construction
const FINE_KNIT_MATERIALS = [
  'Merino Wool',
  'Cashmere',
  'Vicuna Wool',
  'Angora',
  'Silk',
];

// Materials that typically indicate chunky knit construction
const CHUNKY_KNIT_MATERIALS = [
  'Lambs Wool',
  'Mohair',
];

export interface FabricWeaveWarning {
  hasWarning: boolean;
  message?: string;
  suggestedWeave?: string;
}

/**
 * Validates and auto-corrects fabric weave based on material composition
 * 
 * Rules:
 * - Merino/Cashmere/Vicuna/Angora → usually Knit Fine (not Chunky)
 * - Lambs Wool/Mohair → usually Knit Chunky (not Fine)
 * 
 * @param fabricWeave - Current fabric weave value
 * @param materials - Array of materials
 * @param autoCorrect - Whether to auto-correct (default: true)
 * @returns Corrected weave and warning info
 */
export function validateFabricWeave(
  fabricWeave: string | null | undefined,
  materials: string[] | null | undefined,
  autoCorrect: boolean = true
): {
  correctedWeave: string | null;
  warning: FabricWeaveWarning;
} {
  if (!fabricWeave || !materials || materials.length === 0) {
    return {
      correctedWeave: fabricWeave || null,
      warning: { hasWarning: false },
    };
  }

  const hasFineKnitMaterial = materials.some(m => FINE_KNIT_MATERIALS.includes(m));
  const hasChunkyKnitMaterial = materials.some(m => CHUNKY_KNIT_MATERIALS.includes(m));

  // Case 1: Fine material + Knit Chunky = likely wrong
  if (hasFineKnitMaterial && fabricWeave === 'Knit Chunky') {
    const fineMaterials = materials.filter(m => FINE_KNIT_MATERIALS.includes(m)).join(', ');
    
    if (autoCorrect) {
      console.warn(
        `[Fabric Weave] Auto-correcting: ${fineMaterials} is typically Knit Fine, not Chunky`
      );
      return {
        correctedWeave: 'Knit Fine',
        warning: {
          hasWarning: true,
          message: `Auto-corrected to Knit Fine (${fineMaterials} is typically fine gauge)`,
          suggestedWeave: 'Knit Fine',
        },
      };
    }

    return {
      correctedWeave: fabricWeave,
      warning: {
        hasWarning: true,
        message: `⚠️ ${fineMaterials} is typically Knit Fine, not Chunky. Verify thickness.`,
        suggestedWeave: 'Knit Fine',
      },
    };
  }

  // Case 2: Chunky material + Knit Fine = likely wrong
  if (hasChunkyKnitMaterial && fabricWeave === 'Knit Fine') {
    const chunkyMaterials = materials.filter(m => CHUNKY_KNIT_MATERIALS.includes(m)).join(', ');
    
    if (autoCorrect) {
      console.warn(
        `[Fabric Weave] Auto-correcting: ${chunkyMaterials} is typically Knit Chunky, not Fine`
      );
      return {
        correctedWeave: 'Knit Chunky',
        warning: {
          hasWarning: true,
          message: `Auto-corrected to Knit Chunky (${chunkyMaterials} is typically chunky gauge)`,
          suggestedWeave: 'Knit Chunky',
        },
      };
    }

    return {
      correctedWeave: fabricWeave,
      warning: {
        hasWarning: true,
        message: `⚠️ ${chunkyMaterials} is typically Knit Chunky, not Fine. Verify thickness.`,
        suggestedWeave: 'Knit Chunky',
      },
    };
  }

  return {
    correctedWeave: fabricWeave,
    warning: { hasWarning: false },
  };
}

/**
 * Checks if materials array contains generic "Wool" without specificity
 * 
 * @param materials - Array of materials
 * @returns Warning info if generic wool detected
 */
export function checkWoolPrecision(
  materials: string[] | null | undefined
): FabricWeaveWarning {
  if (!materials || materials.length === 0) {
    return { hasWarning: false };
  }

  const hasGenericWool = materials.includes('Wool');
  
  if (hasGenericWool) {
    return {
      hasWarning: true,
      message: '⚠️ Generic "Wool" detected. Specify type (Merino, Lambs, etc.) for better accuracy.',
    };
  }

  return { hasWarning: false };
}
