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
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "images.unsplash.com" },
			{ protocol: "https", hostname: "flagsapi.com" },
			// Dodałem to, aby Next.js obsługiwał zdjęcia z Twojego Supabase
			// (Zastąp 'twoj-projekt' swoim ID, jeśli znasz, lub zostaw hostname ogólny jeśli używasz custom domain)
			{ protocol: "https", hostname: "*.supabase.co" },
		],
	},
	// Allow cross-origin requests from mobile device IP for development
	allowedDevOrigins: ["http://192.168.50.36:3000"],

	// Explicitly expose environment variables to the client
	env: {
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	},

	// To jest sekcja, której potrzebuje biblioteka @imgly
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

export default withPwa(nextConfig);
