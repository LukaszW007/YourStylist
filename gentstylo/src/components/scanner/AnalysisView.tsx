"use client";
import { useState } from "react";

export default function AnalysisView() {
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<any>(null);

	async function analyzeDummy() {
		setLoading(true);
		try {
			const res = await fetch("/api/gemini-proxy", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ demo: true }),
			});
			setResult(await res.json());
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-3">
			<button
				onClick={analyzeDummy}
				className="rounded px-3 py-2 border"
			>
				{loading ? "Analyzing..." : "Analyze"}
			</button>
			{result && <pre className="text-xs bg-black/5 p-3 rounded overflow-auto">{JSON.stringify(result, null, 2)}</pre>}
		</div>
	);
}
