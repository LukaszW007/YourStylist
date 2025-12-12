"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "checked" | "onChange"> {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
	({ className, label, checked, onCheckedChange, id, ...props }, ref) => {
		const defaultId = React.useId();
		const checkboxId = id ?? defaultId;

		const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			onCheckedChange(event.target.checked);
		};

		return (
			<div className={cn("flex items-center gap-2", className)}>
				<input
					ref={ref}
					type="checkbox"
					id={checkboxId}
					checked={checked}
					onChange={handleChange}
					className="peer sr-only"
					{...props}
				/>
				<label
					htmlFor={checkboxId}
					className="flex h-5 w-5 cursor-pointer items-center justify-center rounded border-2 border-gray-300 bg-white transition-colors peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:peer-checked:border-primary dark:peer-checked:bg-primary"
				>
					<svg
						className="h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
					</svg>
				</label>
				{label && (
					<label htmlFor={checkboxId} className="cursor-pointer text-sm font-medium text-foreground">
						{label}
					</label>
				)}
			</div>
		);
	},
);

Checkbox.displayName = "Checkbox";

export { Checkbox };