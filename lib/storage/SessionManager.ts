import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { ImageInsert, SettingsRow } from '@/types/database';
import type { GeneratedImage } from '@/types';

// Generate a unique session ID if not exists
function getSessionId(): string {
    if (typeof window === 'undefined') return 'server';

    let sessionId = localStorage.getItem('davinci_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('davinci_session_id', sessionId);
    }
    return sessionId;
}

/**
 * SessionManager - Handles persistence with Supabase
 * Manages images, bookmarks, and settings sync
 */
export class SessionManager {
    private sessionId: string;
    private autoSaveInterval: ReturnType<typeof setInterval> | null = null;

    constructor() {
        this.sessionId = getSessionId();
    }

    get session(): string {
        return this.sessionId;
    }

    // ============== IMAGES ==============

    /**
     * Save a generated image to Supabase
     */
    async saveImage(image: GeneratedImage): Promise<void> {
        if (!isSupabaseConfigured()) {
            console.warn('Supabase not configured, skipping save');
            return;
        }

        const { error } = await (supabase as any).from('images').insert({
            id: image.id,
            session_id: this.sessionId,
            url: image.url,
            prompt: image.prompt,
            aspect_ratio: image.aspectRatio,
            model: image.model || 'unknown',
            metadata: { timestamp: image.timestamp },
        } as ImageInsert);

        if (error) {
            console.error('Failed to save image:', error.message, error.details || '', error.hint || '');
        }
    }

    /**
     * Load all images for current session
     */
    async loadImages(): Promise<GeneratedImage[]> {
        if (!isSupabaseConfigured()) return [];

        const { data, error } = await (supabase
            .from('images')
            .select('*')
            .eq('session_id', this.sessionId)
            .order('created_at', { ascending: false })) as any;

        if (error) {
            console.error('Failed to load images:', error.message, error.details || '', error.hint || '');
            return [];
        }

        return (data || []).map((row: any) => ({
            id: row.id,
            url: row.url,
            prompt: row.prompt,
            aspectRatio: row.aspect_ratio as any,
            model: row.model,
            timestamp: new Date(row.created_at).getTime(),
        }));
    }

    /**
     * Delete an image
     */
    async deleteImage(imageId: string): Promise<void> {
        if (!isSupabaseConfigured()) return;

        const { error } = await (supabase
            .from('images')
            .delete()
            .eq('id', imageId)
            .eq('session_id', this.sessionId)) as any;

        if (error) {
            console.error('Failed to delete image:', error.message, error.details || '', error.hint || '');
        }
    }

    // ============== BOOKMARKS ==============

    /**
     * Toggle bookmark for an image
     */
    /**
     * Toggle bookmark for an image
     * If fallbackImage is provided, it handles cases where the image might not exist in the DB yet
     */
    async toggleBookmark(imageId: string, fallbackImage?: GeneratedImage): Promise<boolean> {
        if (!isSupabaseConfigured()) return false;

        // Check if already bookmarked
        const { data: existing } = await (supabase
            .from('bookmarks')
            .select('id')
            .eq('session_id', this.sessionId)
            .eq('image_id', imageId)
            .single()) as any;

        if (existing) {
            // Remove bookmark
            await (supabase.from('bookmarks').delete().eq('id', existing.id)) as any;
            return false;
        } else {
            // IF fallbackImage is provided, try to ensure the image exists first
            if (fallbackImage) {
                // We use upsert to be safe, though technically we just need to ensure it's there.
                // We MUST save it associated with the current session so the user "owns" it in their DB view if needed,
                // OR we rely on the fact that 'images' table holds all images.
                // For static gallery images, they might have random UUIDs.
                // Let's insert it if it doesn't exist.
                const { error: imageError } = await (supabase as any).from('images').upsert({
                    id: fallbackImage.id,
                    session_id: this.sessionId, // Associate with current user/session
                    url: fallbackImage.url,
                    prompt: fallbackImage.prompt,
                    aspect_ratio: fallbackImage.aspectRatio,
                    model: fallbackImage.model || 'gallery',
                    metadata: { timestamp: fallbackImage.timestamp },
                }, { onConflict: 'id', ignoreDuplicates: true });

                if (imageError) {
                    console.error('Failed to ensure gallery image existence:', imageError.message);
                    // Proceeding might fail FK, but we try anyway
                }
            }

            // Add bookmark with error handling
            const { error: insertError } = await (supabase as any).from('bookmarks').insert({
                session_id: this.sessionId,
                image_id: imageId,
            }) as any;

            if (insertError) {
                if (!insertError.message?.includes('Failed to fetch')) {
                    console.error('Failed to add bookmark:', insertError.message);
                }
                return false;
            }
            return true;
        }
    }

    /**
     * Load all bookmarked images
     */
    async loadBookmarks(): Promise<GeneratedImage[]> {
        if (!isSupabaseConfigured()) return [];

        const { data, error } = await (supabase
            .from('bookmarks')
            .select('image_id, images(*)')
            .eq('session_id', this.sessionId)) as any;

        if (error) {
            // If the error is regarding the join (e.g. foreign key issue or confusing Permissions), we note it
            console.error('Failed to load bookmarks:', error.message, error.details || '', error.hint || '');
            return [];
        }

        return (data || [])
            .filter((row: any) => row.images)
            .map((row: any) => {
                const img = row.images as any;
                return {
                    id: img.id,
                    url: img.url,
                    prompt: img.prompt,
                    aspectRatio: img.aspect_ratio,
                    model: img.model,
                    timestamp: new Date(img.created_at).getTime(),
                };
            });
    }

    // ============== SETTINGS ==============

    /**
     * Save user settings
     */
    async saveSettings(settings: Partial<SettingsRow>): Promise<void> {
        if (!isSupabaseConfigured()) return;

        const { error } = await (supabase as any)
            .from('settings')
            .upsert({
                session_id: this.sessionId,
                ...settings,
            }, { onConflict: 'session_id' });

        if (error) {
            // Suppress annoying network errors
            if (error.message?.includes('Failed to fetch')) {
                return;
            }
            console.error('Failed to save settings:', error.message, error.details || '', error.hint || '');
        }
    }

    /**
     * Load user settings
     */
    async loadSettings(): Promise<Partial<SettingsRow> | null> {
        if (!isSupabaseConfigured()) return null;

        const { data, error } = await (supabase
            .from('settings')
            .select('*')
            .eq('session_id', this.sessionId)
            .single()) as any;

        if (error && error.code !== 'PGRST116') {
            console.error('Failed to load settings:', error.message, error.details || '', error.hint || '');
        }

        return data;
    }

    // ============== AUTO-SAVE ==============

    /**
     * Start auto-save interval
     */
    startAutoSave(settings: Partial<SettingsRow>, intervalMs: number = 30000): void {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        this.autoSaveInterval = setInterval(() => {
            this.saveSettings(settings);
        }, intervalMs);
    }

    /**
     * Stop auto-save
     */
    stopAutoSave(): void {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
}

// Singleton instance
let sessionManager: SessionManager | null = null;

export function getSessionManager(): SessionManager {
    if (!sessionManager) {
        sessionManager = new SessionManager();
    }
    return sessionManager;
}
