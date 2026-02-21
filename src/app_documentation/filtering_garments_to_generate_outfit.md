# Garment Filtering Pipeline & Debug Analysis

## Overview
This document outlines the data flow for garment filtering in `generate-outfit.ts`, explaining how items are selected, validated, and passed to the LLM. It also diagnoses why the "charcoal gray puffer jacket" persisted in cold weather despite strict rules.

## Data Flow Pipeline

### 1. Database Fetch (`getGarments`)
- **Source:** Supabase `garments` table.
- **Data:** Fetches all garments for the user (including `comfort_min_c`, `category`, `subcategory`, `wear_count`).
- **File:** `src/app/actions/generate-outfit.ts` (lines ~137)

### 2. Sartorial Physics Engine (`analyzeGarmentPhysics`)
- **Purpose:** Applies physical rules to filter out unsuitable items (e.g., cotton in rain, overheating, freezing).
- **Core Logic:** `src/lib/logic/sartorial-physics.ts`
- **Critical Check:** `isCriticalWeatherLayer` determines if an item MUST meet `comfort_min_c`.
- **The Leak:** 
    - Function `isCriticalWeatherLayer` checks: `category === 'outerwear'`.
    - Database returns capitalized `"Outerwear"`.
    - Check fails (`"Outerwear" !== "outerwear"`).
    - Result: The Puffer Jacket is treated as a **Mid Layer** instead of Outerwear.
    - Consequence: Mid layers are **allowed** in cold weather (assuming they are worn *under* a coat).
    - **Verdict:** The jacket wrongly passes this filter.

### 3. Category Fallback (`getWarmestByCategory`)
- **Purpose:** If a critical category (e.g., Outerwear) is empty after Physics, adds the warmest available item to prevent "naked" slots.
- **Logic:** `src/app/actions/generate-outfit.ts` (lines ~202)
- **Status:** Since the Puffer Jacket *passed* the Physics filter (due to the bug above), this Fallback never triggered for Outerwear (because `validGarments` already contained the Puffer). The strict checks added here were bypassed because the item was already "valid".

### 4. Layering Rules (`filterByLayeringRules`)
- **Purpose:** Filters based on outfit complexity (e.g., no short sleeves in 3-layer outfits).
- **Logic:** `src/app/actions/generate-outfit.ts` (lines ~310)
- **Status:** Puffer jacket (long sleeve) passes these rules.

### 5. Template Selection (`validateTemplateAgainstWardrobe`)
- **Purpose:** Selects templates (e.g., "Business Casual 3-Piece") based on *unfiltered* wardrobe availability.
- **Status:** Selects templates that require "Winter Outerwear".

### 6. Slot Filling (`slotBuckets`)
- **Purpose:** Matches filtered garments to template slots.
- **Logic:** `src/app/actions/generate-outfit.ts` (lines ~437)
- **Matching:** Uses `matchesAllowedSubcategory` or `isWinterOuterwear`.
- **Result:** The Puffer Jacket matches "Winter Outerwear" slot. Since it is in `filteredWardrobe` (due to the Physics leak), it is added to the bucket.

### 7. LLM Prompt Generation
- **Purpose:** Constructs the JSON payload for the LLM.
- **Data:** `randomizedBuckets` (derived from `slotBuckets`).
- **Result:** The Puffer Jacket is listed in the "Outerwear" slot choices.
- **LLM Behavior:** Although the prompt says "Check temp", the LLM sees the item in the valid list and may select it if it's the only option or if it hallucinates appropriateness.

## Root Cause Analysis
The persistent appearance of the **charcoal gray puffer jacket** (rated for 0°C) in -16°C weather is due to a **Case Sensitivity Bug** in `src/lib/logic/sartorial-physics.ts`.

- **Function:** `isCriticalWeatherLayer`
- **Bug:** `category === 'outerwear'` (Strict equality, case sensitive)
- **Database Value:** `"Outerwear"` (Capitalized)
- **Effect:** The function returned `false`, classifying the jacket as a non-critical layer (like a shirt/sweater). Non-critical layers do not enforce `comfort_min_c` below 15°C (assuming layering).
- **Fix:** Normalize category to lowercase before comparison: `category.toLowerCase() === 'outerwear'`.

## Conclusion
Fixing the case sensitivity in `sartorial-physics.ts` will correctly classify the Puffer Jacket as "Outerwear". It will then hit the strict `t_app < comfort_min_c - margin` check (-16 < 0 - 5) and be **Rejected**. This will alert the "Category Fallback", which (after recent fixes) will *also* reject it because 0 > -16. The final inventory passed to LLM will be empty of outerwear, triggering the "Missing Garment Message" flow.
