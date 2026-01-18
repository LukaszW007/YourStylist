/**
 * Thermal profile validation and auto-correction utilities
 */

import { VALID_MATERIALS } from './materials';

// All wool materials should be classified as Heavy thermal profile
const WOOL_MATERIALS = [
  'Wool',
  'Merino Wool',
  'Lambs Wool',
  'Alpaca Wool',
  'Vicuna Wool',
  'Cashmere',
  'Mohair',
  'Angora',
];

/**
 * Validates and auto-corrects thermal profile based on material composition
 * 
 * Rule: ALL wool types → Heavy (regardless of thickness)
 * Wool has superior insulation properties even when thin
 * 
 * @param thermalProfile - Current thermal profile value
 * @param materials - Array of materials
 * @param autoCorrect - Whether to auto-correct (default: true)
 * @returns Corrected thermal profile
 */
export function validateThermalProfile(
  thermalProfile: string | null | undefined,
  materials: string[] | null | undefined,
  autoCorrect: boolean = true
): {
  correctedProfile: string | null;
  warning?: string;
} {
  if (!materials || materials.length === 0) {
    return { correctedProfile: thermalProfile || null };
  }

  const hasWool = materials.some(m => WOOL_MATERIALS.includes(m));

  // Rule: All wool → Heavy
  if (hasWool && thermalProfile !== 'Heavy' && thermalProfile !== 'Insulated') {
    const woolTypes = materials.filter(m => WOOL_MATERIALS.includes(m)).join(', ');
    
    if (autoCorrect) {
      console.warn(
        `[Thermal Profile] Auto-correcting: ${woolTypes} should be Heavy thermal profile`
      );
      return {
        correctedProfile: 'Heavy',
        warning: `Auto-corrected to Heavy (${woolTypes} has superior insulation)`,
      };
    }

    return {
      correctedProfile: thermalProfile || null,
      warning: `⚠️ ${woolTypes} should typically be Heavy thermal profile`,
    };
  }

  return { correctedProfile: thermalProfile || null };
}
