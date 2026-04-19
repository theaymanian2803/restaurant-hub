-- Enable realtime for orders so users and admins see live status changes
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;

-- Allow admins to view all profiles (already covered by existing policy via has_role) — confirmed.
-- Add a helper view-friendly policy: admins can read profiles for order customer info (already exists).