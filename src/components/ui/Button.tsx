import { cloneElement, forwardRef, isValidElement } from "react";
import type { ButtonHTMLAttributes, ReactElement } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
	asChild?: boolean;
}

const baseStyles =
	"relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

const variantStyles: Record<ButtonVariant, string> = {
	default: "bg-primary text-primary-foreground hover:bg-primary/90",
	destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/40",
	outline: "border border-border bg-background text-foreground hover:bg-muted hover:text-muted-foreground",
	secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
	ghost: "hover:bg-accent hover:text-accent-foreground",
	link: "text-primary underline-offset-4 hover:underline",
};

const sizeStyles: Record<ButtonSize, string> = {
	default: "h-11 px-5 py-2",
	sm: "h-9 px-4 text-sm",
	lg: "h-12 px-6 text-base",
	icon: "size-11",
};

const Spinner = () => (
	<span
		className="absolute inset-0 flex items-center justify-center"
		role="presentation"
	>
		<svg
			className="h-4 w-4 animate-spin text-current"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M21 12a9 9 0 1 1-6.219-8.56" />
		</svg>
	</span>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className, variant = "default", size = "default", isLoading = false, disabled, children, type = "button", asChild = false, ...props },
		ref
	) => {
		const resolvedVariant = variantStyles[variant] ?? variantStyles.default;
		const resolvedSize = sizeStyles[size] ?? sizeStyles.default;
		const composedClassName = cn(baseStyles, resolvedVariant, resolvedSize, className);

		if (asChild && isValidElement(children)) {
			const child = children as ReactElement<{ className?: string }>;
			return cloneElement(child, {
				className: cn(child.props.className, composedClassName),
				"data-slot": "button",
				...(isLoading ? { "aria-busy": true } : {}),
			} as Record<string, unknown>);
		}

		return (
			<button
				type={type}
				ref={ref}
				disabled={disabled || isLoading}
				aria-busy={isLoading || undefined}
				className={composedClassName}
				{...props}
			>
				{isLoading && <Spinner />}
				<span className={cn("inline-flex items-center gap-2", isLoading && "opacity-0")}>{children}</span>
			</button>
		);
	}
);

Button.displayName = "Button";
