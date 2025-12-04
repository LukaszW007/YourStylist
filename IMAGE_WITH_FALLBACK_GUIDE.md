# 🖼️ ImageWithFallback - Dokumentacja Komponentu

## 📚 Czym jest ImageWithFallback?

`ImageWithFallback` to React komponent, który **automatycznie wyświetla obrazek zastępczy** (fallback), gdy główny obrazek nie może zostać załadowany.

---

## 🎯 Problem który rozwiązuje

### Bez ImageWithFallback:

```tsx
<img
	src="https://broken-url.com/image.jpg"
	alt="Product"
/>
```

**Rezultat**: 🚫 Zepsuty obrazek (broken image icon) - źle wygląda w UI

### Z ImageWithFallback:

```tsx
<ImageWithFallback
	src="https://broken-url.com/image.jpg"
	alt="Product"
/>
```

**Rezultat**: ✅ Elegancki placeholder SVG z ikoną obrazka

---

## 💡 Jak to działa?

### Kod źródłowy z wyjaśnieniami:

```tsx
"use client";

import React, { useState } from "react";

// SVG zakodowany w Base64 - prosty placeholder obrazka
const ERROR_IMG_SRC =
	"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
	// 1️⃣ State śledzi czy obrazek się nie załadował
	const [didError, setDidError] = useState(false);

	// 2️⃣ Handler wywoływany gdy obrazek nie może być załadowany
	const handleError = () => {
		setDidError(true);
	};

	// 3️⃣ Destrukturyzacja props
	const { src, alt, style, className, ...rest } = props;

	// 4️⃣ Jeśli był błąd → pokaż placeholder
	return didError ? (
		<div
			className={`inline-block bg-gray-100 text-center align-middle ${className ?? ""}`}
			style={style}
		>
			<div className="flex items-center justify-center w-full h-full">
				<img
					src={ERROR_IMG_SRC}
					alt="Error loading image"
					{...rest}
					data-original-url={src} // 👈 Zachowaj oryginalny URL dla debugowania
				/>
			</div>
		</div>
	) : (
		// 5️⃣ Jeśli nie było błędu → pokaż normalny obrazek
		<img
			src={src}
			alt={alt}
			className={className}
			style={style}
			{...rest}
			onError={handleError} // 👈 Event listener dla błędów
		/>
	);
}
```

### Mechanizm działania:

1. **Początek**: Komponent próbuje załadować obrazek z `src`
2. **Sukces**: Obrazek się ładuje → wyświetla normalnie
3. **Błąd**: Obrazek nie ładuje się → wywołuje `onError` → `setDidError(true)`
4. **Re-render**: Komponent renderuje się ponownie i pokazuje placeholder SVG

---

## 📖 Użycie w Praktyce

### Podstawowe użycie

```tsx
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export function ProductCard({ product }) {
	return (
		<div className="card">
			<ImageWithFallback
				src={product.imageUrl} // URL z API - może być zepsuty
				alt={product.name}
				className="w-full h-64 object-cover rounded-lg"
			/>
			<h3>{product.name}</h3>
		</div>
	);
}
```

### Wszystkie props z HTMLImageElement

```tsx
<ImageWithFallback
	src="https://example.com/image.jpg"
	alt="Description"
	className="w-full h-auto"
	style={{ borderRadius: "8px" }}
	loading="lazy" // ✅ Native lazy loading
	width={400} // ✅ Określ wymiary
	height={300}
	onClick={handleClick} // ✅ Event handlers działają
	onLoad={() => console.log("Loaded!")}
/>
```

---

## 🎨 Aplikacja w YourStylistApp

### Gdzie można zastosować?

#### 1. **Garment Grid** (Lista ubrań)

**Obecny kod** (`src/components/wardrobe/GarmentCard.tsx`):

```tsx
import Image from "next/image";

export function GarmentCard({ item }) {
	return (
		<div className="card">
			<Image
				src={item.imageUrl}
				alt={item.name}
				fill
				className="object-cover"
			/>
		</div>
	);
}
```

**Z ImageWithFallback**:

```tsx
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

export function GarmentCard({ item }) {
	return (
		<div className="card relative aspect-square">
			<ImageWithFallback
				src={item.imageUrl || "/placeholder-garment.jpg"}
				alt={item.name}
				className="w-full h-full object-cover"
			/>
		</div>
	);
}
```

**Korzyści**:

-   ✅ Jeśli Supabase Storage ma problem → pokazuje placeholder
-   ✅ Jeśli `imageUrl` jest null/undefined → pokazuje placeholder
-   ✅ Lepsze UX - użytkownik wie że coś poszło nie tak

#### 2. **Garment Detail Page** (Widok szczegółów)

**Obecny kod** (`src/app/[lang]/wardrobe/[id]/GarmentDetailPageClient.tsx`):

```tsx
<div className="relative aspect-square bg-muted">
	{garment.image_url ? (
		<Image
			src={garment.image_url}
			alt={garment.name}
			fill
			className="object-cover"
			priority
		/>
	) : (
		<div className="flex items-center justify-center h-full text-muted-foreground">No image available</div>
	)}
</div>
```

**Z ImageWithFallback**:

```tsx
<div className="relative aspect-square bg-muted overflow-hidden">
	<ImageWithFallback
		src={garment.image_url || ""}
		alt={garment.name}
		className="w-full h-full object-cover"
		style={{ width: "100%", height: "100%" }}
	/>
</div>
```

**Korzyści**:

-   ✅ Prostszy kod - nie trzeba sprawdzać `garment.image_url`
-   ✅ Automatyczny fallback
-   ✅ Konsystentny wygląd w całej aplikacji

#### 3. **Scanner Confirmation Screen** (Potwierdzenie skanowania)

**Obecny kod** (`src/components/scanner/ConfirmationScreen.tsx`):

```tsx
<Image
	src={item.imageUrl}
	alt={item.detectedCategory}
	fill
	className="object-cover"
/>
```

**Z ImageWithFallback**:

```tsx
<ImageWithFallback
	src={item.imageUrl}
	alt={item.detectedCategory}
	className="w-full h-full object-cover"
/>
```

**Korzyści**:

-   ✅ Jeśli kompresja obrazu zawiodła → pokazuje placeholder
-   ✅ Jeśli data URL jest zepsute → nie crashuje UI

#### 4. **Outfit Generator** (Generowanie stylizacji)

**Nowy feature**:

```tsx
export function OutfitPreview({ outfit }) {
	return (
		<div className="grid grid-cols-3 gap-2">
			{outfit.items.map((item) => (
				<div
					key={item.id}
					className="aspect-square"
				>
					<ImageWithFallback
						src={item.imageUrl}
						alt={item.name}
						className="w-full h-full object-cover rounded-lg"
					/>
				</div>
			))}
		</div>
	);
}
```

---

## 🔧 Customizacja

### Zmień placeholder SVG

```tsx
// Własny SVG placeholder
const CUSTOM_ERROR_IMG = `
  <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="#f0f0f0"/>
    <text x="50%" y="50%" text-anchor="middle" fill="#999">
      No Image
    </text>
  </svg>
`;

const CUSTOM_ERROR_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(CUSTOM_ERROR_IMG)}`;
```

### Dodaj custom fallback komponent

```tsx
export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
	const [didError, setDidError] = useState(false);

	const { src, alt, style, className, ...rest } = props;

	return didError ? (
		<div
			className={`fallback-container ${className}`}
			style={style}
		>
			{/* 🎨 Custom fallback */}
			<div className="flex flex-col items-center justify-center h-full text-gray-400">
				<ImageIcon className="w-12 h-12 mb-2" />
				<p className="text-sm">Image not available</p>
			</div>
		</div>
	) : (
		<img
			src={src}
			alt={alt}
			className={className}
			style={style}
			{...rest}
			onError={() => setDidError(true)}
		/>
	);
}
```

### Dodaj retry logic

```tsx
export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
	const [didError, setDidError] = useState(false);
	const [retryCount, setRetryCount] = useState(0);

	const handleError = () => {
		if (retryCount < 3) {
			// Spróbuj ponownie po 1 sekundzie
			setTimeout(() => {
				setRetryCount((prev) => prev + 1);
			}, 1000);
		} else {
			setDidError(true);
		}
	};

	const { src, alt, style, className, ...rest } = props;

	return didError ? (
		<div className="fallback">Placeholder</div>
	) : (
		<img
			src={`${src}?retry=${retryCount}`} // Cache busting
			alt={alt}
			className={className}
			style={style}
			{...rest}
			onError={handleError}
		/>
	);
}
```

---

## ⚠️ Next.js Image vs ImageWithFallback

### Next.js `<Image>` Component

```tsx
import Image from "next/image";

<Image
	src="/product.jpg"
	alt="Product"
	width={500}
	height={300}
	className="rounded"
/>;
```

**Zalety**:

-   ✅ Automatyczna optymalizacja (WebP, AVIF)
-   ✅ Lazy loading
-   ✅ Blur placeholder podczas ładowania
-   ✅ Responsive images
-   ✅ Priority loading dla ATF images

**Wady**:

-   ❌ Wymaga określenia `width`/`height` lub `fill`
-   ❌ Bardziej skomplikowany error handling
-   ❌ Nie działa z zewnętrznymi URL bez konfiguracji

### ImageWithFallback (native `<img>`)

```tsx
<ImageWithFallback
	src="/product.jpg"
	alt="Product"
	className="w-full h-auto rounded"
/>
```

**Zalety**:

-   ✅ Prosty error handling (built-in)
-   ✅ Działa z dowolnymi URL
-   ✅ Brak dodatkowej konfiguracji
-   ✅ Mniejszy bundle size

**Wady**:

-   ❌ Brak automatycznej optymalizacji
-   ❌ Brak built-in lazy loading (trzeba dodać `loading="lazy"`)
-   ❌ Brak blur placeholder

### Kiedy używać którego?

| Użyj Next.js Image           | Użyj ImageWithFallback          |
| ---------------------------- | ------------------------------- |
| Statyczne obrazy z `/public` | Dynamiczne URL z API            |
| Hero images, główne grafiki  | Lista produktów/galerie         |
| Potrzebujesz optymalizacji   | Potrzebujesz prostego fallbacku |
| Kontrolujesz źródło obrazów  | Obrazy od użytkowników          |

---

## 🎯 Best Practices

### 1. Zawsze podawaj `alt` text

```tsx
// ❌ ZŁE
<ImageWithFallback src={url} />

// ✅ DOBRE
<ImageWithFallback src={url} alt="Navy blazer - Smart Casual" />
```

### 2. Określ wymiary przez CSS

```tsx
// ✅ DOBRE - Zapobiega layout shift
<ImageWithFallback
	src={url}
	alt="Product"
	className="w-full aspect-square object-cover"
/>
```

### 3. Lazy loading dla obrazów poniżej fold

```tsx
<ImageWithFallback
	src={url}
	alt="Product"
	loading="lazy" // 👈 Native browser lazy loading
	className="w-full h-auto"
/>
```

### 4. Dodaj `data-*` attributes dla debugowania

```tsx
<ImageWithFallback
	src={garment.image_url}
	alt={garment.name}
	data-garment-id={garment.id}
	data-source="supabase-storage"
	className="object-cover"
/>
```

### 5. Error tracking

```tsx
export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
	const [didError, setDidError] = useState(false);

	const handleError = () => {
		setDidError(true);

		// 📊 Wyślij error do analytics
		console.error("[ImageWithFallback] Failed to load:", props.src);

		// Opcjonalnie: wyślij do Sentry/LogRocket
		// Sentry.captureMessage('Image load failed', { extra: { url: props.src } });
	};

	// ... rest of component
}
```

---

## 📊 Przykład implementacji w YourStylistApp

### Pełna integracja w GarmentGrid:

```tsx
// src/components/wardrobe/GarmentCard.tsx
"use client";

import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { Badge } from "@/components/ui/Badge";
import type { WardrobeItem } from "./types";

interface GarmentCardProps {
	item: WardrobeItem;
	onClick: () => void;
}

export function GarmentCard({ item, onClick }: GarmentCardProps) {
	return (
		<div
			onClick={onClick}
			className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg"
		>
			{/* Image Container */}
			<div className="relative aspect-square overflow-hidden bg-muted">
				<ImageWithFallback
					src={item.imageUrl || ""}
					alt={`${item.name} - ${item.category}`}
					className="w-full h-full object-cover transition-transform group-hover:scale-105"
					loading="lazy"
					data-garment-id={item.id}
				/>

				{/* Category Badge */}
				<div className="absolute top-2 right-2">
					<Badge className="bg-black/70 text-white text-xs">{item.category}</Badge>
				</div>
			</div>

			{/* Info Section */}
			<div className="p-3 space-y-1">
				<h3 className="text-sm font-medium line-clamp-1">{item.name}</h3>

				{item.brand && <p className="text-xs text-muted-foreground">{item.brand}</p>}

				{item.lastWorn && <p className="text-xs text-muted-foreground">Last worn: {item.lastWorn}</p>}
			</div>
		</div>
	);
}
```

### Result:

-   ✅ Jeśli `imageUrl` jest prawidłowe → pokazuje obrazek
-   ✅ Jeśli `imageUrl` jest null/undefined → pokazuje placeholder
-   ✅ Jeśli ładowanie obrazka failuje → pokazuje placeholder
-   ✅ Smooth UX bez crashy

---

## 🚀 Podsumowanie

### Co daje ImageWithFallback?

1. **Odporność na błędy** - Aplikacja nie crashuje przy złych URL
2. **Lepsze UX** - Użytkownik widzi placeholder zamiast broken image
3. **Prostota** - Jeden komponent, automatyczne działanie
4. **Debugging** - `data-original-url` zachowuje źródłowy URL

### Kiedy stosować?

-   ✅ Obrazy z zewnętrznych API
-   ✅ User-generated content
-   ✅ Dynamiczne URL z bazy danych
-   ✅ Galerie produktów
-   ✅ Listy elementów z obrazkami

### Kiedy NIE stosować?

-   ❌ Statyczne obrazy z `/public` (użyj Next.js Image)
-   ❌ Hero images wymagające optymalizacji (użyj Next.js Image)
-   ❌ Krytyczne obrazy wymagające blur placeholder (użyj Next.js Image)

---

**Lokalizacja w projekcie**: `src/components/ui/ImageWithFallback.tsx`  
**Autor**: GitHub Copilot  
**Data**: 2025-11-25
