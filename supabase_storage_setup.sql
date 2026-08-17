-- ----------------------------------------------------
-- Setup Storage Bucket and Row-Level Security Policies
-- ----------------------------------------------------

-- 1. Create a public bucket named 'portfolio' if it doesn't exist
-- Note: You can also create this manually in the Supabase Dashboard under Storage -> New Bucket -> name it "portfolio" and make it public.
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public read access to view/download files in the 'portfolio' bucket
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');

-- 3. Allow authenticated administrators to upload files into the 'portfolio' bucket
CREATE POLICY "Allow authenticated upload access" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio');

-- 4. Allow authenticated administrators to update or delete files in the 'portfolio' bucket
CREATE POLICY "Allow authenticated edit access" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'portfolio') WITH CHECK (bucket_id = 'portfolio');
