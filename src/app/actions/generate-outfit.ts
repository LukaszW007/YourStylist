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
import { createOutfitDebugMarkdown, type TemplateValidationLog } from "@/lib/debug/outfit-debug-logger";
import { block } from "sharp";

// Server-side only - uses multi-account selector from AI_CONFIG
const GEMINI_API_KEY = AI_CONFIG.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    //console.error("❌ GEMINI_API_KEY is not configured - check .env.local");
}

const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;


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
            return {
                outfits: existingEntry.suggestions,
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
            .select("id, name, full_name, category, subcategory, image_url, main_color_name, main_color_hex, brand, material, layer_type, comfort_min_c, comfort_max_c, thermal_profile, fabric_weave, tags, style_context, sleeve_length, ai_description")
            .eq("user_id", userId);

        if (error || !wardrobe || wardrobe.length < 2) return { outfits: [], cachedImages: {} };
        
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
                //console.log(`❌ [PHYSICS] Rejected: ${g.name} ${g.category} ${g.subcategory} (score: ${analysis.score}) - ${analysis.reasoning.join(", ")}`);
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
            return categoryItems.sort((a, b) => 
                (a.comfort_min_c ?? 100) - (b.comfort_min_c ?? 100)
            )[0];
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

        // Final check - if still nothing, use full wardrobe as last resort
        // Map wardrobe items to include full_name for type compatibility
        const garmentsToUse = validGarments.length > 0 
            ? validGarments 
            : wardrobe.map(g => ({ ...g, full_name: g.full_name || g.name }));
        if (validGarments.length === 0) {
            //console.warn("⚠️ [FALLBACK] All categories empty! Using FULL wardrobe as emergency fallback.");
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
                const isWhiteTshirt = (fullName.includes('t-shirt') || subcategory.includes('t-shirt')) && colorName.includes('white');
                const isUndershirt = fullName.includes('undershirt') || subcategory.includes('undershirt');
                const isBaseLayerItem = isWhiteTshirt || isUndershirt;
                
                // Short sleeve prohibited in 3+ layers - EXCEPT for base layer items
                if (templateLayerCount >= 3 && isTop && g.sleeve_length === 'short-sleeve' && !isBaseLayerItem) {
                    //console.log(`❌ [SLEEVE FILTER] Rejected short sleeve: ${g.name} (${g.category}) for ${templateLayerCount}-layer outfit`);
                    return false;
                }
                
                // Colored t-shirts only in 1-2 layers
                if (category?.includes('t-shirt') && 
                    !colorName.includes('white') && 
                    templateLayerCount >= 3) {
                    //console.log(`❌ [COLOR FILTER] Rejected colored t-shirt: ${g.name} for ${templateLayerCount}-layer outfit`);
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
        
        const validTemplates = strictValidated;
        
        // SELECT BEST TEMPLATE (strict mode)
        const selectedTemplate = validTemplates[0] || {
            name: "Winter Emergency Fallback",
            required_layers: ["base_layer", "mid_layer", "coat", "bottoms", "shoes", "accessory"],
            layer_count: 5,
            description: "Full cold-weather layering",
            min_temp_c: -50,
            max_temp_c: 0,
            slots: [  // Fallback slots for stylingMetadata generation
                { slot_name: "shirt_layer", allowed_subcategories: ["Cotton Shirt", "Flannel Shirt"], required: true, tucked_in: "always", buttoning: "one_button_undone" },
                { slot_name: "mid_layer", allowed_subcategories: ["Sweater", "Cardigan"], required: true, tucked_in: "never", buttoning: "n/a" },
                { slot_name: "outer_layer", allowed_subcategories: ["Winter Outerwear", "Overcoat"], required: true, tucked_in: "never", buttoning: "n/a" },
            ]
        };
        
        // 6d. APPLY LAYERING RULES FILTER (after template selection)
        const filteredWardrobe = filterByLayeringRules(garmentsToUse, selectedTemplate.layer_count);
        //console.log(`🔍 [FILTER] ${filteredWardrobe.length}/${garmentsToUse.length} garments passed layering rules for ${selectedTemplate.layer_count}-layer outfit`);
        
        // 6e. NEW: ALGORITHMIC SLOT BUCKET MATCHING
        // NOTE: Assumes garment.full_name is populated in Supabase via sql_update_garments_name.sql
        // garment.full_name format: "white v-neck t-shirt cotton long-sleeve"
        
        // Match garments to template slots using garment.full_name
        // DEBUG: Verify full_name mapping in filteredWardrobe
        //console.log(`🔍 [DEBUG] filteredWardrobe sample:`, filteredWardrobe.slice(0, 2).map(g => ({ id: g.id, name: g.name, full_name: (g as any).full_name, subcategory: g.subcategory })));
        
        type SlotBucket = { slotName: string; garments: typeof filteredWardrobe; required: boolean };
        const slotBuckets: SlotBucket[] = selectedTemplate.slots?.map((slot: any) => {
            const matchingGarments = filteredWardrobe.filter(g => 
                slot.allowed_subcategories?.some((allowed: string) => {
                    const garmentSubcategory = g.subcategory || '';
                    
                    // 1. PRIORITY: Use synonym matching system (handles "Puffer Jacket" -> "Winter Outerwear")
                    if (matchesAllowedSubcategory(garmentSubcategory, allowed)) {
                        //console.log(`🗂️ [SYNONYM MATCH] "${garmentSubcategory}" matches "${allowed}"`);
                        return true;
                    }
                    
                    // 2. CATEGORY LOOKUP: Handle broad categories like "Winter Outerwear"
                    // This enables matching when template uses category names instead of specific subcategories
                    if (allowed === "Winter Outerwear" && isWinterOuterwear(garmentSubcategory)) {
                        console.log(`🗂️ [CATEGORY MATCH] "${garmentSubcategory}" is Winter Outerwear`);
                        return true;
                    }

                    // process.exit(1);
                    debugger
                    
                    if (allowed === "Light Outerwear" && isLightOuterwear(garmentSubcategory)) {
                        //console.log(`🗂️ [CATEGORY MATCH] "${garmentSubcategory}" is Light Outerwear`);
                        return true;
                    }
                    
                    // 3. FALLBACK: Multi-word matching on full_name (for edge cases)
                    const garmentFullName = ((g as any).full_name || g.name || '').toLowerCase();
                    const searchText = `${garmentFullName} ${garmentSubcategory.toLowerCase()}`;
                    const allowedWords = allowed.toLowerCase().split(/\s+/).filter(w => w.length > 0);
                    const allWordsMatch = allowedWords.every(word => searchText.includes(word));
                    
                    if (allWordsMatch) {
                        //console.log(`🗂️ [FULLNAME MATCH] "${garmentFullName}" contains all words from "${allowed}"`);
                    }
                    
                    return allWordsMatch;
                })
            );
            
            //console.log(`🗂️ [SLOT BUCKET] ${slot.slot_name}: ${matchingGarments.length} matching garments`);
            if (matchingGarments.length > 0) {
                matchingGarments.slice(0, 3).forEach(mg => 
                    console.log(`   ✓ ${mg.name} (${mg.subcategory})`)
                );
            } else {
                //console.warn(`   ⚠️ No garments found for allowed: ${slot.allowed_subcategories?.join(', ')}`);
            }
            
            return {
                slotName: slot.slot_name,
                garments: matchingGarments,
                required: slot.required ?? true
            };
        }) || [];
        
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

        // Add belt bucket (optional, for tucked outfits based on template)
        const hasTuckedLayers = selectedTemplate.slots?.some((slot: any) => 
            slot.tucked_in === 'always' || slot.tucked_in === 'optional'
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
            //console.log(`🗂️ [SLOT BUCKET] belt: ${beltGarments.length} options (tucked outfit - RECOMMENDED)`);
        } else if (beltGarments.length > 0) {
            // Still add belt as optional even for non-tucked outfits
            slotBuckets.push({ slotName: 'belt', garments: beltGarments, required: false });
            //console.log(`🗂️ [SLOT BUCKET] belt: ${beltGarments.length} options (optional)`);
        } else {
            //console.log(`🗂️ [SLOT BUCKET] belt: SKIPPED (no belts in wardrobe)`);
        }

        // 6f. BUILD SLOT-ORGANIZED PROMPT
        const buildSlotInventorySection = () => {
            return slotBuckets.map(bucket => {
                if (bucket.garments.length === 0) {
                    return `**${bucket.slotName.toUpperCase()} (choose 1)**: ❌ NO OPTIONS AVAILABLE`;
                }
                
                const garmentsList = bucket.garments
                    .slice(0, 20)
                    .map((g, idx) => {
                        const material = Array.isArray(g.material) ? g.material.join(', ') : 'Standard';
                        const weave = g.fabric_weave && g.fabric_weave !== 'standard' ? g.fabric_weave : '';
                        const sleeveInfo = g.sleeve_length && g.sleeve_length !== 'none' ? `[${g.sleeve_length}]` : '';
                        const styleTags = Array.isArray(g.style_context) && g.style_context.length > 0
                            ? g.style_context.join(', ')
                            : 'casual';  // Default to 'casual' not 'versatile'
                        return `   ${idx + 1}. ID: ${g.id} | ${g.main_color_name} ${g.subcategory} ${sleeveInfo} | Material: ${material} ${weave} | Styles: [${styleTags}]`;
                    })
                    .join('\n');
                
                return `**${bucket.slotName.toUpperCase()}** (${bucket.required ? 'REQUIRED' : 'optional'} - choose 1):\n${garmentsList}`;
            }).join('\n\n');
        };
        
        const slotInventorySection = buildSlotInventorySection();
        
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
        //console.log(`📋 [TEMPLATE SELECTED] "${selectedTemplate.name}" with ${selectedTemplate.layer_count} layers: ${JSON.stringify(selectedTemplate.required_layers)}`);

        // 7. STRICT TEMPLATE-BASED PROMPT
        if (!genAI) throw new Error("Gemini client not initialized");
        
        const prompt = `You are an expert Sartorial Stylist with ZERO creative freedom. Follow instructions EXACTLY.

CONTEXT:
- Weather: ${weatherDescription}, Feels like ${apparentTemp.toFixed(1)}°C
- Season: ${currentSeason}
- Selected Template: "${selectedTemplate.name}"
${selectedTemplate.slots ? 
  `- STRICT SLOT REQUIREMENTS:\n${selectedTemplate.slots.map(slot => 
    `  * ${slot.slot_name}: ONLY [${slot.allowed_subcategories.join(', ')}]`
  ).join('\n')}` 
  : 
  `- Required Layers: ${JSON.stringify(selectedTemplate.required_layers || [])} (LEGACY)`
}
- Layer Count: ${selectedTemplate.layer_count}

INVENTORY (ORGANIZED BY SLOT - CHOOSE 1 FROM EACH REQUIRED SLOT):
${slotInventorySection}

### MANDATORY HARD RULES (STRICT ENFORCEMENT)
${hardRules || "No specific compatibility rules loaded."}

### BELT, TUCKING & BUTTONING RULES (CRITICAL - ALWAYS ENFORCE)

**Tucking Rules by Layer:**
${selectedTemplate.slots ? selectedTemplate.slots.map(slot => 
  `- ${slot.slot_name} (${slot.allowed_subcategories?.slice(0, 2).join(', ')}...): ${slot.tucked_in || 'optional'} tucked`
).join('\n') : ''}

**Buttoning Rules by Layer:**
${selectedTemplate.slots ? selectedTemplate.slots.map(slot => {
  const buttonRule = slot.buttoning || 'n/a';
  if (buttonRule === 'n/a') return null;
  return `- ${slot.slot_name}: ${buttonRule}`;
}).filter(Boolean).join('\n') : ''}

**Shirt Buttoning Instructions (STRICT):**
1. **Standard/Business Casual shirt** → Fully buttoned EXCEPT top button (one button undone)
2. **Summer with visible base layer (17°C+)** → Shirt UNBUTTONED, worn open over t-shirt/tank
3. **Summer alternative** → Shirt buttoned ONLY halfway up (relaxed summer look)
4. **POLO & HENLEY (ABSOLUTE RULE)** → ALWAYS one top button undone, NO exceptions
   - In outfit description, MUST write: "polo/henley with one top button undone"
5. **Flannel shirt** → Can be worn unbuttoned over base layer OR buttoned with one undone

**Belt Requirements (DYNAMIC - Based on Template):**
${(() => {
  const hasTuckedLayers = selectedTemplate.slots?.some((slot: any) => 
    slot.tucked_in === 'always' || slot.tucked_in === 'optional'
  ) ?? false;
  
  if (hasTuckedLayers) {
    return `1. **BELT IS MANDATORY** for this template (contains tucked layers):
   - Template "${selectedTemplate.name}" requires tucked garments
   - Belt MUST be added to complete the look
   - Belt color MUST match shoes (brown=brown, black=black)
   - EXCEPTION: Skip belt if trousers have key_features ["adjusters", "gurkha"]
   - If no matching belt in inventory → outfit still valid without belt
   - Check inventory for category="Accessories" AND name/subcategory contains "belt"`;
  } else {
    return `1. **BELT IS OPTIONAL** (all template layers untucked):
   - Add belt only if it enhances the style
   - If added, must match shoe color (brown=brown, black=black)
   - Never add belt to outfits with gurkha/adjuster trousers`;
  }
})()}

2. **Belt color matching (STRICT):**
   - Brown belt = brown shoes (match tones: warm with warm, cool with cool)
   - Black belt = black shoes
   - NEVER mix brown belt with black shoes or vice versa

**CRITICAL IMPLEMENTATION NOTES:**
- Always check garment.key_features array before recommending a belt
- Belt color MUST match shoe color from the outfit
- For Polo and Henley, ALWAYS specify "one top button undone" in outfit description
- When template has tucked_in="always" OR "optional", belt is REQUIRED unless trousers have adjusters/gurkha

### PHYSICAL ATTRIBUTES GUIDE

Each garment in INVENTORY has 'physical_attributes' (array of tags):
- **HIGH_COLLAR**: Turtleneck, Rollneck
- **COLLARED**: Shirt, Polo with standard collar
- **THIN_FABRIC**: Merino, Cashmere, Silk
- **THICK_FABRIC**: Chunky knits, Shawl cardigans, Zip sweaters
- **OUTER_MID_LAYER**: Can be worn as outer layer
- **BASE_LAYER**: White t-shirt or undershirt

**CRITICAL LAYERING RULES (from database)**:
1. **Double Collar Rule**: Never stack COLLARED + COLLARED or COLLARED + HIGH_COLLAR
   - Exception: Coat collar over shirt collar is allowed
   - Check 'physical_attributes' before layering
   
2. **Layering Hierarchy**: Always layer THIN_FABRIC inside, THICK_FABRIC outside
   - Order: BASE_LAYER → THIN_FABRIC→ THICK_FABRIC → OUTER_MID_LAYER
   - No loose shirts under tight sweaters

3. **Use physical_attributes to resolve conflicts**: If a rule mentions fabric thickness or collars, check these tags

### SLEEVE LENGTH RULES (CRITICAL FOR MULTI-LAYER OUTFITS)

Each garment has a 'sleeve_length' field in INVENTORY:
- **"short-sleeve"**: Short-sleeve shirt, short-sleeve polo, t-shirt
- **"long-sleeve"**: Long-sleeve shirt, long-sleeve polo, long-sleeve sweater
- **"none"**: Not applicable (pants, shoes, outerwear, jackets, accessories)

**MANDATORY RULES:**
1. **3+ Layer Outfits**: ONLY use garments with 'sleeve_length': "long-sleeve" for base/shirt/mid layers
   - Check the 'sleeve_length' field BEFORE selecting
   - Short sleeves are FORBIDDEN in 3 layers, 4 layers and 5 layers outfits
2. **1-2 Layer Outfits**: Both short-sleeve and long-sleeve are allowed
3. **Always verify**: For every garment with 'type': "base" or 'type': "mid_layer", check 'sleeve_length' field
4. **Ignore "none"**: Garments with 'sleeve_length': "none" are not tops (pants, shoes, etc.)

### STRICT TEMPLATE INSTRUCTIONS
You MUST create outfits that follow the selected template structure EXACTLY:

1. **CRITICAL SLOT REQUIREMENTS** (MANDATORY):
"${selectedTemplate.slots ? selectedTemplate.slots.map((slot: any) => {
  if (!slot.required) return null;
  const subcats = slot.allowed_subcategories?.slice(0, 3).join(' OR ') || '';
  return `   - **${slot.slot_name}**: REQUIRED - MUST select from [${subcats}${slot.allowed_subcategories?.length > 3 ? '...' : ''}]
     * Check inventory for items with subcategory matching these values
     * This slot is MANDATORY - outfit is INVALID without it`;
}).filter(Boolean).join('\n') : ''}
   - Layer count: ${selectedTemplate.layer_count} layers total (all required slots must be filled)

2. **STYLE COHERENCE (CRITICAL - ZERO TOLERANCE)**:
   
   **ABSOLUTE RULE:** Each outfit uses garments from ONE STYLE ONLY. NO MIXING ALLOWED.
   
   **User Selected Styles:**
   - Outfit #1: "${userStylePreferences[0]}" ONLY
   - Outfit #2: "${userStylePreferences[1]}" ONLY
   - Outfit #3: "${userStylePreferences[2]}" ONLY
   
   **ENFORCEMENT:**
   1. Check EVERY garment's 'Styles: [...]' field in INVENTORY
   2. Garments are already tagged with their matching style(s)
   3. For Outfit #1, use ONLY garments tagged with "${userStylePreferences[0]}"
   4. For Outfit #2, use ONLY garments tagged with "${userStylePreferences[1]}"
   5. For Outfit #3, use ONLY garments tagged with "${userStylePreferences[2]}"
   
   **Special Cases:**
   - If garment has NO "style_context" (shows as "[casual]") -> treat as "Casual/streetwear/workwear"
   - Multi-style garment Styles: [Smart casual, Business casual] → Can use in EITHER matching outfit
   
   **VIOLATION = REJECTION:**
   Mixing styles (e.g., "Smart casual" shirt + "Casual/streetwear/workwear" pants) will cause outfit rejection.

3. **STRICT SUBCATEGORY MATCHING** (CRITICAL):
   - If template requires "henley" → MUST use garment with subcategory="Henley"
   - If template requires "polo" → MUST use garment with subcategory="Polo"
   - If template requires "turtleneck" → MUST use garment with subcategory="Turtleneck"
   - NO SUBSTITUTES ALLOWED for these specific items
   - If exact subcategory not in inventory → DO NOT create that outfit

4. **COLOR MATCHING** (When Specified):
   - If description mentions "White T-shirt" → select only garments with color containing "White" or "Off-White"
   - Verify 'txt' field contains the specified color
   - Respect color-specific requirements from template

**CRITICAL SHOES REQUIREMENT (MANDATORY - READ THIS FIRST)**:
⚠️ ERROR IF MISSING: Every outfit MUST include EXACTLY 1 item from category "Shoes"
- Check inventory for items with category="Shoes" (boots, sneakers, dress shoes, etc.)
- This is NON-NEGOTIABLE - outfits without shoes will be REJECTED
- Pick shoes that match the outfit's style_tags (casual→sneakers/boots, smart→dress shoes)

5. **REQUIRED CATEGORIES** (ALWAYS ADD - NOT PART OF TEMPLATE):
   Templates define UPPER BODY layering only. You MUST ALWAYS add:
   - Bottoms (pants/trousers from category "Bottoms") - MANDATORY, pick 1
   - Shoes (footwear from category "Shoes") - MANDATORY, pick 1
   These are IN ADDITION to template layers!

6. **NO IMPROVISATION ON UPPER LAYERS**: Use ONLY the layer structure from the template
   - Do not add extra upper body layers
   - Do not skip required upper body layers
   - Match template exactly for tops

7. **STYLE REASONING** (MANDATORY):
   For each outfit, explain in "reasoning" field:
   - **Color Harmony**: Why these colors work together (complementary/analogous/monochrome)
   - **Aesthetic Choices**: Texture mixing, pattern balance, visual weight distribution
   - **Style Alignment**: How outfit reflects the intended style (streetwear/sartorial/smart casual/etc.)
   Keep reasoning concise (2-3 sentences max)

**BELT ENFORCEMENT (CRITICAL - ALWAYS VERIFY)**:
- For 3+ layer outfits with tucked garments: Belt is MANDATORY
- Belt color MUST EXACTLY match shoe color:
  * Brown shoes → Brown/Tan/Cognac belt ONLY
  * Black shoes → Black belt ONLY
  * NEVER mix brown belt with black shoes or vice versa
- EXCEPTION: Skip belt if trousers have key_features ["adjusters", "gurkha"]
- If no matching belt color in inventory → outfit valid but note in reasoning
- Belt must be from inventory with category="Accessories"

OUTPUT RULES:
1. Create exactly 3 DISTINCT outfits using DIFFERENT STYLES:
   - Outfit #1: Use ONLY garments with style="${userStylePreferences[0]}"
   - Outfit #2: Use ONLY garments with style="${userStylePreferences[1]}"  
   - Outfit #3: Use ONLY garments with style="${userStylePreferences[2]}"
2. Each outfit uses items from INVENTORY only (match 'id' field exactly)
3. CRITICAL: Check 'Styles: [...]' field - garment MUST match outfit's assigned style
4. If garment has multiple styles matching the outfit style -> OK to use
5. Total garments = template.layer_count (${selectedTemplate.layer_count}) + bottoms (1) + shoes (1) = ${selectedTemplate.layer_count + 2} items

OUTPUT FORMAT (JSON only, NO markdown, NO explanation):
[
  {
    "name": "${userStylePreferences[0]}",
    "template_used": "${selectedTemplate.name}",
    "description": "Brief why it works for ${apparentTemp.toFixed(0)}°C",
    "reasoning": "Explain color harmony, aesthetic choices (2-3 sentences)",
    "garment_ids": ["id1", "id2", "id3", ...]
  },
  {
    "name": "${userStylePreferences[1]}",
    "template_used": "${selectedTemplate.name}",
    "description": "Brief why it works for ${apparentTemp.toFixed(0)}°C",
    "reasoning": "Explain color harmony, aesthetic choices (2-3 sentences)",
    "garment_ids": ["id1", "id2", "id3", ...]
  },
  {
    "name": "${userStylePreferences[2]}",
    "template_used": "${selectedTemplate.name}",
    "description": "Brief why it works for ${apparentTemp.toFixed(0)}°C",
    "reasoning": "Explain color harmony, aesthetic choices (2-3 sentences)",
    "garment_ids": ["id1", "id2", "id3", ...]
  }
]`;

        // Generate Content - MATCH analyze-garments pattern exactly
        console.log("🧥 [AI] Sending prompt to Gemini...");
        //console.debug("DEBUG: " + prompt);

        const result = await genAI.models.generateContent({
            model: AI_CONFIG.OUTFIT_GENERATION.model,
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
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
        
        // Create debug markdown BEFORE attempting LLM call
        // This way we get logs even if LLM is mocked or fails
        await createOutfitDebugMarkdown({
            styleContext: styleContext || '',
            validTemplates: validTemplates,
            selectedTemplate: selectedTemplate,
            filteredGarments: filteredWardrobe,
            uniqueGarmentsPerOutfit: new Map(), // Will be empty if LLM hasn't responded yet
            templateValidationLogs: validationLogsForDebug
        });
        
        //console.log("🧥 [AI] Response received. Extracting...");
        // //console.log("CALY PROMPT: " + prompt);

        // Extract text using SAME pattern as analyze-garments
        let responseText = "";
        if (result.candidates?.[0]?.content?.parts) {
            responseText = result.candidates[0].content.parts.map((p: any) => p.text || "").join("");
        }

        // If response is empty (mocked LLM), return early with empty outfits
        // Debug log has already been created above
        if (!responseText) {
            console.log("⚠️ [AI] Empty response - returning empty outfits (debug log already created)");
            return { outfits: [], cachedImages: {} };
        }

        //console.log("🧥 [AI] Raw response:", responseText.substring(0, 200) + "...");

        // Clean the response - remove markdown code blocks (SAME as analyze-garments)
        let cleanedText = responseText.trim();
        if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (cleanedText.startsWith("```")) {
            cleanedText = cleanedText.replace(/```\n?/g, "");
        }
        cleanedText = cleanedText.trim();
        
        let suggestions;
        try {
            suggestions = JSON.parse(cleanedText);
        } catch (e) {
            //console.error("❌ [AI] JSON Parse Error. Response:", cleanedText);
            // Try to extract JSON array from the text (fallback from analyze-garments)
            const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                //console.log("🧥 [AI] Found JSON array in text via regex");
                suggestions = JSON.parse(jsonMatch[0]);
            } else {
                throw e;
            }
        }

        // 7. HYDRACJA + VALIDATION
        //console.log(`🔍 [VALIDATION] Validating ${suggestions.length} outfits against template "${selectedTemplate.name}"`);
        
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
            
            // VALIDATION: Check minimum garments
            if (uniqueGarments.length < selectedTemplate.layer_count) {
                //console.warn(`⚠️ [VALIDATION] Outfit "${outfit.name}" has ${uniqueGarments.length} items, template requires ${selectedTemplate.layer_count}`);
            }
            
            // ═══════════════════════════════════════════════════════════════════
            // BELT AUTO-INCLUDE: Add belt for 3+ layer outfits
            // CRITICAL: Belt color MUST match shoe color (brown=brown, black=black)
            // ═══════════════════════════════════════════════════════════════════
            const is3PlusLayerOutfit = selectedTemplate.layer_count >= 3;
            
            const currentlyHasBelt = uniqueGarments.some((g: any) => 
                g.subcategory?.toLowerCase().includes('belt') || 
                (g.category?.toLowerCase() === 'accessories' && g.name?.toLowerCase().includes('belt'))
            );
            
            if (is3PlusLayerOutfit && !currentlyHasBelt) {
                // Get shoe color from outfit to match belt color
                const shoe = uniqueGarments.find((g: any) => g.category?.toLowerCase() === 'shoes');
                const shoeColor = shoe?.main_color_name?.toLowerCase() || '';
                
                //console.log(`🎀 [BELT] 3+ layer outfit detected (${selectedTemplate.layer_count} layers). Looking for belt matching shoe color: ${shoeColor}`);
                
                // Find all belts in wardrobe
                const allBelts = wardrobe.filter((g: any) => 
                    g.subcategory?.toLowerCase().includes('belt') ||
                    (g.category?.toLowerCase() === 'accessories' && g.name?.toLowerCase().includes('belt'))
                );
                
                // Filter belts that match shoe color
                // Brown shoes -> brown belt, Black shoes -> black belt
                const matchingBelt = allBelts.find((belt: any) => {
                    const beltColor = belt.main_color_name?.toLowerCase() || '';
                    
                    // Brown matching
                    if (shoeColor.includes('brown') || shoeColor.includes('tan') || shoeColor.includes('cognac')) {
                        return beltColor.includes('brown') || beltColor.includes('tan') || beltColor.includes('cognac');
                    }
                    
                    // Black matching
                    if (shoeColor.includes('black')) {
                        return beltColor.includes('black');
                    }
                    
                    // Fallback: if shoe color unclear, allow any belt
                    return true;
                });
                
                if (matchingBelt) {
                    //console.log(`🎀 [BELT] ✅ Auto-adding belt "${matchingBelt.full_name || matchingBelt.name}" (${matchingBelt.main_color_name}) to match ${shoeColor} shoes`);
                    (uniqueGarments as any[]).push({
                        ...matchingBelt,
                        full_name: matchingBelt.full_name || matchingBelt.name,
                        layer_type: 'accessory'
                    });
                } else if (allBelts.length > 0) {
                    //console.warn(`⚠️ [BELT] 3+ layer outfit needs belt, but no belt matches ${shoeColor} shoes. Available belts: ${allBelts.map((b: any) => b.main_color_name).join(', ')}`);
                } else {
                    //console.warn(`⚠️ [BELT] Tucked-in slot detected but no belt in wardrobe`);
                }
            }
            
            // VALIDATION: Ensure required categories present
            const hasBottoms = uniqueGarments.some((g: any) => g.category.toLowerCase() === 'bottoms');
            const hasShoes = uniqueGarments.some((g: any) => g.category.toLowerCase() === 'shoes');
            
            if (!hasBottoms) {
                console.error(`❌ [VALIDATION] Outfit "${outfit.name}" MISSING BOTTOMS - REJECTED`);
                return null;
            }
            if (!hasShoes) {
                console.error(`❌ [VALIDATION] Outfit "${outfit.name}" MISSING SHOES - REJECTED`);
                return null;
            }
            
            // Ostateczny sanity check na kompletność outfitu
            if (uniqueGarments.length < 2) {
                console.error(`❌ [VALIDATION] Outfit "${outfit.name}" has only ${uniqueGarments.length} items - REJECTED`);
                return null;
            }
            
            console.log(`✅ [VALIDATION] Outfit "${outfit.name}" PASSED: ${uniqueGarments.length} items, bottoms✓, shoes✓`);
            
            // Log style coherence for debugging
            const styles = uniqueGarments
                .map((g: any) => (g.style_context || ['casual']).join(', '))
                .join(' | ');
            console.log(`🎨 [STYLE] Outfit "${outfit.name}" styles: ${styles}`);

            //console.log(`🔍 selectedTemplate: ${JSON.stringify(selectedTemplate, null, 2)}`); //TODO: remove
            // EXTRACT STYLING METADATA from template slots
            const stylingMetadata = selectedTemplate.slots?.map((slot: any) => {
                // Find which garment fills this slot (synonym-aware matching)
                
                const garment = uniqueGarments.find((g: any) => 
                    slot.allowed_subcategories?.some((allowed: string) => {
                        const garmentSubcat = g.subcategory || '';
                        const garmentFullName = g.full_name || '';
                        
                        // PRIORITY 1: Subcategory synonym match
                        if (matchesAllowedSubcategory(garmentSubcat, allowed)) {
                            return true;
                        }
                        
                        // PRIORITY 2: Multi-word matching (fallback for complex names)
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

            // VALIDATE: Check all required slots are filled
            const missingSlots = selectedTemplate.slots?.filter((slot: any) => {
                if (!slot.required) return false;
                
                // Check if outfit has garment matching this slot's allowed subcategories
                // //console.log(`🔍 ---------------------------`);
                // //console.log(`🔍 [SLOT VALIDATION] Checking slot uniqueGarments: "${JSON.stringify(uniqueGarments, null, 2)}"`);
                // //console.log(`🔍 [SLOT VALIDATION] Checking slot allowed_subcategories: "${slot.allowed_subcategories}"`);
                // //console.log(`🔍 ---------------------------`);

                // Use same synonym-aware matching as slot bucket matching
                const hasSlot = (uniqueGarments as GarmentBase[]).some((g: GarmentBase) => 
                    slot.allowed_subcategories?.some((allowed: string) => {
                        // PRIORITY 1: Subcategory synonym match
                        if (matchesAllowedSubcategory(g.subcategory || '', allowed)) {
                            return true;
                        }
                        
                        // PRIORITY 2: Multi-word fallback
                        const searchText = `${g.full_name || ''} ${g.subcategory || ''}`.toLowerCase();
                        const allowedWords = allowed.toLowerCase().split(/\s+/).filter(w => w.length > 0);
                        const allWordsMatch = allowedWords.every(word => searchText.includes(word));
                        const exactPhraseMatch = searchText.includes(allowed.toLowerCase());
                        
                        return allWordsMatch || exactPhraseMatch;
                    })
                );
                
                return !hasSlot; // True if slot is missing
            }) || [];

            if (missingSlots.length > 0) {
                const slotNames = missingSlots.map((s: any) => `${s.slot_name} (needs: ${s.allowed_subcategories?.slice(0, 2).join(' or ')})`).join(', ');
                //console.error(`❌ [SLOT VALIDATION] Outfit "${outfit.name}" MISSING REQUIRED SLOTS: ${slotNames} - REJECTED`);
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
                selectedTemplate: selectedTemplate,
                filteredGarments: filteredWardrobe,
                uniqueGarmentsPerOutfit: uniqueGarmentsPerOutfit,
                templateValidationLogs: validationLogsForDebug // Use the one declared earlier
            });
        }

        // 9. ZAPIS
        if (fullSuggestions.length > 0) {
            await supabase.from("daily_suggestions").upsert({
                user_id: userId,
                date: today,
                suggestions: fullSuggestions,
                weather_snapshot: { temp: temperature, feels_like: apparentTemp, desc: weatherDescription },
            }, { onConflict: "user_id, date" });
        }

        return { outfits: fullSuggestions, cachedImages: {} };

    } catch (error) {
        //console.error("❌ Generate Outfit Error:", error);
        return { outfits: [], cachedImages: {} };
    }
}