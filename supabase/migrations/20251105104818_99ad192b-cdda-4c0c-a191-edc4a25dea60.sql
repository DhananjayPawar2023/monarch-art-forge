-- Create function to decrement artwork edition availability
CREATE OR REPLACE FUNCTION decrement_edition_available(artwork_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE artworks
  SET edition_available = GREATEST(edition_available - 1, 0)
  WHERE id = artwork_id;
END;
$$;