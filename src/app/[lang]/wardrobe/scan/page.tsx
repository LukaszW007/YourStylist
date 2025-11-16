import ScanPageClient from "./ScanPageClient";
import { loadWardrobeDictionary } from "@/lib/i18n/wardrobeTranslations";

type ScanPageProps = {
	params: Promise<{
		lang: string;
	}>;
};

export default async function ScanPage({ params }: ScanPageProps) {
	const { lang } = await params;
	const dict = await loadWardrobeDictionary(lang as "en" | "pl" | "no");
	return (
		<ScanPageClient
			lang={lang}
			translations={dict.scanner}
		/>
	);
}
