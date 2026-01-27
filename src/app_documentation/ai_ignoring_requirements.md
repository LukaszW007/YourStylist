# AI Ignores CRITICAL SLOT REQUIREMENTS - Root Cause

## User's Correct Diagnosis ✅

**User**: "W uniqueGarments nie znajdziemy żadnego t-shirt'u bo to sa ubrania juz wybrane z calej garderoby"

**CORRECT!** Problem NIE jest w walidacji - problem jest że **AI nie wybiera wymaganych garments**.

## Evidence from Logs

**uniqueGarments** (what AI selected):
```json
[
  { "subcategory": "V-neck Sweater", "name": "Merino Wool Sherling Jumper" },
  { "subcategory": "Puffer Jacket", "name": "Synthetic Puffer Jacket" },
  { "subcategory": "Chinos", "name": "Cotton Chinos" },
  { "subcategory": "Hiking Boots", "name": "Black" }  // x3 duplicates!
]
```

**Missing** (required by template):
- ❌ White T-shirt (base_layer slot)
- ❌ Cotton Shirt (shirt_layer slot)
- ❌ Winter Outerwear (outer_layer - AI used Puffer instead)

**Template requires**:
```
base_layer: [White T-shirt, Undershirt] - REQUIRED
shirt_layer: [Cotton Shirt] - REQUIRED
mid_layer: [Sweater, Cardigan, Shawl Cardigan, Blazer] - REQUIRED
outer_layer: [Winter Outerwear, Parka, Overcoat, Pea Coat] - REQUIRED
```

**AI selected**: Sweater + Puffer + Chinos + Boots (NO base, NO shirt!)

---

## Why AI Ignores Instructions

### Problem 1: Template String Interpolation

**Current code** (generate-outfit.ts:413-422):
```typescript
1. **CRITICAL SLOT REQUIREMENTS** (MANDATORY):
${selectedTemplate.slots ? selectedTemplate.slots.map((slot: any) => {
  if (!slot.required) return null;
  const subcats = slot.allowed_subcategories?.slice(0, 3).join(' OR ') || '';
  return `   - **${slot.slot_name}**: REQUIRED - MUST select from [${subcats}...]
     * Check inventory for items matching these values
     * This slot is MANDATORY - outfit is INVALID without it`;
}).filter(Boolean).join('\n') : ''}
```

**Potential Issues**:
1. `\n` might not render as newlines in template literal
2. Instructions too verbose - AI may skip long blocks
3. No emphasis on REJECTION consequences

### Problem 2: AI Response Format

AI might be interpreting "CRITICAL" as suggestion, not requirement.

### Problem 3: Inventory Availability

**Check**: Does inventory actually HAVE white t-shirts?

Need to see full AI prompt and verify inventory contains required items.

---

## Solution Options

### Option A: Simplify & Strengthen Prompt

```typescript
**MANDATORY GARMENT SELECTION (CRITICAL - FAILURE TO COMPLY = REJECTED):**

YOU MUST INCLUDE EXACTLY ONE GARMENT FROM EACH LIST BELOW:

1. BASE LAYER (choose 1): White T-shirt, Undershirt
2. SHIRT LAYER (choose 1): Cotton Shirt  
3. MID LAYER (choose 1): Sweater, Cardigan, Shawl Cardigan, Blazer
4. OUTER LAYER (choose 1): Winter Outerwear, Parka, Overcoat, Pea Coat

⚠️ OUTFITS MISSING ANY LAYER WILL BE AUTOMATICALLY REJECTED ⚠️
```

### Option B: Pre-filter Inventory

Force-include required garments at top of inventory list:
```typescript
// Before sending to AI
const requiredGarments = selectedTemplate.slots
  .filter(s => s.required)
  .flatMap(slot => {
    return wardrobePayload.filter(g => 
      slot.allowed_subcategories.some(allowed =>
        g.txt.toLowerCase().includes(allowed.toLowerCase())
      )
    ).slice(0, 2); // Top 2 matches per slot
  });

const prioritizedPayload = [
  ...requiredGarments,
  ...wardrobePayload.filter(g => !requiredGarments.some(r => r.id === g.id))
];
```

### Option C: Two-Pass Approach

1. **First prompt**: Select REQUIRED slots ONLY
2. **Second prompt**: Add optional garments for style

### Option D: Check Inventory First

**BEFORE blaming AI**, verify inventory HAS white t-shirts:
```typescript
const hasWhiteTShirt = wardrobe.some(g => 
  (g.subcategory?.toLowerCase().includes('t-shirt') || 
   g.subcategory?.toLowerCase().includes('undershirt')) &&
  g.main_color_name?.toLowerCase().includes('white')
);

console.log(`🔍 [INVENTORY CHECK] Has white t-shirt: ${hasWhiteTShirt}`);
```

---

## Recommendation

**FIRST**: Check if inventory has required garments (Option D)
**THEN**: If yes, simplify prompt (Option A)
**FALLBACK**: Pre-filter inventory (Option B)

Need to see:
1. Full AI prompt being sent
2. Inventory list to confirm white t-shirts exist
3. AI raw response to see what it's "thinking"
