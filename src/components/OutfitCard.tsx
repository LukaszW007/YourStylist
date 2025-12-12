
"use client";

import React from "react";
import { RefreshCw, Thermometer } from "lucide-react";
import type { GarmentBase } from "@/types/garment";

// ========== TYPE DEFINITIONS ==========

// The structure of the outfit data prop, using GarmentBase
type OutfitData = {
  [key: string]: GarmentBase | undefined;
  base?: GarmentBase;
  mid?: GarmentBase;
  outer?: GarmentBase;
  bottom?: GarmentBase;
  shoes?: GarmentBase;
};

// Props for the OutfitCard component
interface OutfitCardProps {
  outfitData: OutfitData;
  weather: string;
  reasoning: string;
  onRegenerate: () => void; // Callback for the regenerate button
}

// ========== SUB-COMPONENTS ==========

/**
 * Renders a single garment item in a card.
 */
const GarmentCard: React.FC<{ garment: GarmentBase; className?: string }> = ({ garment, className = "" }) => {
  return (
    <div className={`rounded-lg bg-slate-50/50 dark:bg-slate-800/50 p-4 flex flex-col justify-between items-center text-center ${className}`}>
      <div className="h-40 w-full flex items-center justify-center">
        {garment.image_url ? (
          <img
            src={garment.image_url}
            alt={garment.name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="h-full w-full bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center">
            <span className="text-xs text-slate-500">No Image</span>
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className="text-sm font-semibold truncate dark:text-slate-200">{garment.name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{garment.brand || "Unbranded"}</p>
      </div>
    </div>
  );
};

// ========== MAIN COMPONENT ==========

/**
 * A component to display a generated outfit suggestion in a "flat lay" style.
 */
export const OutfitCard: React.FC<OutfitCardProps> = ({ outfitData, weather, reasoning, onRegenerate }) => {
  // Filter out any undefined or null garments to get an accurate count and list
  const validGarments = Object.values(outfitData).filter((g): g is GarmentBase => !!g);
  
  const garmentCount = validGarments.length;

  // Function to determine grid classes based on the number of items
  const getGridConfig = () => {
    switch (garmentCount) {
      case 5:
        // 3-column top row, 2-column bottom row
        return "grid grid-cols-6 gap-4";
      case 4:
        // 2x2 grid
        return "grid grid-cols-2 gap-4";
      case 3:
        // 1 row, 3 columns
        return "grid grid-cols-3 gap-4";
      default:
        // Fallback for 1, 2, or more than 5 items
        return "grid grid-cols-2 sm:grid-cols-3 gap-4";
    }
  };
  
  const getGarmentSpan = (key: keyof OutfitData) => {
      if (garmentCount === 5) {
          return ['outer', 'mid', 'base'].includes(key as string) ? 'col-span-2' : 'col-span-3';
      }
      return '';
  }

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Your Outfit Suggestion</h2>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Thermometer className="h-5 w-5" />
          <span>{weather}</span>
        </div>
      </div>

      {/* Garment Grid */}
      {garmentCount > 0 ? (
        <div className={getGridConfig()}>
          {outfitData.outer && <GarmentCard garment={outfitData.outer} className={getGarmentSpan('outer')} />}
          {outfitData.mid && <GarmentCard garment={outfitData.mid} className={getGarmentSpan('mid')} />}
          {outfitData.base && <GarmentCard garment={outfitData.base} className={getGarmentSpan('base')} />}
          {outfitData.bottom && <GarmentCard garment={outfitData.bottom} className={getGarmentSpan('bottom')} />}
          {outfitData.shoes && <GarmentCard garment={outfitData.shoes} className={getGarmentSpan('shoes')} />}
        </div>
      ) : (
        <div className="text-center py-10 border-dashed border-2 border-slate-300 dark:border-slate-700 rounded-lg">
            <p className="text-slate-500">No outfit to display.</p>
        </div>
      )}
      
      {/* AI Reasoning Section */}
      <div className="mt-8">
        <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200 mb-2">Stylist's Note</h3>
        <p className="text-slate-600 dark:text-slate-300/90 leading-relaxed italic font-serif">
          "{reasoning}"
        </p>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
        <button
          onClick={onRegenerate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-blue-500"
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </button>
      </div>
    </div>
  );
};

