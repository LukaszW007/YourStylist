import GarmentGrid from "@/components/wardrobe/GarmentGrid";

export default async function WardrobePage() {
	// Server fetch placeholder; will connect to Supabase
	const initial = [] as any[];
	return (
		<main className="p-4 pb-24">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Wardrobe</h1>
				<a
					href="wardrobe/scan"
					className="rounded px-3 py-2 border"
				>
					Scan
				</a>
			</div>
			<div className="mt-4">
				<GarmentGrid items={initial} />
			</div>
		</main>
	);
}
