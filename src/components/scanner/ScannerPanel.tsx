"use client";

import { useState } from "react";

import AnalysisView from "@/components/scanner/AnalysisView";
import ImageUploader from "@/components/scanner/ImageUploader";

export default function ScannerPanel() {
	const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);

	return (
		<div className="space-y-6">
			<ImageUploader
				onImageReady={(base64, mimeType) => {
					setImageData({ base64, mimeType });
				}}
				isLoading={isAnalyzing}
			/>
			<AnalysisView
				base64Image={imageData?.base64 ?? null}
				mimeType={imageData?.mimeType ?? null}
				onAnalyzingChange={setIsAnalyzing}
			/>
		</div>
	);
}
