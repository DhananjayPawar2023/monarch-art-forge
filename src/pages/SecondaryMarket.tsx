import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Skeleton } from '@/components/ui/skeleton';

interface Edition {
  id: string;
  listing_type: string;
  price_usd: number;
  artworks: {
    id: string;
    title: string;
    slug: string;
    primary_image_url: string;
    edition_total: number | null;
    edition_available: number | null;
    artists: {
      name: string;
      slug: string;
    };
  };
}

const Editions = () => {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'collected'>('all');

  useEffect(() => {
    fetchEditions();
  }, []);

  const fetchEditions = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,
          listing_type,
          price_usd,
          artworks (
            id,
            title,
            slug,
            primary_image_url,
            edition_total,
            edition_available,
            artists (
              name,
              slug
            )
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEditions(data || []);
    } catch (error) {
      console.error('Error fetching editions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEditionStatus = (edition: Edition) => {
    const available = edition.artworks.edition_available ?? 0;
    return available > 0 ? 'available' : 'collected';
  };

  const filteredEditions = filter === 'all' 
    ? editions 
    : editions.filter(e => getEditionStatus(e) === filter);

  const getEditionLabel = (edition: Edition) => {
    const total = edition.artworks.edition_total;
    const available = edition.artworks.edition_available;
    
    if (!total) return null;
    if (total === 1) return "Unique";
    if (available === 0) return "Collected";
    return `Edition of ${total}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Editions | Monarch"
        description="Limited digital editions released by Monarch. Collectible works from contemporary artists."
      />
      <Header />
      
      <main className="flex-1 pt-20 lg:pt-24">
        {/* Hero Section */}
        <section className="py-16 md:py-24 border-b border-border">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-medium tracking-tight mb-8">
              Editions
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Limited digital editions released by Monarch.
            </p>
          </div>
        </section>

        {/* Filters - Minimal, text-based */}
        <section className="py-8 border-b border-border">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
            <nav className="flex gap-6 md:gap-8">
              {(['all', 'available', 'collected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`text-sm font-serif tracking-wide capitalize transition-opacity duration-300 ${
                    filter === status 
                      ? "opacity-100" 
                      : "opacity-40 hover:opacity-70"
                  }`}
                >
                  {status === 'all' ? 'All' : status === 'available' ? 'Available' : 'Collected'}
                </button>
              ))}
            </nav>
          </div>
        </section>

        {/* Editions Grid */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredEditions.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-lg text-muted-foreground font-serif">
                  {filter === 'all' 
                    ? "Editions are being prepared."
                    : `No ${filter} editions at this time.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {filteredEditions.map((edition) => {
                  const status = getEditionStatus(edition);
                  const imageUrl = edition.artworks.primary_image_url || 
                    "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80";

                  return (
                    <Link 
                      key={edition.id} 
                      to={`/artwork/${edition.artworks.slug || edition.artworks.id}`}
                      className="group block"
                    >
                      <article>
                        {/* Artwork Image */}
                        <div className="relative aspect-square overflow-hidden bg-muted mb-6 image-frame">
                          <img
                            src={imageUrl}
                            alt={edition.artworks.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02] hover-illuminate"
                          />
                        </div>
                        
                        {/* Edition Info */}
                        <div className="space-y-2">
                          <h2 className="text-xl md:text-2xl font-serif font-medium tracking-tight group-hover:opacity-70 transition-opacity duration-300">
                            {edition.artworks.title}
                          </h2>
                          
                          <p className="text-sm text-muted-foreground">
                            {edition.artworks.artists?.name || "Unknown artist"}
                          </p>
                          
                          <div className="flex items-center justify-between pt-2">
                            {/* Edition size */}
                            {getEditionLabel(edition) && (
                              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                                {getEditionLabel(edition)}
                              </span>
                            )}
                            
                            {/* Status */}
                            <span className={`text-xs uppercase tracking-widest ${
                              status === 'available' 
                                ? 'text-foreground' 
                                : 'text-muted-foreground'
                            }`}>
                              {status === 'available' ? 'Available' : 'Collected'}
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Editions;
