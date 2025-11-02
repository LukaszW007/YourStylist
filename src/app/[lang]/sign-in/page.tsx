import SignInPageClient from "./SignInPageClient";

type SignInPageProps = {
	params: Promise<{
		lang: string;
	}>;
};

export default async function SignInPage({ params }: SignInPageProps) {
	const { lang } = await params;
	return <SignInPageClient lang={lang} />;
}

