import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * Route Handler for large file uploads (e.g. .glb 3D models).
 * 
 * This bypasses Next.js Server Actions entirely because Server Actions
 * serialize arguments as JSON, which corrupts/truncates large binary payloads.
 * Route Handlers use the native Request/Response API and handle multipart
 * form data natively without any serialization issues.
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const path = formData.get('path') as string;

        if (!file || !path) {
            return NextResponse.json(
                { error: 'Missing file or path' },
                { status: 400 }
            );
        }

        // Convert File to ArrayBuffer → Buffer for Supabase
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await supabaseAdmin.storage
            .from('cms-media')
            .upload(path, buffer, {
                upsert: true,
                contentType: file.type || 'application/octet-stream',
            });

        if (error) {
            console.error('[Upload Route] Supabase error:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        const { data: urlData } = supabaseAdmin.storage
            .from('cms-media')
            .getPublicUrl(path);

        return NextResponse.json({
            publicUrl: urlData.publicUrl,
            path: data?.path || path,
        });
    } catch (err: any) {
        console.error('[Upload Route] Unhandled error:', err);
        return NextResponse.json(
            { error: err.message || 'Upload failed' },
            { status: 500 }
        );
    }
}
