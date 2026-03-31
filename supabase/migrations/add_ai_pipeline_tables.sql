-- 1. Add AI Terms flag to Profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_accepted_ai_terms BOOLEAN DEFAULT false;

-- 2. Create Generation Logs Table
CREATE TABLE IF NOT EXISTS generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    model TEXT NOT NULL,
    prompt_hash TEXT NOT NULL,
    storage_path TEXT,
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'blocked', 'error', 'quota_exceeded')),
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_gen_logs_user_date ON generation_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gen_logs_hash ON generation_logs(prompt_hash);

ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own generation logs"
    ON generation_logs FOR SELECT
    USING (auth.uid() = user_id);

-- 3. Storage Bucket for User Designs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('user-designs', 'user-designs', true, 5242880, '{"image/png", "image/jpeg", "image/webp"}')
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can read own user-designs" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'user-designs' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 4. Set Daily Generation Limit in CMS Settings
INSERT INTO cms_settings (key, description, value, is_public)
VALUES (
    'daily_generation_limit', 
    'Max AI image generations allowed per user per day.', 
    '5', 
    true
)
ON CONFLICT (key) DO NOTHING;

-- 5. The Atomic Credit Consumption RPC
CREATE OR REPLACE FUNCTION consume_generation_credit(p_user_id UUID)
RETURNS TABLE(allowed BOOLEAN, used INT, remaining INT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_used INT;
    v_limit INT;
BEGIN
    BEGIN
        SELECT (value)::int INTO v_limit 
        FROM cms_settings 
        WHERE key = 'daily_generation_limit';
    EXCEPTION WHEN OTHERS THEN
        v_limit := 5;
    END;
    
    IF v_limit IS NULL THEN 
        v_limit := 5; 
    END IF;

    SELECT COUNT(*) INTO v_used
    FROM generation_logs
    WHERE user_id = p_user_id
        AND status = 'success'
        AND created_at >= CURRENT_DATE;

    IF v_used >= v_limit THEN
        RETURN QUERY SELECT false, v_used, 0;
    ELSE
        RETURN QUERY SELECT true, v_used, (v_limit - v_used - 1);
    END IF;
END;
$$;
