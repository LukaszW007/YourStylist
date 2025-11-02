import BackButton from "@/components/navigation/BackButton";
import ScannerPanel from "@/components/scanner/ScannerPanel";

type ScanPageProps = {
	params: Promise<{
		lang: string;
	}>;
};

export default async function ScanPage({ params }: ScanPageProps) {
	const { lang } = await params;
	return (
		<main className="p-4 pb-24 space-y-6">
			<div className="flex items-center justify-between">
				<BackButton
					href={`/${lang}/wardrobe`}
					label="Wardrobe"
				/>
				<h1 className="text-xl font-semibold">AI Wardrobe Scanner</h1>
				<div
					className="w-16"
					aria-hidden="true"
				/>
			</div>
			<ScannerPanel />
		</main>
	);
}
