import { NextResponse } from 'next/server';
import { AI_CONFIG } from '@/lib/ai/config';

/**
 * Returns the currently active AI models for different tasks
 * Used by client components to display current model info
 */
export async function GET() {
  return NextResponse.json({
    outfitGeneration: AI_CONFIG.OUTFIT_GENERATION.model,
    imageAnalysis: AI_CONFIG.IMAGE_ANALYSIS.model,
    imageGeneration: AI_CONFIG.IMAGE_GENERATION.model,
  });
}
