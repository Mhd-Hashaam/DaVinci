import crypto from 'crypto';

/**
 * Creates a deterministic SHA-256 hash of a prompt.
 * Secures PII by preventing plaintext logging, and supports precise entity-caching 
 * so duplicate prompt requests skip the LLM entirely and load directly from Supabase Storage.
 */
export function hashPrompt(prompt: string): string {
    return crypto.createHash('sha256')
                 .update(prompt.trim().toLowerCase())
                 .digest('hex');
}
