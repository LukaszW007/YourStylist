import Link from "next/link";

import { Button } from "@/components/ui/Button";
import GarmentGrid from "@/components/wardrobe/GarmentGrid";
import type { WardrobeItem } from "@/components/wardrobe/types";

export default async function WardrobePage() {
	// Server fetch placeholder; will connect to Supabase
	const initial: WardrobeItem[] = [];
	return (
		<main className="p-4 pb-24">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Wardrobe</h1>
				<Button
					variant="outline"
					asChild
				>
					<Link href="wardrobe/scan">Scan</Link>
				</Button>
			</div>
			<div className="mt-4">
				<GarmentGrid items={initial} />
			</div>
		</main>
	);
}
