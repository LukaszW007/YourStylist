// src/types/garment.ts
export type GarmentSeason = 'spring' | 'summer' | 'autumn' | 'winter' | 'all';

export type LayerType = "base" | "mid" | "outer" | "bottom" | "shoes" | "accessory";

export interface GarmentBase {
	id: string;
	full_name: string;
	category: string; // ei. 'Tops'
	subcategory: string | null; // ei. 'Sweater', 'Cardigan'
	brand: string | null;
	material: string[] | null;
	layer_type: LayerType;
    season: GarmentSeason[] | null;
	main_color_name: string | null;
	main_color_hex?: string | null;
	fabric_weave?: string | null;
	thermal_profile?: string | null;
	color_temperature: string | null;
	pattern: string | null;
	style_context: string | null;
	image_url: string;
	comfort_min_c: number | null;
	comfort_max_c: number | null;
	ai_description?: string | null;
	wear_count?: number | null;
	last_worn_date?: string | null;
}

export interface WeatherAppropriateness {
    minTemp: number;
    maxTemp: number;
    allowedSeasons: GarmentSeason[];
}
