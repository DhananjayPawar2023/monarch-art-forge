import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ArtworkCard from '@/components/ArtworkCard';

interface WishlistItem {
  id: string;
  artwork_id: string;
  artworks: {
    id: string;
    title: string;
    slug: string;
    primary_image_url: string | null;
    price_usd: number | null;
    artists: {
      name: string;
      slug: string;
    };
  };
}

const Wishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          artwork_id,
          artworks (
            id,
            title,
            slug,
            primary_image_url,
            price_usd,
            artists (name, slug)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading wishlist",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      setItems(items.filter(item => item.id !== wishlistId));
      toast({
        title: "Removed from wishlist",
        description: "The artwork has been removed from your wishlist",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEO title="Wishlist" description="Your saved artworks" />
        <Header />
        <main className="flex-1 pt-32 pb-24 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <Heart className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-4xl font-serif font-medium mb-4">Sign in to view your wishlist</h1>
            <Link to="/auth">
              <Button size="lg">Sign In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="My Wishlist" description="Your saved artworks" />
      <Header />
      
      <main className="flex-1 pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-5xl font-serif font-medium mb-12">My Wishlist</h1>

          {loading ? (
            <p>Loading...</p>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
              <p className="text-xl text-muted-foreground mb-6">Your wishlist is empty</p>
              <Link to="/explore">
                <Button>Explore Artworks</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {items.map((item) => (
                <div key={item.id} className="relative">
                  <ArtworkCard
                    id={item.artworks.id}
                    title={item.artworks.title}
                    artistName={item.artworks.artists.name}
                    artistSlug={item.artworks.artists.slug}
                    imageUrl={item.artworks.primary_image_url || ''}
                    priceUsd={item.artworks.price_usd}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <Heart className="w-5 h-5 fill-current text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Wishlist;
