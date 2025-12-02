-- Fix the security definer view warning by recreating without SECURITY DEFINER
DROP VIEW IF EXISTS public.artist_public_profiles;

-- Recreate without SECURITY DEFINER (safe because it only exposes non-sensitive data)
CREATE VIEW public.artist_public_profiles AS
SELECT 
  p.id,
  p.full_name,
  p.avatar_url,
  p.bio,
  a.name as artist_name,
  a.slug as artist_slug,
  a.specialty,
  a.is_verified
FROM public.profiles p
LEFT JOIN public.artists a ON a.user_id = p.id
WHERE a.id IS NOT NULL;

-- Grant access
GRANT SELECT ON public.artist_public_profiles TO authenticated, anon;