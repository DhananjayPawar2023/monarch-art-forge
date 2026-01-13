import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ArtworkCard from "@/components/ArtworkCard";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  year: number | null;
  medium: string | null;
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
        const { data: artistData, error: artistError } = await supabase
          .from("artists")
          .select("*")
          .eq("slug", slug)
          .single();

        if (artistError) throw artistError;
        setArtist(artistData);

        const { data: artworksData, error: artworksError } = await supabase
          .from("artworks")
          .select("id, title, slug, primary_image_url, price_usd, edition_total, year, medium")
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
        <main className="flex-1 pt-20 lg:pt-24">
          <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-12 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
              <div className="lg:col-span-2">
                <Skeleton className="aspect-[3/4] w-full" />
              </div>
              <div className="lg:col-span-3 space-y-6">
                <Skeleton className="h-16 w-3/4" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-40 w-full" />
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
        <main className="flex-1 pt-20 lg:pt-24">
          <div className="max-w-3xl mx-auto px-6 py-24 text-center">
            <h1 className="text-4xl font-serif mb-4">Artist Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The artist you're looking for doesn't exist.
            </p>
            <Link to="/artists" className="font-serif underline underline-offset-4 hover:opacity-70 transition-opacity">
              Back to Artists
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
        title={`${artist.name}`}
        description={artist.bio || `${artist.name}. View works and profile at Monarch.`}
        image={artist.avatar_url || artist.cover_image_url || undefined}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 pt-20 lg:pt-24">
          {/* Artist Header - Museum Style, Asymmetrical */}
          <section className="py-12 md:py-20 border-b border-border/50">
            <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
                {/* Artist Portrait */}
                <div className="lg:col-span-2">
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted image-frame">
                    {(artist.avatar_url || artist.cover_image_url) && (
                      <img
                        src={artist.cover_image_url || artist.avatar_url || ""}
                        alt={artist.name}
                        className="w-full h-full object-cover hover-illuminate"
                      />
                    )}
                  </div>
                </div>

                {/* Artist Information */}
                <div className="lg:col-span-3 lg:pt-8 space-y-8">
                  {/* Name */}
                  <div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-normal tracking-tight mb-3">
                      {artist.name}
                    </h1>
                    {artist.specialty && (
                      <p className="text-lg md:text-xl font-serif italic text-muted-foreground">
                        {artist.specialty}
                      </p>
                    )}
                  </div>

                  {/* Artist Statement - Gallery Wall Description */}
                  {artist.bio && (
                    <div className="max-w-xl">
                      <p className="text-lg font-serif leading-relaxed text-foreground/90">
                        {artist.bio}
                      </p>
                    </div>
                  )}

                  {/* Minimal Links - No social icons, just text */}
                  {(artist.website_url || artist.instagram_url) && (
                    <div className="pt-4">
                      <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                        {artist.website_url && (
                          <a
                            href={artist.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-serif hover:text-foreground transition-colors"
                          >
                            Website
                          </a>
                        )}
                        {artist.instagram_url && (
                          <a
                            href={artist.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-serif hover:text-foreground transition-colors"
                          >
                            Instagram
                          </a>
                        )}
                        {artist.twitter_url && (
                          <a
                            href={artist.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-serif hover:text-foreground transition-colors"
                          >
                            Twitter
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Editor's Note - Optional curatorial context */}
                  <div className="pt-8 border-t border-border/50">
                    <p className="museum-label mb-3">Editor's Note</p>
                    <p className="text-muted-foreground font-serif text-sm leading-relaxed max-w-md">
                      {artist.name}'s work is part of the Monarch collection, 
                      representing a commitment to artistic excellence and cultural significance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Selected Works */}
          <section className="py-16 md:py-24">
            <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-12">
              <h2 className="text-2xl md:text-3xl font-serif font-normal mb-12">
                Selected Works
              </h2>
              
              {artworks.length === 0 ? (
                <p className="text-muted-foreground font-serif text-center py-16">
                  No works available at this time
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                  {artworks.map((artwork) => (
                    <Link 
                      key={artwork.id} 
                      to={`/artwork/${artwork.id}`}
                      className="group block"
                    >
                      {/* Image */}
                      <div className="aspect-[4/5] overflow-hidden bg-muted mb-4 image-frame">
                        {artwork.primary_image_url && (
                          <img
                            src={artwork.primary_image_url}
                            alt={artwork.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02] hover-illuminate"
                          />
                        )}
                      </div>
                      
                      {/* Artwork Info - Museum Label Style */}
                      <div className="space-y-1">
                        <h3 className="font-serif text-lg group-hover:opacity-70 transition-opacity">
                          {artwork.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-serif">
                          {artwork.year && <span>{artwork.year}</span>}
                          {artwork.year && artwork.medium && <span> · </span>}
                          {artwork.medium && <span>{artwork.medium}</span>}
                        </p>
                      </div>
                    </Link>
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
