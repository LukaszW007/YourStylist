# Refine CLO Logic and Remove Thermal Profile

## Goal Description
The user wants to know if `thermal_profile` can be skipped given the development of the CLO formula.
My analysis confirms that `thermal_profile` is largely redundant and acts as a crude fallback for the more precise CLO calculation.
Additionally, there is currently **duplicate and conflicting logic** between:
1. `src/lib/logic/garment-taxonomy.ts` (The robust 3-factor formula: Base * Material * Weave)
2. `src/lib/wardrobe/classification.ts` (A simpler material-only lookup)

This plan proposes to:
1.  Answer "Yes" to the user's question.
2.  **Remove `thermal_profile`** from the data model and types.
3.  **Consolidate CLO logic**: Update `classification.ts` (used at ingestion) to use the robust `calculateCLO` from `garment-taxonomy.ts` instead of maintaining its own material specs.

## User Review Required
> [!IMPORTANT]
> **Database Schema Change**: This plan effectively deprecates the `thermal_profile` column. We will not remove the column from the database (to avoid migration complexity for now), but we will stop populating and reading it in the application code.
>
> **Logic Consolidation**: `classification.ts` currently calculates simpler CLO values. We will replace this with the advanced `garment-taxonomy.ts` formula. This means newly scanned items will get more accurate CLO values immediately.

## Proposed Changes

### Logic & Types
#### [MODIFY] [types/garment.ts](file:///f:/Worskpace/YourStylistApp/gentstylo/src/types/garment.ts)
- Remove `thermal_profile` from `GarmentBase` interface.

#### [MODIFY] [lib/logic/types.ts](file:///f:/Worskpace/YourStylistApp/gentstylo/src/lib/logic/types.ts)
- Remove `thermal_profile` from `GarmentBase` interface.
- Remove `ThermalProfile` type definition.

#### [MODIFY] [lib/supabase/wardrobe.ts](file:///f:/Worskpace/YourStylistApp/gentstylo/src/lib/supabase/wardrobe.ts)
- Stop populating `thermal_profile` in `addGarmentsToWardrobe`.
- Update naming/usage to reflect the removal.

#### [MODIFY] [lib/wardrobe/classification.ts](file:///f:/Worskpace/YourStylistApp/gentstylo/src/lib/wardrobe/classification.ts)
- **Deprecate/Remove** `MATERIAL_SPECS` and `averageClo`.
- Update `computeComfortRange` to use `calculateCLO` from `src/lib/logic/garment-taxonomy.ts`.
- Note: This requires `subcategory` and `fabricWeave` arguments. We will update the function signature.

#### [MODIFY] [lib/logic/sartorial-physics.ts](file:///f:/Worskpace/YourStylistApp/gentstylo/src/lib/logic/sartorial-physics.ts)
- Remove the fallback check `|| garment.thermal_profile === 'Insulated'`.
- Rely solely on `estimatedClo` for "Heavy Insulation" detection.

## Verification Plan

### Manual Verification
1.  **Scan/Add New Item**: Use the scanner (or simulation) to add a new garment (e.g., a "Wool Sweater").
2.  **Verify Database/Log**: Check that the inserted record calculates valid `comfort_min_c` / `comfort_max_c` based on the new rigorous CLO formula.
3.  **Verify Physics**: Check `detectPhysics` logs (visible in console) to ensure CLO is calculated correctly without `thermal_profile`.
4.  **Regression Test**: Ensure existing items (which still have `thermal_profile` in DB but ignored by code) still function in `generate-outfit`.
