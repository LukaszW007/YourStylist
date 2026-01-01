"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "./Button";

export function DarkModeToggle() {
	const [isDark, setIsDark] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
        // Check HTML class first (SSR/Cookies might have set it)
        const isHtmlDark = document.documentElement.classList.contains("dark");
		setIsDark(isHtmlDark);
	}, []);

	const toggleDarkMode = () => {
		const newDarkMode = !isDark;
		setIsDark(newDarkMode);
        
        // This utility updates Cookie + Supabase + DOM Class
        import("@/lib/preferences").then(({ savePreferences }) => {
            savePreferences({ theme: newDarkMode ? "dark" : "light" });
        });
	};

	if (!mounted) {
		return (
			<Button
				variant="ghost"
				size="icon"
				className="w-10 h-10 rounded-full"
				aria-label="Toggle theme"
			>
				<Sun className="w-5 h-5" />
			</Button>
		);
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleDarkMode}
			className="w-10 h-10 rounded-full border border-border"
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
		>
			{isDark ? (
				<Sun className="w-5 h-5 text-foreground" />
			) : (
				<Moon className="w-5 h-5 text-foreground" />
			)}
		</Button>
	);
}

