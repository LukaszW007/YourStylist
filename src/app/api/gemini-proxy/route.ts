import { NextRequest, NextResponse } from "next/server";

import { serverEnv } from "@/env";

type Plan = "free" | "pro" | "elite";

export async function POST(req: NextRequest) {
	const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
	const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : null;
	const prompt = typeof body.prompt === "string" ? body.prompt : null;
	const image = body.image;

	// TODO: Replace with Supabase-authenticated user and plan lookup
	const plan: Plan = "free";
	const key = plan === "free" ? serverEnv.freeGeminiKey : serverEnv.paidGeminiKey;

	if (!key) {
		return NextResponse.json(
			{
				error: "Gemini key missing",
				hint: "Set FREE_GEMINI_KEY or GEMINI_API_KEY in your .env file",
			},
			{ status: 500 }
		);
	}

	// For now, echo back details; later call Gemini
	return NextResponse.json({
		ok: true,
		plan,
		usedKey: plan === "free" ? "FREE_GEMINI_KEY" : "PAID_GEMINI_KEY",
		imageUrl,
		prompt,
		imageProvided: Boolean(image),
	});
}
