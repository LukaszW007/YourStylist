"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "./Button";

export function DarkModeToggle() {
	const [isDark, setIsDark] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		// Check for saved theme preference or default to light mode
		const savedTheme = localStorage.getItem("theme");
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
		setIsDark(shouldBeDark);
		if (shouldBeDark) {
			document.documentElement.classList.add("dark");
		}
	}, []);

	const toggleDarkMode = () => {
		const newDarkMode = !isDark;
		setIsDark(newDarkMode);

		if (newDarkMode) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
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

