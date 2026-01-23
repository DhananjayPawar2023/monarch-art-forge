import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import OptimizedImage from "@/components/OptimizedImage";
import { CollectionListSkeleton } from "@/components/SkeletonLoaders";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  curator_name: string | null;
  cover_image_url: string | null;
  published_at: string | null;
}

const Collections = () => {
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const { data, error } = await supabase
          .from("collections")
          .select("id, title, slug, description, curator_name, cover_image_url, published_at")
          .not("published_at", "is", null)
          .order("published_at", { ascending: false });

        if (error) throw error;
        setCollections(data || []);
      } catch (error: any) {
        console.error("Error fetching collections:", error);
        toast({
          title: "Error",
          description: "Failed to load collections",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [toast]);

  const getYear = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).getFullYear();
  };

  return (
    <>
      <SEO 
        title="Collections | Monarch"
        description="Curated works assembled around ideas, moments, and movements."
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 pt-20 lg:pt-24">
          {/* Hero Section */}
          <section className="py-16 md:py-24 border-b border-border">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-medium tracking-[-0.02em] mb-8">
                Collections
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Curated works assembled around ideas, moments, and movements.
              </p>
            </div>
          </section>

          {/* Collections */}
          <section className="py-16 md:py-24">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
              {loading ? (
                <CollectionListSkeleton count={3} />
              ) : collections.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-lg text-muted-foreground font-serif">
                    Collections are being curated.
                  </p>
                </div>
              ) : (
                <div className="space-y-24 md:space-y-32">
                  {collections.map((collection) => (
                    <Link
                      key={collection.slug}
                      to={`/collection/${collection.slug}`}
                      className="group block"
                    >
                      <article>
                        {collection.cover_image_url && (
                          <div className="relative aspect-[21/9] md:aspect-[21/8] overflow-hidden bg-muted mb-8 image-frame">
                            <OptimizedImage
                              src={collection.cover_image_url}
                              alt={collection.title}
                              aspectRatio="landscape"
                              className="w-full h-full transition-transform duration-700 ease-in-out group-hover:scale-[1.02]"
                            />
                          </div>
                        )}
                        
                        <div className="max-w-3xl">
                          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium tracking-tight mb-4 group-hover:text-foreground/70 transition-colors duration-300 ease-in-out">
                            {collection.title}
                          </h2>
                          
                          {collection.description && (
                            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                              {collection.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {getYear(collection.published_at) && (
                              <span className="tracking-wide">{getYear(collection.published_at)}</span>
                            )}
                            {collection.curator_name && (
                              <>
                                <span className="opacity-30">·</span>
                                <span className="tracking-wide">Curated by {collection.curator_name}</span>
                              </>
                            )}
                          </div>
                          
                          <span className="block mt-6 text-sm font-serif text-foreground/50 group-hover:text-foreground/70 transition-colors duration-300 ease-in-out">
                            View Collection →
                          </span>
                        </div>
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

export default Collections;
