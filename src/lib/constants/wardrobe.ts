// src/lib/constants/wardrobe.ts
import { GarmentSeason, LayerType } from "@/types/garment";

export const SEASONS: GarmentSeason[] = ['spring', 'summer', 'autumn', 'winter', 'all'];

export const LAYER_HIERARCHY: Record<LayerType, number> = {
    base: 1,
    mid: 2,
    bottom: 2, // Pants usually go with mid/base
    shoes: 9,
    outer: 3,
    accessory: 10
};
