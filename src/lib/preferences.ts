import { createClient } from "@/lib/supabase/client";

// Constants for cookie names
export const COOKIE_THEME = "theme";
export const COOKIE_LOCALE = "NEXT_LOCALE";

type Preferences = {
    theme?: "light" | "dark" | "system";
    language?: string;
};

/**
 * Saves user preferences to both Supabase (if logged in) and Cookies (for SSR).
 * This ensures no flash of unstyled content/wrong language and persistent settings across devices.
 * 
 * @param preferences Object containing theme or language to update
 */
export async function savePreferences(preferences: Preferences) {
    // 1. Update Cookies (Client-side)
    // We use document.cookie for simple client-side setting. 
    // In a real production app, consider using a library like 'js-cookie' or a Server Action.
    if (preferences.theme) {
        document.cookie = `${COOKIE_THEME}=${preferences.theme}; path=/; max-age=31536000; SameSite=Lax`;
        // Also apply immediately
        if (preferences.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
    
    if (preferences.language) {
        document.cookie = `${COOKIE_LOCALE}=${preferences.language}; path=/; max-age=31536000; SameSite=Lax`;
    }

    // 2. Update Supabase (Async, "Fire and Forget")
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Check if row exists first or just upsert?
            // "user_preferences" table usually has user_id as PK or Unique.
            
            // We need to map our simple keys to the DB schema
            const updates: any = {};
            if (preferences.theme) updates.theme = preferences.theme;
            if (preferences.language) updates.language = preferences.language;
            updates.updated_at = new Date().toISOString();

            // Perform UPSERT
            // Assuming 'user_id' is the unique constrained column
            const { error } = await supabase
                .from("user_preferences")
                .upsert({ 
                    user_id: user.id, 
                    ...updates 
                }, { onConflict: 'user_id' });

            if (error) {
                console.error("Failed to sync preferences to Supabase:", error);
            }
        }
    } catch (err) {
        console.error("Error saving preferences:", err);
    }
}

/**
 * Loads preferences from Supabase and syncs to cookies.
 * Should be called on Auth State Change (Login).
 */
export async function syncPreferencesOnLogin(userId: string) {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("user_preferences")
            .select("theme, language")
            .eq("user_id", userId)
            .single();

        if (data && !error) {
            if (data.theme) {
                document.cookie = `${COOKIE_THEME}=${data.theme}; path=/; max-age=31536000; SameSite=Lax`;
                if (data.theme === 'dark') document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
            }
            if (data.language) {
                document.cookie = `${COOKIE_LOCALE}=${data.language}; path=/; max-age=31536000; SameSite=Lax`;
                // Note: Changing language cookie usually requires a reload or router push to take effect in Next.js
            }
        }
    } catch (err) {
        console.error("Error syncing on login:", err);
    }
}
