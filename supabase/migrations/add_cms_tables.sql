-- =============================================================
-- DaVinci ADC — CMS Tables, Role System, RLS, and Audit Logging
-- Run this in the Supabase SQL Editor
-- =============================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- 0. ROLE SYSTEM — Add role to profiles
-- =============================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'
CHECK (role IN ('user', 'admin'));

-- =============================================================
-- 1. CMS CATEGORIES — Shared taxonomy for gallery, graphics, wardrobe
-- =============================================================

CREATE TABLE IF NOT EXISTS cms_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,                      -- Emoji or icon name
  color TEXT,                     -- Hex color for UI badge
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cms_categories_order ON cms_categories(display_order);
CREATE INDEX idx_cms_categories_active ON cms_categories(is_active);

-- =============================================================
-- 2. CMS GALLERY — Main gallery images (replaces galleryData.ts)
-- =============================================================

CREATE TABLE IF NOT EXISTS cms_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storage_url TEXT NOT NULL,
  title TEXT,
  alt_text TEXT,
  category_id UUID REFERENCES cms_categories(id) ON DELETE SET NULL,
  aspect_ratio TEXT DEFAULT '1:1',
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  variants JSONB DEFAULT '{}',    -- {"webp": "url", "sizes": {"400": "url", "800": "url"}}
  metadata JSONB DEFAULT '{}',    -- Future-proof for AI params, tags, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cms_gallery_category ON cms_gallery(category_id);
CREATE INDEX idx_cms_gallery_order ON cms_gallery(display_order);
CREATE INDEX idx_cms_gallery_published ON cms_gallery(is_published);
CREATE INDEX idx_cms_gallery_featured ON cms_gallery(is_featured);

-- =============================================================
-- 3. CMS GRAPHICS — Art Wall graphics (replaces graphicsManifest.ts)
-- =============================================================

CREATE TABLE IF NOT EXISTS cms_graphics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storage_url TEXT NOT NULL,
  title TEXT,
  category_id UUID REFERENCES cms_categories(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  variants JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cms_graphics_category ON cms_graphics(category_id);
CREATE INDEX idx_cms_graphics_order ON cms_graphics(display_order);
CREATE INDEX idx_cms_graphics_published ON cms_graphics(is_published);

-- =============================================================
-- 4. CMS PRESETS — Preset designs for fitting room (replaces presetDesigns.ts)
-- =============================================================

CREATE TABLE IF NOT EXISTS cms_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  full_image_url TEXT NOT NULL,
  category TEXT,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cms_presets_order ON cms_presets(display_order);
CREATE INDEX idx_cms_presets_published ON cms_presets(is_published);

-- =============================================================
-- 5. CMS WARDROBE — 3D shirt models (replaces hardcoded TheCloset data)
-- =============================================================

CREATE TABLE IF NOT EXISTS cms_wardrobe (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  model_path TEXT NOT NULL,        -- Path to .glb file
  brand TEXT,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cms_wardrobe_order ON cms_wardrobe(display_order);
CREATE INDEX idx_cms_wardrobe_published ON cms_wardrobe(is_published);

-- =============================================================
-- 6. CMS EXPLORE FEATURED — Explore feed images (replaces constants.ts EXPLORE_IMAGES)
-- =============================================================

CREATE TABLE IF NOT EXISTS cms_explore_featured (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storage_url TEXT NOT NULL,
  prompt TEXT,
  model TEXT,
  aspect_ratio TEXT DEFAULT '1:1',
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cms_explore_order ON cms_explore_featured(display_order);

-- =============================================================
-- 7. CMS SITE CONTENT — Editable text/copy across the site
-- =============================================================

CREATE TABLE IF NOT EXISTS cms_site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page TEXT NOT NULL,             -- e.g. 'davinci', 'home', 'global'
  section TEXT NOT NULL,          -- e.g. 'hero', 'footer', 'sidebar'
  key TEXT NOT NULL,              -- e.g. 'heading', 'subtitle', 'cta_text'
  value TEXT NOT NULL DEFAULT '',
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'json')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page, section, key)     -- Only one value per page+section+key combo
);

CREATE INDEX idx_cms_site_content_page ON cms_site_content(page);
CREATE INDEX idx_cms_site_content_lookup ON cms_site_content(page, section, key);

-- =============================================================
-- 8. CMS SETTINGS — Global app configuration
-- =============================================================

CREATE TABLE IF NOT EXISTS cms_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  description TEXT,               -- Human-readable explanation for admin UI
  is_public BOOLEAN DEFAULT false, -- Whether frontend can read this
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 9. CMS AUDIT LOG — Immutable record of all admin changes
-- =============================================================

CREATE TABLE IF NOT EXISTS cms_audit_log (
  id BIGSERIAL PRIMARY KEY,            -- Sequential, not UUID (for ordering)
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  object_type TEXT NOT NULL,            -- Table name: 'cms_gallery', 'cms_categories', etc.
  object_id UUID,                       -- ID of the affected row
  action TEXT NOT NULL,                 -- 'INSERT', 'UPDATE', 'DELETE'
  before_payload JSONB,                 -- Row state BEFORE change (null for INSERT)
  after_payload JSONB,                  -- Row state AFTER change (null for DELETE)
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cms_audit_log_admin ON cms_audit_log(admin_id);
CREATE INDEX idx_cms_audit_log_type ON cms_audit_log(object_type);
CREATE INDEX idx_cms_audit_log_created ON cms_audit_log(created_at DESC);

-- =============================================================
-- UPDATED_AT TRIGGERS — Auto-update timestamps
-- =============================================================

-- Reuse existing function if it exists, otherwise create it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cms_categories_updated_at
  BEFORE UPDATE ON cms_categories FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_gallery_updated_at
  BEFORE UPDATE ON cms_gallery FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_graphics_updated_at
  BEFORE UPDATE ON cms_graphics FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_presets_updated_at
  BEFORE UPDATE ON cms_presets FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_wardrobe_updated_at
  BEFORE UPDATE ON cms_wardrobe FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_explore_updated_at
  BEFORE UPDATE ON cms_explore_featured FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_site_content_updated_at
  BEFORE UPDATE ON cms_site_content FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_settings_updated_at
  BEFORE UPDATE ON cms_settings FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- AUDIT LOG TRIGGER — Auto-log every CMS change
-- =============================================================

CREATE OR REPLACE FUNCTION log_cms_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO cms_audit_log(admin_id, object_type, object_id, action, before_payload, after_payload)
  VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit trigger to all admin-writable CMS tables
CREATE TRIGGER trg_audit_cms_categories
  AFTER INSERT OR UPDATE OR DELETE ON cms_categories
  FOR EACH ROW EXECUTE FUNCTION log_cms_change();

CREATE TRIGGER trg_audit_cms_gallery
  AFTER INSERT OR UPDATE OR DELETE ON cms_gallery
  FOR EACH ROW EXECUTE FUNCTION log_cms_change();

CREATE TRIGGER trg_audit_cms_graphics
  AFTER INSERT OR UPDATE OR DELETE ON cms_graphics
  FOR EACH ROW EXECUTE FUNCTION log_cms_change();

CREATE TRIGGER trg_audit_cms_presets
  AFTER INSERT OR UPDATE OR DELETE ON cms_presets
  FOR EACH ROW EXECUTE FUNCTION log_cms_change();

CREATE TRIGGER trg_audit_cms_wardrobe
  AFTER INSERT OR UPDATE OR DELETE ON cms_wardrobe
  FOR EACH ROW EXECUTE FUNCTION log_cms_change();

CREATE TRIGGER trg_audit_cms_explore
  AFTER INSERT OR UPDATE OR DELETE ON cms_explore_featured
  FOR EACH ROW EXECUTE FUNCTION log_cms_change();

CREATE TRIGGER trg_audit_cms_site_content
  AFTER INSERT OR UPDATE OR DELETE ON cms_site_content
  FOR EACH ROW EXECUTE FUNCTION log_cms_change();

CREATE TRIGGER trg_audit_cms_settings
  AFTER INSERT OR UPDATE OR DELETE ON cms_settings
  FOR EACH ROW EXECUTE FUNCTION log_cms_change();

-- =============================================================
-- ROW LEVEL SECURITY (RLS) — Defense in Depth
-- =============================================================

-- Enable RLS on ALL CMS tables
ALTER TABLE cms_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_graphics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_wardrobe ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_explore_featured ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_audit_log ENABLE ROW LEVEL SECURITY;

-- ----- ADMIN WRITE POLICIES (joins profiles, not JWT-only) -----

-- Helper: is the current user an admin?
-- Used by all policies below via subquery

-- cms_categories
CREATE POLICY "admins_manage_categories" ON cms_categories
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "public_read_active_categories" ON cms_categories
FOR SELECT USING (is_active = true);

-- cms_gallery
CREATE POLICY "admins_manage_gallery" ON cms_gallery
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "public_read_published_gallery" ON cms_gallery
FOR SELECT USING (is_published = true);

-- cms_graphics
CREATE POLICY "admins_manage_graphics" ON cms_graphics
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "public_read_published_graphics" ON cms_graphics
FOR SELECT USING (is_published = true);

-- cms_presets
CREATE POLICY "admins_manage_presets" ON cms_presets
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "public_read_published_presets" ON cms_presets
FOR SELECT USING (is_published = true);

-- cms_wardrobe
CREATE POLICY "admins_manage_wardrobe" ON cms_wardrobe
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "public_read_published_wardrobe" ON cms_wardrobe
FOR SELECT USING (is_published = true);

-- cms_explore_featured
CREATE POLICY "admins_manage_explore" ON cms_explore_featured
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "public_read_published_explore" ON cms_explore_featured
FOR SELECT USING (is_published = true);

-- cms_site_content
CREATE POLICY "admins_manage_site_content" ON cms_site_content
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "public_read_site_content" ON cms_site_content
FOR SELECT USING (true);  -- All site content is publicly readable

-- cms_settings
CREATE POLICY "admins_manage_settings" ON cms_settings
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "public_read_public_settings" ON cms_settings
FOR SELECT USING (is_public = true);

-- cms_audit_log — Admin read-only (inserts happen via triggers, not directly)
CREATE POLICY "admins_read_audit_log" ON cms_audit_log
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- =============================================================
-- STORAGE — CMS Media Bucket
-- =============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-media', 'cms-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for CMS media
CREATE POLICY "CMS media is publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'cms-media' );

-- Admin-only uploads to CMS media
CREATE POLICY "Admins can upload CMS media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cms-media'
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Admin-only update/delete for CMS media
CREATE POLICY "Admins can update CMS media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cms-media'
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admins can delete CMS media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cms-media'
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
