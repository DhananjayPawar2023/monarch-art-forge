-- Create offers table for bidding system
CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_amount_usd NUMERIC NOT NULL,
  offer_amount_eth NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled')),
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create secondary market listings table
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_owner_id UUID REFERENCES auth.users(id),
  listing_type TEXT NOT NULL DEFAULT 'fixed' CHECK (listing_type IN ('fixed', 'auction')),
  price_usd NUMERIC NOT NULL,
  price_eth NUMERIC,
  auction_end_at TIMESTAMP WITH TIME ZONE,
  minimum_bid_usd NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales history table
CREATE TABLE public.sales_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sale_price_usd NUMERIC NOT NULL,
  sale_price_eth NUMERIC,
  royalty_amount_usd NUMERIC,
  royalty_paid_to UUID REFERENCES auth.users(id),
  transaction_hash TEXT,
  sale_type TEXT NOT NULL CHECK (sale_type IN ('primary', 'secondary')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add royalty percentage to artworks
ALTER TABLE public.artworks 
ADD COLUMN IF NOT EXISTS royalty_percentage NUMERIC DEFAULT 10.0 CHECK (royalty_percentage >= 0 AND royalty_percentage <= 100);

-- Add current owner to artworks for secondary market
ALTER TABLE public.artworks 
ADD COLUMN IF NOT EXISTS current_owner_id UUID REFERENCES auth.users(id);

-- Enable RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_history ENABLE ROW LEVEL SECURITY;

-- Offers policies
CREATE POLICY "Users can view offers for their artworks or offers they made"
ON public.offers FOR SELECT
USING (
  auth.uid() = buyer_id OR 
  auth.uid() = seller_id OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Authenticated users can create offers"
ON public.offers FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their own offers or received offers"
ON public.offers FOR UPDATE
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Listings policies
CREATE POLICY "Everyone can view active listings"
ON public.listings FOR SELECT
USING (is_active = true OR auth.uid() = seller_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Artwork owners can create listings"
ON public.listings FOR INSERT
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own listings"
ON public.listings FOR UPDATE
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own listings"
ON public.listings FOR DELETE
USING (auth.uid() = seller_id);

-- Sales history policies
CREATE POLICY "Users can view their own sales history"
ON public.sales_history FOR SELECT
USING (
  auth.uid() = buyer_id OR 
  auth.uid() = seller_id OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "System can create sales records"
ON public.sales_history FOR INSERT
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Create indexes for performance
CREATE INDEX idx_offers_artwork_id ON public.offers(artwork_id);
CREATE INDEX idx_offers_buyer_id ON public.offers(buyer_id);
CREATE INDEX idx_offers_seller_id ON public.offers(seller_id);
CREATE INDEX idx_offers_status ON public.offers(status);

CREATE INDEX idx_listings_artwork_id ON public.listings(artwork_id);
CREATE INDEX idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX idx_listings_is_active ON public.listings(is_active);

CREATE INDEX idx_sales_history_artwork_id ON public.sales_history(artwork_id);
CREATE INDEX idx_sales_history_buyer_id ON public.sales_history(buyer_id);
CREATE INDEX idx_sales_history_seller_id ON public.sales_history(seller_id);

-- Trigger to update updated_at
CREATE TRIGGER update_offers_updated_at
BEFORE UPDATE ON public.offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();