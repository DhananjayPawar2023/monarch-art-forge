import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  curator_name: string | null;
  cover_image_url: string | null;
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
          .select("id, title, slug, description, curator_name, cover_image_url")
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

  return (
    <>
      <SEO 
        title="Collections"
        description="Explore curated art collections showcasing thematic exhibitions and featured artists."
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 pt-16">
          <section className="py-16 border-b border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium mb-6">
                Collections
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Curated exhibitions exploring themes, movements, and stories through art
              </p>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-[16/9] w-full" />
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : collections.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No collections available yet. Check back soon!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {collections.map((collection) => (
                    <Link
                      key={collection.slug}
                      to={`/collection/${collection.slug}`}
                      className="group block"
                    >
                      <div className="space-y-4">
                        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                          {collection.cover_image_url && (
                            <img
                              src={collection.cover_image_url}
                              alt={collection.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          )}
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-serif font-medium group-hover:text-muted-foreground transition-colors">
                            {collection.title}
                          </h3>
                          {collection.curator_name && (
                            <p className="text-sm text-muted-foreground">
                              Curated by {collection.curator_name}
                            </p>
                          )}
                          {collection.description && (
                            <p className="text-muted-foreground line-clamp-2">
                              {collection.description}
                            </p>
                          )}
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

export default Collections;
