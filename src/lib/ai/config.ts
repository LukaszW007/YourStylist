export enum AiProvider {
  GOOGLE = 'GOOGLE',
  HUGGING_FACE = 'HUGGING_FACE',
  CLOUDFLARE = 'CLOUDFLARE'
}

// Model names for @google/genai SDK (v1beta API)
// See: https://ai.google.dev/gemini-api/docs/models/gemini
export const AI_MODELS = {
  GEMINI: {
    // Use model identifiers compatible with v1beta (2025+ models)
    FLASH_2_5: 'gemini-2.5-flash',          // Current stable (500 RPD free tier)
    FLASH_2_5_LITE: 'gemini-2.5-flash-lite', // Lightweight (20 RPD free tier)
    FLASH_3_PREVIEW: 'gemini-3-flash-preview',              // Gemini 3 generation (20 RPD free tier)
    FLASH_3_PRO_PREVIEW: 'gemini-3-pro-preview',              // Gemini 3 generation (20 RPD free tier)
    // FLASH_2_0: 'gemini-2.0-flash',          // Previous gen
    PRO_2_5: 'gemini-2.5-pro',              // Pro tier
  },
  GEMMA: {
    // Open-source models with vision support (SigLIP encoder)
    GEMMA_3_27B: 'gemma-3-27b-it',             // 14,400 RPD free tier, HAS VISION
    GEMMA_3_12B: 'gemma-3-12b-it',             // Smaller variant
  },
  IMAGE: {
    FLUX_2_DEV: '@cf/black-forest-labs/flux-2-dev',
  }
} as const;

export interface AiTaskConfig {
  model: string;
  provider: AiProvider;
  temperature?: number;
  fallbackModels?: string[];  // NEW: Auto-retry chain for 429 errors
}

const IS_PROD = process.env.NODE_ENV === 'production';

// Multi-account API key selector
// Allows easy switching between luwi007.ai and wisznu07@gmail.com accounts
const getGeminiKey = (): string | undefined => {
  const activeAccount = process.env.ACTIVE_GEMINI_ACCOUNT || 'LUWI';
  
  if (activeAccount === 'WISZNU') {
    return process.env.GEMINI_KEY_WISZNU;
  }
  return process.env.GEMINI_KEY_LUWI || process.env.FREE_GEMINI_KEY; // Fallback to old key
};

export const AI_CONFIG = {
  // Task 1: Generating full outfits based on weather/inventory
  OUTFIT_GENERATION: {
    model: AI_MODELS.GEMINI.FLASH_2_5, // Start with fastest/cheapest
    fallbackModels: [  // Auto-retry chain on 429 errors
      AI_MODELS.GEMINI.FLASH_2_5,
      AI_MODELS.GEMINI.FLASH_2_5_LITE,
      AI_MODELS.GEMINI.FLASH_3_PREVIEW,
      AI_MODELS.GEMMA.GEMMA_3_27B,  // 14,400 RPD backup
    ],
    provider: AiProvider.GOOGLE,
    temperature: 0.7
  } as AiTaskConfig,

  // Task 2: Analyze uploaded garment images
  IMAGE_ANALYSIS: {
    model: AI_MODELS.GEMINI.FLASH_2_5_LITE, // Start with fastest
    fallbackModels: [  // All have vision capabilities
      AI_MODELS.GEMINI.FLASH_2_5,
      AI_MODELS.GEMINI.FLASH_3_PREVIEW,
      AI_MODELS.GEMMA.GEMMA_3_27B,  // ✅ Has vision (SigLIP)
    ],
    provider: AiProvider.GOOGLE,
    temperature: 0.2
  } as AiTaskConfig,

  // Task 3: Generate visual representation of the outfit
  IMAGE_GENERATION: {
    model: '@cf/black-forest-labs/flux-2-dev',
    provider: AiProvider.CLOUDFLARE, 
  } as AiTaskConfig,
  
  // API Keys (accessed via server-side env vars only)
  GEMINI_API_KEY: getGeminiKey(),
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
  HF_TOKEN: process.env.HF_TOKEN
};
