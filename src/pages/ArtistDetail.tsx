import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ArtworkCard from "@/components/ArtworkCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Twitter, Globe, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FollowButton from "@/components/FollowButton";

interface Artist {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  specialty: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  website_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  artwork_count: number | null;
}

interface Artwork {
  id: string;
  title: string;
  slug: string;
  primary_image_url: string | null;
  price_usd: number | null;
  edition_total: number | null;
}

const ArtistDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        // Fetch artist
        const { data: artistData, error: artistError } = await supabase
          .from("artists")
          .select("*")
          .eq("slug", slug)
          .single();

        if (artistError) throw artistError;
        setArtist(artistData);

        // Fetch artworks by this artist
        const { data: artworksData, error: artworksError } = await supabase
          .from("artworks")
          .select("id, title, slug, primary_image_url, price_usd, edition_total")
          .eq("artist_id", artistData.id)
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (artworksError) throw artworksError;
        setArtworks(artworksData || []);
      } catch (error: any) {
        console.error("Error fetching artist:", error);
        toast({
          title: "Error",
          description: "Failed to load artist profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArtistData();
    }
  }, [slug, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <Skeleton className="aspect-[3/4] w-full" />
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

  if (!artist) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-4xl font-serif font-medium mb-4">Artist Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The artist you're looking for doesn't exist.
            </p>
            <Link to="/artists">
              <Button>Back to Artists</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${artist.name} - Artist`}
        description={artist.bio || `${artist.name}, ${artist.specialty || 'Artist'}. View artworks and profile at Monarch Gallery.`}
        image={artist.avatar_url || artist.cover_image_url || undefined}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 pt-16">
          {/* Hero Section */}
          <section className="py-16 border-b border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Artist Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  {(artist.avatar_url || artist.cover_image_url) && (
                    <img
                      src={artist.cover_image_url || artist.avatar_url || ""}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Artist Info */}
                <div className="space-y-6 lg:pt-8">
                  <div>
                    <h1 className="text-5xl md:text-6xl font-serif font-medium mb-2">
                      {artist.name}
                    </h1>
                    {artist.specialty && (
                      <p className="text-xl font-serif italic text-muted-foreground">
                        {artist.specialty}
                      </p>
                    )}
                  </div>

                  {artist.bio && (
                    <p className="text-foreground leading-relaxed max-w-xl">
                      {artist.bio}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium">
                      {artworks.length} {artworks.length === 1 ? 'artwork' : 'artworks'}
                    </span>
                  </div>

                  {/* Follow Button */}
                  <div className="pt-4">
                    <FollowButton artistId={artist.id} variant="default" size="lg" />
                  </div>

                  {/* Social Links */}
                  {(artist.website_url || artist.instagram_url || artist.twitter_url) && (
                    <div className="flex gap-3 pt-4">
                      {artist.website_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={artist.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            Website
                          </a>
                        </Button>
                      )}
                      {artist.instagram_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={artist.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Instagram className="w-4 h-4 mr-2" />
                            Instagram
                          </a>
                        </Button>
                      )}
                      {artist.twitter_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={artist.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Twitter className="w-4 h-4 mr-2" />
                            Twitter
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Artworks Section */}
          <section className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-serif font-medium mb-8">Artworks</h2>
              
              {artworks.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">
                  No artworks available yet
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {artworks.map((artwork) => (
                    <ArtworkCard
                      key={artwork.id}
                      id={artwork.id}
                      title={artwork.title}
                      artistName={artist.name}
                      image={artwork.primary_image_url || ""}
                      price={artwork.price_usd ? `$${artwork.price_usd.toLocaleString()}` : undefined}
                      edition={artwork.edition_total === 1 ? "1/1" : `Edition of ${artwork.edition_total}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ArtistDetail;
