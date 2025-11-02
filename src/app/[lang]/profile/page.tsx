import ProfilePageClient from "./ProfilePageClient";

type ProfilePageProps = {
	params: Promise<{
		lang: string;
	}>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
	const { lang } = await params;
	return <ProfilePageClient lang={lang} />;
}

