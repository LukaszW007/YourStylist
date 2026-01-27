# Missing Base Layer Diagnosis

## Problem

**Symptom**: White t-shirt (base_layer) nie pojawia się w outficie
**Example Outfit**: Sweater, Flannel Shirt, Sherling Jumper, Puffer, Boots, Chinos
**Missing**: White T-shirt (mimo że template wymaga `base_layer`)

---

## Root Cause Analysis

### Data Flow: Template → Wardrobe → AI → Outfit

```
1. TEMPLATE SELECTION (generate-outfit.ts:258)
   ↓
   selectedTemplate = { slots: [...] }
   
2. WARDROBE FILTERING (generate-outfit.ts:268)
   ↓
   filteredWardrobe (pomija niektóre garments?)
   
3. AI PROMPT (generate-outfit.ts:322-500)
   ↓
   Template slots → AI instructions
   ↓
   "MUST fill: base_layer, shirt_layer, mid_layer..."
   
4. AI RESPONSE
   ↓
   garment_ids: ["uuid1", "uuid2", ...] 
   ↓
   (NO base_layer UUID?)
   
5. HYDRATION (generate-outfit.ts:540-560)
   ↓
   Maps IDs to actual garments
```

---

## Potential Issues

### Issue 1: AI Ignoruje Base Layer Requirement ❌

**Location**: Prompt template instructions

**Current Prompt** (linia 404-406):
```typescript
1. **SLOT FILLING**: Each outfit MUST include ONE garment for EACH layer
   - Template requires: ${JSON.stringify(selectedTemplate.required_layers)}
   - Layer count: ${selectedTemplate.layer_count}
```

**Problem**: 
- `selectedTemplate.required_layers` to OLD format `["base_layer", "shirt", ...]`
- NEW templates używają `selectedTemplate.slots[]`
- AI może nie rozumieć mapowania między slot names a garment subcategories

### Issue 2: Slot Matching Logic Niepoprawny ❓

**Template slot** (new_layering_templates.json):
```json
{
  "slot_name": "base_layer",
  "allowed_subcategories": ["White T-shirt", "Undershirt"],
  "required": true
}
```

**Wardrobe garment**:
```json
{
  "subcategory": "T-shirt",  // ❌ NIE MATCH "White T-shirt"?
  "name": "White Cotton T-shirt",
  "main_color_name": "White"
}
```

**Problem**: Exact match `"White T-shirt"` vs `"T-shirt"` może failować!

### Issue 3: FilterByLayeringRules Usuwa Base Layer? ❓

**Location**: generate-outfit.ts:268

```typescript
const filteredWardrobe = filterByLayeringRules(garmentsToUse, selectedTemplate.layer_count);
```

Czy `filterByLayeringRules` przypadkiem **POMIJA** base layer thinking it's not needed?

### Issue 4: AI Brak Enforcement dla Specific Subcategories ❌

**Prompt nie mówi**:
- "base_layer MUST be from subcategories: ['White T-shirt', 'Undershirt']"
- "Check inventory for items with subcategory='White T-shirt'"

AI może:
- Myśleć że "base_layer" = optional
- Użyć shirt as base layer (shirt może być layer_type="base" w polymorphism!)

---

## Wymagania użytkownika

### 1. Base Layer Selection
- ✅ Biały t-shirt ZAWSZE w outficie gdy template wymaga base_layer
- ✅ AI MUSI wybrać garment z `allowed_subcategories: ["White T-shirt", "Undershirt"]`

### 2. Image Generation Rules
- ❌ DEFAULT: Biały t-shirt NIE przesyłany do image generation (invisible under other layers)
- ✅ EXCEPTION 1: Koszula `unbuttoned_over_base` → show t-shirt
- ✅ EXCEPTION 2: Koszula `half_buttoned` → show t-shirt

---

## Data Flow Mapping

### Current Flow (BROKEN)

```
Template Slot: "base_layer"
  ↓
AI Inventory: All garments with layer_type="base"
  ↓ (PROBLEM: Shirt can also be layer_type="base"!)
AI Selection: Picks shirt as base_layer (NO white t-shirt!)
  ↓
Outfit: [Shirt, Sweater, Jacket...] ← MISSING T-SHIRT
```

### Correct Flow (NEEDED)

```
Template Slot: "base_layer"
  allowed_subcategories: ["White T-shirt", "Undershirt"]
  ↓
AI Inventory: ONLY garments matching subcategories
  ↓
AI Instruction: "base_layer slot REQUIRES White T-shirt OR Undershirt"
  ↓
AI Selection: White T-shirt UUID
  ↓
Outfit: [White T-shirt, Shirt, Sweater, Jacket...]
```

---

## Fixes Needed

### Fix 1: Strengthen AI Prompt for Slots

**Add to prompt** (generate-outfit.ts ~line 405):
```typescript
**CRITICAL SLOT REQUIREMENTS:**
${selectedTemplate.slots?.map(slot => {
  if (!slot.required) return null;
  return `- ${slot.slot_name}: MANDATORY, MUST select from [${slot.allowed_subcategories.join(', ')}]
    Check inventory for items with subcategory matching these values EXACTLY`;
}).filter(Boolean).join('\n')}
```

### Fix 2: Validate AI Response for Required Slots

**After AI response** (generate-outfit.ts ~line 585):
```typescript
// VALIDATE: Check all required slots are filled
const missingSlots = selectedTemplate.slots?.filter(slot => {
  if (!slot.required) return false;
  
  // Check if outfit has garment matching this slot
  const hasSlot = uniqueGarments.some(g => 
    slot.allowed_subcategories.some(subcat => 
      g.subcategory?.toLowerCase().includes(subcat.toLowerCase())
    )
  );
  
  return !hasSlot;
}) || [];

if (missingSlots.length > 0) {
  console.error(`❌ Missing required slots: ${missingSlots.map(s => s.slot_name).join(', ')}`);
  return null; // Reject outfit
}
```

### Fix 3: Image Generation Filtering

**In generate-look.ts** (~line 50):
```typescript
// Filter out invisible base layers UNLESS shirt is unbuttoned
const visibleGarments = currentOutfit.garments.filter(g => {
  const isBaseLayer = g.subcategory?.toLowerCase().includes('t-shirt') || 
                       g.subcategory?.toLowerCase().includes('undershirt');
  
  if (!isBaseLayer) return true; // Always show non-base layers
  
  // Check if any shirt layer has unbuttoned styling
  const hasUnbuttonedShirt = currentOutfit.stylingMetadata?.some(meta =>
    (meta.slotName === 'shirt_layer' || meta.slotName.includes('shirt')) &&
    (meta.buttoning === 'unbuttoned_over_base' || meta.buttoning === 'half_buttoned')
  );
  
  return hasUnbuttonedShirt; // Show base layer only if shirt unbuttoned
});

// Use visibleGarments for prompt instead of all garments
```

---

## Next Steps

1. ✅ Confirm: Check `filterByLayeringRules` - does it remove base layers?
2. ✅ Fix: Strengthen AI prompt to enforce slot subcategory matching
3. ✅ Fix: Validate AI response has all required slots
4. ✅ Fix: Filter base layer from image generation (unless shirt unbuttoned)
5. ✅ Test: Generate 4-layer outfit, verify white t-shirt present in garments but not in image

Potrzebuję decision - czy implementować wszystkie fix'y?
