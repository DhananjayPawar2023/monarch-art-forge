import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ArtworkCard from "@/components/ArtworkCard";
import FadeIn from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Artwork {
  id: string;
  title: string;
  slug: string;
  primary_image_url: string | null;
  price_usd: number | null;
  edition_total: number | null;
  medium: string | null;
  tags: string[] | null;
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
          edition_total,
          medium,
          tags,
          created_at,
          view_count,
          artists (name)
        `, { count: 'exact' })
        .eq("status", "published")
        .range(from, to);

      // Apply medium filter
      if (filterMedium !== "all") {
        query = query.ilike("medium", `%${filterMedium}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case "price-low":
          query = query.order("price_usd", { ascending: true, nullsFirst: false });
          break;
        case "price-high":
          query = query.order("price_usd", { ascending: false, nullsFirst: false });
          break;
        case "popular":
          query = query.order("view_count", { ascending: false });
          break;
        default: // newest
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
        title="Explore Artworks"
        description="Discover curated artworks from emerging and established artists. Browse paintings, digital art, photography, and sculpture."
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium mb-6">
              Explore
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Discover curated artworks from emerging and established artists
            </p>
          </div>
        </section>

        {/* Filters & Sort */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={filterMedium === "all" ? "outline" : "ghost"} 
                  size="sm"
                  onClick={() => setFilterMedium("all")}
                >
                  All
                </Button>
                <Button 
                  variant={filterMedium === "painting" ? "outline" : "ghost"} 
                  size="sm"
                  onClick={() => setFilterMedium("painting")}
                >
                  Paintings
                </Button>
                <Button 
                  variant={filterMedium === "digital" ? "outline" : "ghost"} 
                  size="sm"
                  onClick={() => setFilterMedium("digital")}
                >
                  Digital
                </Button>
                <Button 
                  variant={filterMedium === "photography" ? "outline" : "ghost"} 
                  size="sm"
                  onClick={() => setFilterMedium("photography")}
                >
                  Photography
                </Button>
                <Button 
                  variant={filterMedium === "sculpture" ? "outline" : "ghost"} 
                  size="sm"
                  onClick={() => setFilterMedium("sculpture")}
                >
                  Sculpture
                </Button>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Artworks Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {loading && artworks.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : artworks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No artworks found. Try adjusting your filters.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {artworks.map((artwork) => (
                    <ArtworkCard 
                      key={artwork.id}
                      id={artwork.id}
                      title={artwork.title}
                      artistName={artwork.artists.name}
                      image={artwork.primary_image_url || ""}
                      price={artwork.price_usd ? `$${artwork.price_usd.toLocaleString()}` : undefined}
                      edition={artwork.edition_total === 1 ? "1/1" : `Edition of ${artwork.edition_total}`}
                    />
                  ))}
                </div>
                
                {hasMore && (
                  <div className="mt-16 text-center">
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={handleLoadMore}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </Button>
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
