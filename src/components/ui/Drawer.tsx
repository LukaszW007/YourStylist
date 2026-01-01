"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface DrawerProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	className?: string;
}

export function Drawer({ isOpen, onClose, title, children, className }: DrawerProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
			// Prevent body scroll
			document.body.style.overflow = "hidden";
		} else {
			const timer = setTimeout(() => setIsVisible(false), 300); // Wait for transition
			document.body.style.overflow = "";
			return () => clearTimeout(timer);
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	if (!isVisible && !isOpen) return null;

	return (
		<div className="fixed inset-0 z-[100] flex justify-center">
			{/* Backdrop */}
			<div
				className={cn(
					"absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
					isOpen ? "opacity-100" : "opacity-0"
				)}
				onClick={onClose}
			/>

			{/* Drawer Content */}
			<div
				className={cn(
					"absolute bottom-0 w-full max-w-2xl rounded-t-3xl bg-background shadow-2xl transition-transform duration-300 ease-out",
					isOpen ? "translate-y-0" : "translate-y-full",
					className
				)}
			>
				{/* Handle Bar (Visual cue) */}
				<div 
                    className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted-foreground/30 cursor-pointer"
                    onClick={onClose}
                />

				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
					<h2 className="text-xl font-semibold">{title}</h2>
					<Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
						<X className="h-5 w-5" />
					</Button>
				</div>

				{/* Scrollable Body */}
				<div className="max-h-[70vh] overflow-y-auto px-6 py-6 pb-10">
					{children}
				</div>
			</div>
		</div>
	);
}
