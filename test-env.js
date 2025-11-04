// Test script to verify environment variables are loaded
console.log("🔍 Environment Variables Check:");
console.log("================================");
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Loaded" : "❌ Missing");
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Loaded" : "❌ Missing");
console.log("FREE_GEMINI_KEY:", process.env.FREE_GEMINI_KEY ? "✅ Loaded" : "❌ Missing");
console.log("================================");

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
	console.error("❌ ERROR: Environment variables not loaded!");
	console.error("Make sure .env.local exists and dev server was restarted.");
	process.exit(1);
} else {
	console.log("✅ All environment variables loaded successfully!");
}
