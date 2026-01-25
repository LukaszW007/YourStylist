export enum AiProvider {
  GOOGLE = 'GOOGLE',
  HUGGING_FACE = 'HUGGING_FACE',
  CLOUDFLARE = 'CLOUDFLARE'
}

// Model names for @google/genai SDK (v1beta API)
// See: https://ai.google.dev/gemini-api/docs/models/gemini
export const AI_MODELS = {
  GEMINI: {
    // Use full model identifiers compatible with v1beta
    FLASH_2_0: 'gemini-2.5-flash-lite',           // Current flagship flash
    FLASH_1_5: 'gemini-1.5-flash-latest',    // Stable 1.5
    PRO_1_5: 'gemini-1.5-pro-latest',        // Pro tier
  },
  IMAGE: {
    FLUX_2_DEV: '@cf/black-forest-labs/flux-2-dev',
  }
} as const;

export interface AiTaskConfig {
  model: string;
  provider: AiProvider;
  temperature?: number;
}

const IS_PROD = process.env.NODE_ENV === 'production';

export const AI_CONFIG = {
  // Task 1: Generating full outfits based on weather/inventory
  OUTFIT_GENERATION: {
    model: AI_MODELS.GEMINI.FLASH_2_0, // Best balance of speed and quality
    provider: AiProvider.GOOGLE,
    temperature: 0.7
  } as AiTaskConfig,

  // Task 2: Analyze uploaded garment images
  IMAGE_ANALYSIS: {
    model: AI_MODELS.GEMINI.FLASH_2_0, // Vision-capable
    provider: AiProvider.GOOGLE,
    temperature: 0.2
  } as AiTaskConfig,

  // Task 3: Generate visual representation of the outfit
  IMAGE_GENERATION: {
    model: '@cf/black-forest-labs/flux-2-dev',
    provider: AiProvider.CLOUDFLARE, 
  } as AiTaskConfig,
  
  // API Keys (accessed via server-side env vars only)
  GEMINI_API_KEY: process.env.FREE_GEMINI_KEY,
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
  HF_TOKEN: process.env.HF_TOKEN
};
