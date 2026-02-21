"use client";

import Link from "next/link";
import { Camera, MoreHorizontal, Search, Shirt, Sun } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { useState, useEffect } from "react";

interface BottomNavigationBarProps {
    dict: Dictionary;
    lang: string;
}

export function BottomNavigationBar({ dict, lang }: BottomNavigationBarProps) {
    const [currentModel, setCurrentModel] = useState<string>("...");

    // Fetch current model from API
    useEffect(() => {
        fetch('/api/current-model')
            .then(res => res.json())
            .then(data => setCurrentModel(data.outfitGeneration || "unknown"))
            .catch(() => setCurrentModel("error"));
    }, []);

    return (
        <>
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
            
            {/* Model Display Badge */}
            <div className="fixed inset-x-0 bottom-16 z-40 pointer-events-none">
                <div className="mx-auto max-w-md px-4">
                    <div className="text-center text-[10px] text-muted-foreground/50 font-mono">
                        🤖 {currentModel}
                    </div>
                </div>
            </div>
        </>
    );
}