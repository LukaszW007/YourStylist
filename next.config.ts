import type { NextConfig } from "next";
import withPWA from "next-pwa";

const withPwa = withPWA({
	dest: "public",
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === "development",
	cacheStartUrl: false,
});

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "images.unsplash.com" },
			{ protocol: "https", hostname: "flagsapi.com" },
		],
	},
	// Explicitly expose environment variables to the client
	env: {
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	},
	// Force Turbopack workspace root to this project to avoid selecting parent lockfile
	// Silences multi-lockfile warning and ensures Tailwind/PostCSS resolution from local config
	// Ref: https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory
	turbopack: {
		root: process.cwd(),
		resolveAlias: {
			// Ensure Tailwind resolves from local node_modules, not parent workspace
			tailwindcss: "./node_modules/tailwindcss",
		},
	},
};

export default withPwa(nextConfig);
