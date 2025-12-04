export type WardrobeItem = {
	id: string;
	name: string;
	category: string;
	brand?: string;
	lastWorn?: string;
	imageUrl?: string;
	colorFamily?: string;
	comfortMinC?: number;
	comfortMaxC?: number;
};
