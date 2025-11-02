import WardrobePageClient from "./WardrobePageClient";

type WardrobePageProps = {
	params: Promise<{
		lang: string;
	}>;
};

export default async function WardrobePage({ params }: WardrobePageProps) {
	const { lang } = await params;
	return <WardrobePageClient lang={lang} />;
}
