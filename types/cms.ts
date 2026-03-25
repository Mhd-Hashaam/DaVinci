import type { Json } from './database';

/**
 * CMS TypeScript Types
 * 
 * These mirror the Supabase CMS tables defined in add_cms_tables.sql.
 * Row = what you get from a SELECT
 * Insert = what you pass to an INSERT (optional fields have ?)
 */

// ─── Categories ──────────────────────────────────────────────

export interface CMSCategoryRow {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CMSCategoryInsert {
    id?: string;
    name: string;
    slug: string;
    icon?: string | null;
    color?: string | null;
    display_order?: number;
    is_active?: boolean;
}

// ─── Gallery ─────────────────────────────────────────────────

export interface CMSGalleryRow {
    id: string;
    storage_url: string;
    title: string | null;
    alt_text: string | null;
    aspect_ratio: string;
    is_featured: boolean;
    is_published: boolean;
    display_order: number;
    metadata: Json;
    created_at: string;
    updated_at: string;
    // Multi-category support (Flattened from junction table)
    categories: CMSCategoryRow[];
}

export interface CMSGalleryInsert {
    id?: string;
    storage_url: string;
    title?: string | null;
    alt_text?: string | null;
    category_ids?: string[];
    aspect_ratio?: string;
    is_featured?: boolean;
    is_published?: boolean;
    display_order?: number;
    variants?: Json;
    metadata?: Json;
}

// ─── Graphics (Art Wall) ─────────────────────────────────────

export interface CMSGraphicsRow {
    id: string;
    storage_url: string;
    title: string | null;
    is_published: boolean;
    display_order: number;
    metadata: Json;
    created_at: string;
    updated_at: string;
    categories: CMSCategoryRow[];
}

export interface CMSGraphicsInsert {
    id?: string;
    storage_url: string;
    title?: string | null;
    category_ids?: string[]; // New field for multi-category
    is_published?: boolean;
    display_order?: number;
    variants?: Json;
    metadata?: Json;
}

// ─── Presets ─────────────────────────────────────────────────

export interface CMSPresetsRow {
    id: string;
    name: string;
    thumbnail_url: string;
    full_image_url: string;
    category: string | null;
    is_published: boolean;
    display_order: number;
    metadata: Json;
    created_at: string;
    updated_at: string;
}

export interface CMSPresetsInsert {
    id?: string;
    name: string;
    thumbnail_url: string;
    full_image_url: string;
    category?: string | null;
    is_published?: boolean;
    display_order?: number;
    metadata?: Json;
}

// ─── Wardrobe ────────────────────────────────────────────────

export interface CMSWardrobeRow {
    id: string;
    name: string;
    thumbnail_url: string;
    model_path: string;
    brand: string | null;
    category: string | null;
    display_order: number;
    is_published: boolean;
    metadata: Json;
    created_at: string;
    updated_at: string;
}

export interface CMSWardrobeInsert {
    id?: string;
    name: string;
    thumbnail_url: string;
    model_path: string;
    brand?: string | null;
    category?: string | null;
    display_order?: number;
    is_published?: boolean;
    metadata?: Json;
}

// ─── Explore Featured ────────────────────────────────────────

export interface CMSExploreFeaturedRow {
    id: string;
    storage_url: string;
    prompt: string | null;
    model: string | null;
    aspect_ratio: string;
    display_order: number;
    is_published: boolean;
    metadata: Json;
    created_at: string;
    updated_at: string;
}

export interface CMSExploreFeaturedInsert {
    id?: string;
    storage_url: string;
    prompt?: string | null;
    model?: string | null;
    aspect_ratio?: string;
    display_order?: number;
    is_published?: boolean;
    metadata?: Json;
}

// ─── Site Content ────────────────────────────────────────────

export type CMSContentType = 'text' | 'html' | 'json';

export interface CMSSiteContentRow {
    id: string;
    page: string;
    section: string;
    key: string;
    value: string;
    content_type: CMSContentType;
    created_at: string;
    updated_at: string;
}

export interface CMSSiteContentInsert {
    id?: string;
    page: string;
    section: string;
    key: string;
    value: string;
    content_type?: CMSContentType;
}

// ─── Settings ────────────────────────────────────────────────

export interface CMSSettingsRow {
    id: string;
    key: string;
    value: string;
    description: string | null;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export interface CMSSettingsInsert {
    id?: string;
    key: string;
    value: string;
    description?: string | null;
    is_public?: boolean;
}

// ─── Audit Log ───────────────────────────────────────────────

export interface CMSAuditLogRow {
    id: number;  // BIGSERIAL
    admin_id: string | null;
    object_type: string;
    object_id: string | null;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    before_payload: Json | null;
    after_payload: Json | null;
    ip_address: string | null;
    created_at: string;
    // Joined from profiles (optional)
    profiles?: { username: string | null; avatar_url: string | null } | null;
}
