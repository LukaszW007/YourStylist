type Lang = "en" | "pl" | "no";

export interface WardrobeTranslations {
	categories: Record<string, string>;
	colors: Record<string, string>;
	patterns: Record<string, string>;
	materials: Record<string, string>;
	scanner: {
		confirmItems: string;
		reviewDetails: string;
		category: string;
		styleSubtype: string;
		styleContext: string;
		colorName: string;
		hex: string;
		secondaryColors: string;
		pattern: string;
		keyFeatures: string;
		addFeature: string;
		material: string;
		brand: string;
		addAllToCloset: string;
		addOneToCloset: string;
		name: string;
		exampleShirt: string;
	};
}

// Load the appropriate wardrobe dictionary based on language
export async function loadWardrobeDictionary(lang: Lang): Promise<WardrobeTranslations> {
	try {
		const dictionary = await import(`./dictionaries/wardrobe-${lang}.json`);
		return dictionary.default;
	} catch {
		// Fallback to English if translation not found
		console.warn(`Failed to load wardrobe dictionary for ${lang}, falling back to English`);
		const fallback = await import("./dictionaries/wardrobe-en.json");
		return fallback.default;
	}
}

/**
 * Translate a garment category from English to the target language
 */
export async function translateCategory(englishTerm: string, targetLang: Lang): Promise<string> {
	if (targetLang === "en") return englishTerm;

	const dictionary = await loadWardrobeDictionary(targetLang);
	return dictionary.categories[englishTerm] || englishTerm;
}

/**
 * Translate a color from English to the target language
 */
export async function translateColor(englishTerm: string, targetLang: Lang): Promise<string> {
	if (targetLang === "en") return englishTerm;

	const dictionary = await loadWardrobeDictionary(targetLang);
	return dictionary.colors[englishTerm] || englishTerm;
}

/**
 * Translate a pattern from English to the target language
 */
export async function translatePattern(englishTerm: string, targetLang: Lang): Promise<string> {
	if (targetLang === "en") return englishTerm;

	const dictionary = await loadWardrobeDictionary(targetLang);
	return dictionary.patterns[englishTerm] || englishTerm;
}

/**
 * Translate a material from English to the target language
 */
export async function translateMaterial(englishTerm: string, targetLang: Lang): Promise<string> {
	if (targetLang === "en") return englishTerm;

	const dictionary = await loadWardrobeDictionary(targetLang);
	return dictionary.materials[englishTerm] || englishTerm;
}

/**
 * Check if a category should be excluded from wardrobe
 * GentStylo doesn't include underwear or socks
 */
export function isCategoryAllowed(category: string): boolean {
	const excludedCategories = ["Underwear", "Socks", "Boxers", "Briefs", "Trunks"];
	return !excludedCategories.includes(category);
}
