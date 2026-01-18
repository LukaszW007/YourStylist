// src/scripts/enrich-wardrobe.ts
// Uruchomienie: npx tsx src/scripts/enrich-wardrobe.ts

import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { normalizeLayerType } from '../lib/utils/garment-guards';

dotenv.config({ path: '.env.local' });

const START_AFTER_ID = "5f8adf5a-22d6-4570-ab15-5a2f99feb485"; 
const BATCH_SIZE = 50; 
const SAFE_DELAY_MS = 10000; 
const ERROR_DELAY_MS = 60000; 

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GEMINI_KEY = process.env.FREE_GEMINI_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY || !GEMINI_KEY) {
  console.error("❌ Brak zmiennych środowiskowych.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// WAŻNE: Wymuszenie API v1 (stabilnego)
const genAI = new GoogleGenAI({ apiKey: GEMINI_KEY, apiVersion: "v1" });

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  } catch (e) {
    return null;
  }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function enrichGarments() {
  console.log(`🚀 Startuje Enrichment (v4 Stable). Start po ID: ${START_AFTER_ID || "POCZĄTEK"}`);

  let query = supabase
    .from('garments')
    .select('id, name, category, subcategory, material, image_url')
    .is('fabric_weave', null)
    .order('id', { ascending: true })
    .limit(BATCH_SIZE);

  if (START_AFTER_ID) {
    query = query.gt('id', START_AFTER_ID);
  }

  const { data: garments, error } = await query;

  if (error) throw error;
  if (!garments || garments.length === 0) {
    console.log("✅ Brak ubrań do przetworzenia.");
    return;
  }

  console.log(`📦 Kolejka: ${garments.length} elementów.`);

  for (const garment of garments) {
    let success = false;
    let attempts = 0;

    while (!success && attempts < 3) {
        attempts++;
        try {
            console.log(`\n🔍 [${garment.id}] Analizuję: ${garment.name}...`);
            
            const base64Image = garment.image_url ? await fetchImageAsBase64(garment.image_url) : null;
            
            const prompt = `
            Analyze garment metadata/image.
            METADATA: ${garment.name}, ${garment.category}, ${garment.subcategory}, ${JSON.stringify(garment.material)}
            TASK: Return JSON with strict technical specs.
            OUTPUT JSON: {"fabric_weave": "standard|seersucker|fresco|flannel|tweed|poplin|knit_chunky|drill|denim|satin|twill", "season": ["Spring"|"Summer"|"Autumn"|"Winter"], "color_temperature": "Warm"|"Cool"|"Neutral", "layer_type": "base"|"mid"|"outer"|"shoes"}
            `;

            const contentParts: any[] = [{ text: prompt }];
            if (base64Image) {
                contentParts.push({ inlineData: { mimeType: "image/png", data: base64Image } });
            }

            // Używamy modelu bez dopisków -latest/-exp, bo jesteśmy na v1
            const result = await genAI.models.generateContent({
                model: "gemini-1.5-flash", 
                contents: [{ role: "user", parts: contentParts }]
            });

            // Ekstrakcja tekstu
            const candidate = result.candidates?.[0];
            const textPart = candidate?.content?.parts?.find((p: any) => p.text);
            let responseText = textPart?.text || "";

            if (!responseText) throw new Error("Empty AI response");

            responseText = responseText.replace(/```json|```/g, "").trim();
            let aiData;
            try {
                aiData = JSON.parse(responseText);
            } catch (jsonError) {
                console.error(`❌ Błąd JSON.`);
                break; 
            }

            const normalizedLayer = normalizeLayerType(garment.category, aiData.layer_type);

            const { error: updateError } = await supabase
                .from('garments')
                .update({
                    fabric_weave: aiData.fabric_weave,
                    season: aiData.season,
                    color_temperature: aiData.color_temperature,
                    layer_type: normalizedLayer,
                })
                .eq('id', garment.id);

            if (updateError) throw new Error(updateError.message);

            console.log(`✅ Sukces: ${aiData.fabric_weave} | ${normalizedLayer}`);
            success = true;
            console.log("⏳ Czekam 10s...");
            await sleep(SAFE_DELAY_MS);

        } catch (e: any) {
            const errString = JSON.stringify(e); // Lepszy podgląd błędu
            console.error(`⚠️ Błąd: ${e.message || errString}`);
            
            if (errString.includes('429') || e.status === 429 || errString.includes('Quota')) {
                console.log(`🛑 LIMIT. Czekam 60s...`);
                await sleep(ERROR_DELAY_MS);
            } else {
                console.log("⏩ Pomijam element.");
                break; 
            }
        }
    }
  }
  console.log("\n✨ Koniec partii.");
}

enrichGarments();