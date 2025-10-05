import LoginForm from "@/components/auth/LoginForm";

type LoginPageProps = {
	params: {
		lang: string;
	};
};

export default function LoginPage({ params }: LoginPageProps) {
	const { lang } = params;

	return (
		<div className="relative min-h-screen overflow-hidden bg-background">
			<div className="pointer-events-none absolute inset-0 -z-[1]">
				<div className="absolute -top-32 right-[-10%] h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
				<div className="absolute bottom-[-20%] left-[-10%] h-80 w-80 rounded-full bg-secondary/40 blur-3xl" />
				<div className="absolute bottom-24 right-20 hidden h-40 w-40 rounded-full bg-accent/20 blur-2xl lg:block" />
			</div>
			<div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-12 px-6 py-16 lg:flex-row lg:items-center lg:gap-24 lg:px-12">
				<div className="flex flex-1 flex-col items-center gap-6 text-center lg:items-start lg:text-left">
					<span className="text-xs font-brand uppercase tracking-[0.4em] text-primary/80">Wardrobe AI Companion</span>
					<h1 className="font-brand text-4xl leading-tight text-foreground sm:text-5xl">
						Own every moment with a wardrobe that adapts to you
					</h1>
					<p className="max-w-lg text-base leading-relaxed text-muted-foreground">
						Stylo blends AI insights with your personal taste to curate outfits, plan packing lists, and keep you weather-ready.
					</p>
					<ul className="space-y-3 text-left text-sm text-muted-foreground">
						<li className="flex items-start gap-3">
							<span className="mt-1.5 size-2.5 rounded-full bg-primary" />
							<span>Personalized looks in seconds for every occasion</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="mt-1.5 size-2.5 rounded-full bg-primary" />
							<span>Plan your week with wardrobe capsules and weather alerts</span>
						</li>
						<li className="flex items-start gap-3">
							<span className="mt-1.5 size-2.5 rounded-full bg-primary" />
							<span>Keep your closet organized with smart scanning tools</span>
						</li>
					</ul>
				</div>
				<div className="flex flex-1 justify-center lg:justify-end">
					<LoginForm lang={lang} />
				</div>
			</div>
		</div>
	);
}
