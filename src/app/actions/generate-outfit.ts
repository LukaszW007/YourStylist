"use server";

import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from '@google/genai';
import { getSeason } from "@/lib/utils/weather-season";
import { analyzeGarmentPhysics, calculateApparentTemperature } from "@/lib/logic/sartorial-physics";
import type { GarmentBase, LayerType } from "@/types/garment";
import type { WeatherContext } from "@/lib/logic/types";
import { expandGarmentPossibilities } from "@/lib/logic/layer-polymorphism";
import { getHardRules, getStyleContext, getRelevantTemplates, formatTemplatesForPrompt, applyMinimalEffortRule, validateTemplateAgainstWardrobe } from "@/lib/logic/knowledge-service";
import { matchesAllowedSubcategory, isWinterOuterwear, isLightOuterwear } from "@/lib/logic/garment-synonyms";
import { averageClo } from "@/lib/wardrobe/classification";
import { AI_CONFIG } from "@/lib/ai/config";
import { createOutfitDebugMarkdown, createPromptDebugMarkdown, type TemplateValidationLog } from "@/lib/debug/outfit-debug-logger";
import { block } from "sharp";
import { debugDump } from "@/lib/debug/debug-dump";

// Server-side only - uses multi-account selector from AI_CONFIG
const GEMINI_API_KEY = AI_CONFIG.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    //console.error("❌ GEMINI_API_KEY is not configured - check .env.local");
}


const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

/**
 * Fisher-Yates shuffle for randomizing array order
 * Used to randomize garment order in slots to prevent LLM from always picking first items
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Type for outfit slot - always returns 3 slots, with outfit or error
export interface OutfitSlot {
    styleName: string;        // The style name (e.g., "Smart casual")
    outfit: {
        name: string;
        description: string;
        reasoning?: string;
        garments: GarmentBase[];
        stylingMetadata?: any[];
    } | null;
    error: string | null;     // User-friendly error message if outfit couldn't be created
}


export async function generateDailyOutfits(
    userId: string, 
    weatherDescription: string, 
    temperature: number,
    // Dodajemy parametry pogodowe niezbędne dla silnika fizyki
    windSpeedKph: number = 10, 
    humidity: number = 50,
    isRaining: boolean = false,
    lat?: number
) {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];
    const userLat = lat || 52.0; 
    const currentSeason = getSeason(userLat);

    // 1. Obliczamy fizykę pogody (Apparent Temp)
    const weatherCtx: WeatherContext = {
        temp_c: temperature,
        wind_kph: windSpeedKph,
        humidity_percent: humidity,
        precipitation: isRaining,
        is_sunny: !isRaining && humidity < 60, // Uproszczenie
        season: currentSeason,
        // Opcjonalnie: pobierz historię temperatur dla aklimatyzacji
    };

    const apparentTemp = calculateApparentTemperature(weatherCtx);

    //console.log(`🌍 Physics: Real ${temperature}°C -> Feels ${apparentTemp.toFixed(1)}°C | Wind: ${windSpeedKph}km/h`);

    try {
        // 2. CHECK CACHE (include generated images)
        const { data: existingEntry } = await supabase
            .from("daily_suggestions")
            .select("suggestions, generated_model_images")
            .eq("user_id", userId)
            .eq("date", today)
            .maybeSingle();

        if (existingEntry?.suggestions) {
            //console.log("📦 [CACHE HIT] Returning cached outfits with", Object.keys(existingEntry.generated_model_images || {}).length, "cached images");
            
            // Build outfitSlots from cached suggestions
            const cachedOutfits = existingEntry.suggestions || [];
            const cachedSlots: OutfitSlot[] = cachedOutfits.map((outfit: any) => ({
                styleName: outfit.name || "Unknown Style",
                outfit: outfit,
                error: null
            }));
            
            // Pad to 3 slots if fewer cached
            while (cachedSlots.length < 3) {
                cachedSlots.push({
                    styleName: `Style ${cachedSlots.length + 1}`,
                    outfit: null,
                    error: "Brak zapisanej stylizacji"
                });
            }
            
            return {
                outfits: existingEntry.suggestions,
                outfitSlots: cachedSlots.slice(0, 3),
                cachedImages: existingEntry.generated_model_images || {}
            };
        }

        // 2.5. FETCH USER STYLE PREFERENCES (Phase 6)
        const { data: userProfile } = await supabase
            .from('user_preferences')
            .select('style_preferences')
            .eq('user_id', userId)
            .maybeSingle();
        
        const userStylePreferences = userProfile?.style_preferences || [
            'Casual/streetwear/workwear',
            'Smart casual',
            'Business casual'
        ];
        
        console.log(`👤 [USER PREFS] Generating outfits for styles: ${userStylePreferences.join(', ')}`);

        // 3. POBRANIE SZAFY (with style tags)
        const { data: wardrobe, error } = await supabase
            .from("garments")
            .select("id, name, full_name, category, subcategory, image_url, main_color_name, main_color_hex, brand, material, layer_type, comfort_min_c, comfort_max_c, thermal_profile, fabric_weave, tags, style_context, sleeve_length, ai_description, wear_count")
            .eq("user_id", userId);

        if (error || !wardrobe || wardrobe.length < 2) {
            console.error("❌ [WARDROBE] Insufficient garments or database error");
            const errorSlots: OutfitSlot[] = [
                { styleName: "Style 1", outfit: null, error: "Niewystarczająca liczba ubrań w garderobie" },
                { styleName: "Style 2", outfit: null, error: "Niewystarczająca liczba ubrań w garderobie" },
                { styleName: "Style 3", outfit: null, error: "Niewystarczająca liczba ubrań w garderobie" },
            ];
            return { outfits: [], outfitSlots: errorSlots, cachedImages: {} };
        }
        
        //console.log("📦 [DB] Fetched", wardrobe.length, "total garments from database");
        //console.log("📊 [DB] Categories:", wardrobe.reduce((acc: any, g) => { acc[g.category] = (acc[g.category] || 0) + 1; return acc; }, {}));

        // 4. SARTORIAL PHYSICS FILTERING (Engine v3.0)
        // Zamiast prostego filtra, przepuszczamy każde ubranie przez silnik
        // Map database 'name' field to 'full_name' to match GarmentBase type
        const validGarments = wardrobe.filter((g) => {
            // Mapowanie DB -> GarmentBase
            const garmentInput: GarmentBase = {
                id: g.id,
                full_name: g.full_name || g.name, // Use full_name from DB, fallback to name if NULL
                category: g.category,
                subcategory: g.subcategory,
                brand: null,
                material: g.material, // string[]
                layer_type: g.layer_type,
                season: null,
                main_color_name: g.main_color_name,
                main_color_hex: null,
                fabric_weave: g.fabric_weave,
                thermal_profile: g.thermal_profile as any,
                color_temperature: null,
                pattern: null,
                style_context: null,
                image_url: '',
                comfort_min_c: g.comfort_min_c,
                comfort_max_c: g.comfort_max_c,
                ai_description: null
            };

            const analysis = analyzeGarmentPhysics(garmentInput, weatherCtx);
            // console.log(`[PHYSICS] analyzeGarmentPhysics: ${g.name} ${g.category} ${g.subcategory} (score: ${analysis.score}) - ${analysis.reasoning.join(", ")}`);
            // const analysis = { is_suitable: true, score: 100, reasoning: [] };
            
            // DEBUG: Logowanie wszystkich odrzuceń
            if (!analysis.is_suitable) {
                console.log(`❌ [PHYSICS] Rejected: ${g.name} (${g.category}/${g.subcategory}) score=${analysis.score} t_app=${calculateApparentTemperature(weatherCtx).toFixed(1)}°C comfort_min=${g.comfort_min_c}°C - ${analysis.reasoning.join(", ")}`);
            }

            return analysis.is_suitable;
        }).map(g => ({ ...g, full_name: g.full_name || g.name })); // Ensure full_name is set (prefer DB value, fallback to name)

        // DEBUG: Status po filtracji
        //console.log(`🧪 [PHYSICS] ${validGarments.length}/${wardrobe.length} garments passed filter`);
        //console.log(`🧪 [validGarments]`, validGarments.map(g => `${g.name} (${g.category} ${g.subcategory})`));

        // CATEGORY-LEVEL FALLBACK: Ensure critical categories have at least one item
        // Instead of using the full wardrobe, add only the "warmest" item per missing category
        type WardrobeItem = typeof wardrobe[number];
        
        const getWarmestByCategory = (category: string): WardrobeItem | undefined => {
            const categoryItems = wardrobe.filter(g => 
                g.category?.toLowerCase() === category.toLowerCase()
            );
            if (categoryItems.length === 0) return undefined;
            // Sort by comfort_min_c ASC - lowest min = can handle coldest temps
            const sorted = categoryItems.sort((a, b) => 
                (a.comfort_min_c ?? 100) - (b.comfort_min_c ?? 100)
            );
            // For outerwear: only use fallback if comfort_min_c <= apparentTemp
            // Prevents adding a summer/light jacket as fallback in winter
            if (category.toLowerCase() === 'outerwear') {
                // If comfort_min_c is null, assume it's NOT suitable for extreme cold (default 5°C, not -100°C)
                const suitable = sorted.find(g => (g.comfort_min_c ?? 5) <= apparentTemp);
                if (!suitable) {
                    console.warn(`⚠️ [FALLBACK] No outerwear with comfort_min_c <= ${apparentTemp.toFixed(1)}°C found. Skipping outerwear fallback.`);
                }
                return suitable;
            }
            return sorted[0];
        };

        const essentialCategories = ['Tops', 'Bottoms', 'Shoes', 'Outerwear'];
        for (const cat of essentialCategories) {
            const hasCategory = validGarments.some(g => 
                g.category?.toLowerCase() === cat.toLowerCase()
            );
            if (!hasCategory) {
                const fallback = getWarmestByCategory(cat);
                if (fallback) {
                    //console.warn(`⚠️ [FALLBACK] No ${cat} passed filter. Adding warmest available: "${fallback.name}"`);
                    validGarments.push({ ...fallback, full_name: fallback.full_name || fallback.name }); // Use full_name from DB, fallback to name
                }
            }
        }
        
        //console.log("✅ [FILTER] After physics filtering:", validGarments.length, "valid garments");
        //console.log("📊 [FILTER] Valid categories:", validGarments.reduce((acc: any, g) => { acc[g.category] = (acc[g.category] || 0) + 1; return acc; }, {}));
        //console.log("📊 [FILTER] Valid layer_types:", validGarments.reduce((acc: any, g) => { acc[g.layer_type || 'null'] = (acc[g.layer_type || 'null'] || 0) + 1; return acc; }, {}));

        // Final check - avoid using full wardrobe as last resort to prevent bypassing filters
        const garmentsToUse = validGarments;
        
        if (validGarments.length === 0) {
            console.warn("⚠️ [FILTER] No garments passed physics filter. Proceeding with empty inventory (will trigger missing items flow).");
        }

        // 4b. PHYSICAL ATTRIBUTES ENRICHMENT
        /**
         * Enriches garment with physical attributes for AI reasoning about layering rules
         * Tags help AI apply Double Collar Rule and Layering Hierarchy from database
         */
        function enrichWithPhysicalAttributes(garment: any): string[] {
            const attrs: string[] = [];
            const subcat = garment.subcategory?.toLowerCase() || "";
            const materials = Array.isArray(garment.material) ? garment.material : [];
            
            // Collar detection (for Double Collar Rule)
            if (subcat.includes("turtleneck") || subcat.includes("rollneck")) {
                attrs.push("HIGH_COLLAR");
            } else if (subcat.includes("shirt") || subcat.includes("polo")) {
                attrs.push("COLLARED");
            }
            
            // Fabric thickness (for Layering Hierarchy Rule)
            const thinMaterials = ["merino", "cashmere", "silk"];
            const thickIndicators = ["zip", "chunky", "shawl"];
            
            if (materials.some((m: any) => thinMaterials.includes(m.toLowerCase()))) {
                attrs.push("THIN_FABRIC");
            }
            
            const isMerino = materials.some((m: any) => m.toLowerCase() === "merino");
            if (thickIndicators.some(ind => subcat.includes(ind)) || 
                (subcat.includes("cardigan") && !isMerino)) {
                attrs.push("THICK_FABRIC");
                attrs.push("OUTER_MID_LAYER");
            }
            
            // Base layer detection
            if (garment.category === "tops" && subcat.includes("t-shirt") && 
                garment.main_color_name?.toLowerCase().includes("white")) {
                attrs.push("BASE_LAYER");
            }
            
            return attrs;
        }

        // 4c. SLEEVE LENGTH FILTERING
        /**
         * Filters garments based on layering rules:
         * - Short sleeve shirts/polos prohibited in 3+ layer outfits
         * - Colored t-shirts only allowed in 1-2 layer outfits as outer layer
         */
        function filterByLayeringRules(garments: any[], templateLayerCount: number) {
            return garments.filter(g => {
                const category = g.category?.toLowerCase();
                const subcategory = g.subcategory?.toLowerCase() || '';
                const fullName = ((g as any).full_name || g.name || '').toLowerCase();
                const colorName = (g.main_color_name || '').toLowerCase();
                const isTop = ['shirt', 'polo', 't-shirt', 'henley', 'tops'].some(c => category?.includes(c));
                
                // EXCEPTION: Base layer items (white t-shirts, undershirts) can be short-sleeve
                // because they're worn UNDER other layers and won't be visible
                const isWhiteTshirt = (fullName.includes('t-shirt') && fullName.includes('white') || subcategory.includes('t-shirt')) && colorName.includes('white');
                const isUndershirt = fullName.includes('undershirt') || subcategory.includes('undershirt');
                const isBaseLayerItem = isWhiteTshirt || isUndershirt;
                
                // Short sleeve prohibited in 3+ layers - EXCEPT for base layer items
                if (templateLayerCount >= 3 && isTop && g.sleeve_length === 'short-sleeve' && !isBaseLayerItem) {
                    console.log(`❌ [SLEEVE FILTER] Rejected short sleeve: ${g.name} (${g.category}) for ${templateLayerCount}-layer outfit`);
                    return false;
                }
                
                // Colored t-shirts only in 1-2 layers
                if (fullName.includes('t-shirt') && 
                    !fullName.includes('white') && 
                    templateLayerCount >= 3) {
                    console.log(`❌ [COLOR FILTER] Rejected colored t-shirt: ${g.name} for ${templateLayerCount}-layer outfit`);
                    return false;
                }
                
                return true;
            });
        }

        // 5. PRZYGOTOWANIE PAYLOADU DLA AI
        // Note: Layering rules filter applied AFTER template selection (line ~270)
        
		const expandedWardrobe = garmentsToUse.flatMap(g => expandGarmentPossibilities(g));

		const wardrobePayload = expandedWardrobe.map((g) => ({
			id: g.id, // To może być np. "uuid_base" lub "uuid_mid"
			original_id: g.id.split('_')[0], // Prawdziwe ID do wyciągnięcia z bazy
			txt: `${g.main_color_name} ${g.subcategory || g.category} (${g.full_name}) [Worn as ${g.layer_type}]`,
			subcategory: g.subcategory || undefined, // CRITICAL: Needed for isWinterOuterwear() category matching in checkInventoryForTemplate()
			type: g.layer_type || 'base', 
			mat: Array.isArray(g.material) ? g.material.join(", ") : "Standard",
			weave: g.fabric_weave || "standard",
			clo: averageClo(Array.isArray(g.material) ? g.material : undefined),
			style_tags: (g as any).tags || (g as any).style_context || [],
			physical_attributes: enrichWithPhysicalAttributes(g),
			sleeve_length: (g as any).sleeve_length || null,
		}));

        // 6. KNOWLEDGE SERVICE - Fetch rules and style context
        //console.log("📚 [KNOWLEDGE] Fetching hard rules and style context...");
        
        const [hardRules, styleContext, rawTemplates] = await Promise.all([
            getHardRules(),
            getStyleContext(`Men's fashion advice for ${currentSeason} weather: ${weatherDescription}, temperature ${apparentTemp.toFixed(0)}°C`),
            getRelevantTemplates(apparentTemp),
        ]);

        //console.log("📚 [KNOWLEDGE] styleContext: ", styleContext);

        // 6b. MINIMAL EFFORT RULE - Filter templates by inventory availability
        const effortResult = applyMinimalEffortRule(rawTemplates, wardrobePayload, 3);
        const effortFiltered = effortResult.validTemplates;
        const templateValidationLogs = effortResult.validationLogs;
        
        // 6c. STRICT VALIDATION - Reject templates missing specific subcategories (henley, polo, etc.)
        const strictValidated = effortFiltered.filter(template => {
            const validation = validateTemplateAgainstWardrobe(template, wardrobe);
            if (!validation.isValid) {
                //console.log(`❌ [STRICT] Rejected template "${template.name}" - missing: ${validation.missingItems.join(", ")}`);
            }
            return validation.isValid;
        });
        
        // 6d. USE ALL VALID TEMPLATES (not just first one)
        // If no valid templates, use fallback
        const fallbackTemplate = {
            name: "Winter Emergency Fallback",
            required_layers: ["base_layer", "mid_layer", "coat", "bottoms", "shoes", "accessory"],
            layer_count: 5,
            description: "Full cold-weather layering",
            min_temp_c: -50,
            max_temp_c: 0,
            slots: [
                { slot_name: "shirt_layer", allowed_subcategories: ["Cotton Shirt", "Flannel Shirt"], required: true, tucked_in: "always", buttoning: "one_button_undone" },
                { slot_name: "mid_layer", allowed_subcategories: ["Sweater", "Cardigan"], required: true, tucked_in: "never", buttoning: "n/a" },
                { slot_name: "outer_layer", allowed_subcategories: ["Winter Outerwear", "Overcoat"], required: true, tucked_in: "never", buttoning: "n/a" },
            ]
        };
        
        const validTemplates = strictValidated.length > 0 ? strictValidated : [fallbackTemplate];
        
        // Calculate max layer count from all valid templates (for filtering)
        const maxLayerCount = Math.max(...validTemplates.map(t => t.layer_count || 3));
        
        // 6e. APPLY LAYERING RULES FILTER (using max layer count from all templates)
        const filteredWardrobe = filterByLayeringRules(garmentsToUse, maxLayerCount);
        //console.log(`🔍 [FILTER] ${filteredWardrobe.length}/${garmentsToUse.length} garments passed layering rules for max ${maxLayerCount}-layer outfit`);
        
        
        // 6f. MERGE SLOT BUCKETS FROM ALL VALID TEMPLATES
        // Collect all unique slots from ALL templates and merge their allowed_subcategories
        type SlotBucket = { slotName: string; garments: typeof filteredWardrobe; required: boolean };
        
        // Step 1: Collect all slots from all templates
        const mergedSlots = new Map<string, {
            allowedSubcategories: Set<string>;
            required: boolean;
        }>();
        
        validTemplates.forEach(template => {
            template.slots?.forEach((slot: any) => {
                const slotName = slot.slot_name;
                
                if (!mergedSlots.has(slotName)) {
                    mergedSlots.set(slotName, {
                        allowedSubcategories: new Set(),
                        required: false
                    });
                }
                
                const existing = mergedSlots.get(slotName)!;
                
                // Union allowed subcategories
                slot.allowed_subcategories?.forEach((subcat: string) => {
                    existing.allowedSubcategories.add(subcat);
                });
                
                // Mark as required if ANY template marks it as required
                if (slot.required) {
                    existing.required = true;
                }
            });
        });
        
        // Step 2: Build slot buckets with matching garments
        const slotBuckets: SlotBucket[] = Array.from(mergedSlots.entries()).map(([slotName, slotData]) => {
            const allowedSubcategories = Array.from(slotData.allowedSubcategories);
            
            const matchingGarments = filteredWardrobe.filter(g =>
                allowedSubcategories.some((allowed: string) => {
                    const garmentSubcategory = g.subcategory || '';
                    
                    // 1. PRIORITY: Use synonym matching system (handles "Puffer Jacket" -> "Winter Outerwear")
                    if (matchesAllowedSubcategory(garmentSubcategory, allowed)) {
                        //console.log(`🗂️ [SYNONYM MATCH] "${garmentSubcategory}" matches "${allowed}"`);
                        return true;
                    }
                    
                    // 2. CATEGORY LOOKUP: Handle broad categories like "Winter Outerwear"
                    if (allowed === "Winter Outerwear" && isWinterOuterwear(garmentSubcategory)) {
                        console.log(`🗂️ [CATEGORY MATCH] "${garmentSubcategory}" is Winter Outerwear`);
                        return true;
                    }
                    
                    if (allowed === "Light Outerwear" && isLightOuterwear(garmentSubcategory)) {
                        //console.log(`🗂️ [CATEGORY MATCH] "${garmentSubcategory}" is Light Outerwear`);
                        return true;
                    }
                    
                    // 3. FALLBACK: Multi-word matching on full_name
                    const garmentFullName = ((g as any).full_name || g.name || '').toLowerCase();
                    const searchText = `${garmentFullName} ${garmentSubcategory.toLowerCase()}`;
                    const allowedWords = allowed.toLowerCase().split(/\s+/).filter(w => w.length > 0);
                    const allWordsMatch = allowedWords.every(word => searchText.includes(word));
                    
                    return allWordsMatch;
                })
            );
            
            //console.log(`🗂️ [SLOT BUCKET] ${slotName}: ${matchingGarments.length} matching garments (merged from ${validTemplates.length} templates)`);
            if (matchingGarments.length > 0) {
                matchingGarments.slice(0, 3).forEach(mg =>
                    console.log(`   ✓ ${mg.name} (${mg.subcategory})`)
                );
            }
            
            return {
                slotName: slotName,
                garments: matchingGarments,
                required: slotData.required
            };
        });
        
        // Add bottoms and shoes buckets (always required, not in template slots)
        const bottomsGarments = filteredWardrobe.filter(g => 
            g.category?.toLowerCase() === 'bottoms'
        );
        const shoesGarments = filteredWardrobe.filter(g => 
            g.category?.toLowerCase() === 'shoes'
        );
        
        slotBuckets.push({ slotName: 'bottoms', garments: bottomsGarments, required: true });
        slotBuckets.push({ slotName: 'shoes', garments: shoesGarments, required: true });
        
        //console.log(`🗂️ [SLOT BUCKET] bottoms: ${bottomsGarments.length} options`);
        //console.log(`🗂️ [SLOT BUCKET] shoes: ${shoesGarments.length} options`);

        // Add belt bucket (optional, add belt if ANY template has tucked layers)
        const hasTuckedLayers = validTemplates.some(template =>
            template.slots?.some((slot: any) => 
                slot.tucked_in === 'always' || slot.tucked_in === 'optional'
            )
        ) ?? false;

        const beltGarments = filteredWardrobe.filter(g => {
            const category = g.category?.toLowerCase() || '';
            const subcategory = g.subcategory?.toLowerCase() || '';
            const name = g.name?.toLowerCase() || '';
            const fullName = ((g as any).full_name || '').toLowerCase();
            
            return category === 'accessories' && 
                (subcategory.includes('belt') || name.includes('belt') || fullName.includes('belt'));
        });

        if (hasTuckedLayers && beltGarments.length > 0) {
            slotBuckets.push({ slotName: 'belt', garments: beltGarments, required: false });
            //console.log(`🗂️ [SLOT BUCKET] belt: ${beltGarments.length} options (some templates have tucked layers - RECOMMENDED)`);
        } else if (beltGarments.length > 0) {
            // Still add belt as optional even for non-tucked outfits
            slotBuckets.push({ slotName: 'belt', garments: beltGarments, required: false });
            //console.log(`🗂️ [SLOT BUCKET] belt: ${beltGarments.length} options (optional)`);
        } else {
            //console.log(`🗂️ [SLOT BUCKET] belt: SKIPPED (no belts in wardrobe)`);
        }

        // 6f½. STYLE COMPATIBILITY FILTER
        // Remove garments whose style_context doesn't match ANY of the user's selected styles.
        // This prevents the LLM from picking style-incompatible garments (e.g., casual puffer for business casual).
        const styleFilteredBuckets = slotBuckets.map(bucket => {
            const filtered = bucket.garments.filter(g => {
                const garmentStyles: string[] = Array.isArray((g as any).style_context) && (g as any).style_context.length > 0
                    ? (g as any).style_context
                    : ['Casual/streetwear/workwear']; // default for garments without style_context
                return garmentStyles.some((gs: string) => userStylePreferences.includes(gs));
            });

            // Fallback: if filtering empties a required slot, keep originals to avoid breaking generation
            if (filtered.length === 0 && bucket.required && bucket.garments.length > 0) {
                console.warn(`⚠️ [STYLE FILTER] Slot "${bucket.slotName}" lost ALL garments after style filter. Keeping ${bucket.garments.length} originals as fallback.`);
                return bucket;
            }

            const removed = bucket.garments.length - filtered.length;
            if (removed > 0) {
                console.log(`🎨 [STYLE FILTER] ${bucket.slotName}: removed ${removed} garment(s), ${filtered.length} remain. Removed: ${
                    bucket.garments.filter(g => !filtered.includes(g)).map(g => `"${(g as any).full_name || g.name}" (styles: ${((g as any).style_context || []).join(', ')})`).join(', ')
                }`);
            }

            return { ...bucket, garments: filtered };
        });

        // 6h. RANDOMIZE SLOT ORDER (prevent outfit repetition)
        // Shuffle garments within each slot to increase variety and prevent LLM from always picking first items
        const randomizedBuckets = styleFilteredBuckets.map(bucket => ({
            ...bucket,
            garments: shuffleArray(bucket.garments)
        }));
        console.log(`🎲 [RANDOMIZE] Shuffled garments in ${randomizedBuckets.length} slot buckets for variety`);

        // 6i. BUILD SLOT-ORGANIZED INVENTORY (YAML format for token savings)
        const buildSlotInventoryYaml = () => {
            return randomizedBuckets.map(bucket => {
                if (bucket.garments.length === 0) {
                    return `## ${bucket.slotName.toUpperCase()} (choose 1): NO OPTIONS`;
                }
                
                const garmentsList = bucket.garments
                    .slice(0, 20)
                    .map((g) => {
                        const material = Array.isArray(g.material) ? g.material.join(', ') : 'Standard';
                        const weave = g.fabric_weave && g.fabric_weave !== 'standard' ? ` ${g.fabric_weave}` : '';
                        const styleTags = Array.isArray(g.style_context) && g.style_context.length > 0
                            ? g.style_context.join(', ')
                            : 'Casual/streetwear/workwear';
                        const comfortMin = (g as any).comfort_min_c != null ? `\n  comfort_min_c: ${(g as any).comfort_min_c}` : '';
                        const wearCount = (g as any).wear_count != null ? `\n  wear_count: ${(g as any).wear_count}` : `\n  wear_count: 0`;
                        return `- id: "${g.id}"\n  name: "${g.full_name}"\n  color: "${g.main_color_hex}"\n  material: "${material}${weave}"\n  styles: [${styleTags}]${comfortMin}${wearCount}`;
                    })
                    .join('\n');
                
                return `## ${bucket.slotName.toUpperCase()} (${bucket.required ? 'REQUIRED' : 'optional'} - choose 1):\n${garmentsList}`;
            }).join('\n\n');
        };
        
        const slotInventorySection = buildSlotInventoryYaml();
        
        // 6g. LEGACY: Still need filteredPayload for polymorphic expansion
        // This expands garments (e.g., flannel -> base + mid variants)
        const filteredExpanded = filteredWardrobe.flatMap(g => expandGarmentPossibilities(g));
        const filteredPayload = filteredExpanded.map((g) => ({
            id: g.id,
            original_id: g.id.split('_')[0],
            txt: `${g.main_color_name} ${g.subcategory || g.category} (${g.full_name}) [Worn as ${g.layer_type}]`,
            type: g.layer_type || 'base',
            mat: Array.isArray(g.material) ? g.material.join(", ") : "Standard",
            weave: g.fabric_weave || "standard",
            clo: averageClo(Array.isArray(g.material) ? g.material : undefined),
            style_tags: (g as any).tags || (g as any).style_context || [],
            physical_attributes: enrichWithPhysicalAttributes(g),
            sleeve_length: (g as any).sleeve_length || null,
        }));
        
        //console.log(`📚 [KNOWLEDGE] Loaded: ${hardRules ? 'rules✓' + hardRules : 'no rules'}, ${styleContext ? 'context✓' + styleContext : 'no context'}`);
        //console.log(`📚 [TEMPLATES] ${validTemplates.length}/${rawTemplates.length} templates valid for inventory: ${validTemplates.map(t => t.name).join(", ")}`);
        //console.log(`📋 [TEMPLATE SELECTED] "${validTemplates[0].name}" with ${validTemplates[0].layer_count} layers: ${JSON.stringify(validTemplates[0].required_layers)}`);

        // 7. STRICT TEMPLATE-BASED PROMPT
        if (!genAI) throw new Error("Gemini client not initialized");
        
        const prompt = `### ROLE
You are the "Sartorial Logic Engine". Your task is to create 3 outfits following classic menswear rules, using ONLY the provided inventory.

### GOAL
Create 3 unique outfits (styles: ${userStylePreferences.join(', ')}) adapted to weather (${weatherDescription}, feels like ${apparentTemp.toFixed(0)}°C) in ${currentSeason} season.

### CRITICAL RULES (ABSOLUTE)
1. **Layer Order:** Always from thinnest material (body) to thickest (outermost).
2. **Double Collar Rule:** NEVER combine polo/henley with shirt or turtleneck. Exception: coat collar over shirt is OK.
3. **JSON Format:** Response MUST be valid JSON. The FIRST field MUST be "_thinking".
4. **Inventory Only:** Use ONLY IDs from INVENTORY. Every outfit MUST have exactly 1 SHOES + 1 BOTTOMS. **SHOES ID MUST appear in garment_ids array — not just in your thinking.**
5. **Belt Logic:** If any template slot has tucked_in: "always"/"optional" → belt MANDATORY (unless trousers have adjusters/gurkha). Belt color MUST match shoe color (brown↔brown, black↔black). NEVER mix.
6. **Sleeve Rule:** 3+ layer outfits → long-sleeve ONLY for shirt_layer and mid_layer. Base layer may be short-sleeve.
7. **Template Compliance:** Follow template slot structure exactly. No extra/skipped upper body layers. Templates define upper body only — always ADD bottoms + shoes.
8. **Name Matching:** If template requires "Henley"/"Polo"/"Turtleneck" → garment name MUST contain that word. No substitutes.
9. **Style Matching:** Each garment's styles[] MUST include the outfit's target style. If garment has no style → treat as "Casual/streetwear/workwear". Multi-style garments can be used in any matching outfit.
10. **Color Matching:** If allowed_subcategories mentions "White T-shirt" → select only garments with white/off-white color.
11. **Subcategory Exclusions:** If a template slot has "exclude_subcategories", NEVER use those garment types for that slot. Key distinctions:
    - "Polo" (short-sleeve cotton) ≠ "Long Sleeve Merino Polo" (knit merino). They are DIFFERENT garments.
    - "Cardigan" (standard knit) ≠ "Shawl Cardigan" (chunky shawl collar). They are DIFFERENT garments.

### HARD RULES (FROM KNOWLEDGE BASE)
${hardRules || "No specific rules loaded."}

### AVAILABLE TEMPLATES (choose 1 per outfit)
${validTemplates.map((t, idx) => `${idx + 1}. ${JSON.stringify(t, null, 2)}`).join('\n\n')}

### INVENTORY (YAML)
${slotInventorySection}

### THINKING + SELECTION PROCESS
In the "_thinking" field, analyze step-by-step for EACH of 3 outfits:

**1. Template Selection:**
Choose the template that best fits the target style. Use different templates for variety when possible.
   - Outfit #1: Style "${userStylePreferences[0]}" → select matching template
   - Outfit #2: Style "${userStylePreferences[1]}" → prefer different template than #1
   - Outfit #3: Style "${userStylePreferences[2]}" → prefer different template than #1 and #2
   * Business Casual → prefer templates with Shirt + Blazer/Cardigan slots
   * Streetwear → prefer templates allowing chunky knits or casual layers

**2. Anchor Selection (ensures variety):**
   - Outfit 1: Start from SHOES. Match belt to shoes.
   - Outfit 2: Start from OUTERWEAR/JACKET.
   - Outfit 3: Start from TROUSERS.
    **Diversity Check:** Before finalizing Outfit 2 and 3, EXPLICITLY check: "Did I use this main item (jacket/pants) in previous outfits?". If yes -> REJECT and choose another.

**3. Layer Building:**
    Use the least-used items in a given category as your preferred choice, while keeping in mind the principles of classic men's elegance. This is determined by the wear_count parameter.
    Fill each template slot with items whose styles[] match the target style.
    Apply color theory: Business→high contrast or monochromatic navy/grey; Smart Casual→earth tones, sprezzatura; Casual→bolder accents or tonal.

**4. Rule Verification:**
   - Do colors harmonize? Does belt match shoes?
   - Double Collar Rule respected?
   - Inner sleeve length ≤ outer sleeve length?
   - All garments have target style in their styles[] field?
   - If template slot has tucked_in: "always" → shirt tucked, belt required?

**5. Finalization:**
If outfit violates any rule, discard and try another combination in your thinking.

**6. Garment Reuse (IMPORTANT):**
Garments CAN and SHOULD be reused across different outfits if needed. There is NO rule against using the same coat, shoes, or trousers in multiple outfits. If only one outerwear option is available AND it matches the outfit style, use it in all outfits that need it. Never reject an outfit just because a garment was used in another outfit.
If NO suitable outerwear exists for a given style (e.g., no formal coat for a Business casual outfit), set garment_ids=[] and write a friendly English explanation in \`missing_garment_message\` describing exactly what type of garment is missing and why it matters for that style.

**7. Wear Count Variety (soft preference, NOT a hard rule):**
Each garment has a \`wear_count\` field showing how many times it has been worn. Within each slot, **prefer garments with a lower wear_count** to give less-worn items more exposure. However, always prioritize style compatibility, color harmony, and sartorial rules first. If the least-worn item doesn't fit the outfit aesthetically, choose a better-fitting one regardless of wear count.

### OUTPUT FORMAT (JSON only, NO markdown, NO explanation)
{
  "_thinking": "1. Weather: ${apparentTemp.toFixed(0)}°C, choosing ${validTemplates.length > 1 ? 'multi' : 'single'}-layer templates...\n2. Outfit ${userStylePreferences[0]}: Starting from shoes...\n3. Verification: checking belt-shoe match...",
  "outfits": [
    {
      "name": "${userStylePreferences[0]}",
      "template_used": "${validTemplates[0].name}",
      "description": "Brief why it works for ${apparentTemp.toFixed(0)}°C",
      "reasoning": "Color harmony + aesthetic choices (2-3 sentences)",
      "garment_ids": ["id1", "id2", "id3"],
      "rejection_reason": null,
      "missing_garment_message": null
    },
    {
      "name": "${userStylePreferences[1]}",
      "template_used": "${validTemplates.length > 2 ? validTemplates[1].name : validTemplates[0].name}",
      "description": "Brief why it works for ${apparentTemp.toFixed(0)}°C",
      "reasoning": "Color harmony + aesthetic choices (2-3 sentences)",
      "garment_ids": ["id1", "id2", "id3"],
      "rejection_reason": null,
      "missing_garment_message": null
    },
    {
      "name": "${userStylePreferences[2]}",
      "template_used": "${validTemplates.length > 3 ? validTemplates[2].name : validTemplates[0].name}",
      "description": "Brief why it works for ${apparentTemp.toFixed(0)}°C",
      "reasoning": "Color harmony + aesthetic choices (2-3 sentences)",
      "garment_ids": ["id1", "id2", "id3"],
      "rejection_reason": null,
      "missing_garment_message": null
    }
  ]
}

NOTE: Always return exactly 3 outfit objects. If outfit cannot be created, set garment_ids=[] and fill rejection_reason with a short technical reason, AND fill missing_garment_message with a friendly explanation for the user (e.g. "Unfortunatelly, your wardrobe doesn't have a suitable garment for this style eg. Pea coat or Overcoat which is required for Business Casual style.").`;


        // const promptNEW =`You are the "Sartorial Logic Engine", an AI expert in classic menswear and styling algorithms.
        //     You do NOT guess. You do NOT hallucinate. You apply strict sartorial rules to assemble outfits based on input variables.
            
        //     CONTEXT:
        //     - Weather: ${weatherDescription}, Feels like ${apparentTemp.toFixed(1)}°C
        //     - Season: ${currentSeason}
        //     - Selected Template: ${selectedTemplate.name} (${selectedTemplate.layer_count} layers, for range of temperatures: ${selectedTemplate.min_temp_c}°C to ${selectedTemplate.max_temp_c}°C)
        //     - Selected Template Slots: ${JSON.stringify(validTemplates[0].slots, null, 2)}

        //     INVENTORY (ORGANIZED BY SLOT - CHOOSE 1 FROM EACH REQUIRED SLOT):
        //     ${slotInventorySection}

        //     ### MANDATORY HARD RULES (STRICT ENFORCEMENT)
        //     ${hardRules || "No specific compatibility rules loaded."}

        //     ### BELT  RULES (CRITICAL - ALWAYS ENFORCE)
        //     ${beltRules || "No specific belt rules loaded."}
        //     `
        // Generate Content - MATCH analyze-garments pattern exactly
        console.log("🧥 [AI] Sending prompt to Gemini...");
        
        // DEBUG: Save exact prompt to file
        await createPromptDebugMarkdown(prompt);

        const result = await genAI.models.generateContent({
            model: AI_CONFIG.OUTFIT_GENERATION.model,
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
            config: {
                temperature: AI_CONFIG.OUTFIT_GENERATION.temperature,
                // maxOutputTokens: 2048, // Optional
            }
        });
        //const result = { candidates: [{ content: { parts: [{ text: "" }] } }] };
        
        // ═══════════════════════════════════════════════════════════════════
        // EARLY DEBUG LOG CREATION (BEFORE LLM RESPONSE)
        // This ensures we capture template validation and filtered garments
        // even if LLM call fails or is mocked
        // ═══════════════════════════════════════════════════════════════════
        
        const validationLogsForDebug = templateValidationLogs.map(log => ({
            templateName: log.templateName,
            isValid: log.isValid,
            missingSlots: log.missingSlots
        }));
        
        // Flatten randomizedBuckets to a unique garment list for debug display
        // This shows the shuffled order that the LLM actually sees in the prompt
        const randomizedGarmentsForDebug = Array.from(
            new Map(
                randomizedBuckets.flatMap(b => b.garments).map(g => [g.id, g])
            ).values()
        );

        // Create debug markdown BEFORE attempting LLM call
        // This way we get logs even if LLM is mocked or fails
        await createOutfitDebugMarkdown({
            styleContext: styleContext || '',
            validTemplates: validTemplates,
            filteredGarments: randomizedGarmentsForDebug,
            uniqueGarmentsPerOutfit: new Map(), // Will be empty if LLM hasn't responded yet
            templateValidationLogs: validationLogsForDebug
        });
        
        console.log("🧥 [AI] Response received. Extracting...");
        // //console.log("CALY PROMPT: " + prompt);

        // Extract text using SAME pattern as analyze-garments
        let responseText = "";
        if (result.candidates?.[0]?.content?.parts) {
            responseText = result.candidates[0].content.parts.map((p: any) => p.text || "").join("");
        }

        if (result) {
            await debugDump(JSON.stringify(result, null, 2), "llm-response", "json", "LLM Response");
        }

        // If response is empty (mocked LLM), return early with empty outfits
        // Debug log has already been created above
        if (!responseText) {
            console.log("⚠️ [AI] Empty response - returning empty outfits (debug log already created)");
            return { outfits: [], cachedImages: {} };
        }

        //console.log("🧥 [AI] Raw response:", responseText.substring(0, 200) + "...");

        // Function to sanitize JSON string from bad control characters while preserving structural whitespace
        const sanitizeJson = (str: string) => {
            return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, (c) => {
                // Keep valid whitespace characters (newline, carriage return, tab)
                if (c === '\n' || c === '\r' || c === '\t') return c;
                return ''; // Remove other control characters
            });
        };

        // Clean the response - remove markdown code blocks (SAME as analyze-garments)
        let cleanedText = responseText.trim();
        if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (cleanedText.startsWith("```")) {
            cleanedText = cleanedText.replace(/```\n?/g, "");
        }
        
        // Remove control characters before parsing
        cleanedText = sanitizeJson(cleanedText.trim());
        
        let suggestions;
        try {
            const parsed = JSON.parse(cleanedText);
            // Handle new format: { _thinking: "...", outfits: [...] }
            if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.outfits)) {
                if (parsed._thinking) {
                    console.log("🧠 [AI THINKING]:", parsed._thinking.substring(0, 500));
                    await debugDump(parsed._thinking, "llm-thinking", "txt", "LLM Chain of Thought");
                }
                suggestions = parsed.outfits;
            } else if (Array.isArray(parsed)) {
                // Legacy fallback: plain array format
                console.log("🧠 [AI] Legacy array format detected (no _thinking field)");
                suggestions = parsed;
            } else {
                throw new Error("Unexpected JSON structure: expected { _thinking, outfits } or array");
            }
        } catch (e) {
            //console.error("❌ [AI] JSON Parse Error. Response:", cleanedText);
            // Try to extract JSON from the text (fallback)
            // First try to find object with outfits array
            const objMatch = cleanedText.match(/\{[\s\S]*"outfits"[\s\S]*\}/);
            if (objMatch) {
                // Sanitize match again just in case regex picked up something weird
                const parsed = JSON.parse(sanitizeJson(objMatch[0]));
                if (parsed._thinking) {
                    console.log("🧠 [AI THINKING] (regex):", parsed._thinking.substring(0, 500));
                    await debugDump(parsed._thinking, "llm-thinking", "txt", "LLM Chain of Thought");
                }
                suggestions = parsed.outfits;
            } else {
                // Fallback: try to find plain array
                const arrMatch = cleanedText.match(/\[[\s\S]*\]/);
                if (arrMatch) {
                    suggestions = JSON.parse(sanitizeJson(arrMatch[0]));
                } else {
                    throw e;
                }
            }
        }

        // 7. HYDRACJA + VALIDATION
        //console.log(`🔍 [VALIDATION] Validating ${suggestions.length} outfits against template "${validTemplates[0].name}"`);
        
        const fullSuggestions = suggestions.map((outfit: any) => {
            const hydratedGarments = (outfit.garment_ids || [])
                .map((id: string) => {
                    // AI might return IDs with suffixes (e.g. "uuid_mid") from the expanded list.
                    // We need to match against the original raw wardrobe IDs.
                    const originalId = id.split('_')[0]; 
                    return wardrobe.find(g => g.id === originalId);
                })
                .filter(Boolean);
            
            // DEDUPLICATION: Remove duplicate garments (same UUID selected multiple times)
            // This happens when AI selects both "uuid_base" and "uuid_mid" from polymorphic expansion
            const uniqueGarments = Array.from(
                new Map(hydratedGarments.map((g: any) => [g.id, g])).values()
            );
            console.log("uniqueGarments: " + uniqueGarments.map((g: any) => g.full_name) + " hydratedGarments: " + hydratedGarments.map((g: any) => g.full_name));
            if (uniqueGarments.length < hydratedGarments.length) {
                //console.warn(`⚠️ [DEDUP] Removed ${hydratedGarments.length - uniqueGarments.length} duplicate(s) from outfit "${outfit.name}"`);
            }
            
            // Find the template that LLM actually used for THIS outfit
            const usedTemplate = validTemplates.find(t => t.name === outfit.template_used) || validTemplates[0];
            
            // VALIDATION: Check minimum garments
            if (uniqueGarments.length < usedTemplate.layer_count) {
                //console.warn(`⚠️ [VALIDATION] Outfit "${outfit.name}" has ${uniqueGarments.length} items, template "${usedTemplate.name}" requires ${usedTemplate.layer_count}`);
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // BELT VALIDATION + AUTO-INCLUDE
            // CRITICAL: Belt color MUST match shoe color (brown=brown, black=black)
            // ═══════════════════════════════════════════════════════════════════
            const is3PlusLayerOutfit = usedTemplate.layer_count >= 3;
            
            const beltIndex = (uniqueGarments as any[]).findIndex((g: any) => 
                g.subcategory?.toLowerCase().includes('belt') || 
                (g.category?.toLowerCase() === 'accessories' && g.name?.toLowerCase().includes('belt'))
            );
            const currentlyHasBelt = beltIndex !== -1;
            
            // Helper: check if colors match (brown family / black family)
            const isBrownFamily = (color: string) => 
                color.includes('brown') || color.includes('tan') || color.includes('cognac') || color.includes('camel');
            const isBlackFamily = (color: string) => color.includes('black');
            
            // Get shoe from outfit
            const shoe = uniqueGarments.find((g: any) => g.category?.toLowerCase() === 'shoes');
            const shoeColor = shoe?.main_color_name?.toLowerCase() || '';
            
            // Find all belts in wardrobe
            const allBelts = wardrobe.filter((g: any) => 
                g.subcategory?.toLowerCase().includes('belt') ||
                (g.category?.toLowerCase() === 'accessories' && g.name?.toLowerCase().includes('belt'))
            );
            
            // Belt color matching function
            const findMatchingBelt = () => {
                return allBelts.find((belt: any) => {
                    const beltColor = belt.main_color_name?.toLowerCase() || '';
                    if (isBrownFamily(shoeColor)) return isBrownFamily(beltColor);
                    if (isBlackFamily(shoeColor)) return isBlackFamily(beltColor);
                    return true; // Fallback: if shoe color unclear, allow any belt
                });
            };
            
            if (currentlyHasBelt) {
                // VALIDATE: LLM chose a belt — check if color matches shoes
                const currentBelt = (uniqueGarments as any[])[beltIndex];
                const beltColor = currentBelt.main_color_name?.toLowerCase() || '';
                
                const brownBelt = isBrownFamily(beltColor);
                const blackBelt = isBlackFamily(beltColor);
                const brownShoes = isBrownFamily(shoeColor);
                const blackShoes = isBlackFamily(shoeColor);
                
                const isMismatch = (brownBelt && blackShoes) || (blackBelt && brownShoes);
                
                if (isMismatch) {
                    console.warn(`⚠️ [BELT] COLOR MISMATCH: ${beltColor} belt + ${shoeColor} shoes in "${outfit.name}" — swapping!`);
                    const correctBelt = findMatchingBelt();
                    if (correctBelt) {
                        (uniqueGarments as any[])[beltIndex] = {
                            ...correctBelt,
                            full_name: correctBelt.full_name || correctBelt.name,
                            layer_type: 'accessory'
                        };
                        console.log(`🎀 [BELT] ✅ Swapped to "${correctBelt.full_name || correctBelt.name}" (${correctBelt.main_color_name}) to match ${shoeColor} shoes`);
                    } else {
                        // No matching belt — remove mismatched one
                        (uniqueGarments as any[]).splice(beltIndex, 1);
                        console.warn(`🎀 [BELT] Removed mismatched ${beltColor} belt — no ${shoeColor} belt available`);
                    }
                } else {
                    console.log(`🎀 [BELT] ✅ LLM chose correct belt: ${beltColor} belt + ${shoeColor} shoes`);
                }
            } else if (is3PlusLayerOutfit) {
                // AUTO-ADD belt for 3+ layer outfits
                console.log(`🎀 [BELT] 3+ layer outfit — auto-adding belt matching ${shoeColor} shoes`);
                const matchingBelt = findMatchingBelt();
                
                if (matchingBelt) {
                    console.log(`🎀 [BELT] ✅ Auto-adding "${matchingBelt.full_name || matchingBelt.name}" (${matchingBelt.main_color_name})`);
                    (uniqueGarments as any[]).push({
                        ...matchingBelt,
                        full_name: matchingBelt.full_name || matchingBelt.name,
                        layer_type: 'accessory'
                    });
                } else if (allBelts.length > 0) {
                    console.warn(`⚠️ [BELT] No belt matches ${shoeColor} shoes. Available: ${allBelts.map((b: any) => b.main_color_name).join(', ')}`);
                } else {
                    console.warn(`⚠️ [BELT] No belts in wardrobe`);
                }
            }

            
            // VALIDATION: Ensure required categories present
            const hasBottoms = uniqueGarments.some((g: any) => g.category.toLowerCase() === 'bottoms');
            let hasShoes = uniqueGarments.some((g: any) => g.category.toLowerCase() === 'shoes');

            // AUTO-RECOVERY: If LLM forgot shoes, add the best matching shoe from wardrobe
            // This is a safety net — LLM should always include shoes in garment_ids
            if (!hasShoes) {
                console.warn(`⚠️ [SHOES] LLM forgot shoes in "${outfit.name}" — auto-adding from filteredWardrobe`);
                const availableShoes = filteredWardrobe.filter((g: any) => g.category?.toLowerCase() === 'shoes');
                // Prefer style-matched shoes
                const styleMatchedShoes = availableShoes.filter((g: any) => {
                    const garmentStyles: string[] = Array.isArray(g.style_context) && g.style_context.length > 0
                        ? g.style_context : ['Casual/streetwear/workwear'];
                    return garmentStyles.some((gs: string) => gs === outfit.name);
                });
                const shoesToAdd = styleMatchedShoes.length > 0 ? styleMatchedShoes[0] : availableShoes[0];
                if (shoesToAdd) {
                    console.log(`👟 [SHOES] Auto-added: "${shoesToAdd.full_name || shoesToAdd.name}" to "${outfit.name}"`);
                    (uniqueGarments as any[]).push({
                        ...shoesToAdd,
                        full_name: shoesToAdd.full_name || shoesToAdd.name,
                        layer_type: 'shoes'
                    });
                    hasShoes = true;
                } else {
                    console.warn(`⚠️ [SHOES] No shoes available in filteredWardrobe for auto-recovery`);
                }
            }
            
            if (!hasBottoms) {
                console.error(`❌ [VALIDATION] Outfit "${outfit.name}" MISSING BOTTOMS - REJECTED`);
                const diagnostics = {
                    rejectionPoint: "MISSING_BOTTOMS",
                    codeLocation: "generate-outfit.ts:938-941",
                    outfitName: outfit.name,
                    reason: "Outfit does not contain any garment with category='bottoms'",
                    availableGarments: (uniqueGarments as any[]).map((g: any) => ({ 
                        id: g.id, 
                        name: g.full_name, 
                        category: g.category, 
                        subcategory: g.subcategory 
                    }))
                };
                debugDump(JSON.stringify(diagnostics, null, 2), `rejected-outfit-${outfit.name.replace(/[^a-zA-Z0-9]/g, '-')}-missing-bottoms`, "json", `Rejected: ${outfit.name} - Missing Bottoms`);
                return null;
            }
            if (!hasShoes) {
                console.error(`❌ [VALIDATION] Outfit "${outfit.name}" MISSING SHOES - REJECTED`);
                const diagnostics = {
                    rejectionPoint: "MISSING_SHOES",
                    codeLocation: "generate-outfit.ts:942-945",
                    outfitName: outfit.name,
                    reason: "Outfit does not contain any garment with category='shoes'",
                    availableGarments: (uniqueGarments as any[]).map((g: any) => ({ 
                        id: g.id, 
                        name: g.full_name, 
                        category: g.category, 
                        subcategory: g.subcategory 
                    }))
                };
                debugDump(JSON.stringify(diagnostics, null, 2), `rejected-outfit-${outfit.name.replace(/[^a-zA-Z0-9]/g, '-')}-missing-shoes`, "json", `Rejected: ${outfit.name} - Missing Shoes`);
                return null;
            }
            
            // Ostateczny sanity check na kompletność outfitu
            if (uniqueGarments.length < 2) {
                console.error(`❌ [VALIDATION] Outfit "${outfit.name}" has only ${uniqueGarments.length} items - REJECTED`);
                const diagnostics = {
                    rejectionPoint: "INSUFFICIENT_ITEMS",
                    codeLocation: "generate-outfit.ts:948-951",
                    outfitName: outfit.name,
                    reason: `Outfit has only ${uniqueGarments.length} item(s), minimum required is 2`,
                    llmReturnedIds: outfit.garment_ids || [],
                    hydratedGarments: (uniqueGarments as any[]).map((g: any) => ({ 
                        id: g.id, 
                        name: g.full_name, 
                        category: g.category 
                    }))
                };
                debugDump(JSON.stringify(diagnostics, null, 2), `rejected-outfit-${outfit.name.replace(/[^a-zA-Z0-9]/g, '-')}-insufficient-items`, "json", `Rejected: ${outfit.name} - Insufficient Items`);
                return null;
            }
            
            console.log(`✅ [VALIDATION] Outfit "${outfit.name}" PASSED: ${uniqueGarments.length} items, bottoms✓, shoes✓`);
            
            // Log style coherence for debugging
            const styles = uniqueGarments
                .map((g: any) => (g.style_context || ['casual']).join(', '))
                .join(' | ');
            console.log(`🎨 [STYLE] Outfit "${outfit.name}" styles: ${styles}`);

            //console.log(`🔍 usedTemplate for "${outfit.name}": ${JSON.stringify(usedTemplate, null, 2)}`); //TODO: remove
            // EXTRACT STYLING METADATA from template slots (use the template LLM chose for THIS outfit)
            const stylingMetadata = usedTemplate.slots?.map((slot: any) => {
                // Find which garment fills this slot (synonym-aware matching)
                
                const garment = uniqueGarments.find((g: any) =>
                    slot.allowed_subcategories?.some((allowed: string) => {
                        const garmentSubcat = g.subcategory || '';
                        const garmentFullName = g.full_name || '';
                        
                        // PRIORITY 1: Subcategory synonym match
                        if (matchesAllowedSubcategory(garmentSubcat, allowed)) {
                            return true;
                        }
                        
                        // PRIORITY 2: Category lookup (broad categories like "Winter Outerwear")
                        if (allowed === "Winter Outerwear" && isWinterOuterwear(garmentSubcat)) {
                            return true;
                        }
                        if (allowed === "Light Outerwear" && isLightOuterwear(garmentSubcat)) {
                            return true;
                        }
                        
                        // PRIORITY 3: Multi-word matching (fallback for complex names)
                        const searchText = `${garmentFullName} ${garmentSubcat}`.toLowerCase();
                        const allowedWords = allowed.toLowerCase().split(/\s+/).filter((w: string) => w.length > 0);
                        const allWordsMatch = allowedWords.every((word: string) => searchText.includes(word));
                        const exactPhraseMatch = searchText.includes(allowed.toLowerCase());
                        
                        return allWordsMatch || exactPhraseMatch;
                    })
                ) as GarmentBase | undefined;

                
                //console.log(`🔍 [SLOT VALIDATION] Checking slot garment: "${JSON.stringify(garment, null, 2)}"`);
                //console.log(`🔍 ---------------------------`);
                
                if (!garment) return null;
                
                return {
                    garmentId: garment.id,
                    garmentName: garment.full_name,
                    slotName: slot.slot_name,
                    tuckedIn: slot.tucked_in || 'n/a',
                    buttoning: slot.buttoning || 'n/a'
                };
            }).filter(Boolean) || [];

            // VALIDATE: Check all required slots are filled (use the template LLM chose for THIS outfit)
            const missingSlots = usedTemplate.slots?.filter((slot: any) => {
                if (!slot.required) return false;
                
                // Check if outfit has garment matching this slot's allowed subcategories
                // //console.log(`🔍 ---------------------------`);
                // //console.log(`🔍 [SLOT VALIDATION] Checking slot uniqueGarments: "${JSON.stringify(uniqueGarments, null, 2)}"`);
                // //console.log(`🔍 [SLOT VALIDATION] Checking slot allowed_subcategories: "${slot.allowed_subcategories}"`);
                // //console.log(`🔍 ---------------------------`);

                // Use same synonym-aware matching as slot bucket matching
                const hasSlot = (uniqueGarments as GarmentBase[]).some((g: GarmentBase) =>
                    slot.allowed_subcategories?.some((allowed: string) => {
                        const garmentSubcat = g.subcategory || '';
                        
                        // PRIORITY 1: Subcategory synonym match
                        if (matchesAllowedSubcategory(garmentSubcat, allowed)) {
                            return true;
                        }
                        
                        // PRIORITY 2: Category lookup (broad categories like "Winter Outerwear")
                        if (allowed === "Winter Outerwear" && isWinterOuterwear(garmentSubcat)) {
                            return true;
                        }
                        if (allowed === "Light Outerwear" && isLightOuterwear(garmentSubcat)) {
                            return true;
                        }
                        
                        // PRIORITY 3: Multi-word fallback
                        const searchText = `${g.full_name || ''} ${garmentSubcat}`.toLowerCase();
                        const allowedWords = allowed.toLowerCase().split(/\s+/).filter(w => w.length > 0);
                        const allWordsMatch = allowedWords.every(word => searchText.includes(word));
                        const exactPhraseMatch = searchText.includes(allowed.toLowerCase());
                        
                        return allWordsMatch || exactPhraseMatch;
                    })
                );
                
                return !hasSlot; // True if slot is missing
            }) || [];

            if (missingSlots.length > 0) {
                const slotNames = missingSlots.map((s: any) => `${s.slot_name} (needs: ${s.allowed_subcategories?.slice(0, 3).join(' or ')})`).join(', ');
                console.error(`❌ [SLOT VALIDATION] Outfit "${outfit.name}" MISSING REQUIRED SLOTS: ${slotNames} - REJECTED`);
                // Dump rejected outfit diagnostics
                const diagnostics = {
                    rejectionPoint: "MISSING_REQUIRED_SLOTS",
                    codeLocation: "generate-outfit.ts:1041-1055",
                    outfitName: outfit.name,
                    reason: `Outfit is missing ${missingSlots.length} required slot(s) from template`,
                    missingSlots: missingSlots.map((s: any) => ({ slot: s.slot_name, needs: s.allowed_subcategories })),
                    availableGarments: (uniqueGarments as any[]).map((g: any) => ({ id: g.id, name: g.full_name, subcategory: g.subcategory, category: g.category }))
                };
                debugDump(JSON.stringify(diagnostics, null, 2), `rejected-outfit-${outfit.name.replace(/[^a-zA-Z0-9]/g, '-')}-missing-slots`, "json", `Rejected: ${outfit.name} - Missing Required Slots`);
                return null;
            }
            
            //console.log(`✅ [SLOT VALIDATION] Outfit "${outfit.name}" has all required slots filled`);

            return {
                name: outfit.name,
                description: outfit.description,
                reasoning: outfit.reasoning, // Already added in previous feature
                garments: uniqueGarments,
                stylingMetadata: stylingMetadata // NEW: for image generation
            };
        }).filter(Boolean);

        // 8. CREATE DEBUG MARKDOWN FILE
        // Collect unique garments per outfit for debug logging
        const uniqueGarmentsPerOutfit = new Map<string, any[]>();
        fullSuggestions.forEach((outfit: any) => {
            if (outfit && outfit.name && outfit.garments) {
                uniqueGarmentsPerOutfit.set(outfit.name, outfit.garments);
            }
        });
        
        // UPDATE debug markdown with outfit results (if LLM succeeded)
        // Note: Initial debug log was already created before LLM call
        if (fullSuggestions.length > 0) {
            await createOutfitDebugMarkdown({
                styleContext: styleContext || '',
                validTemplates: validTemplates,
                filteredGarments: randomizedGarmentsForDebug,
                uniqueGarmentsPerOutfit: uniqueGarmentsPerOutfit,
                templateValidationLogs: validationLogsForDebug // Use the one declared earlier
            });
        }

        // 8b. INCREMENT wear_count FOR ALL GARMENTS USED IN OUTFITS
        // Collect unique garment IDs across all generated outfits
        if (fullSuggestions.length > 0) {
            const usedGarmentIds = new Set<string>();
            fullSuggestions.forEach((outfit: any) => {
                if (outfit?.garments) {
                    outfit.garments.forEach((g: any) => {
                        if (g?.id) usedGarmentIds.add(g.id);
                    });
                }
            });

            if (usedGarmentIds.size > 0) {
                console.log(`👕 [WEAR COUNT] Incrementing wear_count for ${usedGarmentIds.size} garments: ${[...usedGarmentIds].join(', ')}`);
                // Await updates to ensure data integrity
                try {
                    await Promise.all(
                        [...usedGarmentIds].map(async (garmentId) => {
                            const { data: current } = await supabase
                                .from('garments')
                                .select('wear_count')
                                .eq('id', garmentId)
                                .single();
                            
                            const newCount = (current?.wear_count || 0) + 1;
                            const todayStr = new Date().toISOString().split('T')[0];
                            
                            await supabase
                                .from('garments')
                                .update({ 
                                    wear_count: newCount,
                                    last_worn_date: todayStr
                                })
                                .eq('id', garmentId);
                        })
                    );
                } catch (err) {
                    console.error('❌ [WEAR COUNT] Failed to increment wear_count:', err);
                }
            }
        }

        // 9. CREATE 3 OUTFIT SLOTS (always return exactly 3)
        // Map LLM results to user style preferences
        const outfitSlots: OutfitSlot[] = userStylePreferences.map((styleName: string) => {
            // Find outfit matching this style (by name) - includes rejected outfits from LLM
            const llmOutfit = suggestions.find(
                (o: any) => o && o.name && o.name.toLowerCase() === styleName.toLowerCase()
            );
            
            // Check if LLM explicitly rejected this outfit (has rejection_reason)
            if (llmOutfit && llmOutfit.rejection_reason && (!llmOutfit.garment_ids || llmOutfit.garment_ids.length === 0)) {
                console.log(`🚫 [OUTFIT SLOT] "${styleName}": LLM REJECTED - ${llmOutfit.rejection_reason}`);
                // Prefer the friendly Polish missing_garment_message if provided by LLM
                const userFacingError = llmOutfit.missing_garment_message || llmOutfit.rejection_reason;
                return {
                    styleName,
                    outfit: null,
                    error: userFacingError
                };
            }
            
            // Find successfully hydrated outfit
            const matchingOutfit = fullSuggestions.find(
                (o: any) => o && o.name && o.name.toLowerCase() === styleName.toLowerCase()
            );
            
            if (matchingOutfit) {
                console.log(`✅ [OUTFIT SLOT] "${styleName}": Outfit successfully created`);
                return {
                    styleName,
                    outfit: matchingOutfit,
                    error: null
                };
            }
            
            // Outfit not found - determine why with detailed diagnostics
            console.log(`❌ [OUTFIT SLOT] "${styleName}": Outfit NOT created - investigating reason...`);
            
            // 1. Check if wardrobe has ANY garments for this style
            const styleGarments = garmentsToUse.filter(g => {
                const tags = (g as any).style_context || (g as any).tags || [];
                if (Array.isArray(tags)) {
                    return tags.some((t: string) => 
                        t.toLowerCase().includes(styleName.toLowerCase()) ||
                        styleName.toLowerCase().includes(t.toLowerCase())
                    );
                }
                return false;
            });
            
            const hasStyleGarments = styleGarments.length > 0;
            
            if (!hasStyleGarments) {
                console.log(`   ⚠️ Reason: NO garments found in wardrobe with style_context matching "${styleName}"`);
                console.log(`   📊 Total garments in garmentsToUse: ${garmentsToUse.length}`);
                console.log(`   📊 Garments after filtering: ${filteredWardrobe.length}`);
            } else {
                console.log(`   ✓ Found ${styleGarments.length} garment(s) with style "${styleName}"`);
                console.log(`   📋 Style garments:`, styleGarments.map(g => `${(g as any).full_name || 'Unknown'} (${(g as any).subcategory || 'N/A'})`));
            }
            
            // 2. Check template availability
            if (validTemplates.length === 0) {
                console.log(`   ⚠️ Reason: NO valid templates for temperature ${apparentTemp.toFixed(1)}°C`);
            } else {
                console.log(`   ✓ Found ${validTemplates.length} valid template(s) for temperature`);
            }
            
            // 3. Check if LLM returned anything for this style
            const llmReturnedStyles = fullSuggestions.map((o: any) => o?.name).filter(Boolean);
            console.log(`   📤 LLM returned ${fullSuggestions.length} outfit(s): [${llmReturnedStyles.join(', ')}]`);
            
            if (fullSuggestions.length === 0) {
                console.log(`   ⚠️ Reason: LLM returned NO outfits at all (possible LLM failure or prompt issue)`);
            } else {
                console.log(`   ⚠️ Reason: LLM did not return outfit for "${styleName}" (but returned other styles)`);
            }
            
            // 4. Template slot matching diagnostic (check ALL templates since outfit was rejected)
            // We don't know which template LLM would have chosen, so check all of them
            if (hasStyleGarments && validTemplates.length > 0) {
                console.log(`   🔍 Checking if style garments match ANY template's slots...`);
                
                validTemplates.forEach((template, idx) => {
                    console.log(`   📋 Checking Template ${idx + 1}: "${template.name}"`);
                    const templateSlots = template.slots || [];
                
                    const slotMatchDetails: { slotName: string; matched: boolean; matchedGarments: string[] }[] = [];
                
                    const matchedSlots = templateSlots.filter((slot: any) => {
                    const matchingGarments: string[] = [];
                    const hasMatch = styleGarments.some(g => {
                        return slot.allowed_subcategories?.some((allowed: string) => {
                            const garmentSubcategory = (g as any).subcategory || '';
                            const garmentFullName = (g as any).full_name || (g as any).name || '';
                            
                            // 1. SYNONYM MATCH (same as slotBuckets)
                            if (matchesAllowedSubcategory(garmentSubcategory, allowed)) {
                                matchingGarments.push(`${garmentFullName} [synonym: ${garmentSubcategory}→${allowed}]`);
                                return true;
                            }
                            
                            // 2. CATEGORY LOOKUP (same as slotBuckets)
                            if (allowed === "Winter Outerwear" && isWinterOuterwear(garmentSubcategory)) {
                                matchingGarments.push(`${garmentFullName} [category: Winter Outerwear]`);
                                return true;
                            }
                            if (allowed === "Light Outerwear" && isLightOuterwear(garmentSubcategory)) {
                                matchingGarments.push(`${garmentFullName} [category: Light Outerwear]`);
                                return true;
                            }
                            
                            // 3. MULTI-WORD FALLBACK (same as slotBuckets)
                            const searchText = `${garmentFullName} ${garmentSubcategory}`.toLowerCase();
                            const allowedWords = allowed.toLowerCase().split(/\s+/).filter(w => w.length > 0);
                            const allWordsMatch = allowedWords.every(word => searchText.includes(word));
                            
                            if (allWordsMatch) {
                                matchingGarments.push(`${garmentFullName} [multi-word: "${allowed}"]`);
                                return true;
                            }
                            
                            return false;
                        });
                    });
                    
                    slotMatchDetails.push({
                        slotName: slot.slot_name,
                        matched: hasMatch,
                        matchedGarments: matchingGarments.slice(0, 2) // Limit to 2 examples
                    });
                    
                    return hasMatch;
                });
                
                    console.log(`   📊 Template has ${templateSlots.length} slot(s), ${matchedSlots.length} matched by style garments`);
                
                    // Log slot details
                    slotMatchDetails.forEach(detail => {
                    if (detail.matched) {
                        console.log(`   ✓ ${detail.slotName}: ${detail.matchedGarments.join(', ')}`);
                    }
                });
                
                    const unmatchedSlots = templateSlots.filter((slot: any) => slot.required && !matchedSlots.includes(slot));
                    if (unmatchedSlots.length > 0) {
                        console.log(`   ⚠️ MISSING ${unmatchedSlots.length} required slot(s):`, unmatchedSlots.map((s: any) => 
                            `${s.slot_name} (needs: ${s.allowed_subcategories?.slice(0, 2).join(' or ')})`
                        ));
                    }
                }); // Close forEach loop over validTemplates
            }
            
            // Build error message
            let errorMessage: string;
            if (!hasStyleGarments) {
                errorMessage = `Brak ubrań w stylu "${styleName}" w garderobie`;
            } else if (validTemplates.length === 0) {
                errorMessage = `Brak szablonu dla temperatury ${apparentTemp.toFixed(0)}°C`;
            } else {
                errorMessage = `Nie udało się utworzyć stylizacji "${styleName}"`;
            }
            
            console.log(`   💬 Error message: "${errorMessage}"`);
            
            return {
                styleName,
                outfit: null,
                error: errorMessage
            };
        });

        // 10. ZAPIS (save only valid outfits)
        const validOutfits = outfitSlots
            .filter(slot => slot.outfit !== null)
            .map(slot => slot.outfit);
            
        if (validOutfits.length > 0) {
            await supabase.from("daily_suggestions").upsert({
                user_id: userId,
                date: today,
                suggestions: validOutfits,
                weather_snapshot: { temp: temperature, feels_like: apparentTemp, desc: weatherDescription },
            }, { onConflict: "user_id, date" });
        }

        // Return new structure with outfitSlots
        return { 
            outfits: validOutfits,  // Legacy: for backwards compatibility
            outfitSlots,            // New: always 3 slots
            cachedImages: {} 
        };

    } catch (error) {
        console.error("❌ [GENERATE OUTFIT] Fatal error:", error);
        console.error("❌ [GENERATE OUTFIT] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
        console.error("❌ [GENERATE OUTFIT] Error message:", error instanceof Error ? error.message : String(error));
        
        // Return 3 empty slots with error on failure
        const errorSlots: OutfitSlot[] = [
            { styleName: "Style 1", outfit: null, error: "Błąd generowania stylizacji" },
            { styleName: "Style 2", outfit: null, error: "Błąd generowania stylizacji" },
            { styleName: "Style 3", outfit: null, error: "Błąd generowania stylizacji" },
        ];
        return { outfits: [], outfitSlots: errorSlots, cachedImages: {} };
    }
}


