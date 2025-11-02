import FeaturesPageClient from "./FeaturesPageClient";

type FeaturesPageProps = {
	params: Promise<{
		lang: string;
	}>;
};

export default async function FeaturesPage({ params }: FeaturesPageProps) {
	const { lang } = await params;
	return <FeaturesPageClient lang={lang} />;
}

