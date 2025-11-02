"use client";

import { ChevronDown } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

import { Button } from "./Button";

type LanguageOption = {
	code: string;
	label: string;
	flag: string;
};

const languages: LanguageOption[] = [
	{ code: "en", label: "EN", flag: "🇬🇧" },
	{ code: "pl", label: "PL", flag: "🇵🇱" },
	{ code: "no", label: "NO", flag: "🇳🇴" },
];

type LanguageSelectProps = {
	currentLang: string;
};

export function LanguageSelect({ currentLang }: LanguageSelectProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const currentLanguage = languages.find((lang) => lang.code === currentLang) || languages[0];

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	const handleLanguageChange = async (langCode: string) => {
		if (langCode === currentLang) {
			setIsOpen(false);
			return;
		}

		// Replace the language in the current path
		const pathParts = pathname.split("/");
		if (pathParts[1] && languages.some((l) => l.code === pathParts[1])) {
			pathParts[1] = langCode;
			const newPath = pathParts.join("/");
			router.push(newPath);
		} else {
			router.push(`/${langCode}`);
		}

		// Save language preference to Supabase (only if configured)
		if (typeof window !== "undefined") {
			try {
				// Check if Supabase is configured before importing modules
				const { isSupabaseConfigured } = await import("@/lib/supabase/config-check");
				
				if (isSupabaseConfigured()) {
					const { getCurrentUser } = await import("@/lib/supabase/auth");
					const { updateUserPreferences } = await import("@/lib/supabase/queries");
					const user = await getCurrentUser();

					if (user) {
						await updateUserPreferences(user.id, { language: langCode });
					}
				}
			} catch (error) {
				// Silently fail if Supabase is not configured or there's any error
				// This prevents errors when Supabase env vars are missing
			}
		}

		setIsOpen(false);
	};

	return (
		<div
			ref={dropdownRef}
			className="relative"
		>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2 border-border bg-card px-3 py-2"
			>
				<span className="text-base">{currentLanguage.flag}</span>
				<span className="text-sm font-medium text-foreground">{currentLanguage.label}</span>
				<ChevronDown className={`h-4 w-4 text-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
			</Button>

			{isOpen && (
				<div className="absolute right-0 top-full z-50 mt-2 w-32 rounded-lg border border-border bg-card shadow-lg">
					{languages.map((lang) => (
						<button
							key={lang.code}
							onClick={() => handleLanguageChange(lang.code)}
							className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted ${
								lang.code === currentLang ? "bg-muted font-semibold text-foreground" : "text-foreground"
							}`}
						>
							<span className="text-base">{lang.flag}</span>
							<span>{lang.label}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

