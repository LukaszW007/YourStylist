import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDictionary } from "@/lib/i18n/dictionary";
import { TodayOutfitView } from "@/views/outfit/TodayOutfitView";

export const dynamic = "force-dynamic";

type TodayOutfitPageProps = {
	params: Promise<{
		lang: string;
	}>;
};

export default async function TodayOutfitPage({ params }: TodayOutfitPageProps) {
	const { lang } = await params;
	const dict = await loadDictionary(lang);
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`/${lang}/login`);
	}

	return (
		<TodayOutfitView
			userId={user.id} // Przekazujemy ID, żeby klient mógł wywołać akcję
			lang={lang}
			dict={dict}
		/>
	);
}
