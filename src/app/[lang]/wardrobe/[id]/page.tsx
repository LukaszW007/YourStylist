import { GarmentDetailPageClient } from "./GarmentDetailPageClient";
import { loadDictionary } from "@/lib/i18n/dictionary";

type Props = {
	params: Promise<{
		lang: string;
		id: string;
	}>;
};

export default async function GarmentDetailPage({ params }: Props) {
	const { lang, id } = await params;
	const dict = await loadDictionary(lang);

	return (
		<GarmentDetailPageClient
			garmentId={id}
			lang={lang}
			dict={dict}
		/>
	);
}
