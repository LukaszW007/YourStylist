import RecommendationsPageClient from "./RecommendationsPageClient";

type RecommendationsPageProps = {
	params: Promise<{
		lang: string;
	}>;
	searchParams: Promise<{
		item?: string;
		priceMin?: string;
		priceMax?: string;
		style?: string;
		features?: string;
	}>;
};

export default async function RecommendationsPage({ params, searchParams }: RecommendationsPageProps) {
	const { lang } = await params;
	const search = await searchParams;
	return <RecommendationsPageClient lang={lang} searchParams={search} />;
}

