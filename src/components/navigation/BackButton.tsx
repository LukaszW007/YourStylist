"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type BackButtonProps = {
	href: string;
	label?: string;
	className?: string;
	iconOnly?: boolean;
};

export function BackButton({ href, label = "Back", className, iconOnly = false }: BackButtonProps) {
	return (
		<Button
			variant="ghost"
			size="sm"
			className={cn("inline-flex items-center gap-2 rounded-full px-3 text-sm", className)}
			asChild
		>
			<Link href={href}>
				<ChevronLeft
					className="h-4 w-4"
					aria-hidden="true"
				/>
				{iconOnly ? <span className="sr-only">{label}</span> : <span>{label}</span>}
			</Link>
		</Button>
	);
}

export default BackButton;
