import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "muted" | "outline" | "success" | "warning" | "destructive";

const variantClasses: Record<BadgeVariant, string> = {
	default: "bg-primary/90 text-primary-foreground border-primary/20",
	muted: "bg-muted text-muted-foreground border-transparent",
	outline: "bg-transparent text-foreground border-border",
	success: "bg-emerald-100 text-emerald-900 border-emerald-200",
	warning: "bg-amber-100 text-amber-900 border-amber-200",
	destructive: "bg-destructive/10 text-destructive border-destructive/40",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
				variantClasses[variant] ?? variantClasses.default,
				className
			)}
			{...props}
		/>
	);
}
