import { CheckCircle2, ShoppingBag, Sparkles } from "lucide-react";

import BackButton from "@/components/navigation/BackButton";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";

const essentials = [
	{ id: "blazer", name: "Navy blazer", status: "owned" },
	{ id: "shirt", name: "White oxford shirt", status: "owned" },
	{ id: "trousers", name: "Charcoal pleated trousers", status: "wishlist" },
	{ id: "shoes", name: "Brown leather loafers", status: "wishlist" },
];

type CapsuleWardrobeViewProps = {
	dict: Dictionary;
	lang: string;
	className?: string;
};

const statusCopy: Record<string, string> = {
	owned: "In your wardrobe",
	wishlist: "Recommended to add",
};

export function CapsuleWardrobeView({ dict, lang, className }: CapsuleWardrobeViewProps) {
	return (
		<section className={cn("flex min-h-[100svh] flex-col gap-8 bg-background px-5 pb-24 pt-8", className)}>
			<header className="flex items-center justify-between">
				<BackButton
					href={`/${lang}`}
					label="Dashboard"
				/>
				<span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">{dict.home.primarySections.capsuleWardrobe}</span>
				<div
					className="w-16"
					aria-hidden="true"
				/>
			</header>

			<Card className="mx-auto w-full max-w-md border-primary/20 bg-card/90">
				<CardHeader className="gap-3 text-left">
					<CardTitle className="text-lg text-foreground">Smart-casual capsule</CardTitle>
					<CardDescription className="text-sm leading-relaxed text-muted-foreground">
						A 12-piece formula that adapts to business travel, weekend dinners, and client meetings without sacrificing comfort.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<ul className="space-y-3">
						{essentials.map((item) => (
							<li
								key={item.id}
								className="flex items-center justify-between rounded-xl border border-border/60 bg-background/80 px-4 py-3"
							>
								<div>
									<p className="font-medium text-foreground">{item.name}</p>
									<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{statusCopy[item.status]}</p>
								</div>
								{item.status === "owned" ? (
									<CheckCircle2
										className="h-5 w-5 text-emerald-500"
										aria-hidden="true"
									/>
								) : (
									<Sparkles
										className="h-5 w-5 text-primary"
										aria-hidden="true"
									/>
								)}
							</li>
						))}
					</ul>
					<div className="flex gap-3">
						<Button
							variant="secondary"
							className="h-11 flex-1 rounded-xl"
						>
							Plan outfits
						</Button>
						<Button className="h-11 flex-1 rounded-xl">
							<ShoppingBag className="h-4 w-4" />
							Shop gaps
						</Button>
					</div>
				</CardContent>
			</Card>
		</section>
	);
}

export default CapsuleWardrobeView;
