import { loadDictionary } from "@/lib/i18n/dictionary";
import { TodayOutfitView } from "@/views/outfit/TodayOutfitView";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type TodayOutfitPageProps = {
	params: Promise<{
		lang: string;
	}>;
};

export default async function TodayOutfitPage({ params }: TodayOutfitPageProps) {
	const { lang } = await params;
	const dict = await loadDictionary(lang);
	
	// Get authenticated user
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	
	if (!user) {
		redirect(`/${lang}/login`);
	}
	
	return (
		<TodayOutfitView
			dict={dict}
			lang={lang}
			userId={user.id}
		/>
	);
}

