
'use client';

import React from 'react';
import Image from 'next/image';
import type { GarmentBase } from '@/types/garment';
import { cn } from '@/lib/utils';

// ========== TYPE DEFINITIONS ==========

interface FlatLayCompositionProps {
  garments: GarmentBase[];
  className?: string;
}

// ========== HELPER FUNCTIONS ==========

/**
 * Returns Tailwind CSS classes for a given layer type to create a flat lay effect.
 * @param layerType - The layer type of the garment.
 * @returns A string of Tailwind CSS classes for positioning and layering.
 */
function getLayerStyle(layerType: GarmentBase['layer_type']): string {
    const baseClasses = 'absolute transform transition-all duration-300 ease-in-out';
    const imageSizeClasses = 'w-1/2 max-w-[200px]'; // Control the size of the images

    switch (layerType) {
        case 'base':
            return cn(baseClasses, imageSizeClasses, 'z-20 top-[20%] left-1/2 -translate-x-1/2');
        case 'mid':
            return cn(baseClasses, imageSizeClasses, 'z-30 top-[15%] left-1/2 -translate-x-[60%]');
        case 'outer':
            return cn(baseClasses, imageSizeClasses, 'z-40 top-[5%] left-1/2 -translate-x-1/2 scale-105');
        case 'bottom':
            return cn(baseClasses, imageSizeClasses, 'z-10 top-1/2 left-1/2 -translate-x-1/2');
        case 'shoes':
            return cn(baseClasses, imageSizeClasses, 'z-20 top-[75%] left-1/2 -translate-x-1/2');
        case 'accessory':
            return cn(baseClasses, 'w-1/4 max-w-[100px]', 'z-50 top-[10%] left-[15%]');
        default:
            return cn(baseClasses, imageSizeClasses, 'z-10');
    }
}


// ========== MAIN COMPONENT ==========

/**
 * A component that renders a "virtual" flat lay composition of garments.
 * It takes an array of garment objects with transparent background images
 * and layers them aesthetically using CSS.
 */
export function FlatLayComposition({ garments, className }: FlatLayCompositionProps) {
  return (
    <div className={cn("relative w-full aspect-square rounded-lg bg-slate-100 dark:bg-slate-800/50 overflow-hidden", className)}>
      {garments.map((garment) => (
        <div key={garment.id} className={getLayerStyle(garment.layer_type)}>
            {garment.image_url ? (
                <Image
                    src={garment.image_url}
                    alt={garment.name}
                    width={200}
                    height={200}
                    className="object-contain drop-shadow-md"
                />
            ) : null}
        </div>
      ))}
    </div>
  );
}
