# Gemini AI SDK Migration Guide

## Migration from `@google/generative-ai` to `@google/genai`

**Date:** November 9, 2025  
**Reason:** The old `@google/generative-ai` package is deprecated. Google DeepMind released the new `@google/genai` SDK with improved API design and support for Gemini 2.0+ features.

---

## Changes Made

### 1. Package Installation

**Old:**

```bash
npm install @google/generative-ai
```

**New:**

```bash
npm uninstall @google/generative-ai
npm install @google/genai
```

### 2. Import Statement

**Old:**

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
```

**New:**

```typescript
import { GoogleGenAI } from "@google/genai";
```

### 3. Client Initialization

**Old:**

```typescript
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
```

**New:**

```typescript
const genAI = new GoogleGenAI({
	apiKey: GEMINI_API_KEY,
	apiVersion: "v1", // Use stable v1 API instead of beta
});
```

### 4. Model Selection & API Call

**Old:**

```typescript
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const result = await model.generateContent([
	{
		inlineData: {
			mimeType,
			data: base64Image,
		},
	},
	{ text: SYSTEM_PROMPT },
]);

const response = await result.response;
const text = response.text();
```

**New:**

```typescript
const response = await genAI.models.generateContent({
	model: "gemini-2.5-flash-lite",
	contents: [
		{
			role: "user",
			parts: [{ inlineData: { mimeType, data: base64Image } }, { text: SYSTEM_PROMPT }],
		},
	],
});

const text = response.text ?? ""; // text is now a getter, not a method
```

### 5. Response Text Extraction with Fallback

The new SDK provides `response.text` as a convenient getter, but we added a fallback to manually parse `response.candidates` in case it's empty:

```typescript
let text = response.text ?? "";

// Fallback: parse candidates if text is empty
if (!text && response.candidates?.[0]?.content?.parts) {
	const parts = response.candidates[0].content.parts;
	text = parts.map((p: { text?: string }) => p.text || "").join("");
	console.log("[API] Extracted text from response.candidates[0].content.parts");
}

if (!text) {
	return NextResponse.json({ error: "Empty response from Gemini AI" }, { status: 500 });
}
```

### 6. Error Handling

Added precise error handling for API errors with status codes:

```typescript
catch (error) {
  console.error("[API] Analysis error:", error);

  // Check if error has status property (ApiError from @google/genai)
  if (error && typeof error === "object" && "status" in error) {
    const apiError = error as { status?: number; message?: string };
    return NextResponse.json(
      {
        error: apiError.message || "Gemini API error",
        status: apiError.status,
      },
      { status: apiError.status || 500 }
    );
  }

  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    },
    { status: 500 }
  );
}
```

### 7. Streaming Support (New Feature)

Created a new streaming endpoint at `/api/analyze-garments-stream` using Server-Sent Events:

```typescript
const responseStream = await genAI.models.generateContentStream({
	model: "gemini-2.5-flash-lite",
	contents: [
		{
			role: "user",
			parts: [{ inlineData: { mimeType, data: base64Image } }, { text: SYSTEM_PROMPT }],
		},
	],
});

let fullText = "";

for await (const chunk of responseStream) {
	const chunkText = chunk.text ?? "";
	fullText += chunkText;

	// Send progress update via SSE
	const data = JSON.stringify({
		type: "chunk",
		text: chunkText,
		progress: fullText.length,
	});
	controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
}
```

---

## Model Upgrades

| Old Model          | New Model               | Notes                                 |
| ------------------ | ----------------------- | ------------------------------------- |
| `gemini-1.5-flash` | `gemini-2.5-flash-lite` | Faster, optimized for quick responses |
| `gemini-1.5-pro`   | `gemini-2.5-pro`        | More capable, higher quality          |

**Current configuration:** Using `gemini-2.5-flash-lite` for fast clothing analysis.

---

## API Endpoints

### Non-Streaming (Original)

**Endpoint:** `/api/analyze-garments`  
**Method:** POST  
**Body:**

```json
{
	"base64Image": "...",
	"mimeType": "image/jpeg",
	"lang": "pl"
}
```

**Response:**

```json
{
  "success": true,
  "items": [...],
  "rawResponse": "..."
}
```

### Streaming (New)

**Endpoint:** `/api/analyze-garments-stream`  
**Method:** POST  
**Body:** Same as non-streaming  
**Response:** Server-Sent Events stream with progress updates

**Event types:**

-   `chunk`: Progressive text chunks
-   `complete`: Final parsed items
-   `error`: Error occurred

---

## Testing

To test the API endpoint:

```bash
# Start dev server
npm run dev

# Test with curl (replace with actual base64 image)
curl -X POST http://localhost:3000/api/analyze-garments \
  -H "Content-Type: application/json" \
  -d '{"base64Image":"...","mimeType":"image/jpeg","lang":"pl"}'
```

---

## Benefits of New SDK

1. ✅ **Official SDK** - Google DeepMind's canonical SDK for Gemini 2.0+
2. ✅ **Better TypeScript support** - Improved type definitions
3. ✅ **Stable API** - v1 endpoints instead of beta
4. ✅ **Streaming support** - Built-in streaming with `generateContentStream`
5. ✅ **Unified API** - Works with both Gemini Developer API and Vertex AI
6. ✅ **Future-proof** - Will receive Gemini 2.0+ feature updates

---

## Files Modified

-   ✅ `src/app/api/analyze-garments/route.ts` - Updated to new SDK
-   ✅ `src/app/api/analyze-garments-stream/route.ts` - New streaming endpoint
-   ✅ `package.json` - Replaced `@google/generative-ai` with `@google/genai`

---

## References

-   [Official Documentation](https://googleapis.github.io/js-genai/release_docs/index.html)
-   [GitHub Repository](https://github.com/googleapis/js-genai)
-   [Migration Guide](https://googleapis.github.io/js-genai/)
