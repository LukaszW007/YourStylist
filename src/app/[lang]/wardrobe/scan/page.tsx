import ScanPageClient from "./ScanPageClient";

type ScanPageProps = {
	params: Promise<{
		lang: string;
	}>;
};

export default async function ScanPage({ params }: ScanPageProps) {
	const { lang } = await params;
	return <ScanPageClient lang={lang} />;
}
