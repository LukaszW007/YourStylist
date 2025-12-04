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
		],
	},
	// Allow cross-origin requests from mobile device IP for development
	allowedDevOrigins: ["http://192.168.50.36:3000"],
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
	// 	// Improve hot reload performance
	// 	webpack: (config, { isServer }) => {
	// 		if (!isServer) {
	// 			config.watchOptions = {
	// 				poll: 1000,
	// 				aggregateTimeout: 300,
	// 			};
	// 		}
	// 		return config;
	// 	},
};

export default withPwa(nextConfig);
