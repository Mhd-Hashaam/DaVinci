import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generateImageWithGemini } from '@/lib/ai/gemini';
import { hashPrompt } from '@/lib/utils/hash';
import type { GenerationRequest, GenerationResponse, GenerationErrorCode } from '@/lib/types/generation';

// Use Node.js runtime to bypass Vercel Edge's 4MB base64 handling memory limits
export const runtime = 'nodejs';
// Explicitly define a longer timeout since generation can take up to 30s
export const maxDuration = 45;

export async function POST(req: Request) {
    console.log('[API] New Generation Request started');
    let requestPayload: GenerationRequest | null = null;
    let authUser: { id: string } | null = null;

    try {
        // 1. Validate payload
        try {
            requestPayload = await req.json() as GenerationRequest;
            if (!requestPayload.prompt || typeof requestPayload.prompt !== 'string') {
                return errorResponse('BAD_REQUEST', 'Invalid prompt provided');
            }
        } catch {
            return errorResponse('BAD_REQUEST', 'Invalid JSON body');
        }

        const { prompt, aspectRatio = '1:1' } = requestPayload;

        // 2. Validate Session Authenticity
        const cookieStore = await cookies();
        const authClient = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    },
                },
            }
        );

        // SECURITY: Use getUser() instead of getSession() — getSession() reads from
        // client cookies which can be forged. getUser() contacts the Supabase Auth
        // server to cryptographically verify the token.
        const { data: { user }, error: userError } = await authClient.auth.getUser();
        if (userError || !user) {
            console.warn('[API/Auth] Generation blocked: No valid user found');
            return errorResponse('UNAUTHORIZED', 'You must be signed in to generate images');
        }
        authUser = user;

        // 3. Prompt Hashing & Global Caching Strategy
        // If anyone successfully generated this exact prompt recently, fetch from DB cache
        const hashedPrompt = hashPrompt(prompt);
        console.log(`[API] Checking cache for prompt hash: ${hashedPrompt}`);

        const { data: cachedLog } = await (supabaseAdmin as any)
            .from('generation_logs')
            .select('storage_path')
            .eq('prompt_hash', hashedPrompt)
            .eq('status', 'success')
            // Add a constraint to only use caches from the last 7 days to keep things relatively fresh
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .limit(1)
            .maybeSingle();

        // 4. Validate Credit Limit atomically via RPC Check
        // We do this even on Cache Hits to correctly parse their 'remaining' tally.
        console.log(`[API/Debug] Verifying credits for user: ${authUser.id}`);
        const { data: rpcData, error: rpcError } = await (supabaseAdmin as any).rpc('consume_generation_credit', { 
            p_user_id: authUser.id 
        });

        if (rpcError) {
            console.error('[API/Debug] RPC Error during credit check:', rpcError);
            return errorResponse('SERVER_ERROR', 'Failed to verify generation credits');
        }

        const credits = rpcData?.[0] as { allowed: boolean; used: number; remaining: number; } | undefined;
        console.log(`[API/Debug] Credit Check Result: Allowed=${credits?.allowed}, Remaining=${credits?.remaining}`);
        
        if (!credits?.allowed && !cachedLog) {
            console.warn(`[API/Quota] User ${authUser.id} exceeded daily limit`);
            await logGeneration(authUser.id, hashedPrompt, 'quota_exceeded');
            return errorResponse('QUOTA_EXCEEDED', 'Daily generation limit exceeded', 0);
        }

        // Cache Hit Fast-Path
        if (cachedLog && cachedLog.storage_path) {
            console.log(`[API/Debug] Cache Hit! serving existing path: ${cachedLog.storage_path}`);
            const { data: publicUrlData } = supabaseAdmin.storage
                .from('user-designs')
                .getPublicUrl(cachedLog.storage_path);

            return NextResponse.json<GenerationResponse>({
                success: true,
                storageUrl: publicUrlData.publicUrl,
                creditsRemaining: credits?.remaining
            });
        }

        // 5. Invoke Gemini SDK
        console.log(`[API/Debug] Initiating Gemini SDK call for ${authUser.id}...`);
        
        let genResult;
        const startTime = Date.now();
        try {
            genResult = await generateImageWithGemini({ prompt, aspectRatio });
            console.log(`[API/Debug] Gemini Generation Succeeded in ${Date.now() - startTime}ms`);
        } catch (geminiError: any) {
            console.error(`[API/Debug] Gemini Generation Failed:`, geminiError);
            const code = geminiError.code || 'SERVER_ERROR';
            await logGeneration(authUser.id, hashedPrompt, code === 'SAFETY_BLOCKED' ? 'blocked' : 'error');
            return errorResponse(code as GenerationErrorCode, geminiError.message, credits?.remaining);
        }

        // 6. Upload Base64 result to Supabase Storage
        console.log(`[API/Debug] Processing storage upload (${genResult.base64Image.length} bytes)...`);
        const buffer = Buffer.from(genResult.base64Image, 'base64');
        const fileName = `${authUser.id}/${Date.now()}_${hashedPrompt.substring(0, 10)}.webp`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from('user-designs')
            .upload(fileName, buffer, {
                contentType: 'image/webp',
                upsert: false
            });

        if (uploadError) {
            console.error('[API/Debug] Storage Upload failed:', uploadError);
            await logGeneration(authUser.id, hashedPrompt, 'error');
            return errorResponse('SERVER_ERROR', 'Failed to save generated image securely', credits?.remaining);
        }

        // 7. Establish definitive Public URL and commit success log
        const { data: publicUrlData } = supabaseAdmin.storage
            .from('user-designs')
            .getPublicUrl(fileName);

        console.log(`[API/Debug] Image saved to path: ${fileName}`);
        await logGeneration(authUser.id, hashedPrompt, 'success', fileName);

        const finalRemaining = Math.max(0, (credits?.remaining || 1) - 1);
        console.log(`[API/Debug] Request fulfilled. Final Credits: ${finalRemaining}`);
        
        return NextResponse.json<GenerationResponse>({
            success: true,
            storageUrl: publicUrlData.publicUrl,
            creditsRemaining: finalRemaining
        });

    } catch (criticalError: any) {
        console.error('[API/Critical] Uncaught exception:', criticalError);
        return errorResponse('SERVER_ERROR', 'An unexpected critical error occurred');
    }
}

// Internal standard error formatter
function errorResponse(code: GenerationErrorCode, message: string, creditsRemaining?: number) {
    return NextResponse.json<GenerationResponse>(
        { 
            success: false, 
            error: { code, message }, 
            creditsRemaining 
        }, 
        { status: code === 'UNAUTHORIZED' ? 401 : code === 'BAD_REQUEST' ? 400 : 200 } // Send 200 for logical app errors so client handles it naturally
    );
}

// Asynchronously push logs to avoid blocking the user wait
async function logGeneration(userId: string, hash: string, status: string, storagePath?: string) {
    (supabaseAdmin as any).from('generation_logs').insert({
        user_id: userId,
        model: 'gemini-2.5-flash-image',
        prompt_hash: hash,
        status,
        storage_path: storagePath
    }).then(({ error }: { error: any }) => {
        if (error) console.error('[API/Log] Failed to insert generation log:', error);
    });
}
