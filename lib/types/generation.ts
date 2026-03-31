export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export type GenerationErrorCode = 
    | 'UNAUTHORIZED' 
    | 'QUOTA_EXCEEDED' 
    | 'SAFETY_BLOCKED' 
    | 'SERVER_ERROR'
    | 'BAD_REQUEST';

export interface GenerationRequest {
    prompt: string;
    aspectRatio?: AspectRatio;
}

export interface GenerationResponse {
    success: boolean;
    storageUrl?: string; // The URL pointing to our Supabase Storage bucket
    creditsRemaining?: number;
    error?: {
        code: GenerationErrorCode;
        message: string;
    };
}
