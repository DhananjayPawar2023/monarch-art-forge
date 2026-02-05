-- Fix decrement_edition_available to require valid order authorization
CREATE OR REPLACE FUNCTION public.decrement_edition_available(artwork_id uuid, order_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller has a valid order for this artwork
  IF order_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_id
      AND orders.artwork_id = decrement_edition_available.artwork_id
      AND user_id = auth.uid()
      AND payment_status IN ('completed', 'pending', 'processing')
    ) THEN
      RAISE EXCEPTION 'Unauthorized: No valid order found for this artwork';
    END IF;
  ELSE
    -- Fallback: verify user has ANY recent pending/completed order for this artwork
    IF NOT EXISTS (
      SELECT 1 FROM orders
      WHERE orders.artwork_id = decrement_edition_available.artwork_id
      AND user_id = auth.uid()
      AND payment_status IN ('completed', 'pending', 'processing')
      AND created_at > NOW() - INTERVAL '5 minutes'
    ) THEN
      RAISE EXCEPTION 'Unauthorized: No recent order found for this artwork';
    END IF;
  END IF;

  UPDATE artworks
  SET edition_available = GREATEST(edition_available - 1, 0)
  WHERE id = artwork_id;
END;
$$;