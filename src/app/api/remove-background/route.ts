import { NextRequest, NextResponse } from "next/server";
import { removeBackground } from "@imgly/background-removal";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
	console.error("Missing Supabase configuration");
}

const supabaseAdmin = supabaseUrl && supabaseServiceKey 
	? createClient(supabaseUrl, supabaseServiceKey)
	: null;

export async function POST(request: NextRequest) {
	try {
		if (!supabaseAdmin) {
			return NextResponse.json(
				{ error: "Supabase not configured" },
				{ status: 500 }
			);
		}

		const body = await request.json();
		const { garmentId } = body;

		if (!garmentId) {
			return NextResponse.json(
				{ error: "Missing garmentId" },
				{ status: 400 }
			);
		}

		console.log(`[remove-background] Processing garment ${garmentId}...`);

		// 1. Fetch garment record to get current image URL
		const { data: garment, error: fetchError } = await supabaseAdmin
			.from("garments")
			.select("image_url, image_storage_path, user_id")
			.eq("id", garmentId)
			.single();

		if (fetchError || !garment) {
			console.error("[remove-background] Failed to fetch garment:", fetchError);
			return NextResponse.json(
				{ error: "Garment not found" },
				{ status: 404 }
			);
		}

		// 2. Download the current image
		let imageBlob: Blob;
		
		if (garment.image_url.startsWith("data:image")) {
			// Base64 data URL
			const res = await fetch(garment.image_url);
			imageBlob = await res.blob();
		} else {
			// HTTP URL - fetch from Supabase Storage or external
			const res = await fetch(garment.image_url, { mode: "cors" });
			if (!res.ok) {
				throw new Error(`Failed to fetch image: ${res.statusText}`);
			}
			imageBlob = await res.blob();
		}

		console.log(`[remove-background] Downloaded image (${imageBlob.size} bytes)`);

		// 3. Remove background (runs on server, no UI freeze)
		// IMPORTANT: Configure for Node.js environment
		console.log("[remove-background] Removing background...");
		const cleanBlob = await removeBackground(imageBlob, {
			publicPath: "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/dist/",
			debug: true,
		});
		console.log(`[remove-background] Background removed (${cleanBlob.size} bytes)`);

		// 4. Upload cleaned image to Supabase Storage
		const fileName = `clean/${garmentId}.png`;
		const { error: uploadError } = await supabaseAdmin.storage
			.from("garments")
			.upload(fileName, cleanBlob, {
				contentType: "image/png",
				upsert: true,
			});

		if (uploadError) {
			console.error("[remove-background] Upload failed:", uploadError);
			throw uploadError;
		}

		// 5. Get public URL
		const {
			data: { publicUrl },
		} = supabaseAdmin.storage.from("garments").getPublicUrl(fileName);

		console.log(`[remove-background] Uploaded to: ${publicUrl}`);

		// 6. Update garment record with new URL
		const { error: updateError } = await supabaseAdmin
			.from("garments")
			.update({ 
				image_url: publicUrl,
				image_storage_path: fileName 
			})
			.eq("id", garmentId);

		if (updateError) {
			console.error("[remove-background] Database update failed:", updateError);
			throw updateError;
		}

		console.log(`[remove-background] Success! Garment ${garmentId} updated`);

		return NextResponse.json({
			success: true,
			newImageUrl: publicUrl,
		});
	} catch (error) {
		console.error("[remove-background] Error:", error);
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Unknown error occurred",
			},
			{ status: 500 }
		);
	}
}
