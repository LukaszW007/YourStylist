import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", ...props }, ref) => {
	return (
		<input
			type={type}
			ref={ref}
			className={cn(
				"flex h-11 w-full min-w-0 rounded-md border border-input bg-input-background px-3 py-2 text-base text-foreground transition-[box-shadow,color,border] placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
				"focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
				"aria-invalid:border-destructive aria-invalid:ring-destructive/30",
				className
			)}
			{...props}
		/>
	);
});

Input.displayName = "Input";
