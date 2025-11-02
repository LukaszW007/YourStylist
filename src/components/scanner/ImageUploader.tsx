"use client";
import { useState } from "react";
interface ImageUploaderProps {
	onImageReady: (base64Image: string, mimeType: string) => void;
	isLoading: boolean;
}

export default function ImageUploader({ onImageReady, isLoading }: ImageUploaderProps) {
	const [file, setFile] = useState<File | null>(null);
	const buttonPlaceholder = file ? "Zmień plik (JPG/PNG, max 5MB)" : "Wybierz plik (JPG/PNG, max 5MB)";

	const [error, setError] = useState<string | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Walidacja formatu
		if (!["image/jpeg", "image/png"].includes(file.type)) {
			setError("Nieprawidłowy format pliku. Proszę wybrać plik JPG lub PNG.");
			return;
		}

		// Walidacja rozmiaru (5MB)
		if (file.size > 10 * 1024 * 1024) {
			setError("Plik jest zbyt duży. Maksymalny rozmiar to 5MB.");
			return;
		}

		setError(null);

		// Transformacja pliku do Base64
		setFile(file);
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			const base64String = (reader.result as string).split(",")[1];
			onImageReady(base64String, file.type);
		};
		reader.onerror = (error) => {
			console.error("Błąd podczas odczytu pliku:", error);
			setError("Wystąpił błąd podczas przetwarzania pliku.");
		};
	};
	return (
		<div className="space-y-2">
			<input
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				placeholder={buttonPlaceholder}
				disabled={isLoading}
			/>
			{file && <div className="text-sm opacity-70">{file.name}</div>}
			{error && <div className="text-sm text-red-500">{error}</div>}
		</div>
	);
}
