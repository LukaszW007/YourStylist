import GarmentCard from "./GarmentCard";

export default function GarmentGrid({ items }: { items: any[] }) {
	if (!items.length) {
		return <div className="text-center py-12 opacity-70">No garments yet.</div>;
	}
	return (
		<div className="grid grid-cols-2 gap-3">
			{items.map((g) => (
				<GarmentCard
					key={g.id}
					garment={g}
				/>
			))}
		</div>
	);
}
