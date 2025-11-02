import RefinePageClient from "./RefinePageClient";

type RefinePageProps = {
	params: Promise<{
		lang: string;
	}>;
	searchParams: Promise<{
		item?: string;
	}>;
};

export default async function RefinePage({ params, searchParams }: RefinePageProps) {
	const { lang } = await params;
	const { item } = await searchParams;
	return <RefinePageClient lang={lang} item={item || ""} />;
}

