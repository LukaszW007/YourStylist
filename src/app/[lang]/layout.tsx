import type { ReactNode } from "react";
import { SupabaseStatusBanner } from "@/components/supabase/SupabaseStatusBanner";

export default function LangLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-dvh bg-background text-foreground">
			<div className="max-w-md mx-auto w-full">{children}</div>
			<SupabaseStatusBanner />
		</div>
	);
}
