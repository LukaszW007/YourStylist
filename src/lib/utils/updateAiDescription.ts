// src/lib/utils/updateAiDescription.ts

/**
 * Synchronizes ai_description with user-edited attributes
 * 
 * Algorithm:
 * 1. Compare original vs edited values for: colorName, fabricWeave, materials
 * 2. For each changed field, find and replace in ai_description
 * 3. Use smart case-insensitive matching
 * 
 * Example:
 * - Original ai_description: "navy sweater knit chunky wool"
 * - User changes: burgundy, knit-fine, merino wool
 * - Result: "burgundy sweater knit fine merino wool"
 */

interface GarmentAttributes {
  colorName?: string | null;
  fabricWeave?: string | null;
  materials?: string[] | null;
}

export function updateAiDescription(
  originalDescription: string | null | undefined,
  originalAttrs: GarmentAttributes,
  editedAttrs: GarmentAttributes
): string | null {
  if (!originalDescription) return null;
  
  let updated = originalDescription;
  
  // 1. Update color name
  if (originalAttrs.colorName && editedAttrs.colorName && 
      originalAttrs.colorName.toLowerCase() !== editedAttrs.colorName.toLowerCase()) {
    const colorRegex = new RegExp(`\\b${escapeRegex(originalAttrs.colorName)}\\b`, 'gi');
    updated = updated.replace(colorRegex, editedAttrs.colorName);
    console.log(`[AI Desc Sync] Color: "${originalAttrs.colorName}" → "${editedAttrs.colorName}"`);
  }
  
  // 2. Update fabric weave
  if (originalAttrs.fabricWeave && editedAttrs.fabricWeave && 
      originalAttrs.fabricWeave.toLowerCase() !== editedAttrs.fabricWeave.toLowerCase()) {
    // Handle both "chunky" and "knit chunky" patterns
    const weaveWords = originalAttrs.fabricWeave.toLowerCase().split(/[\s-]+/);
    
    for (const word of weaveWords) {
      if (word.length > 2) { // Skip very short words
        const wordRegex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi');
        updated = updated.replace(wordRegex, editedAttrs.fabricWeave.toLowerCase().split(/[\s-]+/)[weaveWords.indexOf(word)] || word);
      }
    }
    
    console.log(`[AI Desc Sync] Weave: "${originalAttrs.fabricWeave}" → "${editedAttrs.fabricWeave}"`);
  }
  
  // 3. Update material (first/dominant material only)
  const originalMaterial = originalAttrs.materials?.[0];
  const editedMaterial = editedAttrs.materials?.[0];
  
  if (originalMaterial && editedMaterial && 
      originalMaterial.toLowerCase() !== editedMaterial.toLowerCase()) {
    const materialRegex = new RegExp(`\\b${escapeRegex(originalMaterial)}\\b`, 'gi');
    updated = updated.replace(materialRegex, editedMaterial);
    console.log(`[AI Desc Sync] Material: "${originalMaterial}" → "${editedMaterial}"`);
  }
  
  return updated;
}

/**
 * Escapes special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
