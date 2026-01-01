"use client";

import { Drawer } from "@/components/ui/Drawer";

interface FilterDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

export function FilterDrawer({ isOpen, onClose, title, children }: FilterDrawerProps) {
	return (
		<Drawer isOpen={isOpen} onClose={onClose} title={title}>
			{children}
		</Drawer>
	);
}
