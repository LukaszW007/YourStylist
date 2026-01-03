// src/lib/utils/weather-season.ts

export function isGarmentWeatherAppropriate(
  garment: any, 
  temp: number, 
  currentSeason: Season
): boolean {
  // 1. HARD OVERRIDE: Jeśli użytkownik zdefiniował zakres temperatur w edycji ubrania
  if (garment.comfort_min_c !== null && garment.comfort_max_c !== null) {
    return temp >= garment.comfort_min_c && temp <= garment.comfort_max_c;
  }

  const materials = Array.isArray(garment.material) ? garment.material.map((m: string) => m.toLowerCase()) : [];
  const subcategory = garment.subcategory?.toLowerCase() || "";
  const category = garment.category?.toLowerCase() || "";
  const isOuter = category === 'outerwear' || garment.layer_type === 'outer';

  // 2. LOGIKA PRZEJŚCIOWA (TRANSITIONAL LOGIC)
  
  // A. "Cold Transition" (5°C - 12°C): Lekka wełna, lekkie ocieplacze
  // Akceptujemy zimowe rzeczy, jeśli nie są ekstremalne (np. pomijamy 'Heavy Parka' przy 10 stopniach)
  if (temp >= 5 && temp <= 12) {
      if (garment.season?.includes('winter') || garment.season?.includes('spring') || garment.season?.includes('autumn')) {
          // Odrzucamy tylko ewidentnie letnie rzeczy (Lniane marynarki)
          if (materials.includes('linen') || materials.includes('seersucker')) return false;
          return true;
      }
  }

  // B. "Cool Spring/Autumn" (8°C - 16°C): Skóra, Zamsz, Woskowana Bawełna
  if (temp >= 8 && temp <= 16) {
      if (materials.includes('leather') || materials.includes('suede') || materials.includes('waxed cotton')) return true;
      // Wełniane płaszcze zaczynają być za ciepłe powyżej 15 stopni
      if (materials.includes('wool') && isOuter && temp > 14) return false;
  }

  // C. "Warm Spring/Cool Summer" (14°C - 22°C): Bawełna, Denim, Harringtonki
  if (temp >= 14 && temp <= 22) {
      // Twoja bawełniana kurtka:
      if (materials.includes('cotton') && isOuter) return true;
      if (materials.includes('denim') && isOuter) return true;
      // Odrzucamy zimowe kurtki
      if (garment.season?.includes('winter') && !garment.season?.includes('spring')) return false;
      if (materials.includes('down') || materials.includes('shearling')) return false;
  }

  // 3. FALLBACK DO SEZONÓW Z BAZY
  if (garment.season && Array.isArray(garment.season) && garment.season.length > 0) {
     if (garment.season.includes('all')) return true;
     if (garment.season.includes(currentSeason)) return true;
  }

  // Domyślnie true (pozwól AI zdecydować, jeśli nie jesteśmy pewni)
  return true; 
}