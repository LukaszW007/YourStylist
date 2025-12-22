import LoginForm from "@/components/auth/LoginForm";
import { getDictionary } from "@/lib/i18n/dictionary";

type LoginPageProps = {
	params: Promise<{
		lang: string;
	}>;
};

export default async function LoginPage({ params }: LoginPageProps) {
	const { lang } = await params;
	// Ensure dictionary is loaded if needed, though LoginForm handles its own text mostly
	// const dict = await getDictionary(lang);

	return (
		<div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
			<LoginForm lang={lang} />
		</div>
	);
}
