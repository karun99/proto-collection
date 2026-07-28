-- PromptPro Challenge Arena - Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- Simple key-value store: each collection is stored as a single JSONB blob
-- Key = collection name (e.g. 'students', 'prompts', 'settings')
-- Value = the entire collection data as JSONB
CREATE TABLE IF NOT EXISTS kv_store (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_kv_store_key ON kv_store(key);

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS kv_store_updated_at ON kv_store;
CREATE TRIGGER kv_store_updated_at
  BEFORE UPDATE ON kv_store
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE kv_store ENABLE ROW LEVEL SECURITY;

-- Allow all operations (service_role key bypasses RLS)
CREATE POLICY "Allow all operations" ON kv_store FOR ALL USING (true);
