"use client";

import { useState } from "react";

type LogEntry = {
  id: string;
  type: "success" | "error" | "processing";
  name: string;
  description?: string;
  error?: string;
};

export default function GenerateDescriptionsPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState({ processed: 0, total: 0 });

  const handleGenerate = async () => {
    setIsProcessing(true);
    setLogs([]);
    setProgress({ processed: 0, total: 0 });

    try {
      const response = await fetch("/api/admin/generate-descriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ garmentIds: "all", regenerate: false }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(line.substring(6));

            if (data.event === "progress") {
              setLogs((prev) => [
                ...prev,
                {
                  id: data.garment_id,
                  type: "success",
                  name: data.garment_name,
                  description: data.description,
                },
              ]);
              setProgress({ processed: data.processed, total: data.total });
            } else if (data.event === "error") {
              setLogs((prev) => [
                ...prev,
                {
                  id: data.garment_id,
                  type: "error",
                  name: data.garment_name,
                  error: data.error,
                },
              ]);
              setProgress({ processed: data.processed, total: data.total });
            } else if (data.event === "complete") {
              setProgress({ processed: data.processed, total: data.total });
            }
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const progressPercent = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            🎨 Generate AI Descriptions
          </h1>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This tool generates detailed visual descriptions for garments using Gemini AI.
              Descriptions will be used to improve outfit image generation quality.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
              <strong>⏱️ Estimated time:</strong> ~10-15 minutes for 30 garments (20s delay between each)
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isProcessing}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing... {progress.processed}/{progress.total}
              </span>
            ) : (
              "🚀 Generate All Descriptions"
            )}
          </button>

          {progress.total > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{progress.processed} / {progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {logs.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Processing Log</h2>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 max-h-96 overflow-y-auto space-y-2">
                {logs.map((log, idx) => (
                  <div
                    key={`${log.id}-${idx}`}
                    className={`p-3 rounded ${
                      log.type === "success"
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">
                        {log.type === "success" ? "✅" : "❌"}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {log.name}
                        </div>
                        {log.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {log.description}
                          </div>
                        )}
                        {log.error && (
                          <div className="text-sm text-red-600 mt-1">
                            Error: {log.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
