# Duplicate Garment Detection System

## Overview

System wykrywania duplikatów ubrań przed dodaniem do garderoby. Porównuje zarówno atrybuty (kategoria, kolor, wzór) jak i podobieństwo wizualne zdjęć.

## Algorytm wykrywania

### 1. Porównanie atrybutów (Score 0-100)

Punktacja według ważności:

| Atrybut                | Waga   | Opis                                          |
| ---------------------- | ------ | --------------------------------------------- |
| **Kategoria**          | 30 pkt | Musi się zgadzać (tops, bottoms, shoes, etc.) |
| **Kolor główny**       | 25 pkt | Porównanie nazwy + rodziny kolorów            |
| **Kolor hex**          | 20 pkt | Dystans Euklidesowy w przestrzeni RGB         |
| **Kolory drugorzędne** | 15 pkt | Overlap hex values                            |
| **SubType/Styl**       | 20 pkt | Fuzzy matching tekstu                         |
| **Wzór**               | 15 pkt | Porównanie tekstowe                           |

**Próg duplikatu**: Match score > 60%

### 2. Porównanie wizualne (Score 0-100)

-   **Algoritm**: Simplified Perceptual Hashing (pHash)
-   **Proces**:

    1. Skalowanie do 8×8 pikseli
    2. Konwersja do grayscale
    3. Obliczenie średniej jasności
    4. Generowanie hash (64 bity)
    5. Hamming distance między hash'ami

-   **Próg podobieństwa**: > 70% dla uruchomienia porównania
-   **Boost**: +15 pkt do match score jeśli visual similarity > 80%

## Przykłady użycia

### Scenariusz 1: Identyczne ubranie

```typescript
// Existing: Navy Wool Blazer, Navy, #1a2332
// New: Navy Wool Blazer, Navy, #1a2332

Match Score: 95%
Reasons:
- Same category (Outerwear)
- Similar color: Navy ≈ Navy
- Color hex values very similar
- Similar style: Blazer ≈ Blazer
- Visually very similar (92%)

Result: ⚠️ DUPLIKAT WYKRYTY
```

### Scenariusz 2: Podobne ale różne

```typescript
// Existing: Navy Blazer, Navy, #1a2332
// New: Navy Jacket, Dark Blue, #2a3342

Match Score: 68%
Reasons:
- Same category (Outerwear)
- Similar color: Navy ≈ Dark Blue
- Similar style: Blazer ≈ Jacket

Result: ⚠️ POTENCJALNY DUPLIKAT
```

### Scenariusz 3: Różne ubrania

```typescript
// Existing: White T-Shirt, White, #ffffff
// New: Black Jeans, Black, #000000

Match Score: 0%
Reasons:
- Different categories (Tops vs Bottoms)

Result: ✅ NO DUPLICATE
```

## Integracja w ConfirmationScreen

### Flow użytkownika:

```
1. User captures image → AI analyzes
2. User reviews/edits in ConfirmationScreen
3. User clicks "Add to Wardrobe"
   ↓
4. System: "Sprawdzanie duplikatów..." (loading)
   ↓
5a. NO DUPLICATES FOUND:
    → Direct save to Supabase
    → Success screen

5b. DUPLICATE DETECTED:
    → Show DuplicateWarningModal
    → User sees side-by-side comparison
    → User decides:
       - "Anuluj" → Back to editing
       - "Dodaj mimo wszystko" → Save anyway
```

### Stan komponentu:

```typescript
const [existingGarments, setExistingGarments] = useState<GarmentRow[]>([]);
const [duplicateCheck, setDuplicateCheck] = useState<{
	item: DetectedItem;
	duplicates: DuplicateMatch[];
} | null>(null);
const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

// Load existing garments on mount
useEffect(() => {
	async function loadExistingGarments() {
		const result = await fetchWardrobe(userId);
		setExistingGarments(result.data);
	}
	loadExistingGarments();
}, []);
```

### Proces sprawdzania:

```typescript
const handleConfirm = async () => {
	setIsCheckingDuplicates(true);

	for (const item of edited) {
		const duplicates = await findDuplicates(
			{
				category: item.category,
				color: item.color,
				colorHex: item.colorHex,
				secondaryColors: item.secondaryColors,
				subType: item.subType,
				pattern: item.pattern,
				imageUrl: item.imageUrl,
			},
			existingGarments,
			70 // Visual check threshold
		);

		if (duplicates.length > 0 && duplicates[0].matchScore > 60) {
			// DUPLICATE FOUND - show warning
			setDuplicateCheck({ item, duplicates });
			setIsCheckingDuplicates(false);
			return;
		}
	}

	// NO DUPLICATES - proceed
	setIsCheckingDuplicates(false);
	onConfirm(edited);
};
```

## Modal UI

### DuplicateWarningModal

**Layout**:

```
┌─────────────────────────────────┐
│ ⚠️ Możliwy duplikat          [X]│
│ Znaleziono podobne ubranie      │
├─────────────────────────────────┤
│                                 │
│  NOWE UBRANIE   |  W SZAFIE     │
│  [image]        |  [image]      │
│  Navy Blazer    |  Navy Blazer  │
│                                 │
├─────────────────────────────────┤
│ Stopień podobieństwa: 92%       │
│                                 │
│ Powody podobieństwa:            │
│ • Same category                 │
│ • Similar color: Navy ≈ Navy    │
│ • Visually very similar (92%)   │
│                                 │
│ Podobieństwo wizualne: 92%      │
├─────────────────────────────────┤
│ [Anuluj i sprawdź ponownie]    │
│ [Dodaj mimo wszystko]           │
└─────────────────────────────────┘
```

## Performance

### Optymalizacje:

1. **Lazy Loading**: Garments loaded once on mount
2. **Early Exit**: Category mismatch = immediate return
3. **Conditional Visual Check**: Only if attribute match > 70%
4. **Parallel Processing**: Multiple items checked simultaneously
5. **Canvas Caching**: Reuse canvas context

### Timing:

-   **Attribute comparison**: ~5-10ms per item
-   **Visual comparison**: ~50-100ms per image pair
-   **Total (3 items, 1 duplicate)**: ~200-300ms

## Testing

### Manual Test Cases:

```typescript
// Test 1: Exact duplicate
const existing = {
	name: "Navy Blazer",
	category: "outerwear",
	color: "Navy",
	image_url: "image1.jpg",
};

const newItem = {
	category: "Jacket",
	color: "Navy",
	colorHex: "#1a2332",
	imageUrl: "image1_copy.jpg",
};

// Expected: 95%+ match, modal shown

// Test 2: Similar items
const existing2 = {
	name: "White T-Shirt",
	category: "tops",
	color: "White",
};

const newItem2 = {
	category: "T-Shirt",
	color: "Off-White",
	colorHex: "#f5f5f5",
};

// Expected: 70-80% match, modal shown

// Test 3: Different items
const existing3 = {
	name: "Black Jeans",
	category: "bottoms",
	color: "Black",
};

const newItem3 = {
	category: "Shirt",
	color: "White",
	colorHex: "#ffffff",
};

// Expected: 0% match, no modal
```

## API Reference

### `findDuplicates()`

```typescript
async function findDuplicates(newGarment: GarmentToCheck, existingGarments: GarmentRow[], visualThreshold?: number): Promise<DuplicateMatch[]>;
```

**Parameters**:

-   `newGarment`: Item to check for duplicates
-   `existingGarments`: User's current wardrobe
-   `visualThreshold`: Min score for visual check (default: 70)

**Returns**: Array of matches sorted by score (highest first)

### `compareGarmentAttributes()`

```typescript
function compareGarmentAttributes(newGarment: GarmentToCheck, existingGarment: GarmentRow): { score: number; reasons: string[] };
```

Returns attribute-based similarity score and explanation.

### `compareImages()`

```typescript
async function compareImages(imageUrl1: string, imageUrl2: string): Promise<number>;
```

Returns visual similarity percentage (0-100) using perceptual hashing.

## Configuration

### Thresholds:

```typescript
// In ConfirmationScreen.tsx
const DUPLICATE_THRESHOLD = 60; // Show warning if score > 60%
const VISUAL_CHECK_THRESHOLD = 70; // Run visual check if > 70%

// In duplicateDetection.ts
const VISUAL_SIMILARITY_BOOST = 15; // Points added if visual > 80%
const MIN_ATTRIBUTE_SCORE = 40; // Minimum to consider as potential duplicate
```

### Customization:

```typescript
// Adjust color family matching
const colorFamilies = {
	black: ["black", "czarny", "noir", "onyx"],
	blue: ["blue", "niebieski", "navy", "granat", "indigo"],
	// ... add more
};

// Adjust category grouping
const categoryMap = {
	tops: ["shirt", "t-shirt", "polo", "blouse"],
	// ... customize
};
```

## Future Enhancements

-   [ ] Machine learning-based visual comparison (CNN)
-   [ ] Brand name matching (Nike Air Max = Nike Air Max 90)
-   [ ] Material comparison (Cotton vs Cotton-Polyester blend)
-   [ ] Season/occasion overlap
-   [ ] User feedback loop (was this actually a duplicate?)
-   [ ] Bulk duplicate scanning for existing wardrobe
-   [ ] Duplicate merge functionality (combine metadata)
-   [ ] Export duplicate report
