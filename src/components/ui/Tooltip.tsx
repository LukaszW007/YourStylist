"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface TooltipProps {
	text: string;
	children: React.ReactNode;
	className?: string;
	side?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ text, children, className, side = "top" }: TooltipProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [coords, setCoords] = useState({ top: 0, left: 0 });
	const triggerRef = useRef<HTMLDivElement>(null);

	const updatePosition = () => {
		if (triggerRef.current) {
			const rect = triggerRef.current.getBoundingClientRect();
			let top = 0;
			let left = 0;

			// Gap between element and tooltip
			const gap = 8;

			switch (side) {
				case "top":
					top = rect.top - gap;
					left = rect.left + rect.width / 2;
					break;
				case "bottom":
					top = rect.bottom + gap;
					left = rect.left + rect.width / 2;
					break;
				case "left":
					top = rect.top + rect.height / 2;
					left = rect.left - gap;
					break;
				case "right":
					top = rect.top + rect.height / 2;
					left = rect.right + gap;
					break;
			}

			setCoords({ top, left });
		}
	};

	const handleMouseEnter = () => {
		updatePosition();
		setIsVisible(true);
	};

	useEffect(() => {
        // Recalculate on scroll or resize if visible
        if (isVisible) {
            window.addEventListener("scroll", updatePosition);
            window.addEventListener("resize", updatePosition);
            return () => {
                window.removeEventListener("scroll", updatePosition);
                window.removeEventListener("resize", updatePosition);
            }
        }
    }, [isVisible]);

	return (
		<div
			ref={triggerRef}
			className={cn("relative flex items-center justify-center group", className)}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={() => setIsVisible(false)}
		>
			{children}
			{isVisible &&
				createPortal(
					<div
						className={cn(
							"fixed z-[9999] whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background shadow-md transition-opacity duration-200 pointer-events-none",
                            // Positioning logic
                            side === "top" && "-translate-x-1/2 -translate-y-full",
                            side === "bottom" && "-translate-x-1/2",
                            side === "left" && "-translate-x-full -translate-y-1/2",
                            side === "right" && "-translate-y-1/2"
						)}
						style={{ top: coords.top, left: coords.left }}
					>
						{text}
                        {/* Simple Arrow (Optional, skipping for Portal simplicity as it needs precise rotation/positioning) */}
					</div>,
					document.body
				)}
		</div>
	);
}
