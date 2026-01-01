"use client";

import { cn } from "@/lib/utils";

type TempRange = "cold" | "cool" | "mild" | "warm" | "hot";

interface TemperatureFilterProps {
	selectedRange: string | null;
	onSelect: (range: string | null) => void;
}

const TEMP_OPTIONS = [
	{ id: "<0", label: "< 0°C", icon: "❄️", desc: "Mroźno" },
	{ id: "0-10", label: "0°C - 10°C", icon: "🧥", desc: "Chłodno" },
	{ id: "10-20", label: "10°C - 20°C", icon: "🌤️", desc: "Przejściowo" },
	{ id: "20-25", label: "20°C - 25°C", icon: "☀️", desc: "Ciepło" },
	{ id: ">25", label: "> 25°C", icon: "🔥", desc: "Upalnie" }, // Using >25 instead of 25-100
];

export function TemperatureFilter({ selectedRange, onSelect }: TemperatureFilterProps) {
	return (
		<div className="grid grid-cols-2 gap-3">
            {/* 'All' Option */}
			<button
				onClick={() => onSelect(null)}
				className={cn(
					"col-span-2 flex items-center justify-center rounded-xl border p-4 transition-all hover:bg-muted/50",
					selectedRange === null
						? "border-primary bg-primary/5 ring-1 ring-primary"
						: "border-border bg-card"
				)}
			>
				<span className="font-medium">Wszystkie temperatury</span>
			</button>

			{TEMP_OPTIONS.map((option) => (
				<button
					key={option.id}
					onClick={() => onSelect(selectedRange === option.id ? null : option.id)}
					className={cn(
						"flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:bg-muted/50",
						selectedRange === option.id
							? "border-primary bg-primary/5 ring-1 ring-primary"
							: "border-border bg-card"
					)}
				>
					<span className="text-3xl">{option.icon}</span>
					<span className="font-semibold text-lg">{option.label}</span>
				</button>
			))}
		</div>
	);
}
