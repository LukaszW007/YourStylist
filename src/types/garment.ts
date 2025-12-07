// src/types/garment.ts

export type LayerType = "base" | "mid" | "outer" | "bottom" | "shoes" | "accessory";

export interface GarmentBase {
	id: string;
	name: string;
	category: string; // ei. 'Tops'
	subcategory: string | null; // ei. 'Sweater', 'Cardigan'
	brand: string | null;
	layer_type: LayerType;
	main_color_name: string | null;
	pattern: string | null;
	style_context: string | null;
	image_url: string;
	comfort_min_c: number | null;
	comfort_max_c: number | null;
}
