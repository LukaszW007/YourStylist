/**
 * Database type definitions for Supabase
 * Generate this automatically using: npx supabase gen types typescript --project-id <your-project-id>
 *
 * For now, using manual types based on the schema
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			user_profiles: {
				Row: {
					id: string;
					display_name: string | null;
					avatar_url: string | null;
					member_since: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					display_name?: string | null;
					avatar_url?: string | null;
					member_since?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					display_name?: string | null;
					avatar_url?: string | null;
					member_since?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			user_preferences: {
				Row: {
					id: string;
					user_id: string;
					language: string;
					theme: string;
					email_notifications: boolean;
					push_notifications: boolean;
					weather_location: string | null;
					weather_location_lat: number | null;
					weather_location_lng: number | null;
					subscription_plan: string;
					subscription_expires_at: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					language?: string;
					theme?: string;
					email_notifications?: boolean;
					push_notifications?: boolean;
					weather_location?: string | null;
					weather_location_lat?: number | null;
					weather_location_lng?: number | null;
					subscription_plan?: string;
					subscription_expires_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					language?: string;
					theme?: string;
					email_notifications?: boolean;
					push_notifications?: boolean;
					weather_location?: string | null;
					weather_location_lat?: number | null;
					weather_location_lng?: number | null;
					subscription_plan?: string;
					subscription_expires_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			garments: {
				Row: {
					id: string;
					user_id: string;
					full_name: string;
					category: string;
					subcategory: string | null;
					brand: string | null;
					style_context: string[] | null;
					main_color_name: string | null;
					main_color_hex: string | null;
					color_temperature: string | null;
					secondary_colors: { name?: string; hex?: string }[] | null;
					pattern: string | null;
					key_features: string[] | null;
					material: string[] | null;
					description: string | null;
					season: string[] | null;
					size: string | null;
					image_url: string | null;
					image_storage_path: string | null;
					purchase_date: string | null;
					purchase_price: number | null;
					purchase_location: string | null;
					last_worn_date: string | null;
					last_laundered_date: string | null;
					wear_count: number;
					favorite: boolean;
					notes: string | null;
					tags: string[] | null;
					comfort_min_c: number | null;
					comfort_max_c: number | null;
					thermal_profile: string | null;
					fabric_weave: string | null;
					layer_type: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					category: string;
					subcategory?: string | null;
					brand?: string | null;
					style_context?: string[] | null;
					main_color_name?: string | null;
					main_color_hex?: string | null;
					color_temperature?: string | null;
					secondary_colors?: { name?: string; hex?: string }[] | null;
					pattern?: string | null;
					key_features?: string[] | null;
					material?: string[] | null;
					description?: string | null;
					season?: string[] | null;
					size?: string | null;
					image_url?: string | null;
					image_storage_path?: string | null;
					purchase_date?: string | null;
					purchase_price?: number | null;
					purchase_location?: string | null;
					last_worn_date?: string | null;
					last_laundered_date?: string | null;
					wear_count?: number;
					favorite?: boolean;
					notes?: string | null;
					tags?: string[] | null;
					comfort_min_c?: number | null;
					comfort_max_c?: number | null;
					thermal_profile?: string | null;
					fabric_weave?: string | null;
					layer_type?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					name?: string;
					category?: string;
					subcategory?: string | null;
					brand?: string | null;
					style_context?: string[] | null;
					main_color_name?: string | null;
					main_color_hex?: string | null;
					color_temperature?: string | null;
					secondary_colors?: { name?: string; hex?: string }[] | null;
					pattern?: string | null;
					key_features?: string[] | null;
					material?: string[] | null;
					description?: string | null;
					season?: string[] | null;
					size?: string | null;
					image_url?: string | null;
					image_storage_path?: string | null;
					purchase_date?: string | null;
					purchase_price?: number | null;
					purchase_location?: string | null;
					last_worn_date?: string | null;
					last_laundered_date?: string | null;
					wear_count?: number;
					favorite?: boolean;
					notes?: string | null;
					tags?: string[] | null;
					comfort_min_c?: number | null;
					comfort_max_c?: number | null;
					thermal_profile?: string | null;
					fabric_weave?: string | null;
					layer_type?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			outfits: {
				Row: {
					id: string;
					user_id: string;
					name: string;
					description: string | null;
					occasion: string | null;
					season: string | null;
					weather_condition: string | null;
					rating: number | null;
					notes: string | null;
					image_url: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					description?: string | null;
					occasion?: string | null;
					season?: string | null;
					weather_condition?: string | null;
					rating?: number | null;
					notes?: string | null;
					image_url?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					name?: string;
					description?: string | null;
					occasion?: string | null;
					season?: string | null;
					weather_condition?: string | null;
					rating?: number | null;
					notes?: string | null;
					image_url?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			outfit_plans: {
				Row: {
					id: string;
					user_id: string;
					outfit_id: string;
					planned_date: string;
					notes: string | null;
					completed: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					outfit_id: string;
					planned_date: string;
					notes?: string | null;
					completed?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					outfit_id?: string;
					planned_date?: string;
					notes?: string | null;
					completed?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
		};
	};
}
