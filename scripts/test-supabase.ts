/**
 * Test script to verify Supabase garments table access
 * Run with: npm run test-supabase
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	console.error("❌ Missing Supabase environment variables!");
	console.log("Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY");
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabaseConnection() {
	console.log("🔍 Testing Supabase connection...\n");

	try {
		// Test 1: Check if we can connect
		console.log("1️⃣ Testing connection...");
		const { data: testData, error: testError } = await supabase.from("garments").select("count");

		if (testError) {
			if (testError.code === "PGRST205") {
				console.error("❌ Table 'garments' not found in schema cache");
				console.log("\n📋 Possible solutions:");
				console.log("1. Go to Supabase Dashboard → SQL Editor");
				console.log("2. Run: NOTIFY pgrst, 'reload schema';");
				console.log("3. Or follow steps in SUPABASE_GARMENTS_FIX.md");
				return false;
			} else if (testError.code === "42P01") {
				console.error("❌ Table 'garments' does not exist");
				console.log("\n📋 Solution: Run the migration in Supabase Dashboard");
				console.log("See: supabase/migrations/001_initial_schema.sql");
				return false;
			} else {
				console.error("❌ Error:", testError.message);
				console.log("Code:", testError.code);
				console.log("Details:", testError.details);
				return false;
			}
		}

		console.log("✅ Connection successful!");
		console.log(`   Found ${testData?.[0]?.count ?? 0} garments in table\n`);

		// Test 2: Check table structure
		console.log("2️⃣ Checking table structure...");
		const { error: structureError } = await supabase.from("garments").select("*").limit(1);

		if (structureError) {
			console.error("❌ Error checking structure:", structureError.message);
			return false;
		}

		console.log("✅ Table structure looks good!\n");

		// Test 3: Try to insert a test record (requires authentication)
		console.log("3️⃣ Testing authentication...");
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			console.warn("⚠️  No authenticated user (this is OK for initial setup)");
			console.log("   Sign in through the app to test full functionality\n");
		} else {
			console.log("✅ User authenticated:", user.email);

			// Test insert
			console.log("\n4️⃣ Testing insert...");
			const { error: insertError } = await supabase.from("garments").insert({
				user_id: user.id,
				name: "Test Garment",
				category: "tops",
				color: "Blue",
				image_url: "https://example.com/test.jpg",
			});

			if (insertError) {
				console.error("❌ Insert failed:", insertError.message);
				if (insertError.code === "42501") {
					console.log("   This might be an RLS policy issue");
					console.log("   Check RLS policies in Supabase Dashboard");
				}
				return false;
			}

			console.log("✅ Test insert successful!");

			// Clean up test data
			const { error: deleteError } = await supabase.from("garments").delete().eq("name", "Test Garment").eq("user_id", user.id);

			if (deleteError) {
				console.warn("⚠️  Could not delete test garment:", deleteError.message);
			} else {
				console.log("✅ Test cleanup successful\n");
			}
		}

		// Test 4: Check RLS policies
		console.log("5️⃣ RLS Status:");
		const { data: rlsData, error: rlsError } = await supabase.rpc("check_table_rls", { table_name: "garments" }).single();

		if (rlsError) {
			console.warn("⚠️  Could not check RLS status (this is OK)");
		} else {
			console.log("   RLS enabled:", rlsData);
		}

		console.log("\n✅ All tests passed!");
		return true;
	} catch (error) {
		console.error("\n❌ Unexpected error:", error);
		return false;
	}
}

// Run tests
testSupabaseConnection()
	.then((success) => {
		if (success) {
			console.log("\n🎉 Supabase setup is working correctly!");
		} else {
			console.log("\n⚠️  Some issues detected. See SUPABASE_GARMENTS_FIX.md for solutions.");
		}
		process.exit(success ? 0 : 1);
	})
	.catch((error) => {
		console.error("\n💥 Fatal error:", error);
		process.exit(1);
	});
