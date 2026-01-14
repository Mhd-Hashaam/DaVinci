-- DaVinci Studio - Supabase Database Schema
-- Run this in the Supabase SQL Editor to create tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Images Table: Stores all generated images
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL DEFAULT '1:1',
  model TEXT NOT NULL,
  style TEXT,
  metadata JSONB
);

-- Index for faster lookups
CREATE INDEX idx_images_session ON images(session_id);
CREATE INDEX idx_images_user ON images(user_id);
CREATE INDEX idx_images_created ON images(created_at DESC);

-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read (public gallery)
CREATE POLICY "Public images are viewable by everyone"
  ON images FOR SELECT
  USING (true);

-- RLS Policy: Sessions can insert their own images
CREATE POLICY "Sessions can insert images"
  ON images FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Users can update their own images
CREATE POLICY "Users can update own images"
  ON images FOR UPDATE
  USING (session_id = current_setting('request.headers')::json->>'x-session-id' 
    OR user_id = auth.uid());

-----------------------------------------------------------

-- Bookmarks Table: User's saved images
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  UNIQUE(session_id, image_id)
);

CREATE INDEX idx_bookmarks_session ON bookmarks(session_id);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions can manage their bookmarks"
  ON bookmarks FOR ALL
  USING (true)
  WITH CHECK (true);

-----------------------------------------------------------

-- Settings Table: User preferences
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  model TEXT DEFAULT 'gemini-2.5-flash',
  style TEXT DEFAULT 'Dynamic',
  aspect_ratio TEXT DEFAULT '1:1',
  generation_count INTEGER DEFAULT 1
);

CREATE INDEX idx_settings_session ON settings(session_id);
CREATE INDEX idx_settings_user ON settings(user_id);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions can manage their settings"
  ON settings FOR ALL
  USING (true)
  WITH CHECK (true);

-----------------------------------------------------------

-- Orders Table: Custom apparel orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered')),
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE SET NULL,
  mockup_type TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  metadata JSONB
);

CREATE INDEX idx_orders_session ON orders(session_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions can view their orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Sessions can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-----------------------------------------------------------

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
