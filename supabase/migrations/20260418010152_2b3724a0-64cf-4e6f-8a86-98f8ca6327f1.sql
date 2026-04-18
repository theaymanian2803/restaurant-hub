
DROP POLICY IF EXISTS "Menu images public read" ON storage.objects;

-- Allow public read of individual files via known URL is handled by the bucket being public.
-- For SELECT (listing) via storage API, restrict to admins.
CREATE POLICY "Admins list menu images" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'));
