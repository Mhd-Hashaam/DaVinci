export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            bookmarks: {
                Row: {
                    id: number
                    session_id: string
                    image_id: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    session_id: string
                    image_id: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    session_id?: string
                    image_id?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "bookmarks_image_id_fkey"
                        columns: ["image_id"]
                        isOneToOne: false
                        referencedRelation: "images"
                        referencedColumns: ["id"]
                    }
                ]
            }
            fitting_room_progress: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    created_at: string
                    updated_at: string
                    preview_url: string | null
                    preview_thumbnail_url: string | null
                    state: Json
                    app_version: string
                    schema_version: number
                }
                Insert: {
                    id?: string
                    user_id: string
                    title?: string
                    created_at?: string
                    updated_at?: string
                    preview_url?: string | null
                    preview_thumbnail_url?: string | null
                    state: Json
                    app_version?: string
                    schema_version?: number
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    created_at?: string
                    updated_at?: string
                    preview_url?: string | null
                    preview_thumbnail_url?: string | null
                    state?: Json
                    app_version?: string
                    schema_version?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "fitting_room_progress_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            images: {
                Row: {
                    id: string
                    session_id: string
                    url: string
                    prompt: string
                    aspect_ratio: string
                    model: string
                    metadata: Json | null
                    created_at: string
                }
                Insert: {
                    id: string
                    session_id: string
                    url: string
                    prompt: string
                    aspect_ratio: string
                    model: string
                    metadata?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    session_id?: string
                    url?: string
                    prompt?: string
                    aspect_ratio?: string
                    model?: string
                    metadata?: Json | null
                    created_at?: string
                }
                Relationships: []
            }
            orders: {
                Row: {
                    [key: string]: any
                }
                Insert: {
                    [key: string]: any
                }
                Update: {
                    [key: string]: any
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    full_name: string | null
                    bio: string | null
                    website: string | null
                    avatar_url: string | null
                    role: 'user' | 'admin'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username?: string | null
                    full_name?: string | null
                    bio?: string | null
                    website?: string | null
                    avatar_url?: string | null
                    role?: 'user' | 'admin'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string | null
                    full_name?: string | null
                    bio?: string | null
                    website?: string | null
                    avatar_url?: string | null
                    role?: 'user' | 'admin'
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            settings: {
                Row: {
                    [key: string]: any
                }
                Insert: {
                    [key: string]: any
                }
                Update: {
                    [key: string]: any
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[keyof Database]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

// Helper type for Profile rows
export type ProfileRow = Database['public']['Tables']['profiles']['Row']

// Helper type for Settings rows
export type SettingsRow = Database['public']['Tables']['settings']['Row']

// Helper types for Image table
export type ImageRow = Database['public']['Tables']['images']['Row']
export type ImageInsert = Database['public']['Tables']['images']['Insert']

// Helper types for Bookmark table
export type BookmarkRow = Database['public']['Tables']['bookmarks']['Row']
export type BookmarkInsert = Database['public']['Tables']['bookmarks']['Insert']
