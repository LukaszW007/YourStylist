# Odpowiedzi na Pytania o Architekturę

## Pytanie 1: Template Selection

**Pytanie**: "Czy dobrze rozumiem że do prompt podajemy tylko jeden template?"

**TAK, masz rację!**

### Gdzie?
```typescript
// generate-outfit.ts:257-258
const selectedTemplate = validTemplates[0] || {
    name: "Winter Emergency Fallback",
    ...
};
```

### Na jakiej podstawie?

```
1. getRelevantTemplates(apparentTemp)
   ↓
   SELECT * FROM layering_templates
   WHERE min_temp_c <= {temp} AND max_temp_c >= {temp}
   ORDER BY min_temp_c DESC  // "Minimal Effort Rule"
   ↓
2. applyMinimalEffortRule(templates, inventory, 3)
   ↓
   Filter: czy garderoba MA garments dla template.slots
   ↓
3. validateTemplateAgainstWardrobe(template, wardrobe)
   ↓
   Reject templates bez specific items (henley, polo)
   ↓
4. validTemplates[0]  ← PIERWSZE pasujące = wybrane
```

**Kluczowe**: AI NIE wybiera template - algorytm wybiera PRZED wysłaniem do AI.

---

## Pytanie 2: Filtrowanie Garderobliy

**Pytanie**: "Czy ubrania są już przefiltrowane przed wysłaniem do AI?"

**TAK, ale tylko CZĘŚCIOWO:**

### Obecne Filtrowanie (generate-outfit.ts:192-214):

```typescript
function filterByLayeringRules(garments, templateLayerCount) {
    return garments.filter(g => {
        // ❌ Short sleeves rejected for 3+ layers
        if (templateLayerCount >= 3 && isTop && g.sleeve_length === 'short-sleeve') {
            return false;
        }
        
        // ❌ Colored t-shirts rejected for 3+ layers
        if (category?.includes('t-shirt') && !isWhite && templateLayerCount >= 3) {
            return false;
        }
        
        return true;
    });
}
```

### Co BRAKUJE:

**❌ NIE filtrujemy po `allowed_subcategories`!**

Obecnie wysyłamy CAŁĄ przefiltrowaną garderobę do AI, a AI ma sam wybrać odpowiednie subcategory dla każdego slotu.

**Twój pomysł jest POPRAWNY** - powinniśmy:
1. Iterować przez `selectedTemplate.slots`
2. Dla każdego slotu znaleźć garments matching `allowed_subcategories`
3. Wysyłać do AI TYLKO te które matchują template

---

## Pytanie 3: Segregacja po Slotach

**Twój pomysł**: "Posegregowane według slotów - może to pomoże AI?"

**ŚWIETNY POMYSŁ!**

Zamiast:
```
INVENTORY: [wszystkie 50 garments...]
```

Wysyłamy:
```
BASE_LAYER OPTIONS (choose 1):
- White Cotton T-shirt (id: xxx)
- White Undershirt (id: yyy)

SHIRT_LAYER OPTIONS (choose 1):
- Blue Cotton Shirt (id: aaa)
- White Oxford Shirt (id: bbb)

MID_LAYER OPTIONS (choose 1):
- Gray Merino Sweater (id: ccc)
- Navy Cardigan (id: ddd)

OUTER_LAYER OPTIONS (choose 1):
- Black Pea Coat (id: eee)
- Navy Overcoat (id: fff)

BOTTOMS OPTIONS (choose 1):
- Charcoal Chinos (id: ggg)
- Navy Trousers (id: hhh)

SHOES OPTIONS (choose 1):
- Brown Chelsea Boots (id: iii)
- Black Hiking Boots (id: jjj)
```

**Korzyści**:
1. AI wie DOKŁADNIE co wybrać dla każdego slotu
2. Nie trzeba szukać w 50+ garments
3. Jasne instrukcje = mniej błędów
4. Mniejszy prompt = tańsze API calls

---

## Pytanie 4: Templates dla 18°C

**Sprawdzam w Supabase** (layering_templates table):

Templates gdzie `min_temp_c <= 18 AND max_temp_c >= 18`:

| Template Name | min_temp_c | max_temp_c | Layers |
|--------------|------------|------------|--------|
| "1 Layer Style (20°C+)" | 20 | 50 | 1 | ❌ (min > 18) |
| "2 Layer Style (15°C+)" | 15 | 25 | 2 | ✅ |
| "3 Layer Style (0°C+)" | 0 | 18 | 3 | ✅ (max = 18) |
| Inne 3-layer variants | 0 | 20 | 3 | ✅ |

**Pasujące templates dla 18°C**:
1. **"2 Layer Style (15°C+)"** - lekki zestaw
2. **"3 Layer Style (0°C+)"** (jeśli max=18 lub wyżej)
3. Warianty z Polo/Henley jeśli masz te items

**Uwaga**: Templates są w Supabase, nie w `new_layering_templates.json`!
Plik JSON to definicje do zaimportowania, nie źródło produkcyjne.

---

## Proponowany Plan Implementacji

### Nowy Flow:

```
1. Template Selection (bez zmian)
   ↓
2. NOWE: Algorithmic Slot Matching
   ↓
   FOR EACH slot in selectedTemplate.slots:
     matchingGarments = wardrobe.filter(g => 
       slot.allowed_subcategories.some(allowed =>
         g.subcategory.includes(allowed) || allowed.includes(g.subcategory)
       )
     )
     slotBuckets[slot.slot_name] = matchingGarments
   ↓
3. Build Slot-Organized Prompt
   ↓
   "BASE_LAYER OPTIONS: ..."
   "SHIRT_LAYER OPTIONS: ..."
   ↓
4. AI Selection (simplified task)
   ↓
   AI tylko wybiera 1 z każdego bucket
   ↓
5. Validation (pozostaje)
```

### Korzyści:
- **Gwarancja**: AI MUSI wybrać z dostępnych opcji per slot
- **Prostota**: AI ma jasne instrukcje
- **Pewność**: Nie może pominąć slotu bo każdy ma opcje
- **Wydajność**: Mniejszy prompt

---

## Czy Implementować?

Czekam na decyzję:
- ✅ Algorytmiczny pre-filtering po `allowed_subcategories`
- ✅ Slot-organized prompt format
- ✅ Zmiana AI task z "wybierz z 50 garments" na "wybierz 1 z każdego bucket"
