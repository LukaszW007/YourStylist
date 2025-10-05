export type ClassValue = string | number | false | null | undefined | ClassValue[];

function pushClass(target: string[], value: ClassValue) {
	if (!value && value !== 0) {
		return;
	}

	if (Array.isArray(value)) {
		for (const nested of value) {
			pushClass(target, nested);
		}
		return;
	}

	target.push(String(value).trim());
}

export function cn(...values: ClassValue[]) {
	const classes: string[] = [];

	for (const value of values) {
		pushClass(classes, value);
	}

	return classes.filter(Boolean).join(" ");
}
