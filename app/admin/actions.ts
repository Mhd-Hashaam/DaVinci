'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import * as cms from '@/lib/api/admin-cms';
import { revalidatePath } from 'next/cache';
import type { 
    CMSCategoryInsert, CMSCategoryRow, 
    CMSGalleryInsert, CMSGalleryRow,
    CMSGraphicsInsert, CMSGraphicsRow,
    CMSWardrobeInsert, CMSWardrobeRow,
    CMSSiteContentInsert, CMSSiteContentRow
} from '@/types/cms';

// ─── Error Serializer ────────────────────────────────────────
// Next.js cannot pass Error/PostgrestError class instances from
// Server → Client Components. Flatten them to plain objects.
function se(error: unknown): { message: string; code?: string; details?: string } | null {
    if (!error) return null;
    if (typeof error === 'string') return { message: error };
    if (error instanceof Error) {
        return { message: error.message };
    }
    if (typeof error === 'object') {
        const e = error as any;
        let fallbackMessage = String(error);
        if (fallbackMessage === '[object Object]') {
            try {
                fallbackMessage = JSON.stringify(e);
            } catch (err) {
                fallbackMessage = 'Unknown error object';
            }
        }
        return {
            message: e.message || e.error_description || fallbackMessage,
            code: e.code,
            details: e.details,
        };
    }
    return { message: String(error) };
}

// Wrap raw result so errors are always plain objects
function wrap(res: any): { data: any; error: { message: string; code?: string; details?: string } | null } {
    return { data: res.data ?? null, error: se(res.error) };
}

// ─── Auth ────────────────────────────────────────────────────

async function getAdminId() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch {
                        // Handle cookie error
                    }
                },
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Unauthorized');
    return session.user.id;
}

// ─── Categories ──────────────────────────────────────────────

export async function createCategoryAction(category: CMSCategoryInsert) {
    const adminId = await getAdminId();
    const res = await cms.createCategory(adminId, category);
    if (!res.error) revalidatePath('/admin/categories', 'page');
    return wrap(res);
}

export async function updateCategoryAction(id: string, updates: Partial<CMSCategoryRow>) {
    const adminId = await getAdminId();
    const res = await cms.updateCategory(adminId, id, updates);
    if (!res.error) revalidatePath('/admin/categories', 'page');
    return wrap(res);
}

export async function deleteCategoryAction(id: string) {
    const adminId = await getAdminId();
    const res = await cms.deleteCategory(adminId, id);
    if (!res.error) revalidatePath('/admin/categories', 'page');
    return wrap(res);
}

export async function syncCategoryGalleryItemsAction(categoryId: string, galleryIds: string[]) {
    const adminId = await getAdminId();
    const res = await cms.syncCategoryGalleryItems(adminId, categoryId, galleryIds);
    if (!res.error) {
        revalidatePath('/admin/categories', 'page');
        revalidatePath('/admin/gallery', 'page');
        revalidatePath('/admin', 'layout');
    }
    return wrap(res);
}

export async function removeGalleryItemFromCategoryAction(categoryId: string, galleryId: string) {
    const adminId = await getAdminId();
    const res = await cms.removeGalleryItemFromCategory(adminId, categoryId, galleryId);
    if (!res.error) {
        revalidatePath('/admin/categories', 'page');
        revalidatePath('/admin/gallery', 'page');
        revalidatePath('/admin', 'layout');
    }
    return wrap(res);
}

// ─── Gallery ─────────────────────────────────────────────────

export async function createGalleryItemAction(item: CMSGalleryInsert) {
    const adminId = await getAdminId();
    const res = await cms.createGalleryItem(adminId, item);
    if (!res.error) {
        revalidatePath('/admin/gallery', 'page');
        revalidatePath('/admin', 'layout');
    }
    return wrap(res);
}

export async function updateGalleryItemAction(id: string, updates: any) {
    const adminId = await getAdminId();
    console.log('[ACTIONS] updateGalleryItemAction called:', { id, updates });
    const res = await cms.updateGalleryItem(adminId, id, updates);
    console.log('[ACTIONS] updateGalleryItem result:', { data: !!res.data, error: res.error });
    if (!res.error) {
        revalidatePath('/admin/gallery', 'page');
        revalidatePath('/admin', 'layout');
    }
    return wrap(res);
}

export async function deleteGalleryItemsAction(ids: string[]) {
    const adminId = await getAdminId();
    const res = await cms.deleteGalleryItems(adminId, ids);
    if (!res.error) {
        revalidatePath('/admin/gallery', 'page');
        revalidatePath('/admin', 'layout');
    }
    return wrap(res);
}

export async function bulkAddGalleryItemsToCategoriesAction(galleryIds: string[], categoryIds: string[]) {
    const adminId = await getAdminId();
    const res = await cms.bulkAddGalleryItemsToCategories(adminId, galleryIds, categoryIds);
    if (!res.error) {
        revalidatePath('/admin/gallery', 'page');
        revalidatePath('/admin/categories', 'page');
        revalidatePath('/admin', 'layout');
    }
    return wrap(res);
}

export async function bulkUpdateGalleryItemsAction(ids: string[], updates: any) {
    const adminId = await getAdminId();
    const res = await cms.bulkUpdateGalleryItems(adminId, ids, updates);
    if (!res.error) {
        revalidatePath('/admin/gallery', 'page');
        revalidatePath('/admin', 'layout');
    }
    return wrap(res);
}

export async function deleteGalleryItemAction(id: string) {
    const adminId = await getAdminId();
    const res = await cms.deleteGalleryItem(adminId, id);
    if (!res.error) {
        revalidatePath('/admin/gallery', 'page');
        revalidatePath('/admin', 'layout');
    }
    return wrap(res);
}

export async function reorderGalleryItemsAction(orderedIds: string[]) {
    const adminId = await getAdminId();
    const res = await cms.reorderGalleryItems(adminId, orderedIds);
    if (!res.error) {
        revalidatePath('/admin/gallery', 'page');
        revalidatePath('/admin', 'layout');
    }
    return wrap(res);
}

// ─── Art Wall (Graphics) ─────────────────────────────────────

export async function createGraphicsItemAction(item: CMSGraphicsInsert) {
    const adminId = await getAdminId();
    const res = await cms.createGraphicsItem(adminId, item);
    if (!res.error) {
        revalidatePath('/admin/artwall', 'page');
        revalidatePath('/admin', 'layout');
    }
    return wrap(res);
}

export async function updateGraphicsItemAction(id: string, updates: any) {
    const adminId = await getAdminId();
    const res = await cms.updateGraphicsItem(adminId, id, updates);
    if (!res.error) {
        revalidatePath('/admin/artwall', 'page');
        revalidatePath('/admin', 'layout');
    }
    return wrap(res);
}

export async function deleteGraphicsItemAction(id: string) {
    const adminId = await getAdminId();
    const res = await cms.deleteGraphicsItem(adminId, id);
    if (!res.error) {
        revalidatePath('/admin/artwall', 'page');
        revalidatePath('/admin', 'layout');
    }
    return wrap(res);
}

// ─── Wardrobe ────────────────────────────────────────────────

export async function createWardrobeItemAction(item: CMSWardrobeInsert) {
    const adminId = await getAdminId();
    const res = await cms.createWardrobeItem(adminId, item);
    if (!res.error) {
        revalidatePath('/admin/wardrobe', 'page');
        revalidatePath('/admin', 'layout');
    }
    return wrap(res);
}

export async function updateWardrobeItemAction(id: string, updates: Partial<CMSWardrobeRow>) {
    const adminId = await getAdminId();
    const res = await cms.updateWardrobeItem(adminId, id, updates);
    if (!res.error) {
        revalidatePath('/admin/wardrobe', 'page');
        revalidatePath('/admin', 'layout');
    }
    return wrap(res);
}

export async function deleteWardrobeItemAction(id: string) {
    const adminId = await getAdminId();
    const res = await cms.deleteWardrobeItem(adminId, id);
    if (!res.error) {
        revalidatePath('/admin/wardrobe', 'page');
        revalidatePath('/admin', 'layout');
    }
    return wrap(res);
}

// ─── Media ───────────────────────────────────────────────────

export async function uploadMediaAction(formData: FormData, path: string) {
    const adminId = await getAdminId();
    const file = formData.get('file') as File;
    if (!file) return { error: { message: 'No file uploaded' }, data: null };
    
    // Convert File to ArrayBuffer to prevent Supabase/Node.js crash on large binaries
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const res = await cms.uploadMedia(adminId, buffer, path, { contentType: file.type });
    if (!res.error) revalidatePath('/admin/media');
    return wrap(res);
}

/**
 * Base64 upload path — bypasses FormData multipart boundary parsing entirely.
 * Use this for large binary files (e.g. .glb 3D models) that cause
 * "Unexpected end of form" errors through the FormData path.
 */
export async function uploadMediaBase64Action(base64Data: string, path: string, contentType: string) {
    const adminId = await getAdminId();
    const buffer = Buffer.from(base64Data, 'base64');
    const res = await cms.uploadMedia(adminId, buffer, path, { contentType });
    if (!res.error) revalidatePath('/admin/media');
    return wrap(res);
}

export async function listMediaAction(folder?: string) {
    const res = await cms.listMedia(folder);
    return wrap(res);
}

export async function deleteMediaAction(paths: string[]) {
    const adminId = await getAdminId();
    const res = await cms.deleteMedia(adminId, paths);
    if (!res.error) revalidatePath('/admin/media');
    return wrap(res);
}

export async function renameMediaAction(fromPath: string, toPath: string) {
    const adminId = await getAdminId();
    const res = await cms.moveMedia(adminId, fromPath, toPath);
    return wrap(res);
}

// ─── Site Content ────────────────────────────────────────────

export async function upsertSiteContentAction(item: CMSSiteContentInsert) {
    const adminId = await getAdminId();
    const res = await cms.upsertSiteContent(adminId, item);
    if (!res.error) {
        revalidatePath('/admin/content', 'page');
        revalidatePath('/admin', 'layout');
    }
    return wrap(res);
}

export async function deleteSiteContentAction(id: string) {
    const adminId = await getAdminId();
    const res = await cms.deleteSiteContent(adminId, id);
    if (!res.error) {
        revalidatePath('/admin/content', 'page');
        revalidatePath('/admin', 'layout');
    }
    return wrap(res);
}
