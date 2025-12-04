# 🎓 Next.js 15 - Przewodnik po Routing i API Routes

## 📚 Spis Treści

1. [Routing w Next.js App Router](#routing-w-nextjs-app-router)
2. [API Routes (Endpointy)](#api-routes-endpointy)
3. [Przykłady z YourStylistApp](#przykłady-z-yourstylistapp)
4. [Dobre praktyki](#dobre-praktyki)

---

## Routing w Next.js App Router

### 🔑 Podstawy

Next.js 15 używa **App Router** (folder `app/`) zamiast starszego Pages Router (folder `pages/`).

#### Struktura folderów = URL routing

```
app/
├── page.tsx                    → /
├── about/
│   └── page.tsx               → /about
├── blog/
│   ├── page.tsx               → /blog
│   └── [slug]/
│       └── page.tsx           → /blog/my-post (dynamiczny)
└── api/
    └── users/
        └── route.ts           → /api/users (API endpoint)
```

### 📍 Dynamiczne Parametry

#### 1. Single Dynamic Segment `[id]`

**Plik**: `app/products/[id]/page.tsx`
**URL**: `/products/123`

```tsx
// app/products/[id]/page.tsx
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params; // Next.js 15: params jest Promise!

	return <div>Product ID: {id}</div>;
}
```

#### 2. Multi-level Dynamic Routes `[lang]/[category]/[id]`

**Przykład z YourStylistApp**:

```
app/[lang]/wardrobe/[id]/
├── page.tsx                   → /en/wardrobe/123
└── GarmentDetailPageClient.tsx
```

```tsx
// app/[lang]/wardrobe/[id]/page.tsx
type PageProps = {
	params: Promise<{
		lang: string;
		id: string;
	}>;
};

export default async function GarmentDetailPage({ params }: PageProps) {
	const { lang, id } = await params;

	return (
		<GarmentDetailPageClient
			garmentId={id}
			lang={lang}
		/>
	);
}
```

**Lokalizacja w projekcie**:

-   `f:\Worskpace\YourStylistApp\gentstylo\src\app\[lang]\wardrobe\[id]\page.tsx`

---

## 🔄 Nawigacja w Next.js

### ❌ NIE RÓB TAK:

```tsx
// ❌ ZŁE - Pełne przeładowanie strony, utraca state aplikacji
window.location.href = `/products/${id}`;

// ❌ ZŁE - Stara metoda z Next.js 12
import Router from "next/router";
Router.push("/about");
```

### ✅ PRAWIDŁOWO:

#### 1. Client-Side Navigation z `useRouter` (Client Components)

```tsx
"use client";
import { useRouter } from "next/navigation"; // ⚠️ next/navigation, nie next/router!

export default function MyComponent() {
	const router = useRouter();

	const handleClick = () => {
		// ✅ Soft navigation - zachowuje state, szybkie
		router.push("/about");

		// Inne metody:
		router.back(); // Cofnij
		router.forward(); // Do przodu
		router.refresh(); // Odśwież dane
		router.replace("/new"); // Zastąp w historii (nie można wrócić)
	};

	return <button onClick={handleClick}>Navigate</button>;
}
```

**Przykład z YourStylistApp - WardrobePageClient.tsx**:

```tsx
// Lokalizacja: src/app/[lang]/wardrobe/WardrobePageClient.tsx (linia 4-5)
import { useRouter } from "next/navigation";

export default function WardrobePageClient({ lang }: WardrobePageClientProps) {
	const router = useRouter();

	// Linia 166-170
	const handleItemClick = (item: WardrobeItem) => {
		// ✅ Używamy router.push zamiast window.location.href
		router.push(`/${lang}/wardrobe/${item.id}`);
	};

	return (
		<GarmentGrid
			items={filteredItems}
			onItemClick={handleItemClick}
		/>
	);
}
```

**Dlaczego `router.push` zamiast `window.location.href`?**

| window.location.href               | router.push                |
| ---------------------------------- | -------------------------- |
| ❌ Pełne przeładowanie HTML/CSS/JS | ✅ Tylko pobiera nowe dane |
| ❌ Resetuje cały state aplikacji   | ✅ Zachowuje React state   |
| ❌ Wolniejsze (~500ms+)            | ✅ Szybkie (~50ms)         |
| ❌ Traci scroll position           | ✅ Pamięta scroll position |
| ❌ Resetuje cache                  | ✅ Wykorzystuje cache      |

#### 2. Deklaratywna Nawigacja z `<Link>` (preferowana dla linków)

```tsx
import Link from "next/link";

export default function Navigation() {
	return (
		<nav>
			{/* ✅ Automatyczne prefetching, soft navigation */}
			<Link href="/about">About</Link>

			{/* Dynamiczny URL */}
			<Link href={`/products/${productId}`}>View Product</Link>

			{/* Replace mode (nie można wrócić) */}
			<Link
				href="/login"
				replace
			>
				Login
			</Link>

			{/* Zewnętrzny link - działa jak <a> */}
			<Link
				href="https://google.com"
				target="_blank"
			>
				Google
			</Link>
		</nav>
	);
}
```

**Przykład z YourStylistApp - WardrobePageClient.tsx (linia 278-315)**:

```tsx
// Bottom Navigation - używa Link dla statycznych linków
<Link href={`/${lang}/wardrobe`} className="flex flex-col items-center gap-1">
  <Shirt className="h-5 w-5" />
  <span className="text-xs">Wardrobe</span>
</Link>

<Link href={`/${lang}/wardrobe/scan`}>
  <Camera className="h-5 w-5" />
  <span className="text-xs">Scanner</span>
</Link>
```

---

## API Routes (Endpointy)

### 🎯 Tworzenie API Endpoints

API Routes w Next.js 15 używają **Route Handlers** (plik `route.ts` zamiast `page.tsx`).

#### Podstawowa struktura

```
app/
└── api/
    ├── users/
    │   └── route.ts           → POST/GET /api/users
    ├── users/
    │   └── [id]/
    │       └── route.ts       → GET /api/users/123
    └── auth/
        └── login/
            └── route.ts       → POST /api/auth/login
```

#### Template Route Handler

```tsx
// app/api/users/route.ts
import { NextResponse, NextRequest } from "next/server";

// ✅ GET /api/users
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const limit = searchParams.get("limit") || "10";

		// Pobierz dane z bazy
		const users = await db.users.findMany({ take: parseInt(limit) });

		return NextResponse.json({
			success: true,
			data: users,
		});
	} catch (error) {
		return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
	}
}

// ✅ POST /api/users
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Walidacja
		if (!body.email || !body.name) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		// Zapis do bazy
		const newUser = await db.users.create({ data: body });

		return NextResponse.json(
			{
				success: true,
				data: newUser,
			},
			{ status: 201 }
		);
	} catch (error) {
		return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
	}
}

// Inne metody HTTP
export async function PUT(request: NextRequest) {
	/* ... */
}
export async function DELETE(request: NextRequest) {
	/* ... */
}
export async function PATCH(request: NextRequest) {
	/* ... */
}
```

### 📋 Przykłady z YourStylistApp

#### 1. **Gemini AI Proxy** - `/api/gemini-proxy`

**Lokalizacja**: `src/app/api/gemini-proxy/route.ts`

```tsx
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
	try {
		// 1. Parsowanie body
		const { prompt, image } = await request.json();

		// 2. Walidacja
		if (!prompt || !image?.inlineData?.data) {
			return NextResponse.json({ error: "Missing prompt or image data" }, { status: 400 });
		}

		// 3. Wywołanie zewnętrznego API (Anthropic Claude)
		const anthropic = new Anthropic({
			apiKey: serverEnv.anthropicApiKey,
		});

		const response = await anthropic.messages.create({
			model: "claude-3-5-sonnet-20241022",
			max_tokens: 2048,
			messages: [
				{
					role: "user",
					content: [
						{
							type: "image",
							source: {
								type: "base64",
								media_type: image.inlineData.mimeType,
								data: image.inlineData.data,
							},
						},
						{ type: "text", text: prompt },
					],
				},
			],
		});

		// 4. Zwrócenie odpowiedzi
		return NextResponse.json({
			ok: true,
			plan: "free",
			usedKey: "anthropic",
			prompt: response.content[0].text,
		});
	} catch (error) {
		console.error("[Gemini Proxy Error]:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
```

**Wywołanie z Client Component**:

```tsx
// src/components/scanner/AnalysisView.tsx (linia 59-75)
const response = await fetch("/api/gemini-proxy", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		prompt: "Analyze this garment...",
		image: {
			inlineData: {
				data: base64Image,
				mimeType: "image/jpeg",
			},
		},
	}),
});

const data = await response.json();
```

#### 2. **Garment Analysis** - `/api/analyze-garments`

**Lokalizacja**: `src/app/api/analyze-garments/route.ts`

````tsx
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are an expert AI fashion analyst...`;

export async function POST(request: NextRequest) {
	try {
		// 1. Pobierz dane z body
		const { base64Image, mimeType, lang = "en" } = await request.json();

		// 2. Walidacja
		if (!base64Image || !mimeType) {
			return NextResponse.json({ error: "Missing image data" }, { status: 400 });
		}

		// 3. Inicjalizacja Gemini AI
		const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

		// 4. Analiza obrazu
		const response = await genAI.models.generateContent({
			model: "gemini-2.5-flash-lite",
			contents: [
				{
					role: "user",
					parts: [{ inlineData: { mimeType, data: base64Image } }, { text: SYSTEM_PROMPT }],
				},
			],
		});

		// 5. Parse odpowiedzi
		let text = response.text ?? "";
		let cleanedText = text
			.trim()
			.replace(/```json\n?/g, "")
			.replace(/```\n?/g, "");
		let parsedData = JSON.parse(cleanedText);

		// 6. Mapowanie i tłumaczenie
		const items = await Promise.all(
			parsedData.map(async (item, index) => ({
				id: `item_${Date.now()}_${index}`,
				detectedCategory: await translateCategory(item.type, lang),
				colorName: await translateColor(item.main_color_name, lang),
				// ... więcej pól
			}))
		);

		// 7. Zwróć wynik
		return NextResponse.json({
			success: true,
			items,
			rawResponse: text,
		});
	} catch (error) {
		console.error("[API] Analysis error:", error);
		return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
	}
}
````

**Wywołanie**:

```tsx
// src/lib/ai/batchAnalysis.ts (linia 16-30)
const response = await fetch("/api/analyze-garments", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		base64Image: compressedImage,
		mimeType: "image/jpeg",
		lang: "pl",
	}),
});

if (!response.ok) {
	throw new Error(`API request failed with status ${response.status}`);
}

const data = await response.json();
return data.items; // Array of detected garments
```

---

## 🎯 Dobre Praktyki

### 1. **Zawsze używaj TypeScript**

```tsx
// ✅ DOBRZE - Typowane parametry
type PageProps = {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ filter?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
	const { id } = await params;
	const { filter } = await searchParams;
	// ...
}
```

### 2. **Error Handling w API Routes**

```tsx
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Walidacja
		if (!body.email) {
			return NextResponse.json({ error: "Email is required", field: "email" }, { status: 400 });
		}

		// Business logic
		const result = await processData(body);

		return NextResponse.json({ success: true, data: result });
	} catch (error) {
		console.error("[API Error]:", error);

		// Zwróć user-friendly error
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}
```

### 3. **Loading States & Suspense**

```tsx
// app/products/[id]/page.tsx
import { Suspense } from "react";

export default async function ProductPage({ params }: PageProps) {
	return (
		<Suspense fallback={<ProductSkeleton />}>
			<ProductContent params={params} />
		</Suspense>
	);
}

async function ProductContent({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const product = await fetchProduct(id);

	return <ProductDetails product={product} />;
}
```

### 4. **Prefetching z Link**

```tsx
// Next.js automatycznie prefetchuje linki w viewport
<Link href="/products" prefetch={true}>  {/* domyślnie true */}
  Products
</Link>

// Wyłącz prefetching dla rzadko używanych linków
<Link href="/archive" prefetch={false}>
  Archive
</Link>
```

### 5. **Middleware dla Autentykacji**

```tsx
// middleware.ts w root projektu
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const token = request.cookies.get("auth-token");

	// Sprawdź czy user jest zalogowany
	if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

// Określ które ścieżki mają być chronione
export const config = {
	matcher: ["/dashboard/:path*", "/profile/:path*"],
};
```

---

## 🔍 Debugging Tips

### 1. **Console Logs w API Routes**

```tsx
export async function POST(request: NextRequest) {
	console.log("[API] Received request:", {
		method: request.method,
		url: request.url,
		headers: Object.fromEntries(request.headers),
	});

	const body = await request.json();
	console.log("[API] Request body:", body);

	// ... logic

	console.log("[API] Response:", result);
	return NextResponse.json(result);
}
```

**Logi widoczne w**:

-   Development: Terminal gdzie uruchomiony jest `npm run dev`
-   Production: Vercel Logs / Server logs

### 2. **Network Tab w DevTools**

-   Otwórz Chrome DevTools → Network
-   Filtruj po "Fetch/XHR"
-   Zobacz request/response dla każdego API call

---

## 📊 Podsumowanie

| Akcja                  | Metoda                   | Kiedy używać                          |
| ---------------------- | ------------------------ | ------------------------------------- |
| Nawigacja (link)       | `<Link href="/path">`    | Statyczne linki w UI                  |
| Nawigacja (programowa) | `router.push('/path')`   | Po akcji usera (klik buttona, submit) |
| API Call               | `fetch('/api/endpoint')` | Pobranie/wysłanie danych              |
| Server Component       | `async function Page()`  | Rendering z danymi z DB               |
| Client Component       | `'use client'`           | Interaktywność, state, events         |

---

## ✅ Checklist dla Nowych Features

-   [ ] Struktura folderów odpowiada URL
-   [ ] `page.tsx` dla widoków, `route.ts` dla API
-   [ ] `'use client'` tylko gdy potrzeba interaktywności
-   [ ] `useRouter` z `next/navigation`, nie `next/router`
-   [ ] `router.push()` zamiast `window.location.href`
-   [ ] TypeScript types dla `params` i `searchParams`
-   [ ] Error handling w API routes
-   [ ] Loading states i Suspense
-   [ ] Console logs dla debugowania

---

**Autor**: GitHub Copilot  
**Data**: 2025-11-25  
**Projekt**: YourStylistApp
