import type { NextConfig } from "next";
const withPWA = require("next-pwa")({
	dest: "public",
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === "development",
	cacheStartUrl: false,
});

const nextConfig: NextConfig = {
	reactStrictMode: true,

	// FIX 1: Konfiguracja dla Server Actions (rozwiązuje błąd CORS/Blocked request)
	experimental: {
		serverActions: {
			allowedOrigins: ["192.168.50.36:3000", "localhost:3000"],
		},
	},

	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "bgxkroyixepstktekokt.supabase.co",
				pathname: "/storage/v1/object/public/**",
			},
			{ protocol: "https", hostname: "**" },
		],
	},

	// Explicitly expose environment variables to the client
	env: {
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	},

	// Headers dla @imgly - WYMAGANE dla WebAssembly multi-threading
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "Cross-Origin-Opener-Policy",
						value: "same-origin",
					},
					{
						key: "Cross-Origin-Embedder-Policy",
						value: "require-corp",
					},
				],
			},
		];
	},

	turbopack: {
		root: process.cwd(),
		resolveAlias: {
			tailwindcss: "./node_modules/tailwindcss",
		},
	},
};

export default withPWA(nextConfig);
