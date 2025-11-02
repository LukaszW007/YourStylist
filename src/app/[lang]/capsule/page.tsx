import { loadDictionary } from "@/lib/i18n/dictionary";
import CapsuleWardrobeView from "@/views/capsule/CapsuleWardrobeView";

type CapsulePageProps = {
	params: Promise<{
		lang: string;
	}>;
};

export default async function CapsulePage({ params }: CapsulePageProps) {
	const { lang } = await params;
	const dict = await loadDictionary(lang);
	return (
		<CapsuleWardrobeView
			dict={dict}
			lang={lang}
		/>
	);
}
