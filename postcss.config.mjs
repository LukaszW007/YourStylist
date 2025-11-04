// Fallback PostCSS config using classic Tailwind plugin to avoid lightningcss native binary issues under Turbopack on Windows.
// If you upgrade to stable Tailwind v4 with working lightningcss, revert to: import tailwindcss from '@tailwindcss/postcss'
// During tests we disable heavy CSS transforms for speed.

import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const isTest = process.env.VITEST === "true" || process.env.NODE_ENV === "test";

const config = {
	plugins: isTest ? [] : [tailwindcss, autoprefixer],
};

export default config;
