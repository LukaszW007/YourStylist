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
};

export default withPwa(nextConfig);
