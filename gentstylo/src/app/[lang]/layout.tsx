import type { ReactNode } from "react";

export default function LangLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-dvh bg-white dark:bg-[#0f1e32] text-[#0f1e32] dark:text-white">
			<div className="max-w-md mx-auto w-full">{children}</div>
		</div>
	);
}
