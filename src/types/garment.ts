// src/types/garment.ts
export type GarmentSeason = 'spring' | 'summer' | 'autumn' | 'winter' | 'all';

export type LayerType = "base" | "mid" | "outer" | "bottom" | "shoes" | "accessory";

export interface GarmentBase {
	id: string;
	name: string;
	category: string; // ei. 'Tops'
	subcategory: string | null; // ei. 'Sweater', 'Cardigan'
	brand: string | null;
	material: string[] | null;
	layer_type: LayerType;
    season: GarmentSeason[] | null;
	main_color_name: string | null;
	color_temperature: string | null;
	pattern: string | null;
	style_context: string | null;
	image_url: string;
	comfort_min_c: number | null;
	comfort_max_c: number | null;
}

export interface WeatherAppropriateness {
    minTemp: number;
    maxTemp: number;
    allowedSeasons: GarmentSeason[];
}
