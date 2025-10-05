"use client";
import { useState } from "react";

export default function ImageUploader() {
	const [file, setFile] = useState<File | null>(null);
	return (
		<div className="space-y-2">
			<input
				type="file"
				accept="image/*"
				onChange={(e) => setFile(e.target.files?.[0] ?? null)}
			/>
			{file && <div className="text-sm opacity-70">{file.name}</div>}
		</div>
	);
}
