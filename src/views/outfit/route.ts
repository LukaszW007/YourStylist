import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import sharp from "sharp";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: NextRequest) {
	try {
		const formData = await req.formData();
		const file = formData.get("image") as File;

		if (!file) {
			return NextResponse.json({ error: "No image provided" }, { status: 400 });
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// 1. Initialize Gemini Model
		// Using gemini-1.5-flash for speed and vision capabilities
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

		const prompt = `
      Analyze this image and identify all individual clothing garments.
      For each garment, provide the following details in a JSON array:
      - name: A descriptive name (e.g., "Blue Denim Jacket")
      - category: Top, Bottom, Shoes, Outerwear, or Accessory
      - subcategory: Specific type (e.g., Jeans, T-Shirt, Sneakers)
      - color: Primary color
      - bounding_box: The bounding box of the item as [ymin, xmin, ymax, xmax] with coordinates normalized to 1000 (0-1000 scale).
      
      Return ONLY the JSON array without markdown formatting.
    `;

		// 2. Generate Content
		const result = await model.generateContent([
			prompt,
			{
				inlineData: {
					data: buffer.toString("base64"),
					mimeType: file.type,
				},
			},
		]);

		const response = await result.response;
		const text = response.text();

		// Clean up markdown code blocks if present
		const jsonStr = text
			.replace(/```json/g, "")
			.replace(/```/g, "")
			.trim();
		let detectedItems: any[] = [];

		try {
			detectedItems = JSON.parse(jsonStr);
		} catch (e) {
			console.error("Failed to parse Gemini response:", text);
			return NextResponse.json({ error: "Failed to parse analysis results" }, { status: 500 });
		}

		// 3. Process Images with Sharp (Cropping)
		const image = sharp(buffer);
		const metadata = await image.metadata();
		const imgWidth = metadata.width || 0;
		const imgHeight = metadata.height || 0;

		const processedItems = await Promise.all(
			detectedItems.map(async (item) => {
				// If no box or invalid dimensions, return item without image
				if (!item.bounding_box || !Array.isArray(item.bounding_box) || imgWidth === 0 || imgHeight === 0) {
					return { ...item, cropped_image_url: null };
				}

				const [ymin, xmin, ymax, xmax] = item.bounding_box;

				// Convert normalized (0-1000) to pixels
				let top = Math.floor((ymin / 1000) * imgHeight);
				let left = Math.floor((xmin / 1000) * imgWidth);
				let height = Math.floor(((ymax - ymin) / 1000) * imgHeight);
				let width = Math.floor(((xmax - xmin) / 1000) * imgWidth);

				// Add 5% padding to ensure we don't cut off edges
				const padY = Math.floor(height * 0.05);
				const padX = Math.floor(width * 0.05);

				// Adjust coordinates with padding, ensuring we stay within bounds
				top = Math.max(0, top - padY);
				left = Math.max(0, left - padX);
				height = Math.min(imgHeight - top, height + padY * 2);
				width = Math.min(imgWidth - left, width + padX * 2);

				try {
					const cropBuffer = await image
						.clone()
						.extract({ left, top, width, height })
						.resize(800, 800, { fit: "inside" }) // Zmniejsz do rozsądnego rozmiaru
						.toFormat("png", { quality: 80 }) // Kompresja PNG
						.toBuffer();

					const base64Image = `data:image/png;base64,${cropBuffer.toString("base64")}`;

					if (uploadError) throw uploadError;

					const {
						data: { publicUrl },
					} = supabase.storage.from("garments").getPublicUrl(fileName);

					return {
						...item,
						base64_image: base64Image,
					};
				} catch (cropError) {
					console.error("Error cropping item:", item.name, cropError);
					return { ...item, base64_image: null };
				}
			})
		);

		return NextResponse.json({ garments: processedItems });
	} catch (error) {
		console.error("Analysis failed:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
