import { loadDictionary } from "@/lib/i18n/dictionary";
import MainDashboard from "@/views/home/MainDashboard";

type DashboardProps = {
	params: Promise<{
		lang: string;
	}>;
};

export default async function Dashboard({ params }: DashboardProps) {
	const { lang } = await params;
	const dict = await loadDictionary(lang);
	return (
		<MainDashboard
			dict={dict}
			lang={lang}
		/>
	);
}
