import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Artist {
  id: string;
  name: string;
  slug: string;
  specialty: string | null;
  artwork_count: number | null;
  avatar_url: string | null;
}

const Artists = () => {
  const { toast } = useToast();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const { data, error } = await supabase
          .from("artists")
          .select("id, name, slug, specialty, artwork_count, avatar_url")
          .order("name", { ascending: true });

        if (error) throw error;
        setArtists(data || []);
      } catch (error: any) {
        console.error("Error fetching artists:", error);
        toast({
          title: "Error",
          description: "Failed to load artists",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, [toast]);

  return (
    <>
      <SEO 
        title="Artists"
        description="Meet the visionaries behind the art. Discover emerging and established artists featured at Monarch Gallery."
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 pt-16">
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium mb-6">
              Artists
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Meet the visionaries behind the art
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <div className="space-y-3 pt-2">
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : artists.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No artists found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {artists.map((artist) => (
                  <Link 
                    key={artist.slug} 
                    to={`/artist/${artist.slug}`}
                    className="group block"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                        {artist.avatar_url && (
                          <img
                            src={artist.avatar_url}
                            alt={artist.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div className="space-y-3 pt-2">
                        <h3 className="text-2xl font-serif font-medium group-hover:text-muted-foreground transition-colors">
                          {artist.name}
                        </h3>
                        {artist.specialty && (
                          <p className="text-muted-foreground">{artist.specialty}</p>
                        )}
                        <p className="text-sm">
                          {artist.artwork_count || 0} {artist.artwork_count === 1 ? 'artwork' : 'artworks'}
                        </p>
                      </div>
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

export default Artists;
