import { createClient } from '@supabase/supabase-js';
import type {
    CMSCategoryRow, CMSCategoryInsert,
    CMSGalleryRow, CMSGalleryInsert,
    CMSGraphicsRow, CMSGraphicsInsert,
    CMSPresetsRow, CMSPresetsInsert,
    CMSWardrobeRow, CMSWardrobeInsert,
    CMSExploreFeaturedRow, CMSExploreFeaturedInsert,
    CMSSiteContentRow, CMSSiteContentInsert,
    CMSSettingsRow, CMSSettingsInsert,
    CMSAuditLogRow,
} from '@/types/cms';

/**
 * Admin CMS API — Server-side CRUD Controller
 *
 * Every function re-verifies admin role before performing mutations.
 * This is the "final gate" — middleware is just a fast-path check.
 * 
 * NOTE: We use an untyped Supabase client here because the CMS table
 * types in database.ts are auto-generated AFTER the migration runs.
 * Once you run `supabase gen types typescript`, the casts below can
 * be removed and the server.ts typed client can be used instead.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '', {
    auth: { autoRefreshToken: false, persistSession: false },
});


// ─── Auth Verification ──────────────────────────────────────

async function verifyAdmin(userId: string): Promise<boolean> {
    const { data } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
    return data?.role === 'admin';
}

function unauthorized() {
    return { error: 'Forbidden: Admin access required', data: null };
}

// ─── Categories ──────────────────────────────────────────────

export async function getCategories() {
    const { data, error } = await supabaseAdmin
        .from('cms_categories')
        .select('*')
        .order('display_order', { ascending: true });
    return { data, error };
}

export async function createCategory(userId: string, category: CMSCategoryInsert) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { data, error } = await supabaseAdmin
        .from('cms_categories')
        .insert(category)
        .select()
        .single();
    return { data, error };
}

export async function updateCategory(userId: string, id: string, updates: Partial<CMSCategoryRow>) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { data, error } = await supabaseAdmin
        .from('cms_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    return { data, error };
}

export async function deleteCategory(userId: string, id: string) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { error } = await supabaseAdmin
        .from('cms_categories')
        .delete()
        .eq('id', id);
    return { error };
}

export async function syncCategoryGalleryItems(userId: string, categoryId: string, galleryIds: string[]) {
    if (!(await verifyAdmin(userId))) return unauthorized();

    // Remove all old associations
    await supabaseAdmin
        .from('cms_gallery_categories')
        .delete()
        .eq('category_id', categoryId);

    // Add new associations
    if (galleryIds.length > 0) {
        const inserts = galleryIds.map(gId => ({
            gallery_id: gId,
            category_id: categoryId
        }));
        await supabaseAdmin
            .from('cms_gallery_categories')
            .insert(inserts);
    }
    return { data: true, error: null };
}

export async function removeGalleryItemFromCategory(userId: string, categoryId: string, galleryId: string) {
    if (!(await verifyAdmin(userId))) return unauthorized();

    const { error } = await supabaseAdmin
        .from('cms_gallery_categories')
        .delete()
        .eq('category_id', categoryId)
        .eq('gallery_id', galleryId);

    return { data: true, error };
}

// ─── Gallery ─────────────────────────────────────────────────

export async function getGalleryItems(publishedOnly = false) {
    let query = supabaseAdmin
        .from('cms_gallery')
        .select(`
            *,
            category_links:cms_gallery_categories(
                category:cms_categories(*)
            )
        `)
        .order('display_order', { ascending: true });
    
    if (publishedOnly) query = query.eq('is_published', true);
    
    const { data, error } = await query;
    
    // Flatten result for convenience: move categories to a top-level array
    const formatted = data?.map((item: any) => ({
        ...item,
        categories: item.category_links?.map((link: any) => link.category) || []
    }));

    return { data: formatted, error };
}

export async function createGalleryItem(userId: string, item: CMSGalleryInsert) {
    if (!(await verifyAdmin(userId))) return unauthorized();

    // Separate junction-table fields from direct columns
    const { category_ids, ...directFields } = item as any;

    const { data, error } = await supabaseAdmin
        .from('cms_gallery')
        .insert(directFields)
        .select()
        .single();

    if (error || !data) return { data, error };

    // Write category associations to junction table
    if (category_ids && category_ids.length > 0) {
        const inserts = category_ids.map((catId: string) => ({
            gallery_id: data.id,
            category_id: catId,
        }));
        await supabaseAdmin
            .from('cms_gallery_categories')
            .insert(inserts);
    }

    return { data, error };
}

export async function updateGalleryItem(userId: string, id: string, updates: any) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    
    // Separate junction updates from direct table updates
    const { category_ids, ...directUpdates } = updates;

    const { data, error } = await supabaseAdmin
        .from('cms_gallery')
        .update(directUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) return { data: null, error };

    // Update categories in junction table if provided
    if (category_ids !== undefined) {
        // Delete old associations
        await supabaseAdmin
            .from('cms_gallery_categories')
            .delete()
            .eq('gallery_id', id);

        // Insert new associations
        if (category_ids && category_ids.length > 0) {
            const inserts = category_ids.map((catId: string) => ({
                gallery_id: id,
                category_id: catId
            }));
            await supabaseAdmin
                .from('cms_gallery_categories')
                .insert(inserts);
        }
    }

    return { data, error };
}

export async function deleteGalleryItems(userId: string, ids: string[]) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { error } = await supabaseAdmin
        .from('cms_gallery')
        .delete()
        .in('id', ids);
    return { error };
}

export async function bulkAddGalleryItemsToCategories(userId: string, galleryIds: string[], categoryIds: string[]) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    
    // For each gallery item, we'll insert links to each category
    const inserts: { gallery_id: string, category_id: string }[] = [];
    galleryIds.forEach(gId => {
        categoryIds.forEach(cId => {
            inserts.push({ gallery_id: gId, category_id: cId });
        });
    });

    if (inserts.length === 0) return { data: true, error: null };

    const { error } = await supabaseAdmin
        .from('cms_gallery_categories')
        .insert(inserts);

    return { data: true, error };
}

export async function bulkUpdateGalleryItems(userId: string, ids: string[], updates: any) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { data, error } = await supabaseAdmin
        .from('cms_gallery')
        .update(updates)
        .in('id', ids)
        .select();
    return { data, error };
}

export async function deleteGalleryItem(userId: string, id: string) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { error } = await supabaseAdmin
        .from('cms_gallery')
        .delete()
        .eq('id', id);
    return { error };
}

export async function reorderGalleryItems(userId: string, orderedIds: string[]) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const updates = orderedIds.map((id, index) =>
        supabaseAdmin
            .from('cms_gallery')
            .update({ display_order: index })
            .eq('id', id)
    );
    await Promise.all(updates);
    return { error: null };
}

// ─── Graphics (Art Wall) ─────────────────────────────────────

export async function getGraphicsItems(publishedOnly = false) {
    let query = supabaseAdmin
        .from('cms_graphics')
        .select(`
            *,
            category_links:cms_graphics_categories(
                category:cms_categories(*)
            )
        `)
        .order('display_order', { ascending: true });
        
    if (publishedOnly) query = query.eq('is_published', true);
    
    const { data, error } = await query;
    
    const formatted = data?.map((item: any) => ({
        ...item,
        categories: item.category_links?.map((link: any) => link.category) || []
    }));

    return { data: formatted, error };
}

export async function createGraphicsItem(userId: string, item: CMSGraphicsInsert) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { data, error } = await supabaseAdmin
        .from('cms_graphics')
        .insert(item)
        .select()
        .single();
    return { data, error };
}

export async function updateGraphicsItem(userId: string, id: string, updates: any) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    
    const { category_ids, ...directUpdates } = updates;

    const { data, error } = await supabaseAdmin
        .from('cms_graphics')
        .update(directUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) return { data, error };

    if (category_ids !== undefined) {
        await supabaseAdmin
            .from('cms_graphics_categories')
            .delete()
            .eq('graphics_id', id);

        if (category_ids && category_ids.length > 0) {
            const inserts = category_ids.map((catId: string) => ({
                graphics_id: id,
                category_id: catId
            }));
            await supabaseAdmin
                .from('cms_graphics_categories')
                .insert(inserts);
        }
    }

    return { data, error };
}

export async function deleteGraphicsItem(userId: string, id: string) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { error } = await supabaseAdmin
        .from('cms_graphics')
        .delete()
        .eq('id', id);
    return { error };
}

// ─── Presets ─────────────────────────────────────────────────

export async function getPresets(publishedOnly = false) {
    let query = supabaseAdmin
        .from('cms_presets')
        .select('*')
        .order('display_order', { ascending: true });
    if (publishedOnly) query = query.eq('is_published', true);
    const { data, error } = await query;
    return { data, error };
}

export async function createPreset(userId: string, item: CMSPresetsInsert) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { data, error } = await supabaseAdmin
        .from('cms_presets')
        .insert(item)
        .select()
        .single();
    return { data, error };
}

export async function updatePreset(userId: string, id: string, updates: Partial<CMSPresetsRow>) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { data, error } = await supabaseAdmin
        .from('cms_presets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    return { data, error };
}

export async function deletePreset(userId: string, id: string) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { error } = await supabaseAdmin
        .from('cms_presets')
        .delete()
        .eq('id', id);
    return { error };
}

// ─── Wardrobe ────────────────────────────────────────────────

export async function getWardrobeItems(publishedOnly = false) {
    let query = supabaseAdmin
        .from('cms_wardrobe')
        .select('*')
        .order('display_order', { ascending: true });
    if (publishedOnly) query = query.eq('is_published', true);
    const { data, error } = await query;
    return { data, error };
}

export async function createWardrobeItem(userId: string, item: CMSWardrobeInsert) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { data, error } = await supabaseAdmin
        .from('cms_wardrobe')
        .insert(item)
        .select()
        .single();
    return { data, error };
}

export async function updateWardrobeItem(userId: string, id: string, updates: Partial<CMSWardrobeRow>) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { data, error } = await supabaseAdmin
        .from('cms_wardrobe')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    return { data, error };
}

export async function deleteWardrobeItem(userId: string, id: string) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { error } = await supabaseAdmin
        .from('cms_wardrobe')
        .delete()
        .eq('id', id);
    return { error };
}

// ─── Explore Featured ────────────────────────────────────────

export async function getExploreFeatured(publishedOnly = false) {
    let query = supabaseAdmin
        .from('cms_explore_featured')
        .select('*')
        .order('display_order', { ascending: true });
    if (publishedOnly) query = query.eq('is_published', true);
    const { data, error } = await query;
    return { data, error };
}

export async function createExploreFeatured(userId: string, item: CMSExploreFeaturedInsert) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { data, error } = await supabaseAdmin
        .from('cms_explore_featured')
        .insert(item)
        .select()
        .single();
    return { data, error };
}

export async function updateExploreFeatured(userId: string, id: string, updates: Partial<CMSExploreFeaturedRow>) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { data, error } = await supabaseAdmin
        .from('cms_explore_featured')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    return { data, error };
}

export async function deleteExploreFeatured(userId: string, id: string) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { error } = await supabaseAdmin
        .from('cms_explore_featured')
        .delete()
        .eq('id', id);
    return { error };
}

// ─── Site Content ────────────────────────────────────────────

export async function getSiteContent(page?: string) {
    let query = supabaseAdmin.from('cms_site_content').select('*');
    if (page) query = query.eq('page', page);
    const { data, error } = await query;
    return { data, error };
}

export async function upsertSiteContent(userId: string, item: CMSSiteContentInsert) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { data, error } = await supabaseAdmin
        .from('cms_site_content')
        .upsert(item, { onConflict: 'page,section,key' })
        .select()
        .single();
    return { data, error };
}

export async function deleteSiteContent(userId: string, id: string) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { error } = await supabaseAdmin
        .from('cms_site_content')
        .delete()
        .eq('id', id);
    return { error };
}

// ─── Settings ────────────────────────────────────────────────

export async function getSettings(publicOnly = false) {
    let query = supabaseAdmin.from('cms_settings').select('*');
    if (publicOnly) query = query.eq('is_public', true);
    const { data, error } = await query;
    return { data, error };
}

export async function upsertSetting(userId: string, item: CMSSettingsInsert) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { data, error } = await supabaseAdmin
        .from('cms_settings')
        .upsert(item, { onConflict: 'key' })
        .select()
        .single();
    return { data, error };
}

// ─── Audit Log ───────────────────────────────────────────────

export async function getAuditLog(options?: {
    limit?: number;
    offset?: number;
    objectType?: string;
    adminId?: string;
}) {
    let query = supabaseAdmin
        .from('cms_audit_log')
        .select('*, profiles:admin_id(username, avatar_url)')
        .order('created_at', { ascending: false });

    if (options?.objectType) query = query.eq('object_type', options.objectType);
    if (options?.adminId) query = query.eq('admin_id', options.adminId);
    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);

    const { data, error } = await query;
    return { data, error };
}

// ─── Media (Storage) ─────────────────────────────────────────

export async function uploadMedia(userId: string, file: File | Buffer | ArrayBuffer, path: string, options?: any) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { data, error } = await supabaseAdmin.storage
        .from('cms-media')
        .upload(path, file, { upsert: true, ...options });
    if (error) return { data: null, error };
    const { data: urlData } = supabaseAdmin.storage
        .from('cms-media')
        .getPublicUrl(path);
    return { data: { path: data?.path || path, publicUrl: urlData.publicUrl }, error: null };
}

export async function deleteMedia(userId: string, paths: string[]) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { error } = await supabaseAdmin.storage
        .from('cms-media')
        .remove(paths);
    return { error };
}

export async function moveMedia(userId: string, fromPath: string, toPath: string) {
    if (!(await verifyAdmin(userId))) return unauthorized();
    const { data, error } = await supabaseAdmin.storage
        .from('cms-media')
        .move(fromPath, toPath);
    if (error) return { error };
    
    // Get new public URL
    const { data: urlData } = supabaseAdmin.storage
        .from('cms-media')
        .getPublicUrl(toPath);
        
    return { data: { path: toPath, publicUrl: urlData.publicUrl }, error: null };
}

export async function listMedia(folder?: string) {
    const { data, error } = await supabaseAdmin.storage
        .from('cms-media')
        .list(folder || '', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    return { data, error };
}
