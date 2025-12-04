/**
 * Image compression utilities for Supabase storage
 * Implements aggressive compression similar to TinyPNG algorithm
 * Target: max 0.5MB per image to optimize free tier storage
 */

export interface StorageCompressionOptions {
	maxWidth?: number;
	maxHeight?: number;
	targetSizeMB?: number;
	minQuality?: number;
	initialQuality?: number;
}

export interface CompressedStorageImage {
	blob: Blob;
	dataUrl: string;
	originalSize: number;
	compressedSize: number;
	compressionRatio: number;
	finalQuality: number;
	dimensions: { width: number; height: number };
}

/**
 * Compress image for Supabase storage with TinyPNG-like algorithm
 * Uses progressive quality reduction with smart dimension scaling
 *
 * Algorithm steps:
 * 1. Smart resize maintaining aspect ratio (max 1920px)
 * 2. Progressive JPEG/WebP quality reduction (0.85 → 0.40)
 * 3. Fallback dimension reduction if still over target
 * 4. Final pass with ultra-low quality if needed
 *
 * @param file - Original image file
 * @param options - Compression options
 * @returns Compressed image ready for storage
 */
export async function compressImageForStorage(file: File, options: StorageCompressionOptions = {}): Promise<CompressedStorageImage> {
	const { maxWidth = 1920, maxHeight = 1920, targetSizeMB = 0.5, minQuality = 0.4, initialQuality = 0.85 } = options;

	const targetSizeBytes = targetSizeMB * 1024 * 1024;

	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = async (e) => {
			const img = new Image();

			img.onload = async () => {
				try {
					// Step 1: Calculate optimal dimensions (TinyPNG smart resize)
					let { width, height } = img;

					// First resize: maintain aspect ratio, cap at max dimensions
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

					// Create canvas
					const canvas = document.createElement("canvas");
					canvas.width = width;
					canvas.height = height;

					const ctx = canvas.getContext("2d", {
						alpha: false, // Disable alpha for JPEG optimization
						willReadFrequently: false,
					});

					if (!ctx) {
						reject(new Error("Failed to get canvas context"));
						return;
					}

					// Draw with high-quality downsampling
					ctx.imageSmoothingEnabled = true;
					ctx.imageSmoothingQuality = "high";
					ctx.drawImage(img, 0, 0, width, height);

					// Step 2: Progressive quality reduction (TinyPNG-like)
					// Convert to WebP if supported, otherwise JPEG
					const mimeType = "image/jpeg"; // Use JPEG for better compression
					let currentQuality = initialQuality;
					let blob: Blob | null = null;
					let attempts = 0;
					const maxAttempts = 20;

					// Progressive quality reduction in steps
					while (attempts < maxAttempts) {
						blob = await new Promise<Blob | null>((res) => {
							canvas.toBlob((b) => res(b), mimeType, currentQuality);
						});

						if (!blob) {
							reject(new Error("Failed to create blob"));
							return;
						}

						// Check if we reached target size
						if (blob.size <= targetSizeBytes || currentQuality <= minQuality) {
							break;
						}

						// Reduce quality by 0.05 each iteration (similar to TinyPNG)
						currentQuality = Math.max(minQuality, currentQuality - 0.05);
						attempts++;
					}

					// Step 3: If still too large, reduce dimensions further
					if (blob && blob.size > targetSizeBytes && width > 800) {
						// Reduce dimensions by 20% and try again
						width = Math.round(width * 0.8);
						height = Math.round(height * 0.8);

						canvas.width = width;
						canvas.height = height;
						ctx.imageSmoothingEnabled = true;
						ctx.imageSmoothingQuality = "high";
						ctx.drawImage(img, 0, 0, width, height);

						// Try again with reduced dimensions at min quality
						blob = await new Promise<Blob | null>((res) => {
							canvas.toBlob((b) => res(b), mimeType, minQuality);
						});
					}

					if (!blob) {
						reject(new Error("Failed to compress image"));
						return;
					}

					// Create data URL for preview
					const dataUrl = await new Promise<string>((res, rej) => {
						const reader = new FileReader();
						reader.onloadend = () => res(reader.result as string);
						reader.onerror = rej;
						reader.readAsDataURL(blob);
					});

					const compressedSize = blob.size;
					const originalSize = file.size;

					resolve({
						blob,
						dataUrl,
						originalSize,
						compressedSize,
						compressionRatio: Math.round(((originalSize - compressedSize) / originalSize) * 100),
						finalQuality: currentQuality,
						dimensions: { width, height },
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
 * Batch compress multiple images for storage
 * Useful for multi-garment scanning
 */
export async function compressImagesForStorage(
	files: File[],
	options?: StorageCompressionOptions,
	onProgress?: (current: number, total: number) => void
): Promise<CompressedStorageImage[]> {
	const results: CompressedStorageImage[] = [];

	for (let i = 0; i < files.length; i++) {
		if (onProgress) {
			onProgress(i + 1, files.length);
		}

		const compressed = await compressImageForStorage(files[i], options);
		results.push(compressed);
	}

	return results;
}

/**
 * Convert compressed image to File object for upload
 */
export function compressedImageToFile(compressed: CompressedStorageImage, filename: string): File {
	return new File([compressed.blob], filename, {
		type: compressed.blob.type,
		lastModified: Date.now(),
	});
}

/**
 * Get compression statistics for display
 */
export function getCompressionStats(compressed: CompressedStorageImage): string {
	const { originalSize, compressedSize, compressionRatio, finalQuality, dimensions } = compressed;

	const formatBytes = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	};

	return `Original: ${formatBytes(originalSize)} → Compressed: ${formatBytes(compressedSize)} (${compressionRatio}% saved) | Quality: ${(
		finalQuality * 100
	).toFixed(0)}% | Size: ${dimensions.width}×${dimensions.height}`;
}
