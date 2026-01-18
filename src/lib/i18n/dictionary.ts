import en from "./dictionaries/en.json";
import pl from "./dictionaries/pl.json";
import no from "./dictionaries/no.json";

const dictionaries = {
	en,
	pl,
	no,
} as const;

export type Dictionary = typeof en;

export async function loadDictionary(lang: string): Promise<Dictionary> {
	return dictionaries[lang as keyof typeof dictionaries] ?? en;
}

// Alias for backwards compatibility
export const getDictionary = loadDictionary;
