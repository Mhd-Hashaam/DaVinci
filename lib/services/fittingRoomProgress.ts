import { getSupabaseClient } from '@/lib/supabase/client';
import { FittingRoomSnapshot, FittingRoomProgressRecord } from '@/types/fittingRoomProgress';
import { CanvasCaptureService } from './canvasCapture';

export interface SaveProgressArgs {
    userId: string;
    title?: string;
    previewBlob: Blob;
    state: FittingRoomSnapshot;
}

export class FittingRoomProgressService {
    private static BUCKET = 'fitting-progress-previews';
    private static TABLE = 'fitting_room_progress';

    /**
     * Saves the current fitting room state along with a preview image.
     * Uploads the image and its thumbnail first, then creates the DB record.
     */
    static async saveProgress(args: SaveProgressArgs): Promise<FittingRoomProgressRecord> {
        const supabase = getSupabaseClient();
        const sessionId = crypto.randomUUID();
        const folder = `${args.userId}/progress`;
        const timestamp = Date.now();

        // 1. Process Images
        const thumbBlob = await CanvasCaptureService.resizeImage(args.previewBlob, 400, 300);
        const fullPath = `${folder}/${sessionId}_full_${timestamp}.webp`;
        const thumbPath = `${folder}/${sessionId}_thumb_${timestamp}.webp`;

        // 2. Upload Images Parallel
        const [fullUpload, thumbUpload] = await Promise.all([
            supabase.storage.from(this.BUCKET).upload(fullPath, args.previewBlob, { upsert: true }),
            supabase.storage.from(this.BUCKET).upload(thumbPath, thumbBlob, { upsert: true })
        ]);

        if (fullUpload.error) throw new Error(`Preview upload failed: ${fullUpload.error.message}`);
        if (thumbUpload.error) throw new Error(`Thumbnail upload failed: ${thumbUpload.error.message}`);

        const { data: { publicUrl: previewUrl } } = supabase.storage.from(this.BUCKET).getPublicUrl(fullPath);
        const { data: { publicUrl: previewThumbnailUrl } } = supabase.storage.from(this.BUCKET).getPublicUrl(thumbPath);

        // 3. Insert Record
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

        return data as unknown as FittingRoomProgressRecord;
    }

    /**
     * Lists saved progress records for a user, ordered by most recently updated.
     */
    static async listProgress(userId: string, limit = 12, offset = 0): Promise<FittingRoomProgressRecord[]> {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('fitting_room_progress')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(`Failed to list progress: ${error.message}`);
        return data as unknown as FittingRoomProgressRecord[];
    }

    /**
     * Deletes a progress record and its associated preview images.
     */
    static async deleteProgress(id: string): Promise<void> {
        const supabase = getSupabaseClient();

        // Fetch record to get file paths (optimistic delete: removing record first is safer for UI, files can be cleaned later)
        // But for strict hygiene, we fetch -> delete files -> delete record
        const { data: record, error: fetchError } = await supabase
            .from('fitting_room_progress')
            .select('preview_url, preview_thumbnail_url')
            .eq('id', id)
            .single();

        if (fetchError) console.warn("Could not fetch record before delete, skipping file cleanup");

        const { error: deleteError } = await supabase
            .from('fitting_room_progress')
            .delete()
            .eq('id', id);

        if (deleteError) throw new Error(`Failed to delete record: ${deleteError.message}`);

        // Cleanup Storage (Best effort, don't block flow on this)
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
