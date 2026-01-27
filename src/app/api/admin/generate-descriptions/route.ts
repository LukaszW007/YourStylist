import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { AI_CONFIG } from "@/lib/ai/config";

const GEMINI_API_KEY = AI_CONFIG.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// Visual description prompt (optimized for FLUX.2Dev)
const VISUAL_PROMPT = `You are a Visual Prompt Engineer optimized for FLUX.2Dev AI image generation.

Analyze this clothing item and create a SINGLE, dense sentence describing it for AI image re-generation.

Format: [Main Color + Material/Texture] [Item Category] featuring [Secondary Color + Material/Placement] and [Key Distinguishing Detail].

Strict Rules:
1. NO fluff words ("stylish", "comfortable", "nice", "pair of"). Focus ONLY on visual physics.
2. Mention Hex codes only if the color is ambiguous.
3. Capture specific fabrics precisely (e.g., "chunky cable knit", "rough suede", "shiny nylon", "washed denim", "brushed flannel").
4. Capture patterns/prints exactly (e.g., "vertical pinstripes", "tartan check", "buffalo plaid", "horizontal quilting").
5. Include construction details (e.g., "raglan sleeves", "patch pockets", "ribbed cuffs", "contrast stitching").

Examples:
- "Tan rough-out suede hiking boots featuring contrasting navy blue mesh panels and a black outsole with white speckles."
- "Burnt Orange (#CC5500) shiny nylon puffer jacket with horizontal quilting and black matte shoulder patches."
- "Forest Green and Navy Blue buffalo-check flannel shirt with a button-down collar and chest pocket."
- "Charcoal gray fine-knit merino wool V-neck sweater with ribbed hem and cuffs."

Return ONLY the description sentence, no JSON, no markdown, no extra text.`;

export async function POST(request: NextRequest) {
  try {
    if (!genAI) {
      return NextResponse.json({ error: "Gemini API not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { garmentIds, regenerate = false } = body;

    // Initialize Supabase client
    const supabase = await createClient();

    // Fetch garments
    let query = supabase
      .from("garments")
      .select("id, name, image_url, ai_description");

    if (garmentIds && garmentIds !== "all") {
      query = query.in("id", garmentIds);
    }

    if (!regenerate) {
      // Only process garments without descriptions
      query = query.is("ai_description", null);
    }

    const { data: garments, error: fetchError } = await query;

    if (fetchError) {
      return NextResponse.json({ error: `Database error: ${fetchError.message}` }, { status: 500 });
    }

    if (!garments || garments.length === 0) {
      return NextResponse.json({ 
        message: regenerate ? "No garments found" : "All garments already have descriptions",
        processed: 0 
      });
    }

    console.log(`[GENERATE-DESCRIPTIONS] Processing ${garments.length} garments...`);

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let processed = 0;
        const total = garments.length;

        for (const garment of garments) {
          try {
            console.log(`[${processed + 1}/${total}] Processing: ${garment.name}`);

            // Fetch image from Supabase storage
            if (!garment.image_url) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                event: "error",
                garment_id: garment.id,
                garment_name: garment.name,
                error: "No image URL",
                processed: processed + 1,
                total
              })}\\n\\n`));
              processed++;
              continue;
            }

            // Download image
            const imageResponse = await fetch(garment.image_url);
            if (!imageResponse.ok) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                event: "error",
                garment_id: garment.id,
                garment_name: garment.name,
                error: "Failed to download image",
                processed: processed + 1,
                total
              })}\\n\\n`));
              processed++;
              continue;
            }

            // Convert to base64
            const imageBuffer = await imageResponse.arrayBuffer();
            const base64Image = Buffer.from(imageBuffer).toString("base64");
            const mimeType = imageResponse.headers.get("content-type") || "image/png";

            // Send to Gemini
            const result = await genAI.models.generateContent({
              model: AI_CONFIG.IMAGE_ANALYSIS.model,
              contents: [{
                role: "user",
                parts: [
                  { inlineData: { mimeType, data: base64Image } },
                  { text: VISUAL_PROMPT }
                ]
              }]
            });

            // Extract text
            let visualDescription = "";
            if (result.candidates?.[0]?.content?.parts) {
              const parts = result.candidates[0].content.parts;
              visualDescription = parts.map((p: any) => p.text || "").join("").trim();
            }

            if (!visualDescription) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                event: "error",
                garment_id: garment.id,
                garment_name: garment.name,
                error: "Empty Gemini response",
                processed: processed + 1,
                total
              })}\\n\\n`));
              processed++;
              continue;
            }

            // Save to database
            const { error: updateError } = await supabase
              .from("garments")
              .update({ ai_description: visualDescription })
              .eq("id", garment.id);

            if (updateError) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                event: "error",
                garment_id: garment.id,
                garment_name: garment.name,
                error: `DB update failed: ${updateError.message}`,
                processed: processed + 1,
                total
              })}\\n\\n`));
              processed++;
              continue;
            }

            // Success!
            processed++;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              event: "progress",
              garment_id: garment.id,
              garment_name: garment.name,
              description: visualDescription,
              processed,
              total
            })}\\n\\n`));

            console.log(`[✓] ${garment.name}: "${visualDescription.substring(0, 100)}..."`);

            // Rate limit: wait 20 seconds before next garment
            if (processed < total) {
              await new Promise(resolve => setTimeout(resolve, 20000));
            }

          } catch (itemError) {
            console.error(`[ERROR] ${garment.name}:`, itemError);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              event: "error",
              garment_id: garment.id,
              garment_name: garment.name,
              error: itemError instanceof Error ? itemError.message : "Unknown error",
              processed: processed + 1,
              total
            })}\\n\\n`));
            processed++;
          }
        }

        // Send completion
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          event: "complete",
          processed,
          total
        })}\\n\\n`));
        controller.close();
      }
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("[GENERATE-DESCRIPTIONS] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
