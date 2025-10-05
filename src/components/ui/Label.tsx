import { forwardRef } from "react";
import type { LabelHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export const Label = forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
	<label
		ref={ref}
		className={cn(
			"text-sm font-semibold text-foreground/90",
			"flex items-center gap-2 leading-tight",
			"peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
			className
		)}
		{...props}
	/>
));

Label.displayName = "Label";
