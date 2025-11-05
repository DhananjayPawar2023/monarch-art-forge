import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Heart } from "lucide-react";

interface Artwork {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  primary_image_url: string | null;
  price_usd: number | null;
  price_eth: number | null;
  medium: string | null;
  dimensions: string | null;
  year: number | null;
  edition_total: number | null;
  edition_available: number | null;
  is_nft: boolean | null;
  chain: string | null;
  contract_address: string | null;
  token_id: string | null;
  artists: {
    name: string;
    slug: string;
  };
}

const ArtworkDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    fetchArtwork();
    if (user) {
      checkWishlist();
    }
  }, [id, user]);

  const fetchArtwork = async () => {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('*, artists(name, slug)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setArtwork(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('artwork_id', id)
        .single();

      setInWishlist(!!data);
    } catch (error) {
      // Not in wishlist
      setInWishlist(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save favorites",
        variant: "destructive",
      });
      return;
    }

    setWishlistLoading(true);

    try {
      if (inWishlist) {
        // Remove from wishlist
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('artwork_id', id);

        setInWishlist(false);
        toast({
          title: "Removed from wishlist",
          description: "The artwork has been removed from your favorites",
        });
      } else {
        // Add to wishlist
        await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            artwork_id: id,
          });

        setInWishlist(true);
        toast({
          title: "Added to wishlist",
          description: "The artwork has been saved to your favorites",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-32 pb-24 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-6">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-32 pb-24 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-serif font-medium mb-4">Artwork Not Found</h1>
            <Link to="/explore">
              <Button>Back to Explore</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "name": artwork.title,
    "creator": { "@type": "Person", "name": artwork.artists?.name },
    "image": artwork.primary_image_url,
    "offers": {
      "@type": "Offer",
      "price": artwork.price_usd,
      "priceCurrency": "USD"
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title={`${artwork.title} by ${artwork.artists?.name || 'Unknown Artist'}`}
        description={artwork.description || `Artwork by ${artwork.artists?.name}`}
        keywords={`${artwork.title}, ${artwork.artists?.name}, ${artwork.medium}, art for sale`}
        image={artwork.primary_image_url || undefined}
        structuredData={structuredData}
      />
      <Header />
      
      <main className="flex-1 pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={artwork.primary_image_url || 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80'}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl font-serif font-medium mb-4">{artwork.title}</h1>
                <Link 
                  to={`/artist/${artwork.artists?.slug}`}
                  className="text-xl text-muted-foreground hover:text-foreground transition-colors"
                >
                  {artwork.artists?.name || 'Unknown Artist'}
                </Link>
              </div>
              
              {artwork.description && (
                <p className="text-lg leading-relaxed">{artwork.description}</p>
              )}
              
              <div className="space-y-4 pt-6 border-t border-border">
                {artwork.medium && (
                  <div>
                    <span className="text-sm text-muted-foreground">Medium</span>
                    <p className="text-lg">{artwork.medium}</p>
                  </div>
                )}
                
                {artwork.dimensions && (
                  <div>
                    <span className="text-sm text-muted-foreground">Dimensions</span>
                    <p className="text-lg">{artwork.dimensions}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm text-muted-foreground">Edition</span>
                  <p className="text-lg">
                    {artwork.edition_total === 1 
                      ? 'Unique work' 
                      : `${artwork.edition_available} of ${artwork.edition_total} available`}
                  </p>
                </div>
                
                {artwork.year && (
                  <div>
                    <span className="text-sm text-muted-foreground">Year</span>
                    <p className="text-lg">{artwork.year}</p>
                  </div>
                )}

                {artwork.is_nft && (
                  <div>
                    <span className="text-sm text-muted-foreground">NFT Details</span>
                    <div className="space-y-1 mt-1">
                      {artwork.chain && <p className="text-sm">Chain: {artwork.chain}</p>}
                      {artwork.contract_address && (
                        <p className="text-sm font-mono">
                          Contract: {artwork.contract_address.slice(0, 8)}...{artwork.contract_address.slice(-6)}
                        </p>
                      )}
                      {artwork.token_id && <p className="text-sm">Token ID: {artwork.token_id}</p>}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-6 border-t border-border">
                <p className="text-4xl font-serif font-medium mb-6">
                  {artwork.price_usd ? `$${artwork.price_usd.toLocaleString()}` : 'Price on request'}
                  {artwork.price_eth && (
                    <span className="text-xl text-muted-foreground ml-4">
                      {artwork.price_eth} ETH
                    </span>
                  )}
                </p>
                
                {artwork.edition_available && artwork.edition_available > 0 ? (
                  <div className="flex gap-4">
                    <Button 
                      size="lg" 
                      className="flex-1"
                      onClick={() => {
                        if (!user) {
                          toast({
                            title: "Please sign in",
                            description: "You need to be signed in to purchase artworks",
                            variant: "destructive",
                          });
                          return;
                        }
                        if (artwork.price_usd) {
                          addToCart({
                            artworkId: artwork.id,
                            title: artwork.title,
                            artistName: artwork.artists?.name || 'Unknown Artist',
                            image: artwork.primary_image_url || '/placeholder.svg',
                            priceUsd: artwork.price_usd,
                            priceEth: artwork.price_eth,
                          });
                        }
                      }}
                    >
                      Add to Cart
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={toggleWishlist}
                      disabled={wishlistLoading}
                    >
                      <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                ) : (
                  <Button size="lg" disabled className="w-full">
                    Sold Out
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ArtworkDetail;
