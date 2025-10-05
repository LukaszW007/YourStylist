import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Stylo — Own Your Look",
	description: "AI-powered style companion",
	manifest: "/manifest.json",
	other: {
		"apple-mobile-web-app-capable": "yes",
	},
};

export const viewport = {
	themeColor: "#0f1e32",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
		>
			<body
				suppressHydrationWarning
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
				<Script
					src="/scripts/preline-init.js"
					strategy="afterInteractive"
				/>
			</body>
		</html>
	);
}
