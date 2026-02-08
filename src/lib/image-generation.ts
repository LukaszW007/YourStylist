import { AI_CONFIG, AiProvider } from "./ai/config";

export interface ImageGenerationResult {
    url?: string;
    base64?: string;
    error?: string;
}

/**
 * The SINGLE public entry point for generating images.
 * Dispatches to the correct provider based on specific logic or global config.
 */
export async function generateImage(prompt: string): Promise<ImageGenerationResult> {
    
    // 1. Get configuration
    const config = AI_CONFIG.IMAGE_GENERATION;
    const provider = config.provider;
    const model = config.model;

    console.log(`[ImageGen] Request: "${prompt.substring(0, 30)}..." | Provider: ${provider} | Model: ${model}`);

    try {
        switch (provider) {
            case AiProvider.CLOUDFLARE:
                return await generateWithCloudflare(prompt, model);
            case AiProvider.HUGGING_FACE:
                return await generateWithHuggingFace(prompt, model);
            case AiProvider.GOOGLE:
                return await generateWithGoogle(prompt, model);
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    } catch (error: any) {
        console.error(`[ImageGen] Error with ${provider}:`, error);
        return { error: error.message || "Unknown generation error" };
    }
}

// --- PROVIDER IMPLEMENTATIONS ---

async function generateWithCloudflare(prompt: string, modelId: string): Promise<ImageGenerationResult> {
    const ACCOUNT_ID = AI_CONFIG.CLOUDFLARE_ACCOUNT_ID;
    const TOKEN = AI_CONFIG.CLOUDFLARE_API_TOKEN;

    if (!ACCOUNT_ID || !TOKEN) {
        throw new Error("Missing Cloudflare Credentials (CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN)");
    }

    // Cloudflare Workers AI Endpoint
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${modelId}`;

    console.log(`[ImageGen] POST ${url}`);

    // FLUX.2 [dev] requires multipart/form-data format
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('steps', '35'); // Default steps for speed
    formData.append('width', '512');
    formData.append('height', '768'); // Portrait for full-body fashion

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${TOKEN}`,
            // Don't set Content-Type - browser will set it with boundary
        },
        body: formData
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Cloudflare API Error (${response.status}): ${errText}`);
    }

    // Check if response is JSON (some CF models return JSON with result.image)
    const contentType = response.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
        // JSON response format: { result: { image: "base64string" } }
        const jsonResponse = await response.json();
        console.log("[ImageGen] Received JSON response from Cloudflare");
        
        if (jsonResponse.result?.image) {
            // Image is already Base64 string
            const base64String = jsonResponse.result.image;
            console.log(`[ImageGen] Base64 string length: ${base64String.length}`);
            
            return {
                base64: `data:image/png;base64,${base64String}`
            };
        } else {
            throw new Error("JSON response missing result.image field");
        }
    } else {
        // Binary response format (arrayBuffer)
        console.log("[ImageGen] Received binary response from Cloudflare");
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        console.log(`[ImageGen] Converted arrayBuffer (${arrayBuffer.byteLength} bytes) to Base64`);

        return {
            base64: `data:image/png;base64,${base64}`
        };
    }
}

async function generateWithHuggingFace(prompt: string, modelId: string): Promise<ImageGenerationResult> {
    const TOKEN = AI_CONFIG.HF_TOKEN;
    if (!TOKEN) {
        throw new Error("Missing HF_TOKEN");
    }

    const url = `https://api-inference.huggingface.co/models/${modelId}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HuggingFace API Error (${response.status}): ${errText}`);
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Content type detection (simple)
    const type = response.headers.get("content-type") || "image/jpeg";

    return {
        base64: `data:${type};base64,${base64}`
    };
}

async function generateWithGoogle(prompt: string, modelId: string): Promise<ImageGenerationResult> {
    // Placeholder - requires Google Imagen setup usually via Vertex AI or separate endpoint
    console.warn("Google Imagen not implemented yet.");
    return { error: "Google Provider not implemented" };
}
