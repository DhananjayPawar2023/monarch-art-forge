-- CRITICAL SECURITY FIX: Move roles to separate table
-- First, drop all policies that depend on the role column
DROP POLICY IF EXISTS "Admins can delete artists" ON public.artists;
DROP POLICY IF EXISTS "Admins can insert artists" ON public.artists;
DROP POLICY IF EXISTS "Admins can update artists" ON public.artists;
DROP POLICY IF EXISTS "Admins can manage artworks" ON public.artworks;
DROP POLICY IF EXISTS "Published artworks are viewable by everyone" ON public.artworks;
DROP POLICY IF EXISTS "Admins can manage collections" ON public.collections;
DROP POLICY IF EXISTS "Admins can manage artwork images" ON public.artwork_images;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view subscribers" ON public.newsletter_subscribers;

-- Now drop the role column and enum
ALTER TABLE profiles DROP COLUMN IF EXISTS role;
DROP TYPE IF EXISTS user_role CASCADE;

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'collector', 'artist');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policy for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Recreate all RLS policies using has_role function

-- Artists table policies
CREATE POLICY "Admins can delete artists"
ON public.artists FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert artists"
ON public.artists FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update artists"
ON public.artists FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Artworks table policies
CREATE POLICY "Published artworks are viewable by everyone"
ON public.artworks FOR SELECT
USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage artworks"
ON public.artworks FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Collections table policies
CREATE POLICY "Admins can manage collections"
ON public.collections FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Artwork images policies
CREATE POLICY "Admins can manage artwork images"
ON public.artwork_images FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Orders policies
CREATE POLICY "Users can view own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Newsletter subscribers policies
CREATE POLICY "Admins can view subscribers"
ON public.newsletter_subscribers FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage subscribers"
ON public.newsletter_subscribers FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update handle_new_user function to assign default collector role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  -- Assign default collector role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'collector');
  
  RETURN NEW;
END;
$$;

-- Create storage bucket for artwork images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artworks',
  'artworks',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for artworks bucket
CREATE POLICY "Public can view artwork images"
ON storage.objects FOR SELECT
USING (bucket_id = 'artworks');

CREATE POLICY "Admins can upload artwork images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'artworks' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update artwork images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'artworks' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete artwork images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'artworks' AND
  public.has_role(auth.uid(), 'admin')
);