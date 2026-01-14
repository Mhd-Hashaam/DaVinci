/**
 * Database type definitions for Supabase
 * Auto-generated schema types for type-safe queries
 */

export interface Database {
    public: {
        Tables: {
            // Generated Images Table
            images: {
                Row: {
                    id: string;
                    created_at: string;
                    user_id: string | null;
                    session_id: string;
                    url: string;
                    prompt: string;
                    aspect_ratio: string;
                    model: string;
                    style: string | null;
                    metadata: Record<string, unknown> | null;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    user_id?: string | null;
                    session_id: string;
                    url: string;
                    prompt: string;
                    aspect_ratio: string;
                    model: string;
                    style?: string | null;
                    metadata?: Record<string, unknown> | null;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    user_id?: string | null;
                    session_id?: string;
                    url?: string;
                    prompt?: string;
                    aspect_ratio?: string;
                    model?: string;
                    style?: string | null;
                    metadata?: Record<string, unknown> | null;
                };
            };

            // User Profiles Table
            profiles: {
                Row: {
                    id: string;
                    username: string | null;
                    full_name: string | null;
                    avatar_url: string | null;
                    website: string | null;
                    bio: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    username?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    website?: string | null;
                    bio?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    username?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    website?: string | null;
                    bio?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };

            // Bookmarks Table
            bookmarks: {
                Row: {
                    id: string;
                    created_at: string;
                    user_id: string | null;
                    session_id: string;
                    image_id: string;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    user_id?: string | null;
                    session_id: string;
                    image_id: string;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    user_id?: string | null;
                    session_id?: string;
                    image_id?: string;
                };
            };

            // User Settings Table
            settings: {
                Row: {
                    id: string;
                    created_at: string;
                    user_id: string | null;
                    session_id: string;
                    model: string;
                    style: string;
                    aspect_ratio: string;
                    generation_count: number;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    user_id?: string | null;
                    session_id: string;
                    model?: string;
                    style?: string;
                    aspect_ratio?: string;
                    generation_count?: number;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    user_id?: string | null;
                    session_id?: string;
                    model?: string;
                    style?: string;
                    aspect_ratio?: string;
                    generation_count?: number;
                };
            };

            // Orders Table
            orders: {
                Row: {
                    id: string;
                    created_at: string;
                    user_id: string | null;
                    session_id: string;
                    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
                    image_id: string;
                    mockup_type: string;
                    size: string;
                    color: string;
                    quantity: number;
                    unit_price: number;
                    total_price: number;
                    metadata: Record<string, unknown> | null;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    user_id?: string | null;
                    session_id: string;
                    status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
                    image_id: string;
                    mockup_type: string;
                    size: string;
                    color: string;
                    quantity: number;
                    unit_price: number;
                    total_price: number;
                    metadata?: Record<string, unknown> | null;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    user_id?: string | null;
                    session_id?: string;
                    status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
                    image_id?: string;
                    mockup_type?: string;
                    size?: string;
                    color?: string;
                    quantity?: number;
                    unit_price?: number;
                    total_price?: number;
                    metadata?: Record<string, unknown> | null;
                };
            };
        };
        Views: {};
        Functions: {};
        Enums: {};
    };
}

// Convenience types
export type ImageRow = Database['public']['Tables']['images']['Row'];
export type ImageInsert = Database['public']['Tables']['images']['Insert'];
export type BookmarkRow = Database['public']['Tables']['bookmarks']['Row'];
export type SettingsRow = Database['public']['Tables']['settings']['Row'];
export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderStatus = OrderRow['status'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
