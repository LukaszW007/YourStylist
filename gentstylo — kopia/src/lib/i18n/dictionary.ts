import en from "./dictionaries/en.json";
import pl from "./dictionaries/pl.json";
import no from "./dictionaries/no.json";

const maps: Record<string, any> = { en, pl, no };

export async function loadDictionary(lang: string) {
	return maps[lang] ?? en;
}
