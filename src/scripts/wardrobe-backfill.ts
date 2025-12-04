// Backfill comfort and color_family for garments
import { createClient } from "@supabase/supabase-js";
import { computeComfortRange, deriveColorFamily } from "../lib/wardrobe/classification";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "50", 10);
const DRY_RUN = process.env.DRY_RUN === "1";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function backfillBatch(offset: number) {
	const { data: garments, error } = await supabase
		.from("garments")
		.select("*")
		.order("id", { ascending: true })
		.range(offset, offset + BATCH_SIZE - 1);
	if (error) throw error;
	if (!garments || garments.length === 0) return false;

	for (const garment of garments) {
		const comfort = computeComfortRange(garment.material);
		const colorFamily = deriveColorFamily(garment.main_color_name);
		if (DRY_RUN) {
			console.log(`[DRY RUN] Would update garment id=${garment.id}:`, {
				comfort_min_c: comfort.min,
				comfort_max_c: comfort.max,
				thermal_profile: comfort.thermalProfile,
				color_family: colorFamily,
			});
			continue;
		}
		await supabase
			.from("garments")
			.update({
				comfort_min_c: comfort.min,
				comfort_max_c: comfort.max,
				thermal_profile: comfort.thermalProfile,
				color_family: colorFamily,
			})
			.eq("id", garment.id);
		console.log(`Updated garment id=${garment.id}`);
	}
	return garments.length === BATCH_SIZE;
}

async function main() {
	let offset = 0;
	while (await backfillBatch(offset)) {
		offset += BATCH_SIZE;
	}
	console.log("Backfill complete.");
}

main().catch((err) => {
	console.error("Error during backfill:", err);
	process.exit(1);
});
