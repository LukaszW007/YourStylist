// src/scripts/fix-layers.ts
// Uruchomienie: npx tsx src/scripts/fix-layers.ts

import { createClient } from '@supabase/supabase-js';
import { normalizeLayerType } from '../lib/utils/garment-guards';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function fixLayers() {
  console.log("🔄 Rozpoczynam naprawę warstw...");

  // 1. Pobierz wszystko
  const { data: garments, error } = await supabase
    .from('garments')
    .select('id, category, subcategory, layer_type, name');

  if (error) throw error;

  let updates = 0;

  for (const garment of garments) {
    // 2. Oblicz poprawny typ używając naszej nowej logiki
    const correctLayer = normalizeLayerType(garment.category, garment.subcategory);

    // 3. Jeśli się różni, aktualizuj
    if (garment.layer_type !== correctLayer) {
      console.log(`🛠 Naprawa: ${garment.name} (${garment.subcategory}) | ${garment.layer_type} -> ${correctLayer}`);
      
      const { error: updateError } = await supabase
        .from('garments')
        .update({ layer_type: correctLayer })
        .eq('id', garment.id);

      if (!updateError) updates++;
    }
  }

  console.log(`✅ Zakończono. Zaktualizowano ${updates} ubrań.`);
}

fixLayers();