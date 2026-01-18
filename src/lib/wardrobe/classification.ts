// Thermal comfort and color family classification utilities
// CLO values based on ISO 9920 thermal insulation standards

/**
 * Material specifications with CLO (thermal insulation) values
 * CLO is a unit of thermal resistance: 1 CLO = 0.155 m²K/W
 * Higher CLO = More insulating
 */
export const MATERIAL_SPECS: Record<string, { clo: number; min: number; max: number }> = {
	// Lightweight / Summer fabrics (CLO 0.1 - 0.2)
	Linen: { clo: 0.12, min: 22, max: 35 },
	Silk: { clo: 0.15, min: 15, max: 30 },
	Chiffon: { clo: 0.10, min: 22, max: 35 },
	
	// Standard weight fabrics (CLO 0.15 - 0.25)
	Cotton: { clo: 0.18, min: 15, max: 25 },
	Polyester: { clo: 0.20, min: 15, max: 22 },
	Nylon: { clo: 0.22, min: 12, max: 20 },
	Rayon: { clo: 0.18, min: 18, max: 28 },
	Viscose: { clo: 0.18, min: 18, max: 28 },
	Acetate: { clo: 0.16, min: 20, max: 28 },
	Spandex: { clo: 0.15, min: 18, max: 26 },
	
	// Mid-weight fabrics (CLO 0.25 - 0.4)
	Denim: { clo: 0.30, min: 12, max: 24 },
	Flannel: { clo: 0.35, min: 8, max: 18 },
	Velvet: { clo: 0.32, min: 10, max: 18 },
	"Terry Cloth": { clo: 0.28, min: 15, max: 22 },
	Suede: { clo: 0.35, min: 10, max: 20 },
	
	// Heavy / Winter fabrics (CLO 0.35 - 0.6)
	Wool: { clo: 0.45, min: -5, max: 15 },
	Fleece: { clo: 0.50, min: 5, max: 15 },
	Cashmere: { clo: 0.55, min: -10, max: 12 },
	Angora: { clo: 0.58, min: -15, max: 10 },
	
	// Outerwear / High insulation (CLO 0.5 - 1.5+)
	Leather: { clo: 0.50, min: 8, max: 18 },
	"Faux Leather": { clo: 0.45, min: 10, max: 18 },
	"Faux Fur": { clo: 0.80, min: -15, max: 5 },
	Down: { clo: 1.50, min: -25, max: 5 },
	Shearling: { clo: 1.20, min: -20, max: 5 },
	Gore_Tex: { clo: 0.40, min: -10, max: 15 },
	Thinsulate: { clo: 1.00, min: -20, max: 10 },
};

// Fallback for unknown materials
const DEFAULT_SPECS = { clo: 0.20, min: 15, max: 25 };

/**
 * Calculate the average CLO (thermal insulation) value for given materials
 * @param materials Array of material names
 * @returns Average CLO value
 */
export function averageClo(materials?: string[]): number {
	if (!materials || materials.length === 0) {
		return DEFAULT_SPECS.clo;
	}

	let totalClo = 0;
	let count = 0;

	for (const m of materials) {
		// Case-insensitive lookup
		const key = Object.keys(MATERIAL_SPECS).find(
			(k) => k.toLowerCase() === m.toLowerCase()
		);
		const spec = key ? MATERIAL_SPECS[key] : DEFAULT_SPECS;
		totalClo += spec.clo;
		count++;
	}

	return count > 0 ? totalClo / count : DEFAULT_SPECS.clo;
}

/**
 * Compute comfort temperature range, thermal profile, and CLO value for materials
 * @param materials Array of material names
 * @returns Object with min/max temp range, thermal profile label, and estimated CLO
 */
export function computeComfortRange(materials?: string[]): {
	min: number;
	max: number;
	thermalProfile: string;
	estimatedClo: number;
} {
	if (!materials || materials.length === 0) {
		return { ...DEFAULT_SPECS, min: DEFAULT_SPECS.min, max: DEFAULT_SPECS.max, thermalProfile: "Mid", estimatedClo: DEFAULT_SPECS.clo };
	}

	let totalMin = 0;
	let totalMax = 0;
	let totalClo = 0;
	let count = 0;

	for (const m of materials) {
		// Case-insensitive lookup
		const key = Object.keys(MATERIAL_SPECS).find(
			(k) => k.toLowerCase() === m.toLowerCase()
		);
		const spec = key ? MATERIAL_SPECS[key] : DEFAULT_SPECS;
		totalMin += spec.min;
		totalMax += spec.max;
		totalClo += spec.clo;
		count++;
	}

	const avgMin = Math.round(totalMin / count);
	const avgMax = Math.round(totalMax / count);
	const avgClo = totalClo / count;
	const mid = (avgMin + avgMax) / 2;

	let thermalProfile = "Mid";
	if (mid < 5) thermalProfile = "Insulated"; // Cold weather gear
	else if (mid < 15) thermalProfile = "Heavy";
	else if (mid < 22) thermalProfile = "Mid";
	else if (mid < 28) thermalProfile = "Light";
	else thermalProfile = "Ultra-Light";

	return { min: avgMin, max: avgMax, thermalProfile, estimatedClo: Math.round(avgClo * 100) / 100 };
}

// Color families per provided image
const FAMILY_DEFS: Array<{ family: string; patterns: RegExp[] }> = [
	{ family: "WHITE", patterns: [/\bwhite\b/, /off[- ]?white/, /ivory/] },
	{ family: "BEIGE", patterns: [/\bbeige\b/, /camel/, /khaki/, /tan/, /sand/, /ecru/] },
	{ family: "GREY", patterns: [/grey/, /gray/, /charcoal/, /graphite/] },
	{ family: "LIGHT BLUE", patterns: [/light\s+blue/, /sky\s+blue/, /azure/] },
	{ family: "BLUE", patterns: [/\bblue\b/] },
	{ family: "PINK", patterns: [/\bpink\b/, /fuchsia/, /magenta/] },
	{ family: "YELLOW", patterns: [/\byellow\b/, /mustard/, /gold/] },
	{ family: "ORANGE", patterns: [/\borange\b/, /coral/] },
	{ family: "BLACK", patterns: [/\bblack\b/] },
	{ family: "BROWN", patterns: [/\bbrown\b/, /chocolate/] },
	{ family: "NAVY", patterns: [/\bnavy\b/, /denim/, /indigo/] },
	{ family: "GREEN", patterns: [/\bgreen\b/, /olive/, /forest/] },
	{ family: "RED", patterns: [/\bred\b/, /maroon/, /burgundy/, /crimson/] },
	{ family: "PURPLE", patterns: [/\bpurple\b/, /violet/, /lavender/] },
];

export type ShadeEntry = { name: string; hex: string };

// Shade definitions per family (user-provided curated list)
export const FAMILY_SHADES: Record<string, ShadeEntry[]> = {
	white: [
		{ name: "White", hex: "#FFFFFF" },
		{ name: "Ivory", hex: "#FFFFF0" },
		{ name: "Snow", hex: "#FFFAFA" },
		{ name: "Alabaster", hex: "#FAFAFA" },
		{ name: "Pearl", hex: "#EAE0C8" },
		{ name: "Cream", hex: "#FFFDD0" },
		{ name: "Bone", hex: "#E3DAC9" },
	],
	beige: [
		{ name: "Beige", hex: "#F5F5DC" },
		{ name: "Ecru", hex: "#C2B280" },
		{ name: "Sand", hex: "#C2B280" },
		{ name: "Khaki", hex: "#F0E68C" },
		{ name: "Camel", hex: "#C19A6B" },
		{ name: "Tan", hex: "#D2B48C" },
		{ name: "Buff", hex: "#F0DC82" },
		{ name: "Nude", hex: "#E3BC9A" },
		{ name: "Champagne", hex: "#F7E7CE" },
	],
	grey: [
		{ name: "Grey", hex: "#808080" },
		{ name: "Silver", hex: "#C0C0C0" },
		{ name: "Charcoal", hex: "#36454F" },
		{ name: "Anthracite", hex: "#36454F" },
		{ name: "Platinum", hex: "#E5E4E2" },
		{ name: "Ash", hex: "#B2BEB5" },
		{ name: "Slate", hex: "#708090" },
		{ name: "Dove Grey", hex: "#6D6C6C" },
		{ name: "Steel", hex: "#4682B4" },
	],
	light_blue: [
		{ name: "Light Blue", hex: "#ADD8E6" },
		{ name: "Sky Blue", hex: "#87CEEB" },
		{ name: "Baby Blue", hex: "#89CFF0" },
		{ name: "Powder Blue", hex: "#B0E0E6" },
		{ name: "Cyan", hex: "#00FFFF" },
		{ name: "Aquamarine", hex: "#7FFFD4" },
		{ name: "Turquoise", hex: "#40E0D0" },
		{ name: "Azure", hex: "#007FFF" },
		{ name: "Teal", hex: "#008080" },
	],
	pink: [
		{ name: "Pink", hex: "#FFC0CB" },
		{ name: "Rose", hex: "#FF007F" },
		{ name: "Fuchsia", hex: "#FF00FF" },
		{ name: "Magenta", hex: "#FF00FF" },
		{ name: "Salmon", hex: "#FA8072" },
		{ name: "Coral", hex: "#FF7F50" },
		{ name: "Blush", hex: "#DE5D83" },
		{ name: "Raspberry", hex: "#E30B5C" },
		{ name: "Hot Pink", hex: "#FF69B4" },
	],
	yellow: [
		{ name: "Yellow", hex: "#FFFF00" },
		{ name: "Lemon", hex: "#FFF700" },
		{ name: "Gold", hex: "#FFD700" },
		{ name: "Canary", hex: "#FFFF99" },
		{ name: "Honey", hex: "#A98307" },
		{ name: "Mustard", hex: "#FFDB58" },
		{ name: "Saffron", hex: "#F4C430" },
		{ name: "Maize", hex: "#FBEC5D" },
		{ name: "Straw", hex: "#E4D96F" },
	],
	orange: [
		{ name: "Orange", hex: "#FF8000" },
		{ name: "Tangerine", hex: "#F28500" },
		{ name: "Amber", hex: "#FFBF00" },
		{ name: "Carrot", hex: "#ED9121" },
		{ name: "Pumpkin", hex: "#FF7518" },
		{ name: "Rust", hex: "#B7410E" },
		{ name: "Copper", hex: "#B87333" },
		{ name: "Apricot", hex: "#FBCEB1" },
		{ name: "Peach", hex: "#FFE5B4" },
		{ name: "Ochre", hex: "#CC7722" },
	],
	black: [
		{ name: "Black", hex: "#000000" },
		{ name: "Ebony", hex: "#555D50" },
		{ name: "Jet Black", hex: "#343434" },
		{ name: "Onyx", hex: "#353839" },
		{ name: "Licorice", hex: "#1A1110" },
	],
	brown: [
		{ name: "Brown", hex: "#964B00" },
		{ name: "Chocolate", hex: "#7B3F00" },
		{ name: "Coffee", hex: "#6F4E37" },
		{ name: "Chestnut", hex: "#954535" },
		{ name: "Mahogany", hex: "#C04000" },
		{ name: "Sepia", hex: "#704214" },
		{ name: "Sienna", hex: "#882D17" },
		{ name: "Umber", hex: "#635147" },
		{ name: "Bronze", hex: "#CD7F32" },
		{ name: "Hazel", hex: "#8E7618" },
	],
	navy: [
		{ name: "Navy", hex: "#000080" },
		{ name: "Midnight Blue", hex: "#191970" },
		{ name: "Indigo", hex: "#4B0082" },
		{ name: "Royal Blue", hex: "#4169E1" },
		{ name: "Cobalt", hex: "#0047AB" },
		{ name: "Sapphire", hex: "#0F52BA" },
		{ name: "Denim", hex: "#1560BD" },
		{ name: "Prussian Blue", hex: "#003153" },
		{ name: "Ink", hex: "#000035" },
	],
	green: [
		{ name: "Green", hex: "#008000" },
		{ name: "Lime", hex: "#00FF00" },
		{ name: "Olive", hex: "#808000" },
		{ name: "Emerald", hex: "#50C878" },
		{ name: "Forest Green", hex: "#228B22" },
		{ name: "Mint", hex: "#98FF98" },
		{ name: "Sage", hex: "#BCB88A" },
		{ name: "Sea Green", hex: "#2E8B57" },
		{ name: "Malachite", hex: "#0BDA51" },
		{ name: "Kelly Green", hex: "#4CBB17" },
	],
	red: [
		{ name: "Red", hex: "#FF0000" },
		{ name: "Crimson", hex: "#DC143C" },
		{ name: "Scarlet", hex: "#FF2400" },
		{ name: "Burgundy", hex: "#800020" },
		{ name: "Maroon", hex: "#800000" },
		{ name: "Ruby", hex: "#E0115F" },
		{ name: "Cherry", hex: "#D2042D" },
		{ name: "Brick", hex: "#CB4154" },
		{ name: "Vermilion", hex: "#E34234" },
		{ name: "Blood Red", hex: "#660000" },
		{ name: "Wine", hex: "#722F37" },
	],
	purple: [
		{ name: "Purple", hex: "#800080" },
		{ name: "Violet", hex: "#EE82EE" },
		{ name: "Lavender", hex: "#E6E6FA" },
		{ name: "Lilac", hex: "#C8A2C8" },
		{ name: "Plum", hex: "#8E4585" },
		{ name: "Amethyst", hex: "#9966CC" },
		{ name: "Mauve", hex: "#E0B0FF" },
		{ name: "Heather", hex: "#B7A8B9" },
		{ name: "Grape", hex: "#6F2DA8" },
	],
};

const SHADES_INDEX: Record<string, string> = Object.fromEntries(
	Object.entries(FAMILY_SHADES).flatMap(([familyKey, shades]) =>
		shades.map((s) => [s.name.toLowerCase(), familyKey.toUpperCase().replace(/_/g, " ")])
	)
);

function stripModifiers(name: string): string {
	return name
		.toLowerCase()
		.replace(/\b(dark|light|deep|pale|muted|dusty)\b/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

export function deriveColorFamily(name?: string): string | undefined {
	if (!name) return undefined;
	const cleaned = stripModifiers(name);
	const rawLower = name.toLowerCase().trim();
	for (const def of FAMILY_DEFS) {
		if (def.patterns.some((r) => r.test(cleaned))) return def.family;
	}
	// Exact shade name match fallback (case-insensitive)
	if (SHADES_INDEX[rawLower]) return SHADES_INDEX[rawLower];
	if (SHADES_INDEX[cleaned]) return SHADES_INDEX[cleaned];
	return undefined;
}
