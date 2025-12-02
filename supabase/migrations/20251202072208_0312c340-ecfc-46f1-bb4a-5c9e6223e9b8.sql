-- CRITICAL SECURITY FIX: Restrict profiles table access to prevent email harvesting
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Only allow users to view their own profile or admins can view all
CREATE POLICY "Users can view own profile or admins"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR has_role(auth.uid(), 'admin'));

-- Create a public view for artist profiles (safe, non-PII data only)
CREATE OR REPLACE VIEW public.artist_public_profiles AS
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

-- Allow anyone to view the public artist profiles view
GRANT SELECT ON public.artist_public_profiles TO authenticated, anon;