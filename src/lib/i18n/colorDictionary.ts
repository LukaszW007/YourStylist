// Lightweight multilingual color dictionary & normalization utilities.
// This is an initial curated subset; can be expanded incrementally.
// Avoid copying large external lists verbatim (e.g., Wikipedia) to respect licensing.

export type Lang = "en" | "pl" | "no";

interface ColorEntry {
	id: string; // canonical slug
	hex?: string; // representative hex (approx dominant shade)
	en: string;
	pl: string;
	no: string;
	synonyms?: Partial<Record<Lang, string[]>>; // per-language synonym list
}

// Initial sample mapping; extend with more as needed.
const COLORS: ColorEntry[] = [
	{ id: "black", hex: "#000000", en: "Black", pl: "Czarny", no: "Svart" },
	{ id: "white", hex: "#FFFFFF", en: "White", pl: "Biały", no: "Hvit" },
	{ id: "navy", hex: "#14213D", en: "Navy Blue", pl: "Granatowy", no: "Marineblå", synonyms: { en: ["Navy"], pl: ["Granat"], no: ["Navy"] } },
	{ id: "light-blue", hex: "#ADD8E6", en: "Light Blue", pl: "Jasnoniebieski", no: "Lyseblå" },
	{ id: "olive", hex: "#556B2F", en: "Olive Green", pl: "Oliwkowy", no: "Oliven" },
	{ id: "burgundy", hex: "#800020", en: "Burgundy", pl: "Bordowy", no: "Burgunder" },
	{ id: "beige", hex: "#F5F5DC", en: "Beige", pl: "Beżowy", no: "Beige" },
	{ id: "camel", hex: "#C19A6B", en: "Camel", pl: "Kamelowy", no: "Camel" },
	{ id: "khaki", hex: "#C3B091", en: "Khaki", pl: "Khaki", no: "Khaki" },
	{ id: "charcoal", hex: "#36454F", en: "Charcoal Gray", pl: "Antracytowy", no: "Antrasitt" },
	{ id: "off-white", hex: "#F8F8F5", en: "Off-White", pl: "Ecru", no: "Offwhite" },
	{ id: "mustard", hex: "#FFDB58", en: "Mustard", pl: "Musztardowy", no: "Sennep" },
	{ id: "forest", hex: "#228B22", en: "Forest Green", pl: "Ciemnozielony", no: "Skoggrønn" },
	{ id: "mint", hex: "#98FF98", en: "Mint", pl: "Miętowy", no: "Mint" },
	{ id: "gold", hex: "#D4AF37", en: "Gold", pl: "Złoty", no: "Gull" },
	{ id: "pink", hex: "#FFC0CB", en: "Pink", pl: "Różowy", no: "Rosa" },
	{ id: "fuchsia", hex: "#FF00FF", en: "Hot Pink", pl: "Fuksja", no: "Fuksia" },
	{ id: "violet", hex: "#8A2BE2", en: "Violet", pl: "Fioletowy", no: "Fiolett" },
	{ id: "lavender", hex: "#E6E6FA", en: "Lavender", pl: "Lawendowy", no: "Lavendel" },
	{ id: "coral", hex: "#FF7F50", en: "Coral", pl: "Koralowy", no: "Korall" },
	{ id: "brown", hex: "#8B4513", en: "Brown", pl: "Brązowy", no: "Brun" },
	{ id: "tan", hex: "#D2B48C", en: "Tan", pl: "Jasnobrązowy", no: "Tan" },
	{ id: "gray", hex: "#808080", en: "Gray", pl: "Szary", no: "Grå" },
	{ id: "teal", hex: "#008080", en: "Teal", pl: "Morski", no: "Blågrønn" },
	{ id: "orange", hex: "#FF7F00", en: "Orange", pl: "Pomarańczowy", no: "Oransje" },
	{ id: "red", hex: "#FF0000", en: "Red", pl: "Czerwony", no: "Rød" },
	{ id: "yellow", hex: "#FFFF00", en: "Yellow", pl: "Żółty", no: "Gul" },
	{ id: "green", hex: "#008000", en: "Green", pl: "Zielony", no: "Grønn" },
	{ id: "blue", hex: "#0000FF", en: "Blue", pl: "Niebieski", no: "Blå" },
];

// Simple index maps for quick lookup & synonym resolution
const INDEX: Record<string, ColorEntry> = {};
COLORS.forEach((c) => {
	INDEX[c.en.toLowerCase()] = c;
	INDEX[c.pl.toLowerCase()] = c;
	INDEX[c.no.toLowerCase()] = c;
	if (c.synonyms) {
		Object.values(c.synonyms).forEach((list) =>
			list?.forEach((s) => {
				INDEX[s.toLowerCase()] = c;
			})
		);
	}
});

// Basic normalization: lowercase, trim, collapse spaces.
function normalizeRaw(term: string): string {
	return term.toLowerCase().trim().replace(/\s+/g, " ");
}

// Descriptive modifiers we strip before lookup (language-agnostic + common PL/NO forms)
const ADJECTIVE_MODIFIERS = [
	// English
	"dark",
	"light",
	"bright",
	"deep",
	"soft",
	"pale",
	"warm",
	"cool",
	"dusty",
	"muted",
	"rich",
	"vivid",
	// Polish variants
	"ciemny",
	"jasny",
	"głęboki",
	"pastelowy",
	"ciepły",
	"chłodny",
	"zgaszony",
	"intensywny",
	"żywy",
	"blade",
	"błękitny",
	// Norwegian variants
	"mørk",
	"lys",
	"dyp",
	"klar",
	"varm",
	"kald",
	"støvfylt",
	"livlig",
	"matt",
];

// Simple Levenshtein distance for fuzzy fallback
function levenshtein(a: string, b: string): number {
	const m = a.length,
		n = b.length;
	if (!m) return n;
	if (!n) return m;
	const dp = Array.from({ length: m + 1 }, () => Array<number>(n + 1).fill(0));
	for (let i = 0; i <= m; i++) dp[i][0] = i;
	for (let j = 0; j <= n; j++) dp[0][j] = j;
	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
		}
	}
	return dp[m][n];
}

function stripModifiers(raw: string): string {
	const parts = normalizeRaw(raw).split(/\s+/).filter(Boolean);
	const filtered = parts.filter((p) => !ADJECTIVE_MODIFIERS.includes(p));
	return filtered.join(" ") || parts[parts.length - 1] || raw;
}

export function findColorEntry(raw: string): ColorEntry | undefined {
	if (!raw) return undefined;
	// Direct lookup
	const direct = INDEX[normalizeRaw(raw)];
	if (direct) return direct;
	// Try stripping modifiers
	const stripped = stripModifiers(raw);
	if (stripped && stripped !== raw) {
		const sDirect = INDEX[normalizeRaw(stripped)];
		if (sDirect) return sDirect;
	}
	// Try last token heuristic
	const parts = normalizeRaw(stripped).split(" ");
	if (parts.length > 1) {
		for (let i = parts.length - 1; i >= 0; i--) {
			const candidate = INDEX[parts[i]];
			if (candidate) return candidate;
		}
	}
	// Fuzzy fallback: choose minimal distance below threshold
	const threshold = 2; // tuneable
	let best: { entry: ColorEntry; dist: number } | null = null;
	const needle = normalizeRaw(stripped);
	for (const entry of Object.values(INDEX)) {
		const dist = levenshtein(needle, normalizeRaw(entry.en));
		if (dist <= threshold && (!best || dist < best.dist)) {
			best = { entry, dist };
		}
	}
	return best?.entry;
}

export function translateCanonicalColor(raw: string, lang: Lang): string {
	const entry = findColorEntry(raw);
	if (!entry) return raw; // fallback unchanged
	switch (lang) {
		case "pl":
			return entry.pl;
		case "no":
			return entry.no;
		default:
			return entry.en;
	}
}

// Ensure language consistency: if raw looks mixed (e.g., contains Polish diacritics and English tokens), prefer dictionary translation from canonical id.
export function enforceColorLanguage(raw: string, lang: Lang): string {
	const entry = findColorEntry(raw);
	if (!entry) return raw;
	return translateCanonicalColor(entry.en, lang); // use canonical English base
}

// Future extension: approximate from hex by computing nearest LAB distance.
export function approximateFromHex(hex: string, lang: Lang): string {
	const entry = COLORS.find((c) => c.hex?.toLowerCase() === hex.toLowerCase());
	return entry ? translateCanonicalColor(entry.en, lang) : hex;
}

export function listSupportedColors(): ColorEntry[] {
	return COLORS.slice();
}
