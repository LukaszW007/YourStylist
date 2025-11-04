// Tailwind CSS v4 uses the new @tailwindcss/postcss entrypoint which exports a plugin object.
// Vitest (Vite in test mode) was failing because the plugin string was not resolved to an object.
// We import the plugin instead of passing a string and guard for test environment to avoid unnecessary CSS processing.

import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

const isTest = process.env.VITEST === "true" || process.env.NODE_ENV === "test";

const config = {
	plugins: isTest ? [] : [tailwindcss, autoprefixer],
};

export default config;
