/**
 * Duplicate garment detection utilities
 * Compares garments by attributes and visual similarity
 */

import type { Database } from "@/lib/supabase/types";

type GarmentRow = Database["public"]["Tables"]["garments"]["Row"];

export interface DuplicateMatch {
	garment: GarmentRow;
	matchScore: number; // 0-100
	matchReasons: string[];
	visualSimilarity?: number; // 0-100 if image comparison was performed
}

export interface GarmentToCheck {
	category: string;
	colorName?: string;
	colorHex?: string | null;
	secondaryColors?: { name?: string; hex?: string }[];
	subType?: string | null;
	pattern?: string | null;
	imageUrl?: string;
}

/**
 * Compare two colors by name similarity
 */
function compareColorNames(color1: string, color2: string): number {
	const normalize = (c: string) => c.toLowerCase().trim();
	const c1 = normalize(color1);
	const c2 = normalize(color2);

	if (c1 === c2) return 100;

	// Check for color family matches
	const colorFamilies: Record<string, string[]> = {
		black: ["black", "czarny", "noir"],
		white: ["white", "biały", "blanc"],
		blue: ["blue", "niebieski", "navy", "granat"],
		red: ["red", "czerwony", "rouge"],
		green: ["green", "zielony", "vert"],
		yellow: ["yellow", "żółty", "jaune"],
		gray: ["gray", "grey", "szary", "gris"],
		brown: ["brown", "brązowy", "brun"],
	};

	for (const variants of Object.values(colorFamilies)) {
		if (variants.some((v) => c1.includes(v)) && variants.some((v) => c2.includes(v))) {
			return 80;
		}
	}

	return 0;
}

/**
 * Compare two hex colors
 */
function compareHexColors(hex1: string, hex2: string): number {
	const toRGB = (hex: string) => {
		const clean = hex.replace("#", "");
		return {
			r: parseInt(clean.substring(0, 2), 16),
			g: parseInt(clean.substring(2, 4), 16),
			b: parseInt(clean.substring(4, 6), 16),
		};
	};

	try {
		const rgb1 = toRGB(hex1);
		const rgb2 = toRGB(hex2);

		// Calculate Euclidean distance in RGB space
		const distance = Math.sqrt(Math.pow(rgb1.r - rgb2.r, 2) + Math.pow(rgb1.g - rgb2.g, 2) + Math.pow(rgb1.b - rgb2.b, 2));

		// Max distance is ~442 (sqrt(255^2 * 3))
		// Convert to similarity percentage
		const similarity = Math.max(0, 100 - (distance / 442) * 100);

		return similarity;
	} catch {
		return 0;
	}
}

/**
 * Check if secondary colors overlap
 */
function compareSecondaryColors(colors1?: { name?: string; hex?: string }[], colors2?: { name?: string; hex?: string }[]): number {
	if (!colors1?.length || !colors2?.length) return 0;

	let matchCount = 0;
	const total = Math.max(colors1.length, colors2.length);

	for (const c1 of colors1) {
		for (const c2 of colors2) {
			if (c1.hex && c2.hex) {
				const hexSimilarity = compareHexColors(c1.hex, c2.hex);
				if (hexSimilarity > 70) {
					matchCount++;
					break;
				}
			}
		}
	}

	return (matchCount / total) * 100;
}

/**
 * Compare categories (normalized to DB format)
 */
function compareCategories(cat1: string, cat2: string): boolean {
	const normalize = (c: string) => c.toLowerCase().trim();

	const categoryMap: Record<string, string[]> = {
		tops: ["shirt", "t-shirt", "polo", "tank top", "sweatshirt", "hoodie", "sweater", "cardigan", "tops", "koszulka"],
		bottoms: ["jeans", "pants", "shorts", "chinos", "bottoms", "spodnie"],
		shoes: ["sneakers", "dress shoes", "boots", "sandals", "shoes", "buty"],
		outerwear: ["jacket", "blazer", "coat", "outerwear", "kurtka"],
		dresses: ["dress", "sukienka"],
	};

	const c1 = normalize(cat1);
	const c2 = normalize(cat2);

	if (c1 === c2) return true;

	// Check if both belong to same category family
	for (const variants of Object.values(categoryMap)) {
		if (variants.some((v) => c1.includes(v)) && variants.some((v) => c2.includes(v))) {
			return true;
		}
	}

	return false;
}

/**
 * Compare text fields (subtype, pattern) with fuzzy matching
 */
function compareTextFields(text1?: string | null, text2?: string | null): number {
	if (!text1 || !text2) return 0;

	const normalize = (t: string) => t.toLowerCase().trim();
	const t1 = normalize(text1);
	const t2 = normalize(text2);

	if (t1 === t2) return 100;

	// Check if one contains the other
	if (t1.includes(t2) || t2.includes(t1)) return 80;

	// Simple word overlap
	const words1 = t1.split(/\s+/);
	const words2 = t2.split(/\s+/);
	const commonWords = words1.filter((w) => words2.includes(w));

	if (commonWords.length > 0) {
		return (commonWords.length / Math.max(words1.length, words2.length)) * 100;
	}

	return 0;
}

/**
 * Compare garment attributes to detect potential duplicates
 * Returns a match score (0-100) and reasons for the match
 */
export function compareGarmentAttributes(newGarment: GarmentToCheck, existingGarment: GarmentRow): { score: number; reasons: string[] } {
	const reasons: string[] = [];
	let totalScore = 0;
	let maxScore = 0;

	// 1. Category match (required for duplicate consideration) - 30 points
	maxScore += 30;
	if (compareCategories(newGarment.category, existingGarment.category)) {
		totalScore += 30;
		reasons.push("Same category");
	} else {
		// If categories don't match, it's definitely not a duplicate
		return { score: 0, reasons: [] };
	}

	// 2. Primary color match - 25 points
	maxScore += 25;
	const colorNameSimilarity = compareColorNames(newGarment.colorName || "", existingGarment.main_color_name || "");
	if (colorNameSimilarity > 70) {
		totalScore += 25 * (colorNameSimilarity / 100);
		reasons.push(`Similar color: ${newGarment.colorName} ≈ ${existingGarment.main_color_name}`);
	}

	// 3. Hex color match (if available) - 20 points
	if (newGarment.colorHex && existingGarment.main_color_hex) {
		maxScore += 20;
		const hexSimilarity = compareHexColors(newGarment.colorHex, existingGarment.main_color_hex);
		if (hexSimilarity > 60) {
			totalScore += 20 * (hexSimilarity / 100);
			reasons.push("Color hex values very similar");
		}
	}

	// 4. Secondary colors overlap - 15 points
	maxScore += 15;
	const secondaryMatch = compareSecondaryColors(
		newGarment.secondaryColors,
		existingGarment.secondary_colors as { name?: string; hex?: string }[] | undefined
	);
	if (secondaryMatch > 50) {
		totalScore += 15 * (secondaryMatch / 100);
		reasons.push("Secondary colors match");
	}

	// 5. SubType / Style match - 20 points
	if (newGarment.subType || existingGarment.subcategory) {
		maxScore += 20;
		const subTypeSimilarity = compareTextFields(newGarment.subType, existingGarment.subcategory);
		if (subTypeSimilarity > 60) {
			totalScore += 20 * (subTypeSimilarity / 100);
			reasons.push(`Similar style: ${newGarment.subType} ≈ ${existingGarment.subcategory}`);
		}
	}

	// 6. Pattern match - 15 points
	if (newGarment.pattern || existingGarment.tags?.includes("pattern")) {
		maxScore += 15;
		const patternSimilarity = compareTextFields(newGarment.pattern, existingGarment.notes);
		if (patternSimilarity > 70) {
			totalScore += 15 * (patternSimilarity / 100);
			reasons.push(`Same pattern: ${newGarment.pattern}`);
		}
	}

	// Calculate final percentage
	const finalScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

	return { score: Math.round(finalScore), reasons };
}

/**
 * Compare two images for visual similarity using Canvas API
 * Uses simplified perceptual hashing
 */
export async function compareImages(imageUrl1: string, imageUrl2: string): Promise<number> {
	try {
		// Load both images
		const [img1, img2] = await Promise.all([loadImage(imageUrl1), loadImage(imageUrl2)]);

		// Create thumbnails for comparison (8x8 grayscale)
		const hash1 = await getImageHash(img1);
		const hash2 = await getImageHash(img2);

		// Calculate Hamming distance
		const similarity = calculateHashSimilarity(hash1, hash2);

		return similarity;
	} catch (error) {
		console.error("Image comparison failed:", error);
		return 0;
	}
}

/**
 * Load image from URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = url;
	});
}

/**
 * Generate perceptual hash of image (simplified pHash)
 */
async function getImageHash(img: HTMLImageElement): Promise<string> {
	const size = 8;
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;

	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Cannot get canvas context");

	// Draw image scaled to 8x8
	ctx.drawImage(img, 0, 0, size, size);

	// Get grayscale values
	const imageData = ctx.getImageData(0, 0, size, size);
	const pixels = imageData.data;
	const grayscale: number[] = [];

	for (let i = 0; i < pixels.length; i += 4) {
		const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
		grayscale.push(gray);
	}

	// Calculate average
	const average = grayscale.reduce((a, b) => a + b, 0) / grayscale.length;

	// Create hash: 1 if above average, 0 if below
	const hash = grayscale.map((g) => (g > average ? "1" : "0")).join("");

	return hash;
}

/**
 * Calculate similarity between two hashes (0-100)
 */
function calculateHashSimilarity(hash1: string, hash2: string): number {
	if (hash1.length !== hash2.length) return 0;

	let matches = 0;
	for (let i = 0; i < hash1.length; i++) {
		if (hash1[i] === hash2[i]) matches++;
	}

	return (matches / hash1.length) * 100;
}

/**
 * Find potential duplicates in existing wardrobe
 * Returns matches sorted by match score (highest first)
 */
export async function findDuplicates(
	newGarment: GarmentToCheck,
	existingGarments: GarmentRow[],
	visualThreshold: number = 70 // Only check images if attribute match > this
): Promise<DuplicateMatch[]> {
	const matches: DuplicateMatch[] = [];

	// First pass: attribute comparison
	for (const existing of existingGarments) {
		const { score, reasons } = compareGarmentAttributes(newGarment, existing);

		if (score > 40) {
			// Only consider if at least 40% match
			matches.push({
				garment: existing,
				matchScore: score,
				matchReasons: reasons,
			});
		}
	}

	// Second pass: visual comparison for high-scoring matches
	for (const match of matches) {
		if (match.matchScore > visualThreshold && newGarment.imageUrl && match.garment.image_url) {
			try {
				const visualSimilarity = await compareImages(newGarment.imageUrl, match.garment.image_url);

				match.visualSimilarity = Math.round(visualSimilarity);

				// Boost match score if visually similar
				if (visualSimilarity > 80) {
					match.matchScore = Math.min(100, match.matchScore + 15);
					match.matchReasons.push(`Visually very similar (${Math.round(visualSimilarity)}%)`);
				}
			} catch (error) {
				console.warn("Visual comparison failed for garment:", match.garment.id, error);
			}
		}
	}

	// Sort by match score (highest first)
	return matches.sort((a, b) => b.matchScore - a.matchScore);
}
