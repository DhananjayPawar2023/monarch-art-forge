-- Journal posts table
CREATE TABLE IF NOT EXISTS public.journal_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  author_id UUID REFERENCES public.profiles(id),
  artist_id UUID REFERENCES public.artists(id),
  collection_id UUID REFERENCES public.collections(id),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published journal posts"
  ON public.journal_posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage journal posts"
  ON public.journal_posts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Artist follows (collectors follow artists)
CREATE TABLE IF NOT EXISTS public.artist_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, artist_id)
);

ALTER TABLE public.artist_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view follows"
  ON public.artist_follows FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own follows"
  ON public.artist_follows FOR ALL
  USING (auth.uid() = follower_id);

-- Artist applications
CREATE TABLE IF NOT EXISTS public.artist_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  email TEXT NOT NULL,
  portfolio_url TEXT,
  instagram_url TEXT,
  bio TEXT,
  sample_work_urls TEXT[],
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.artist_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON public.artist_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications"
  ON public.artist_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage applications"
  ON public.artist_applications FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Purchase inquiries
CREATE TABLE IF NOT EXISTS public.purchase_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inquiries"
  ON public.purchase_inquiries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create inquiries"
  ON public.purchase_inquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage inquiries"
  ON public.purchase_inquiries FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Activity feed for engagement tracking
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON public.activity_feed FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create activity"
  ON public.activity_feed FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all activity"
  ON public.activity_feed FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Add verification badge to artists
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_journal_posts_published ON public.journal_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_artist_follows_artist ON public.artist_follows(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_follows_follower ON public.artist_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON public.activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artist_applications_status ON public.artist_applications(status);
CREATE INDEX IF NOT EXISTS idx_purchase_inquiries_status ON public.purchase_inquiries(status);

-- Function to update follower count
CREATE OR REPLACE FUNCTION public.update_artist_follower_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.artists SET follower_count = follower_count + 1 WHERE id = NEW.artist_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.artists SET follower_count = follower_count - 1 WHERE id = OLD.artist_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_artist_follow_change ON public.artist_follows;
CREATE TRIGGER on_artist_follow_change
AFTER INSERT OR DELETE ON public.artist_follows
FOR EACH ROW EXECUTE FUNCTION public.update_artist_follower_count();