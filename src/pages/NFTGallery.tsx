import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Exhibition {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  curator_name: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  is_featured: boolean | null;
}

const Exhibitions = () => {
  const { toast } = useToast();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        // Using collections as exhibitions with is_featured flag
        const { data, error } = await supabase
          .from("collections")
          .select("id, title, slug, description, curator_name, cover_image_url, published_at, is_featured")
          .order("published_at", { ascending: false });

        if (error) throw error;
        setExhibitions(data || []);
      } catch (error: any) {
        console.error("Error fetching exhibitions:", error);
        toast({
          title: "Error",
          description: "Failed to load exhibitions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, [toast]);

  // Separate into current (featured), upcoming, and past
  const currentExhibition = exhibitions.find(e => e.is_featured && e.published_at);
  const upcomingExhibitions = exhibitions.filter(e => !e.published_at);
  const pastExhibitions = exhibitions.filter(e => e.published_at && !e.is_featured);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <>
      <SEO 
        title="Exhibitions | Monarch"
        description="Curated exhibitions presented by Monarch. Experience art as cultural programming."
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 pt-20 lg:pt-24">
          {/* Hero Section */}
          <section className="py-16 md:py-24 border-b border-border">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-medium tracking-tight mb-8">
                Exhibitions
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Curated exhibitions presented by Monarch.
              </p>
            </div>
          </section>

          {loading ? (
            <section className="py-16 md:py-24">
              <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
                <Skeleton className="aspect-[21/9] w-full" />
                <div className="space-y-4">
                  <Skeleton className="h-10 w-2/3" />
                  <Skeleton className="h-5 w-full max-w-xl" />
                </div>
              </div>
            </section>
          ) : exhibitions.length === 0 ? (
            <section className="py-24">
              <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 text-center">
                <p className="text-lg text-muted-foreground font-serif">
                  Exhibitions are being prepared.
                </p>
              </div>
            </section>
          ) : (
            <>
              {/* Current Exhibition - Featured, large */}
              {currentExhibition && (
                <section className="py-16 md:py-24 border-b border-border">
                  <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
                    <p className="museum-label mb-8">Current Exhibition</p>
                    
                    <Link
                      to={`/collection/${currentExhibition.slug}`}
                      className="group block"
                    >
                      {currentExhibition.cover_image_url && (
                        <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-muted mb-10 image-frame">
                          <img
                            src={currentExhibition.cover_image_url}
                            alt={currentExhibition.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02] hover-illuminate"
                          />
                        </div>
                      )}
                      
                      <div className="max-w-3xl">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight mb-6 group-hover:opacity-70 transition-opacity duration-300">
                          {currentExhibition.title}
                        </h2>
                        
                        {currentExhibition.curator_name && (
                          <p className="text-sm text-muted-foreground mb-6 tracking-wide">
                            Curated by {currentExhibition.curator_name}
                          </p>
                        )}
                        
                        {currentExhibition.description && (
                          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
                            {currentExhibition.description}
                          </p>
                        )}
                        
                        {formatDate(currentExhibition.published_at) && (
                          <p className="text-sm text-muted-foreground tracking-wide">
                            {formatDate(currentExhibition.published_at)}
                          </p>
                        )}
                      </div>
                    </Link>
                  </div>
                </section>
              )}

              {/* Upcoming Exhibitions */}
              {upcomingExhibitions.length > 0 && (
                <section className="py-16 md:py-24 border-b border-border">
                  <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
                    <p className="museum-label mb-12">Upcoming</p>
                    
                    <div className="space-y-16">
                      {upcomingExhibitions.map((exhibition) => (
                        <article key={exhibition.id} className="max-w-3xl">
                          <h3 className="text-2xl md:text-3xl font-serif font-medium tracking-tight mb-4">
                            {exhibition.title}
                          </h3>
                          
                          {exhibition.curator_name && (
                            <p className="text-sm text-muted-foreground mb-4 tracking-wide">
                              Curated by {exhibition.curator_name}
                            </p>
                          )}
                          
                          {exhibition.description && (
                            <p className="text-muted-foreground leading-relaxed">
                              {exhibition.description}
                            </p>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Past Exhibitions - Archived */}
              {pastExhibitions.length > 0 && (
                <section className="py-16 md:py-24">
                  <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
                    <p className="museum-label mb-12">Archive</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                      {pastExhibitions.map((exhibition) => (
                        <Link
                          key={exhibition.id}
                          to={`/collection/${exhibition.slug}`}
                          className="group block"
                        >
                          <article>
                            {exhibition.cover_image_url && (
                              <div className="relative aspect-[16/10] overflow-hidden bg-muted mb-6 image-frame">
                                <img
                                  src={exhibition.cover_image_url}
                                  alt={exhibition.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02] hover-illuminate"
                                />
                              </div>
                            )}
                            
                            <h3 className="text-xl md:text-2xl font-serif font-medium tracking-tight mb-2 group-hover:opacity-70 transition-opacity duration-300">
                              {exhibition.title}
                            </h3>
                            
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              {formatDate(exhibition.published_at) && (
                                <span className="tracking-wide">{formatDate(exhibition.published_at)}</span>
                              )}
                              {exhibition.curator_name && (
                                <>
                                  <span className="opacity-30">·</span>
                                  <span className="tracking-wide">{exhibition.curator_name}</span>
                                </>
                              )}
                            </div>
                          </article>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Exhibitions;
