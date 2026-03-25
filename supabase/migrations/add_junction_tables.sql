-- =============================================================
-- DaVinci ADC — Many-to-Many Taxonomy Support
-- =============================================================

-- 1. Create junction table for Gallery items
CREATE TABLE IF NOT EXISTS cms_gallery_categories (
    gallery_id UUID REFERENCES cms_gallery(id) ON DELETE CASCADE,
    category_id UUID REFERENCES cms_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (gallery_id, category_id)
);

CREATE INDEX idx_gallery_categories_gallery ON cms_gallery_categories(gallery_id);
CREATE INDEX idx_gallery_categories_category ON cms_gallery_categories(category_id);

-- 2. Create junction table for Graphics items (Art Wall)
CREATE TABLE IF NOT EXISTS cms_graphics_categories (
    graphics_id UUID REFERENCES cms_graphics(id) ON DELETE CASCADE,
    category_id UUID REFERENCES cms_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (graphics_id, category_id)
);

CREATE INDEX idx_graphics_categories_graphics ON cms_graphics_categories(graphics_id);
CREATE INDEX idx_graphics_categories_category ON cms_graphics_categories(category_id);

-- 3. Transition logic (Optional: Migrate existing category_id data)
-- INSERT INTO cms_gallery_categories (gallery_id, category_id)
-- SELECT id, category_id FROM cms_gallery WHERE category_id IS NOT NULL;

-- INSERT INTO cms_graphics_categories (graphics_id, category_id)
-- SELECT id, category_id FROM cms_graphics WHERE category_id IS NOT NULL;

-- 4. RLS for Junction Tables
ALTER TABLE cms_gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_graphics_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_manage_gallery_junction" ON cms_gallery_categories
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "public_read_gallery_junction" ON cms_gallery_categories
FOR SELECT USING (true);

CREATE POLICY "admins_manage_graphics_junction" ON cms_graphics_categories
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "public_read_graphics_junction" ON cms_graphics_categories
FOR SELECT USING (true);
