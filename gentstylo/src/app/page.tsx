import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const LANGUAGES = [
	{ code: "en", label: "English" },
	{ code: "pl", label: "Polski" },
	{ code: "no", label: "Norsk" },
];

export default function Home() {
	return (
		<main className="flex min-h-dvh items-center justify-center bg-background px-6 py-16">
			<div className="text-center">
				<Badge className="mx-auto">Stylo</Badge>
				<h1 className="mt-4 font-brand text-4xl text-foreground sm:text-5xl">Own Your Look</h1>
				<p className="mt-3 max-w-prose text-sm text-muted-foreground sm:text-base">
					Choose your language to enter the experience tailored to the WardrobeAI design system.
				</p>
				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					{LANGUAGES.map((language) => (
						<Button
							key={language.code}
							variant="outline"
							asChild
							className="min-w-[8rem] justify-center"
						>
							<Link href={`/${language.code}`}>{language.label}</Link>
						</Button>
					))}
				</div>
			</div>
		</main>
	);
}
