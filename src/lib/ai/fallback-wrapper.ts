/**
 * Automatic Model Fallback Wrapper
 * Retries API calls with fallback models when quota limits (429) are hit
 */

import type { AiTaskConfig } from './config';

/**
 * Calls Gemini API with automatic fallback on 429 quota errors
 * 
 * @param task - AI task configuration with fallback models
 * @param apiCall - Function that executes the API call with a given model
 * @returns API response from successful model
 * @throws Error if all models fail or non-429 error occurs
 */
export async function callWithFallback<T>(
  task: AiTaskConfig,
  apiCall: (model: string) => Promise<T>
): Promise<T> {
  const modelsToTry = [task.model, ...(task.fallbackModels || [])];
  
  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    const isLastModel = i === modelsToTry.length - 1;
    
    try {
      console.log(`🔄 [FALLBACK ${i + 1}/${modelsToTry.length}] Trying: ${currentModel}`);
      
      const result = await apiCall(currentModel);
      
      if (i > 0) {
        console.warn(`✅ [FALLBACK] Success with fallback model: ${currentModel}`);
      } else {
        console.log(`✅ [PRIMARY] Success with primary model: ${currentModel}`);
      }
      
      return result;
      
    } catch (error: any) {
      // Check if it's a quota/rate limit error (429)
      const is429 = 
        error?.status === 429 || 
        error?.code === 429 ||
        error?.error?.code === 429 ||
        error?.message?.includes('429') ||
        error?.message?.toLowerCase().includes('quota');
      
      if (is429 && !isLastModel) {
        console.warn(`⚠️ [FALLBACK] 429 quota error on ${currentModel}, trying next model...`);
        continue;  // Try next model in chain
      }
      
      // Non-429 error or last model failed - throw error
      if (isLastModel) {
        console.error(`❌ [FALLBACK] All ${modelsToTry.length} models exhausted. Last error:`, error);
      } else {
        console.error(`❌ [FALLBACK] Non-429 error on ${currentModel}:`, error?.message || error);
      }
      
      throw error;
    }
  }
  
  throw new Error('[FALLBACK] Unexpected: loop exited without return or throw');
}
