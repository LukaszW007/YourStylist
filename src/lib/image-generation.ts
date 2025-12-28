import { HfInference } from "@huggingface/inference";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const HF_API_KEY = process.env.HUGGING_FACE_API_KEY || process.env.FREE_GEMINI_KEY;

export type ModelType = "cloudflare-flux" | "flux-schnell" | "sdxl-base" | "pollinations";

interface GenOptions {
	description: string;
}

// --- PROVIDER: CLOUDFLARE WORKERS AI (REST API) ---
async function generateWithCloudflare(options: GenOptions): Promise<string> {
	// Używamy wersji DEV zgodnie z Twoim wyborem
	// UWAGA: Jeśli Cloudflare udostępniło 'flux-2-dev' pod tym ID, to zadziała.
	// Jeśli nie, to jest to najlepszy dostępny Flux Dev.
	const MODEL_ID = "@cf/black-forest-labs/flux-2-dev";

	if (!CF_ACCOUNT_ID || !CF_API_TOKEN) throw new Error("Missing Cloudflare Credentials");

	const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${MODEL_ID}`;

	console.log(`☁️ [GEN-LIB] Attempting Cloudflare Model: ${MODEL_ID} (Multipart Mode)`);

	// FIX KRYTYCZNY: Flux Dev WYMAGA FormData (multipart/form-data), a nie JSON!
	const formData = new FormData();
	formData.append("prompt", options.description);
	formData.append("num_steps", "25"); // Więcej kroków dla Dev
	formData.append("guidance", "3.5");

	const response = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${CF_API_TOKEN}`,
			// NIE USTAWIAJ Content-Type ręcznie przy FormData!
			// Fetch sam ustawi 'multipart/form-data; boundary=...'
		},
		body: formData,
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error(`❌ Cloudflare Error Body: ${errorText}`);
		throw new Error(`CF_ERR:${response.status}:${errorText}`);
	}

	const arrayBuffer = await response.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	console.log(`✅ [GEN-LIB] Image generated successfully via Cloudflare. Size: ${buffer.length} bytes`);
	return `data:image/png;base64,${buffer.toString("base64")}`;
}

async function generateWithHuggingFace(modelId: string, options: GenOptions) {
	if (!HF_API_KEY) throw new Error("Missing HF API Key");
	const hf = new HfInference(HF_API_KEY);
	console.log(`🎨 [GEN-LIB] Calling HF (${modelId})...`);
	const imageBlob = await hf.textToImage({
		model: modelId,
		inputs: options.description,
	});
	const buffer = Buffer.from(await imageBlob.arrayBuffer());
	return `data:${imageBlob.type};base64,${buffer.toString("base64")}`;
}

async function generateWithPollinations(options: GenOptions) {
	console.log(`🎨 [GEN-LIB] Generating Pollinations URL...`);
	const encodedPrompt = encodeURIComponent(options.description);
	const seed = Math.floor(Math.random() * 10000);
	return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=1024&seed=${seed}&model=flux&nologo=true`;
}

// --- GŁÓWNY ROUTER ---
export async function generateImageUnified(model: ModelType, description: string) {
	switch (model) {
		case "cloudflare-flux":
			console.log(`🚀 [GEN-LIB] USED MODEL: cloudflare-flux`);
			return await generateWithCloudflare({ description });

		case "flux-schnell": // Hugging Face Flux (zapas)
			console.log(`🚀 [GEN-LIB] USED MODEL: FLUX 1 SCHNELL (${MODEL_SCHNELL})`);
			return await generateWithHuggingFace("black-forest-labs/FLUX.1-schnell", { description });

		case "sdxl-base":
			console.log(`🚀 [GEN-LIB] USED MODEL: SDXL BASE (stabilityai/stable-diffusion-xl-base-1.0)`);
			return await generateWithHuggingFace("stabilityai/stable-diffusion-xl-base-1.0", { description });

		case "pollinations":
			console.log(`🚀 [GEN-LIB] USED MODEL: POLLINATIONS`);
			return await generateWithPollinations({ description });
		default:
			throw new Error("Unknown model type");
	}
}
