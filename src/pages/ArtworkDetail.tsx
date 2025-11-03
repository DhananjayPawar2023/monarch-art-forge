import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  is_physical: boolean | null;
  is_nft: boolean | null;
  artist_id: string;
  artists: {
    name: string;
    slug: string;
    avatar_url: string | null;
    specialty: string | null;
  };
}

const ArtworkDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const { data, error } = await supabase
          .from("artworks")
          .select(`
            *,
            artists (
              name,
              slug,
              avatar_url,
              specialty
            )
          `)
          .eq("id", id)
          .eq("status", "published")
          .single();

        if (error) throw error;
        setArtwork(data as Artwork);
      } catch (error: any) {
        console.error("Error fetching artwork:", error);
        toast({
          title: "Error",
          description: "Failed to load artwork",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArtwork();
    }
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-6">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-12 w-1/3" />
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
        <main className="flex-1 pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-4xl font-serif font-medium mb-4">Artwork Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The artwork you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/explore">
              <Button>Back to Explore</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const editionText = artwork.edition_total === 1 
    ? "1/1 Unique"
    : `Edition of ${artwork.edition_total}`;

  return (
    <>
      <SEO 
        title={`${artwork.title} - ${artwork.artists.name}`}
        description={artwork.description || `${artwork.title} by ${artwork.artists.name}. ${artwork.medium || 'Artwork'} available at Monarch Gallery.`}
        image={artwork.primary_image_url || undefined}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 pt-16">
          <section className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {artwork.primary_image_url && (
                    <img
                      src={artwork.primary_image_url}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Details */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-4xl md:text-5xl font-serif font-medium mb-2">
                        {artwork.title}
                      </h1>
                      <Link 
                        to={`/artist/${artwork.artists.slug}`}
                        className="text-xl text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {artwork.artists.name}
                      </Link>
                    </div>

                    {artwork.year && (
                      <p className="text-sm text-muted-foreground">{artwork.year}</p>
                    )}
                  </div>

                  {artwork.description && (
                    <div className="space-y-2">
                      <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
                        About This Work
                      </h2>
                      <p className="text-foreground leading-relaxed">
                        {artwork.description}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4 py-6 border-y border-border">
                    {artwork.medium && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Medium</span>
                        <span className="font-medium">{artwork.medium}</span>
                      </div>
                    )}
                    {artwork.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions</span>
                        <span className="font-medium">{artwork.dimensions}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Edition</span>
                      <span className="font-medium">{editionText}</span>
                    </div>
                    {artwork.edition_available !== null && artwork.edition_available > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available</span>
                        <span className="font-medium">{artwork.edition_available} remaining</span>
                      </div>
                    )}
                    {artwork.is_nft && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Format</span>
                        <span className="font-medium">NFT</span>
                      </div>
                    )}
                    {artwork.is_physical && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium">Physical Artwork</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {artwork.price_usd && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-serif font-medium">
                          ${artwork.price_usd.toLocaleString()}
                        </span>
                        {artwork.price_eth && (
                          <span className="text-lg text-muted-foreground">
                            / {artwork.price_eth} ETH
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button size="lg" className="flex-1">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Purchase
                      </Button>
                      <Button variant="outline" size="lg">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>

                    {artwork.edition_available === 0 && (
                      <p className="text-sm text-destructive">
                        This edition is currently sold out
                      </p>
                    )}
                  </div>

                  {/* Artist Info */}
                  <Link 
                    to={`/artist/${artwork.artists.slug}`}
                    className="block p-6 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {artwork.artists.avatar_url && (
                        <img
                          src={artwork.artists.avatar_url}
                          alt={artwork.artists.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm uppercase tracking-wider text-muted-foreground mb-1">
                          Artist
                        </p>
                        <p className="text-lg font-serif font-medium mb-1">
                          {artwork.artists.name}
                        </p>
                        {artwork.artists.specialty && (
                          <p className="text-sm text-muted-foreground">
                            {artwork.artists.specialty}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ArtworkDetail;
