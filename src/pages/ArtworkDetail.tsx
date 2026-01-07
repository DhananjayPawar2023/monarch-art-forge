import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import MakeOfferDialog from "@/components/MakeOfferDialog";
import OffersList from "@/components/OffersList";
import PurchaseInquiryDialog from "@/components/PurchaseInquiryDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Heart, DollarSign } from "lucide-react";

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
  royalty_percentage: number | null;
  current_owner_id: string | null;
  artist_id: string;
  artists: {
    name: string;
    slug: string;
    user_id: string | null;
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
        .select('*, artists(name, slug, user_id)')
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
        <main className="flex-1 pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-24 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-4 sm:space-y-6">
                <Skeleton className="h-8 sm:h-12 w-3/4" />
                <Skeleton className="h-5 sm:h-6 w-1/2" />
                <Skeleton className="h-24 sm:h-32 w-full" />
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
        <main className="flex-1 pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-24 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium mb-4">Artwork Not Found</h1>
            <Link to="/explore">
              <Button size="sm" className="h-9 sm:h-10">Back to Explore</Button>
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
      
      <main className="flex-1 pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Image */}
            <div className="space-y-4 sm:space-y-6">
              <div className="aspect-square overflow-hidden bg-muted rounded-sm">
                <img
                  src={artwork.primary_image_url || 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80'}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Details */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-medium mb-2 sm:mb-4">{artwork.title}</h1>
                <Link 
                  to={`/artist/${artwork.artists?.slug}`}
                  className="text-base sm:text-lg md:text-xl text-muted-foreground hover:text-foreground transition-colors"
                >
                  {artwork.artists?.name || 'Unknown Artist'}
                </Link>
              </div>
              
              {artwork.description && (
                <p className="text-sm sm:text-base md:text-lg leading-relaxed">{artwork.description}</p>
              )}
              
              {/* Artwork details grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-border">
                {artwork.medium && (
                  <div>
                    <span className="text-xs sm:text-sm text-muted-foreground">Medium</span>
                    <p className="text-sm sm:text-base md:text-lg">{artwork.medium}</p>
                  </div>
                )}
                
                {artwork.dimensions && (
                  <div>
                    <span className="text-xs sm:text-sm text-muted-foreground">Dimensions</span>
                    <p className="text-sm sm:text-base md:text-lg">{artwork.dimensions}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-xs sm:text-sm text-muted-foreground">Edition</span>
                  <p className="text-sm sm:text-base md:text-lg">
                    {artwork.edition_total === 1 
                      ? 'Unique work' 
                      : `${artwork.edition_available}/${artwork.edition_total}`}
                  </p>
                </div>
                
                {artwork.year && (
                  <div>
                    <span className="text-xs sm:text-sm text-muted-foreground">Year</span>
                    <p className="text-sm sm:text-base md:text-lg">{artwork.year}</p>
                  </div>
                )}
              </div>

              {artwork.is_nft && (
                <div className="pt-2 sm:pt-4">
                  <span className="text-xs sm:text-sm text-muted-foreground">NFT Details</span>
                  <div className="grid grid-cols-2 gap-2 mt-1 text-xs sm:text-sm">
                    {artwork.chain && <p>Chain: {artwork.chain}</p>}
                    {artwork.contract_address && (
                      <p className="font-mono truncate">
                        Contract: {artwork.contract_address.slice(0, 6)}...{artwork.contract_address.slice(-4)}
                      </p>
                    )}
                    {artwork.token_id && <p>Token ID: {artwork.token_id}</p>}
                  </div>
                </div>
              )}
              
              {/* Pricing section */}
              <div className="pt-4 sm:pt-6 border-t border-border">
                <div className="mb-4 sm:mb-6">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium">
                    {artwork.price_usd ? `$${artwork.price_usd.toLocaleString()}` : 'Price on request'}
                  </p>
                  {artwork.price_eth && (
                    <span className="text-base sm:text-lg md:text-xl text-muted-foreground">
                      {artwork.price_eth} ETH
                    </span>
                  )}
                  {artwork.royalty_percentage && (
                    <span className="block text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                      Artist royalty: {artwork.royalty_percentage}% on secondary sales
                    </span>
                  )}
                </div>
                
                {artwork.edition_available && artwork.edition_available > 0 ? (
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <Button 
                      size="sm"
                      className="flex-1 min-w-[120px] h-9 sm:h-10 text-sm"
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
                    <MakeOfferDialog
                      artworkId={artwork.id}
                      sellerId={artwork.artists?.user_id || artwork.current_owner_id || ''}
                      currentPriceUsd={artwork.price_usd || undefined}
                      trigger={
                        <Button size="sm" variant="outline" className="gap-1.5 h-9 sm:h-10 text-sm">
                          <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="hidden xs:inline">Make</span> Offer
                        </Button>
                      }
                    />
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={toggleWishlist}
                      disabled={wishlistLoading}
                      className="h-9 sm:h-10 w-9 sm:w-10 p-0"
                    >
                      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${inWishlist ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <Button size="sm" disabled className="w-full h-9 sm:h-10 text-sm">
                      Sold Out
                    </Button>
                    <PurchaseInquiryDialog 
                      artworkId={artwork.id} 
                      artworkTitle={artwork.title} 
                    />
                  </div>
                )}

                {/* Offers Section */}
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="w-full h-9 sm:h-10">
                    <TabsTrigger value="details" className="flex-1 text-sm">Details</TabsTrigger>
                    <TabsTrigger value="offers" className="flex-1 text-sm">Offers</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      <p>Full artwork details and provenance information.</p>
                      {artwork.is_nft && (
                        <p className="mt-2">This artwork is minted as an NFT on {artwork.chain}.</p>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="offers" className="pt-3 sm:pt-4">
                    <OffersList
                      artworkId={artwork.id}
                      sellerId={artwork.artists?.user_id || artwork.current_owner_id || ''}
                      onOfferAccepted={() => fetchArtwork()}
                    />
                  </TabsContent>
                </Tabs>
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
