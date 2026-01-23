import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ImageViewer from "@/components/ImageViewer";
import ArtworkInfoPanel from "@/components/ArtworkInfoPanel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Info, Expand, ArrowLeft, Heart } from "lucide-react";

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
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

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

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to purchase artworks",
        variant: "destructive",
      });
      return;
    }
    if (artwork?.price_usd) {
      addToCart({
        artworkId: artwork.id,
        title: artwork.title,
        artistName: artwork.artists?.name || 'Unknown Artist',
        image: artwork.primary_image_url || '/placeholder.svg',
        priceUsd: artwork.price_usd,
        priceEth: artwork.price_eth,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pt-16 lg:pt-20">
          <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] flex items-center justify-center">
            <Skeleton className="w-full h-full max-w-4xl max-h-[80vh] mx-4" />
          </div>
        </main>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-serif font-medium mb-4">Artwork Not Found</h1>
            <p className="text-foreground/60 mb-8">This work could not be located in our collection.</p>
            <Link to="/explore">
              <Button>Return to Gallery</Button>
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

  const imageUrl = artwork.primary_image_url || 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80';

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <SEO 
        title={`${artwork.title} by ${artwork.artists?.name || 'Unknown Artist'}`}
        description={artwork.description || `Artwork by ${artwork.artists?.name}`}
        keywords={`${artwork.title}, ${artwork.artists?.name}, ${artwork.medium}, art for sale`}
        image={artwork.primary_image_url || undefined}
        structuredData={structuredData}
      />

      {/* Immersive Header Overlay */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/explore"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-sm font-serif hidden sm:inline">Back to Gallery</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className="p-3 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300"
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-white' : ''}`} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setIsViewerOpen(true)}
              className="p-3 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300"
              aria-label="View full screen"
            >
              <Expand className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setIsPanelOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300"
            >
              <Info className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm font-serif">Details</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Full-Screen Image */}
      <main className="flex-1 relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex items-center justify-center p-4 md:p-8 lg:p-12"
        >
          <div 
            className="relative max-w-6xl w-full h-full flex items-center justify-center cursor-pointer group"
            onClick={() => setIsViewerOpen(true)}
          >
            <img
              src={imageUrl}
              alt={artwork.title}
              className="max-w-full max-h-full object-contain shadow-2xl"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <Expand className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-8">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-medium text-white mb-2">
                {artwork.title}
              </h1>
              <Link 
                to={`/artist/${artwork.artists?.slug}`}
                className="text-lg text-white/70 hover:text-white transition-colors"
              >
                {artwork.artists?.name || 'Unknown Artist'}
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-serif text-white">
                  {artwork.price_usd ? `$${artwork.price_usd.toLocaleString()}` : 'Price on request'}
                </p>
                {artwork.price_eth && (
                  <p className="text-sm text-white/60">{artwork.price_eth} ETH</p>
                )}
              </div>
              <Button
                onClick={() => setIsPanelOpen(true)}
                size="lg"
                className="bg-white text-black hover:bg-white/90 border-0"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Full-Screen Image Viewer */}
      <ImageViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        src={imageUrl}
        alt={artwork.title}
      />

      {/* Sliding Info Panel */}
      <ArtworkInfoPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        artwork={artwork}
        user={user}
        inWishlist={inWishlist}
        wishlistLoading={wishlistLoading}
        onToggleWishlist={toggleWishlist}
        onAddToCart={handleAddToCart}
        onRefreshArtwork={fetchArtwork}
      />
    </div>
  );
};

export default ArtworkDetail;
