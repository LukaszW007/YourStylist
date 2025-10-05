import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
	label?: string;
	description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className, label, description, id, ...props }, ref) => {
	const autoId = useId();
	const checkboxId = id ?? autoId;

	return (
		<label
			htmlFor={checkboxId}
			className={cn(
				"group grid gap-1 rounded-xl border border-border/60 bg-card/80 px-4 py-3 outline-none transition focus-within:border-ring focus-within:shadow-sm",
				props.disabled && "opacity-60",
				className
			)}
		>
			<span className="flex items-center gap-3">
				<span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
					<input
						ref={ref}
						id={checkboxId}
						type="checkbox"
						className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded border border-border bg-input-background transition focus-visible:ring-2 focus-visible:ring-ring/50"
						{...props}
					/>
					<span className="pointer-events-none inline-flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground opacity-0 transition peer-checked:opacity-100">
						<svg
							className="h-3.5 w-3.5"
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
						</svg>
					</span>
				</span>
				{label ? <span className="text-sm font-semibold text-foreground">{label}</span> : null}
			</span>
			{description ? <span className="pl-8 text-xs text-muted-foreground">{description}</span> : null}
		</label>
	);
});

Checkbox.displayName = "Checkbox";
