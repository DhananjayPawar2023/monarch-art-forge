import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArtistListSkeleton } from "@/components/SkeletonLoaders";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Artist {
  id: string;
  name: string;
  slug: string;
  specialty: string | null;
  bio: string | null;
}

const Artists = () => {
  const { toast } = useToast();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const { data, error } = await supabase
          .from("artists")
          .select("id, name, slug, specialty, bio")
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

  const mediums = ["all", "Painting", "Digital", "Photography", "Sculpture"];

  const filteredArtists = filter === "all" 
    ? artists 
    : artists.filter(a => a.specialty?.toLowerCase().includes(filter.toLowerCase()));

  return (
    <>
      <SEO 
        title="Artists | Monarch"
        description="Artists shaping culture across mediums and disciplines. A curated directory of contemporary voices."
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 pt-20 lg:pt-24">
          {/* Hero Section */}
          <section className="py-16 md:py-24 border-b border-border">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-medium tracking-[-0.02em] mb-8">
                Artists
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Artists shaping culture across mediums and disciplines.
              </p>
            </div>
          </section>

          {/* Filters */}
          <section className="py-8 border-b border-border">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
              <nav className="flex flex-wrap gap-6 md:gap-8">
                {mediums.map((medium) => (
                  <button
                    key={medium}
                    onClick={() => setFilter(medium)}
                    className={`text-sm font-serif tracking-wide transition-all duration-300 ease-in-out ${
                      filter === medium 
                        ? "text-foreground" 
                        : "text-foreground/50 hover:text-foreground/80"
                    }`}
                  >
                    {medium === "all" ? "All" : medium}
                  </button>
                ))}
              </nav>
            </div>
          </section>

          {/* Artists Grid */}
          <section className="py-16 md:py-24">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
              {loading ? (
                <ArtistListSkeleton count={6} />
              ) : filteredArtists.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-lg text-muted-foreground font-serif">
                    {filter === "all" 
                      ? "Monarch is curating a select group of artists."
                      : "No artists found in this medium."}
                  </p>
                  {filter === "all" && (
                    <Link 
                      to="/apply-artist" 
                      className="inline-block mt-8 text-sm font-serif tracking-wide text-foreground/60 hover:text-foreground transition-colors duration-300 ease-in-out"
                    >
                      Apply to Join →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                  {filteredArtists.map((artist) => (
                    <Link 
                      key={artist.slug} 
                      to={`/artist/${artist.slug}`}
                      className="group block"
                    >
                      <article className="space-y-3">
                        <h2 className="text-2xl md:text-3xl font-serif font-medium tracking-tight group-hover:text-foreground/60 transition-colors duration-300 ease-in-out">
                          {artist.name}
                        </h2>
                        
                        {artist.specialty && (
                          <p className="text-sm text-muted-foreground tracking-wide">
                            {artist.specialty}
                          </p>
                        )}
                        
                        <span className="block text-sm font-serif text-foreground/50 group-hover:text-foreground/70 transition-colors duration-300 ease-in-out">
                          View Artist →
                        </span>
                      </article>
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
