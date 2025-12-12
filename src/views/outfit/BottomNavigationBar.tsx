"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shirt, Camera, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionary";

interface BottomNavigationBarProps {
	lang: string;
	dict: Dictionary;
}

export function BottomNavigationBar({ lang, dict }: BottomNavigationBarProps) {
	const pathname = usePathname();

	// Use the passed lang prop, or fallback to parsing pathname if needed
	const currentLang = lang || pathname.split("/")[1] || "en";

	const navItems = [
		{
			label: dict.home?.navHome || "Home",
			href: `/${currentLang}/home`,
			icon: Home,
			isActive: pathname === `/${currentLang}/home` || pathname === `/${currentLang}`,
		},
		{
			label: dict.home?.navWardrobe || "Wardrobe",
			href: `/${currentLang}/wardrobe`,
			icon: Shirt,
			isActive: pathname.startsWith(`/${currentLang}/wardrobe`),
		},
		{
			label: "Scan",
			href: `/${currentLang}/scanner`,
			icon: Camera,
			isActive: pathname.startsWith(`/${currentLang}/scanner`),
		},
		{
			label: dict.home?.navToday || "Today",
			href: `/${currentLang}/outfit/today`,
			icon: Sparkles,
			isActive: pathname.startsWith(`/${currentLang}/outfit/today`),
		},
	];

	return (
		<nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-[env(safe-area-inset-bottom)]">
			<div className="flex items-center justify-around h-16 px-2 bg-background">
				{navItems.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							"flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
							item.isActive ? "text-primary" : "text-muted-foreground hover:text-primary/80"
						)}
					>
						<item.icon className="w-5 h-5" />
						<span className="text-[10px] font-medium">{item.label}</span>
					</Link>
				))}
			</div>
		</nav>
	);
}
