
'use server';

import { HfInference } from '@huggingface/inference';
import { serverEnv } from '@/env';

/**
 * Generates an image of a model wearing a described outfit using the Hugging Face Inference API.
 * @param outfitDescription - A detailed description of the outfit and model (e.g., "A man wearing a navy blazer, white t-shirt, and beige chinos, photorealistic, 8k").
 * @returns A Base64 encoded data URL of the generated image.
 */
export async function generateLook(outfitDescription: string): Promise<{ imageUrl?: string; error?: string }> {
  try {
    const hfApiKey = serverEnv.huggingFaceApiKey;

    if (!hfApiKey) {
      throw new Error('Hugging Face API key is not configured. Please set HUGGING_FACE_API_KEY in your environment variables.');
    }

    const hf = new HfInference(hfApiKey);

    const imageBlob = await hf.textToImage({
      model: 'stabilityai/stable-diffusion-xl-base-1.0',
      inputs: outfitDescription,
      parameters: {
        negative_prompt: 'blurry, disfigured, deformed, low quality, extra limbs',
        num_inference_steps: 25,
        guidance_scale: 7.5,
      },
    });

    // Convert the image blob to a Base64 data URL
    const buffer = Buffer.from(await imageBlob.arrayBuffer());
    const dataUrl = `data:${imageBlob.type};base64,${buffer.toString('base64')}`;

    return { imageUrl: dataUrl };

  } catch (error: unknown) {
    let errorMessage = 'Failed to generate model image.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error in generateLook server action:', errorMessage);
    return { error: errorMessage };
  }
}
