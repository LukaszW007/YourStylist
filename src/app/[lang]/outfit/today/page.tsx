import { loadDictionary } from "@/lib/i18n/dictionary";
import { TodayOutfitView } from "@/views/outfit/TodayOutfitView";
import type { GarmentBase } from "@/types/garment";

type TodayOutfitPageProps = {
	params: Promise<{
		lang: string;
	}>;
};

// Mock data for the initial outfit, as the generation logic is not yet hooked up to the frontend.
// Using the GarmentBase type to ensure type safety.
const mockInitialOutfit = {
	id: "outfit-1",
	name: "Today's Smart Casual",
	reasoning:
		"A versatile and stylish look perfect for today's mild weather. The layers offer flexibility, and the neutral colors are effortlessly chic.",
	garments: [
		{
			id: "garment-1",
			name: "Lightweight Denim Jacket",
			category: "Outerwear",
			subcategory: "Jacket",
			brand: "Levi's",
			layer_type: "outer",
			main_color_name: "Blue",
			pattern: "Solid",
			style_context: "Casual",
			image_url: "https://images.unsplash.com/photo-1543087904-7435aacos4d7?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
			comfort_min_c: 12,
			comfort_max_c: 22,
		},
		{
			id: "garment-2",
			name: "Classic White T-Shirt",
			category: "Tops",
			subcategory: "T-Shirt",
			brand: "Calvin Klein",
			layer_type: "base",
			main_color_name: "White",
			pattern: "Solid",
			style_context: "Minimalist",
			image_url: "https://images.unsplash.com/photo-1581655353564-df123a43e246?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
			comfort_min_c: null,
			comfort_max_c: null,
		},
		{
			id: "garment-3",
			name: "Black Slim-Fit Chinos",
			category: "Bottoms",
			subcategory: "Chinos",
			brand: "AG Jeans",
			layer_type: "bottom",
			main_color_name: "Black",
			pattern: "Solid",
			style_context: "Smart Casual",
			image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
			comfort_min_c: null,
			comfort_max_c: null,
		},
		{
			id: "garment-4",
			name: "White Leather Sneakers",
			category: "Shoes",
			subcategory: "Sneakers",
			brand: "Common Projects",
			layer_type: "shoes",
			main_color_name: "White",
			pattern: "Solid",
			style_context: "Minimalist",
			image_url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
			comfort_min_c: null,
			comfort_max_c: null,
		},
	] as GarmentBase[],
};

/**
 * The page component for the "Today's Outfit" view.
 * This is a Next.js Server Component that fetches data and passes it to a Client Component.
 */
export default async function TodayOutfitPage({ params }: TodayOutfitPageProps) {
	const { lang } = await params;
	const dict = await loadDictionary(lang);

	return (
		<TodayOutfitView
			initialOutfit={mockInitialOutfit}
			lang={lang}
			dict={dict}
		/>
	);
}
