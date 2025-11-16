/**
 * Image processing utilities for browser environments
 */

export interface ImageCompressionOptions {
	maxWidth?: number;
	maxHeight?: number;
	quality?: number; // 0.0 to 1.0
	maxSizeMB?: number;
}

export interface CompressedImage {
	base64: string; // Without data URL prefix
	mimeType: string;
	originalSize: number; // bytes
	compressedSize: number; // bytes
	compressionRatio: number; // percentage
}

/**
 * Compresses and downscales an image file for optimal Gemini API usage
 *
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed image data ready for Gemini API
 */
export async function compressImageForAI(file: File, options: ImageCompressionOptions = {}): Promise<CompressedImage> {
	const {
		maxWidth = 1024,
		maxHeight = 1024,
		quality = 0.85,
		maxSizeMB = 4, // Leave 1MB buffer under 5MB limit
	} = options;

	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			const img = new Image();

			img.onload = () => {
				try {
					// Calculate new dimensions while maintaining aspect ratio
					let { width, height } = img;

					if (width > maxWidth || height > maxHeight) {
						const aspectRatio = width / height;

						if (width > height) {
							width = maxWidth;
							height = Math.round(width / aspectRatio);
						} else {
							height = maxHeight;
							width = Math.round(height * aspectRatio);
						}
					}

					// Create canvas for resizing
					const canvas = document.createElement("canvas");
					canvas.width = width;
					canvas.height = height;

					const ctx = canvas.getContext("2d");
					if (!ctx) {
						reject(new Error("Failed to get canvas context"));
						return;
					}

					// Draw resized image with high quality
					ctx.imageSmoothingEnabled = true;
					ctx.imageSmoothingQuality = "high";
					ctx.drawImage(img, 0, 0, width, height);

					// Convert to desired format
					const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
					let dataUrl = canvas.toDataURL(mimeType, quality);
					let currentQuality = quality;

					// If still too large, progressively reduce quality
					const maxSizeBytes = maxSizeMB * 1024 * 1024;
					while (dataUrl.length > maxSizeBytes && currentQuality > 0.1) {
						currentQuality -= 0.1;
						dataUrl = canvas.toDataURL(mimeType, currentQuality);
					}

					// Extract base64 without prefix
					const base64 = dataUrl.split(",")[1];
					const compressedSize = Math.round((base64.length * 3) / 4); // Approximate byte size
					const originalSize = file.size;

					resolve({
						base64,
						mimeType,
						originalSize,
						compressedSize,
						compressionRatio: Math.round(((originalSize - compressedSize) / originalSize) * 100),
					});
				} catch (error) {
					reject(error);
				}
			};

			img.onerror = () => {
				reject(new Error("Failed to load image"));
			};

			img.src = e.target?.result as string;
		};

		reader.onerror = () => {
			reject(new Error("Failed to read file"));
		};

		reader.readAsDataURL(file);
	});
}

/**
 * Validates if a file is a supported image format
 */
export function isValidImageFile(file: File): boolean {
	const supportedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
	return supportedTypes.includes(file.type);
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
