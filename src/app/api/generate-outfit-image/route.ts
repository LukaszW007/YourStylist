import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/image-generation";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { outfitDescription } = body;

        if (!outfitDescription || typeof outfitDescription !== 'string') {
            return NextResponse.json({ error: "Missing or invalid 'outfitDescription'" }, { status: 400 });
        }

        console.log("[API] /generate-outfit-image Request received");

        const result = await generateImage(outfitDescription);

        if (result?.error) {
            console.error("[API] Generation failed:", result.error);
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        if (!result?.base64 && !result?.url) {
             return NextResponse.json({ error: "No image data returned from provider" }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true,
            image: result.base64 || result.url 
        });

    } catch (error: any) {
        console.error("[API] /generate-outfit-image Internal Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
