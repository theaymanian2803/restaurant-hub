CREATE TABLE public.landing_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key text NOT NULL UNIQUE,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.landing_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.landing_content TO authenticated;
GRANT ALL ON public.landing_content TO service_role;

ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landing content viewable by all"
  ON public.landing_content FOR SELECT USING (true);

CREATE POLICY "Admins manage landing content"
  ON public.landing_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_landing_content_updated_at
  BEFORE UPDATE ON public.landing_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Landing assets public read"
  ON storage.objects FOR SELECT USING (bucket_id = 'landing-assets');

CREATE POLICY "Admins upload landing assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'landing-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update landing assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'landing-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete landing assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'landing-assets' AND public.has_role(auth.uid(), 'admin'));