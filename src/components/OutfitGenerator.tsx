"use client";

import type { Dictionary } from "@/lib/i18n/dictionary";

type OutfitGeneratorProps = {
	dict: Dictionary;
};

export default function OutfitGenerator({ dict }: OutfitGeneratorProps) {
	return (
		<section className="space-y-4">
			<button className="w-full rounded-xl bg-[#7d2f35] text-white py-3 font-semibold shadow-sm">{dict.home.whatToWear}</button>
			<div className="rounded-xl border p-6 bg-neutral-50 dark:bg-white/5 border-slate-300/60 dark:border-white/10">
				<div className="text-center">
					<div className="text-xl font-serif">{dict.home.outfitOfTheDay}</div>
					<p className="mt-2 text-sm opacity-80 max-w-[36ch] mx-auto">{dict.home.outfitDescription}</p>
				</div>
			</div>
		</section>
	);
}
