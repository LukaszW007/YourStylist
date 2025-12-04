import { GarmentDetailPageClient } from "./GarmentDetailPageClient";

type Props = {
	params: Promise<{
		lang: string;
		id: string;
	}>;
};

export default async function GarmentDetailPage({ params }: Props) {
	const { lang, id } = await params;

	return (
		<GarmentDetailPageClient
			garmentId={id}
			lang={lang}
		/>
	);
}
