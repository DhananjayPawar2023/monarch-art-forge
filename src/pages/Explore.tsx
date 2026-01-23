import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import OptimizedImage from "@/components/OptimizedImage";
import { ArtworkGridSkeleton } from "@/components/SkeletonLoaders";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Artwork {
  id: string;
  title: string;
  slug: string;
  primary_image_url: string | null;
  price_usd: number | null;
  medium: string | null;
  year: number | null;
  artists: {
    name: string;
  };
}

const Explore = () => {
  const { toast } = useToast();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [filterMedium, setFilterMedium] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 12;

  const mediums = ["all", "Painting", "Digital", "Photography", "Sculpture"];

  const fetchArtworks = async (loadMore = false) => {
    try {
      setLoading(true);
      const currentPage = loadMore ? page : 1;
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from("artworks")
        .select(`
          id,
          title,
          slug,
          primary_image_url,
          price_usd,
          medium,
          year,
          created_at,
          view_count,
          artists (name)
        `, { count: 'exact' })
        .eq("status", "published")
        .range(from, to);

      if (filterMedium !== "all") {
        query = query.ilike("medium", `%${filterMedium}%`);
      }

      switch (sortBy) {
        case "price-low":
          query = query.order("price_usd", { ascending: true, nullsFirst: false });
          break;
        case "price-high":
          query = query.order("price_usd", { ascending: false, nullsFirst: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      if (loadMore) {
        setArtworks((prev) => [...prev, ...(data || [])]);
      } else {
        setArtworks(data || []);
      }

      setHasMore(count ? from + itemsPerPage < count : false);
    } catch (error: any) {
      console.error("Error fetching artworks:", error);
      toast({
        title: "Error",
        description: "Failed to load artworks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchArtworks(false);
  }, [sortBy, filterMedium]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArtworks(true);
  };

  return (
    <>
      <SEO 
        title="Explore | Monarch"
        description="Discover curated artworks from contemporary artists across mediums."
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 pt-20 lg:pt-24">
          {/* Hero Section */}
          <section className="py-16 md:py-24 border-b border-border">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-medium tracking-[-0.02em] mb-8">
                Explore
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Discover curated artworks from contemporary artists.
              </p>
            </div>
          </section>

          {/* Filters */}
          <section className="py-8 border-b border-border">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <nav className="flex flex-wrap gap-6 md:gap-8">
                  {mediums.map((medium) => (
                    <button
                      key={medium}
                      onClick={() => setFilterMedium(medium)}
                      className={`text-sm font-serif tracking-wide transition-all duration-300 ease-in-out ${
                        filterMedium === medium 
                          ? "text-foreground" 
                          : "text-foreground/50 hover:text-foreground/80"
                      }`}
                    >
                      {medium === "all" ? "All" : medium}
                    </button>
                  ))}
                </nav>
                
                <div className="flex items-center gap-4">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Sort</span>
                  <nav className="flex gap-4">
                    {[
                      { value: "newest", label: "Recent" },
                      { value: "price-low", label: "Price ↑" },
                      { value: "price-high", label: "Price ↓" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`text-sm font-serif tracking-wide transition-all duration-300 ease-in-out ${
                          sortBy === option.value 
                            ? "text-foreground" 
                            : "text-foreground/50 hover:text-foreground/80"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </section>

          {/* Artworks Grid */}
          <section className="py-16 md:py-24">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
              {loading && artworks.length === 0 ? (
                <ArtworkGridSkeleton count={6} />
              ) : artworks.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-lg text-muted-foreground font-serif">
                    No artworks found. Try adjusting your filters.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                    {artworks.map((artwork) => {
                      const imageUrl = artwork.primary_image_url || 
                        "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80";

                      return (
                        <Link 
                          key={artwork.id} 
                          to={`/artwork/${artwork.slug || artwork.id}`}
                          className="group block"
                        >
                          <article>
                            <div className="relative mb-6 image-frame">
                              <OptimizedImage
                                src={imageUrl}
                                alt={artwork.title}
                                aspectRatio="portrait"
                                className="transition-transform duration-500 ease-in-out group-hover:scale-[1.02]"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <h2 className="text-lg md:text-xl font-serif font-medium tracking-tight group-hover:text-foreground/70 transition-colors duration-300 ease-in-out">
                                {artwork.title}
                              </h2>
                              
                              <p className="text-sm text-muted-foreground">
                                {artwork.artists?.name}
                                {artwork.year && <span className="opacity-60">, {artwork.year}</span>}
                              </p>
                              
                              {artwork.medium && (
                                <p className="text-xs text-muted-foreground tracking-wide">
                                  {artwork.medium}
                                </p>
                              )}
                            </div>
                          </article>
                        </Link>
                      );
                    })}
                  </div>
                  
                  {hasMore && (
                    <div className="mt-24 text-center">
                      <button 
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="text-sm font-serif tracking-wide text-foreground/60 hover:text-foreground transition-colors duration-300 ease-in-out"
                      >
                        {loading ? 'Loading...' : 'Load More'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Explore;
