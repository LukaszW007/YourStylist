/**
 * Style Context Constants
 * Canonical list of 8 defined styles used throughout the application
 */

export const STYLE_CONTEXT_OPTIONS = [
	"British Country / Heritage",
	"Smart casual",
	"Business casual",
	"Casual/streetwear/workwear",
	"Ivy League (Preppy)",
	"Sporty (rugby/cricket)",
	"Western/country",
	"Formal",
] as const;

export type StyleContext = typeof STYLE_CONTEXT_OPTIONS[number];
