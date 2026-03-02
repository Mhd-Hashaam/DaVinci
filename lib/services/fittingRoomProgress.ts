import { getSupabaseClient, ensureValidSession } from '@/lib/supabase/client';
import { FittingRoomSnapshot, FittingRoomProgressRecord } from '@/types/fittingRoomProgress';
import { CanvasCaptureService } from './canvasCapture';

export interface SaveProgressArgs {
    userId: string;
    title?: string;
    previewBlob: Blob;
    state: FittingRoomSnapshot;
}

export class FittingRoomProgressService {
    private static BUCKET = 'fitting-progress-previews' as const;
    private static TABLE = 'fitting_room_progress' as const;

    /**
     * Saves the current fitting room state along with a preview image.
     *
     * Strategy: ensure the session token is valid BEFORE making any requests.
     * This prevents the "dead token" failure where the first call works but later
     * ones fail because GoTrueClient's auto-refresh was previously interrupted.
     */
    static async saveProgress(args: SaveProgressArgs): Promise<FittingRoomProgressRecord> {
        const t0 = performance.now();
        console.log('[ProgressService] 🚀 Save starting for user:', args.userId);

        // ── 1. Validate session before doing anything ──────────────────────────
        const sessionValid = await ensureValidSession();
        if (!sessionValid) {
            throw new Error('Your session has expired. Please sign out and sign in again.');
        }

        const supabase = getSupabaseClient();
        const sessionId = crypto.randomUUID();
        const folder = `${args.userId}/progress`;
        const timestamp = Date.now();

        try {
            // ── 2. Resize to thumbnail ─────────────────────────────────────────
            console.log('[ProgressService] 🛠️ Resizing thumbnail...');
            const thumbBlob = await CanvasCaptureService.resizeImage(args.previewBlob, 400, 300);
            console.log(`[ProgressService] ✅ Resize done (${((performance.now() - t0) / 1000).toFixed(1)}s)`);

            const fullPath = `${folder}/${sessionId}_full_${timestamp}.webp`;
            const thumbPath = `${folder}/${sessionId}_thumb_${timestamp}.webp`;

            // ── 3. Upload preview images ───────────────────────────────────────
            console.log('[ProgressService] ☁️ Uploading full preview...');
            const { error: fullError } = await supabase.storage
                .from(this.BUCKET)
                .upload(fullPath, args.previewBlob, { upsert: true });

            if (fullError) throw new Error(`Preview upload failed: ${fullError.message}`);
            console.log('[ProgressService] ☁️ Uploading thumbnail...');

            const { error: thumbError } = await supabase.storage
                .from(this.BUCKET)
                .upload(thumbPath, thumbBlob, { upsert: true });

            if (thumbError) throw new Error(`Thumbnail upload failed: ${thumbError.message}`);
            console.log(`[ProgressService] ✅ Uploads done (${((performance.now() - t0) / 1000).toFixed(1)}s)`);

            // ── 4. Get public URLs ─────────────────────────────────────────────
            const { data: { publicUrl: previewUrl } } = supabase.storage.from(this.BUCKET).getPublicUrl(fullPath);
            const { data: { publicUrl: previewThumbnailUrl } } = supabase.storage.from(this.BUCKET).getPublicUrl(thumbPath);

            // ── 5. Insert database record ──────────────────────────────────────
            console.log('[ProgressService] 📝 Inserting record...');
            const { data, error } = await supabase
                .from('fitting_room_progress')
                .insert({
                    user_id: args.userId,
                    title: args.title || `Session – ${new Date().toLocaleDateString()}`,
                    state: args.state as any,
                    preview_url: previewUrl,
                    preview_thumbnail_url: previewThumbnailUrl,
                    app_version: '1.0',
                    schema_version: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw new Error(`Failed to save progress record: ${error.message}`);

            console.log(`[ProgressService] 🎉 Save successful in ${((performance.now() - t0) / 1000).toFixed(1)}s — ID: ${data.id}`);
            return data as unknown as FittingRoomProgressRecord;

        } catch (error: any) {
            console.error(`[ProgressService] ❌ Save failed after ${((performance.now() - t0) / 1000).toFixed(1)}s:`, error.message);
            throw error;
        }
    }

    /**
     * Lists saved progress records for a user.
     * Validates session first to prevent stale-token failures.
     */
    static async listProgress(userId: string, limit = 12, offset = 0): Promise<FittingRoomProgressRecord[]> {
        console.log('[ProgressService] 🔍 Fetching progress for user:', userId);

        const sessionValid = await ensureValidSession();
        if (!sessionValid) {
            throw new Error('Session expired. Please sign in again.');
        }

        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('[ProgressService] ❌ Fetch error:', error.message, error);
            throw new Error(`Failed to list progress: ${error.message}`);
        }

        console.log(`[ProgressService] ✅ Found ${data?.length || 0} records.`);
        return data as unknown as FittingRoomProgressRecord[];
    }

    /**
     * Deletes a progress record and its associated preview images.
     */
    static async deleteProgress(id: string): Promise<void> {
        const supabase = getSupabaseClient();

        const { data: record, error: fetchError } = await supabase
            .from('fitting_room_progress')
            .select('preview_url, preview_thumbnail_url')
            .eq('id', id)
            .single();

        if (fetchError) console.warn('Could not fetch record before delete, skipping file cleanup');

        const { error: deleteError } = await supabase
            .from('fitting_room_progress')
            .delete()
            .eq('id', id);

        if (deleteError) throw new Error(`Failed to delete record: ${deleteError.message}`);

        // Cleanup Storage (Best effort)
        if (record) {
            const extractPath = (url: string | null) => {
                if (!url) return null;
                const parts = url.split(`${this.BUCKET}/`);
                return parts.length > 1 ? parts[1] : null;
            };
            const paths = [extractPath(record.preview_url), extractPath(record.preview_thumbnail_url)].filter(Boolean) as string[];
            if (paths.length > 0) {
                await supabase.storage.from(this.BUCKET).remove(paths);
            }
        }
    }

    /**
     * Updates the title of a progress record.
     */
    static async updateTitle(id: string, title: string): Promise<void> {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from('fitting_room_progress')
            .update({ title, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw new Error(`Failed to update title: ${error.message}`);
    }

    /**
     * Fetches a single progress record by ID.
     */
    static async getProgressById(id: string): Promise<FittingRoomProgressRecord> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('fitting_room_progress')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw new Error(`Failed to fetch progress: ${error.message}`);
        return data as unknown as FittingRoomProgressRecord;
    }
}
