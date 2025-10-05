export default function Home() {
	return (
		<main className="min-h-dvh flex items-center justify-center p-8">
			<div className="text-center">
				<p className="text-sm text-muted-foreground">Stylo</p>
				<h1 className="text-3xl font-semibold">Own Your Look</h1>
				<p className="mt-3 text-neutral-600 dark:text-neutral-300">Select a language to begin.</p>
				<div className="mt-6 flex gap-3 justify-center">
					<a
						className="px-4 py-2 rounded border"
						href="/en"
					>
						English
					</a>
					<a
						className="px-4 py-2 rounded border"
						href="/pl"
					>
						Polski
					</a>
					<a
						className="px-4 py-2 rounded border"
						href="/no"
					>
						Norsk
					</a>
				</div>
			</div>
		</main>
	);
}
