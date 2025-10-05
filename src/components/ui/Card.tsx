import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: CardProps) => (
	<div
		data-slot="card"
		className={cn("bg-card text-card-foreground flex flex-col gap-6 rounded-2xl border border-border shadow-sm", className)}
		{...props}
	/>
);

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
	<div
		data-slot="card-header"
		className={cn("grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-8 pt-8 sm:px-10 sm:pt-10", className)}
		{...props}
	/>
);

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
	<h2
		data-slot="card-title"
		className={cn("font-brand text-2xl leading-tight text-foreground", className)}
		{...props}
	/>
);

export const CardDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
	<p
		data-slot="card-description"
		className={cn("text-muted-foreground text-sm", className)}
		{...props}
	/>
);

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
	<div
		data-slot="card-content"
		className={cn("px-8 pb-8 sm:px-10 sm:pb-10", className)}
		{...props}
	/>
);

export const CardFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
	<div
		data-slot="card-footer"
		className={cn("mt-auto flex items-center justify-between gap-4 px-8 pb-8 sm:px-10 sm:pb-10", className)}
		{...props}
	/>
);
