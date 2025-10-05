import { NextRequest, NextResponse } from "next/server";

type Plan = "free" | "pro" | "elite";

export async function POST(req: NextRequest) {
	const { imageUrl } = await req.json().catch(() => ({}));

	// TODO: Replace with Supabase-authenticated user and plan lookup
	const plan: Plan = "free";
	const key = plan === "free" ? process.env.FREE_GEMINI_KEY : process.env.PAID_GEMINI_KEY;

	if (!key) {
		return NextResponse.json({ error: "Gemini key missing" }, { status: 500 });
	}

	// For now, just echo back with plan and key type; later call Gemini
	return NextResponse.json({ ok: true, plan, usedKey: plan === "free" ? "FREE_GEMINI_KEY" : "PAID_GEMINI_KEY", imageUrl: imageUrl ?? null });
}
