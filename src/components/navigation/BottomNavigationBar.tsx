"use client";

import Link from "next/link";
import { Camera, MoreHorizontal, Search, Shirt, Sun } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";

interface BottomNavigationBarProps {
    dict: Dictionary;
    lang: string;
}

export function BottomNavigationBar({ dict, lang }: BottomNavigationBarProps) {
    // In a real app, you'd use usePathname() to determine active state,
    // but for now we will keep it simple.
    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background">
            <div className="mx-auto flex h-16 w-full max-w-md items-center justify-around px-6">
                <Link
                    href={`/${lang}/wardrobe`}
                    className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Shirt className="h-5 w-5" />
                    <span className="text-xs">{dict.home.navWardrobe}</span>
                </Link>
                <Link
                    href={`/${lang}/wardrobe/scan`}
                    className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Camera className="h-5 w-5" />
                    <span className="text-xs">{dict.home.navScanner}</span>
                </Link>
                <Link
                    href={`/${lang}/outfit/today`}
                    className="flex flex-col items-center gap-1"
                >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-lg -mt-6">
                        <Sun className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs text-foreground font-medium">{dict.home.navToday}</span>
                </Link>
                <Link
                    href={`/${lang}/shopping`}
                    className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Search className="h-5 w-5" />
                    <span className="text-xs">{dict.home.navShopping}</span>
                </Link>
                <Link
                    href={`/${lang}/features`}
                    className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <MoreHorizontal className="h-5 w-5" />
                    <span className="text-xs">{dict.home.navMore}</span>
                </Link>
            </div>
        </nav>
    );
}