import ShoppingPageClient from "./ShoppingPageClient";

type ShoppingPageProps = {
	params: Promise<{
		lang: string;
	}>;
};

export default async function ShoppingPage({ params }: ShoppingPageProps) {
	const { lang } = await params;
	return <ShoppingPageClient lang={lang} />;
}

