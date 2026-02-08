/**
 * Knowledge Service
 * Bridges the Supabase knowledge base with the AI Outfit Generator.
 * Provides hard rules, RAG-based style context, and layering templates.
 */

import { createClient } from '@/lib/supabase/server';
import { LayeringTemplate, TemplateSlot } from './types';
import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from '@/lib/ai/config';
import { isLightOuterwear, isWinterOuterwear, matchesAllowedSubcategory } from './garment-synonyms';

// =====================================================
// TYPES - Now imported from types.ts
// =====================================================
// LayeringTemplate and TemplateSlot are imported from './types'

interface CompatibilityRule {
    id: number;
    rule_type: string;
    trigger_value: string;
    allowed_values: string[];
    error_message: string;
}

interface KnowledgeChunk {
    id: number;
    category: string;
    content: string;
    similarity?: number;
}

// =====================================================
// CACHE (Simple in-memory with TTL)
// =====================================================

let hardRulesCache: { data: string; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// =====================================================
// GEMINI CLIENT (for embeddings)
// =====================================================

const GEMINI_API_KEY = AI_CONFIG.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// =====================================================
// FUNCTIONS
// =====================================================

/**
 * Fetches all compatibility rules from the database and formats them
 * into a string suitable for inclusion in an LLM system prompt.
 * Results are cached for 1 hour to reduce database load.
 */
export async function getHardRules(): Promise<string> {
    // Check cache
    if (hardRulesCache && Date.now() < hardRulesCache.expiresAt) {
        // console.log("[KnowledgeService] Using cached hard rules: ", hardRulesCache.data + 'which expires at: ' + hardRulesCache.expiresAt);
        return hardRulesCache.data;
    }

    console.log("[KnowledgeService] Fetching hard rules from database...");
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("compatibility_rules")
        .select("rule_type, trigger_value, allowed_values, error_message")
        .order("rule_type");

    if (error) {
        console.error("[KnowledgeService] Error fetching rules:", error.message);
        return ""; // Return empty string on error, don't crash
    }

    const rules = data as CompatibilityRule[];

    // Format rules into a readable string for the LLM
    const formattedRules = rules.map((rule) => {
        const ruleType = rule.rule_type.toUpperCase().replace(/_/g, " ");
        const allowed = rule.allowed_values.slice(0, 5).join(", "); // Limit for brevity
        return `[${ruleType}] ${rule.trigger_value}: ${rule.error_message} (OK with: ${allowed})`;
    }).join("\n");

    // Update cache
    hardRulesCache = {
        data: formattedRules,
        expiresAt: Date.now() + CACHE_TTL_MS,
    };

    // console.log(`[KnowledgeService] Cached ${rules.length} hard rules: ${formattedRules}`);
    return formattedRules;
}

/**
 * Performs RAG (Retrieval-Augmented Generation) to fetch relevant
 * style knowledge based on a semantic query.
 * Uses Google Gemini text-embedding-004 for embeddings.
 * 
 * @param query - Natural language query (e.g., "Men's style for winter")
 * @returns Concatenated content from matching knowledge chunks
 */
export async function getStyleContext(query: string): Promise<string> {
    if (!genAI) {
        console.warn("[KnowledgeService] Gemini API not configured, skipping RAG");
        return "";
    }

    console.log(`[KnowledgeService] RAG query: "${query}"`);

    try {
        // 1. Generate embedding for the query
        const embeddingResult = await genAI.models.embedContent({
            model: "text-embedding-004",
            contents: [{ role: "user", parts: [{ text: query }] }],
        });

        const embedding = embeddingResult.embeddings?.[0]?.values;
        if (!embedding || embedding.length === 0) {
            console.error("[KnowledgeService] Failed to generate embedding");
            return "";
        }

        // 2. Call Supabase RPC for vector similarity search
        const supabase = await createClient();
        
        const { data, error } = await supabase.rpc("match_knowledge", {
            query_embedding: embedding,
            match_threshold: 0.65,
            match_count: 8,
        });

        if (error) {
            console.error("[KnowledgeService] RPC error:", error.message);
            return "";
        }

        const chunks = data as KnowledgeChunk[];
        
        if (!chunks || chunks.length === 0) {
            console.log("[KnowledgeService] No matching knowledge found");
            return "";
        }

        console.log(`[KnowledgeService] Found ${chunks.length} relevant knowledge chunks`);

        // 3. Format and return the context
        const context = chunks
            .map((chunk, i) => `[${i + 1}] ${chunk.content}`)
            .join("\n\n");

        return context;

    } catch (err) {
        console.error("[KnowledgeService] RAG error:", err);
        return "";
    }
}

/**
 * Lists all available Gemini models and displays them in the console.
 * Shows model names, supported actions, and token limits.
 * 
 * @returns Array of available models
 */
export async function listAvailableModels() {
    if (!genAI) {
        console.warn("[KnowledgeService] Gemini API not configured, cannot list models");
        return [];
    }

    console.log("[KnowledgeService] Fetching available Gemini models...");

    try {
        const modelsPager = await genAI.models.list();
        
        // Collect all models from the pager
        const models = [];
        for await (const model of modelsPager) {
            models.push(model);
        }
        
        if (models.length === 0) {
            console.log("[KnowledgeService] No models found");
            return [];
        }

        console.log(`\n========== AVAILABLE GEMINI MODELS (${models.length}) ==========`);
        
        models.forEach((model, index) => {
            console.log(`\n[${index + 1}] ${model.name}`);
            console.log(`    Display Name: ${model.displayName || 'N/A'}`);
            console.log(`    Description: ${model.description || 'N/A'}`);
            console.log(`    Input Token Limit: ${model.inputTokenLimit || 'N/A'}`);
            console.log(`    Output Token Limit: ${model.outputTokenLimit || 'N/A'}`);
            console.log(`    Supported Actions: ${model.supportedActions?.join(', ') || 'N/A'}`);
        });
        
        console.log(`\n========== END OF MODEL LIST ==========\n`);

        // Group by supported actions
        const generateContentModels = models.filter(m => 
            m.supportedActions?.includes("generateContent")
        );
        const embedContentModels = models.filter(m => 
            m.supportedActions?.includes("embedContent")
        );

        console.log(`📝 Models supporting generateContent (${generateContentModels.length}):`);
        generateContentModels.forEach(m => console.log(`   - ${m.name}`));
        
        console.log(`\n🔢 Models supporting embedContent (${embedContentModels.length}):`);
        embedContentModels.forEach(m => console.log(`   - ${m.name}`));
        console.log("");

        return models;

    } catch (err) {
        console.error("[KnowledgeService] Error listing models:", err);
        return [];
    }
}

/**
 * Fetches layering templates that are applicable for the given temperature.
 * Applies the "Minimal Effort Rule": sorts by min_temp_c DESC to prefer
 * lighter layering (closer to actual temp = less effort).
 * 
 * @param currentTemp - Current apparent temperature in Celsius
 * @returns Array of matching LayeringTemplate objects, sorted by minimal effort
 */
export async function getRelevantTemplates(currentTemp: number): Promise<LayeringTemplate[]> {
    // Round temperature to integer - database columns min_temp_c/max_temp_c expect INT
    // This fixes: "invalid input syntax for type integer: -14.066202..."
    const roundedTemp = Math.round(currentTemp);
    console.log(`[KnowledgeService] Fetching templates for ${roundedTemp}°C (raw: ${currentTemp.toFixed(1)})`);
    
    const supabase = await createClient();

    // Fetch templates where the temperature falls within min/max range
    // Sort by min_temp_c DESC = "Minimal Effort Rule" (prefer warmer minimums)
    const { data, error } = await supabase
        .from("layering_templates")
        .select("*")
        .lte("min_temp_c", roundedTemp)
        .gte("max_temp_c", roundedTemp)
        .order("min_temp_c", { ascending: false }); // MINIMAL EFFORT: higher min = lighter layers

    if (error) {
        console.error("[KnowledgeService] Error fetching templates:", error.message);
        return [];
    }

    const templates = data as LayeringTemplate[];
    console.log(`[KnowledgeService] Found ${templates.length} applicable templates (sorted by minimal effort)`);
    
    return templates;
}


// =====================================================
// STRICT TEMPLATE VALIDATION
// =====================================================
// NOTE: LAYER_SLOT_MAPPINGS removed - now using template.slots.allowed_subcategories
// This ensures templates specify EXACT allowed items (e.g., "Cardigan" but NOT "Vest")

// =====================================================
// STRICT TEMPLATE VALIDATION
// =====================================================

/**
 * Validates if wardrobe contains items for template's required layers
 * STRICT MODE: Requires exact subcategory matches for specific slots
 * 
 * @param template - Template to validate
 * @param inventory - User's wardrobe items
 * @returns Validation result with missing items list
 */
export function validateTemplateAgainstWardrobe(
    template: LayeringTemplate,
    inventory: any[]
): { isValid: boolean; missingItems: string[] } {
    const missingItems: string[] = [];
    
    // NEW: Handle templates with slots (no required_layers)
    if (!template.required_layers || template.required_layers.length === 0) {
        // Templates using slots are validated elsewhere (checkInventoryForTemplate)
        return { isValid: true, missingItems: [] };
    }
    
    // Specific requirements that need EXACT subcategory matches
    const specificRequirements = ["henley", "polo", "turtleneck", "linen_shirt"];
    
    for (const requiredLayer of template.required_layers) {
        if (specificRequirements.includes(requiredLayer)) {
            // STRICT: Must have exact subcategory match (with synonym support)
            const hasItem = inventory.some(item => {
                const itemSubcat = item.subcategory || "";
                
                // Use synonym matching (e.g., "polo shirt" matches canonical "Polo")
                const canonical = requiredLayer.charAt(0).toUpperCase() + requiredLayer.slice(1).replace(/_/g, ' ');
                if (matchesAllowedSubcategory(itemSubcat, canonical)) {
                    return true;
                }
                
                // Fallback: substring match
                return itemSubcat.toLowerCase().includes(requiredLayer);
            });
            
            if (!hasItem) {
                missingItems.push(requiredLayer);
            }
        }
        // For generic slots (base_layer, mid_layer, jacket, coat, etc.)
        // we don't enforce strict validation - handled by minimal effort rule
    }
    
    return {
        isValid: missingItems.length === 0,
        missingItems
    };
}

/**
 * Represents an inventory item for template matching
 */
interface InventoryItem {
    id: string;
    type?: string;
    txt?: string;
    subcategory?: string;
    category?: string;
}


/**
 * Represents an inventory item for template matching
 */
interface InventoryItem {
    id: string;
    type?: string;
    txt?: string;
    subcategory?: string;
    category?: string;
}

/**
 * Validation result from template inventory check
 */
export interface TemplateInventoryValidation {
    isValid: boolean;
    templateName: string;
    missingSlots?: Array<{
        slotName: string;
        allowedSubcategories: string[];
    }>;
}

/**
 * Checks if the user's inventory can fulfill a specific layering template.
 * Returns validation details including missing slots for debug logging.
 * 
 * NEW BEHAVIOR: Uses template.slots.allowed_subcategories for strict validation
 * Example: If slot requires ["Cardigan", "Shawl Cardigan"], will NOT accept Vest
 * 
 * @param template - The layering template to check
 * @param inventory - The user's wardrobe payload
 * @returns Validation result with details about missing slots
 */
export function checkInventoryForTemplate(
    template: LayeringTemplate,
    inventory: InventoryItem[]
): TemplateInventoryValidation {
    const result: TemplateInventoryValidation = {
        isValid: true,
        templateName: template.name,
        missingSlots: []
    };
    
    // NEW: Use slots if available
    if (template.slots && template.slots.length > 0) {
        for (const slot of template.slots) {
            if (!slot.required) continue;  // Skip optional slots
            
            // Check if inventory has ANY item matching allowed subcategories
            // IMPORTANT: Use same multi-word matching logic as slot bucket matching in generate-outfit.ts
            const hasMatch = inventory.some((item) => {
                const itemSubcat = (item.subcategory || "").toLowerCase();
                const itemTxt = (item.txt || "").toLowerCase();
                const searchText = `${itemTxt} ${itemSubcat}`;
                
                return slot.allowed_subcategories.some((allowed: string) => {
                    // 1. PRIORYTET: Użyj systemu synonimów
                    if (matchesAllowedSubcategory(itemSubcat, allowed)) {
                        return true;
                    }
                    
                    // 2. CATEGORY LOOKUP: Winter Outerwear, Light Outerwear
                    if (allowed === "Winter Outerwear" && isWinterOuterwear(itemSubcat)) {
                        return true;
                    }
                    
                    if (allowed === "Light Outerwear" && isLightOuterwear(itemSubcat)) {
                        return true;
                    }
                    
                    // 3. FALLBACK: Multi-word matching
                    // Multi-word matching: split allowed into words and check if ALL exist
                    // Example: "White T-shirt" -> ["white", "t-shirt"] - both must be present
                    // This matches "white v-neck t-shirt" because it contains both "white" AND "t-shirt"
                    const allowedWords = allowed.toLowerCase().split(/\s+/).filter(w => w.length > 0);
                    
                    // Check if ALL words from allowed exist somewhere in searchText
                    const allWordsMatch = allowedWords.every(word => searchText.includes(word));
                    
                    // Also check exact phrase match for backward compatibility
                    const exactPhraseMatch = searchText.includes(allowed.toLowerCase());
                    
                    return allWordsMatch || exactPhraseMatch;
                });
            });

            if (!hasMatch) {
                console.log(`❌ [TEMPLATE CHECK] "${template.name}" missing slot: ${slot.slot_name} (needs: ${slot.allowed_subcategories.join(" OR ")})`);
                result.isValid = false;
                result.missingSlots!.push({
                    slotName: slot.slot_name,
                    allowedSubcategories: slot.allowed_subcategories
                });
            } else {
                console.log(`✅ [TEMPLATE CHECK] "${template.name}" - slot "${slot.slot_name}" OK`);
            }
        }
        return result;
    }
    
    // FALLBACK: Old required_layers logic (for backward compatibility)
    if (!template.required_layers || template.required_layers.length === 0) {
        return result; // No requirements = always valid
    }

    // Legacy behavior - will be removed after full migration
    console.warn(`⚠️ Template "${template.name}" using deprecated required_layers. Migrate to slots!`);
    return result;  // Allow legacy templates to pass
}

/**
 * Result from applying minimal effort rule
 */
export interface MinimalEffortResult {
    validTemplates: LayeringTemplate[];
    validationLogs: TemplateInventoryValidation[];
}

/**
 * Applies the Minimal Effort Rule to select the best templates for the user.
 * 1. Sorts by min_temp_c DESC (warmest minimum = lightest valid layering)
 * 2. Filters by inventory availability
 * 3. Returns top N valid templates with validation logs
 * 
 * @param templates - Raw templates from database (already sorted)
 * @param inventory - User's wardrobe payload
 * @param maxResults - Maximum number of templates to return
 * @returns Validated templates and validation logs for debug
 */
export function applyMinimalEffortRule(
    templates: LayeringTemplate[],
    inventory: InventoryItem[],
    maxResults: number = 3
): MinimalEffortResult {
    if (!templates || templates.length === 0) {
        return { validTemplates: [], validationLogs: [] };
    }

    // Collect validation results for all templates
    const validationResults = templates.map((t) => 
        checkInventoryForTemplate(t, inventory)
    );
    
    // Filter templates that passed validation
    const validTemplates = templates.filter((_, idx) => 
        validationResults[idx].isValid
    );

    console.log(`[KnowledgeService] Minimal Effort: ${validTemplates.length}/${templates.length} templates valid for inventory: ${validTemplates.map(t => t.name).join(", ")}`);

    // If no valid templates, return the simplest fallback (lowest layer_count)
    if (validTemplates.length === 0 && templates.length > 0) {
        const fallback = [...templates].sort((a, b) => a.layer_count - b.layer_count)[0];
        console.log(`[KnowledgeService] Using fallback template: "${fallback.name}"`);
        return { 
            validTemplates: [fallback],
            validationLogs: validationResults
        };
    }

    // Return top N templates (already sorted by minimal effort from DB)
    return {
        validTemplates: validTemplates.slice(0, maxResults),
        validationLogs: validationResults
    };
}

/**
 * Formats layering templates into a structured string for the LLM prompt.
 * Includes slot descriptions for the AI to fill.
 * 
 * @param templates - Array of LayeringTemplate objects
 * @returns Formatted string describing the templates with slots
 */
export function formatTemplatesForPrompt(templates: LayeringTemplate[]): string {
    if (!templates || templates.length === 0) {
        return "";
    }

    return templates
        .slice(0, 3) // Limit to top 3 to save tokens
        .map((t, i) => {
            const slots = (t.required_layers || []).join(" → ");
            return `OPTION ${i + 1}: "${t.name}" (${t.layer_count} layers)
  Layers: ${slots}
  Description: ${t.description}`;
        })
        .join("\n\n");
}
