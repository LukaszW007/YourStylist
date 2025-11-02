"use client";

import { ArrowLeft, Home, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type ShoppingPageClientProps = {
	lang: string;
};

const missingItems = [
	"Navy Blazer",
	"Wool Sweater",
	"Leather Boots",
	"White Oxford Shirt",
	"Cashmere Scarf",
];

export default function ShoppingPageClient({ lang }: ShoppingPageClientProps) {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");

	const handleItemClick = (item: string) => {
		router.push(`/${lang}/shopping/refine?item=${encodeURIComponent(item)}`);
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/${lang}/shopping/refine?item=${encodeURIComponent(searchQuery)}`);
		}
	};

	return (
		<main className="min-h-screen bg-background pb-24">
			{/* Header */}
			<header className="flex items-center justify-between border-b border-border bg-background px-5 py-4">
				<Link
					href={`/${lang}`}
					className="text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="h-5 w-5" />
				</Link>
				<h1 className="text-lg font-semibold text-foreground">AI Shopping Assistant</h1>
				<Link
					href={`/${lang}`}
					className="text-muted-foreground hover:text-foreground"
				>
					<Home className="h-5 w-5" />
				</Link>
			</header>

			<div className="px-5 py-6">
				{/* Question */}
				<h2 className="mb-4 text-xl font-bold text-primary">CZEGO SZUKASZ?</h2>

				{/* Search Bar */}
				<form
					onSubmit={handleSearch}
					className="mb-8"
				>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="np. białe skórzane sneakersy"
							className="w-full rounded-lg border border-border bg-card px-10 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
				</form>

				{/* From your Capsule Wardrobe */}
				<section className="space-y-4">
					<div>
						<h3 className="mb-1 text-lg font-semibold text-foreground">From your Capsule Wardrobe</h3>
						<p className="text-sm text-muted-foreground">Missing items that would complete your style</p>
					</div>

					<div className="space-y-2">
						{missingItems.map((item) => (
							<Card
								key={item}
								className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4 transition hover:bg-muted"
								onClick={() => handleItemClick(item)}
							>
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary">
									<Plus className="h-4 w-4 text-primary" />
								</div>
								<span className="flex-1 font-medium text-foreground">{item}</span>
							</Card>
						))}
					</div>
				</section>
			</div>
		</main>
	);
}

