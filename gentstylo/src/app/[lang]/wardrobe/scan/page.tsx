import ImageUploader from "@/components/scanner/ImageUploader";
import AnalysisView from "@/components/scanner/AnalysisView";

export default function ScanPage() {
	return (
		<main className="p-4 pb-24 space-y-6">
			<h1 className="text-xl font-semibold">AI Wardrobe Scanner</h1>
			<ImageUploader />
			<AnalysisView />
		</main>
	);
}
