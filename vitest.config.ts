import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const rootDir = dirname(fileURLToPath(new URL("./", import.meta.url)));

export default defineConfig({
	resolve: {
		alias: {
			"@": resolve(rootDir, "src"),
		},
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["test-setup.ts"],
		include: ["__tests__/**/*.test.{ts,tsx}"],
		coverage: {
			provider: "v8",
			reportsDirectory: "coverage",
		},
	},
});
