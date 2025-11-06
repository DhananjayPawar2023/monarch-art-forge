import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArtworkCard from '@/components/ArtworkCard';
import SEO from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, Clock } from 'lucide-react';

interface Listing {
  id: string;
  listing_type: string;
  price_usd: number;
  price_eth: number;
  auction_end_at: string | null;
  artworks: {
    id: string;
    title: string;
    slug: string;
    primary_image_url: string;
    artist_id: string;
    artists: {
      name: string;
      slug: string;
    };
  };
}

const SecondaryMarket = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'fixed' | 'auction'>('all');

  useEffect(() => {
    fetchListings();
  }, [filter]);

  const fetchListings = async () => {
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          artworks (
            id,
            title,
            slug,
            primary_image_url,
            artist_id,
            artists (
              name,
              slug
            )
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('listing_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Secondary Market - Buy Resale Artworks"
        description="Explore artworks listed for resale by collectors. Find unique pieces and support artists through royalties."
        keywords="secondary market, art resale, NFT marketplace, art auctions"
      />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Secondary Market</h1>
            <p className="text-lg text-muted-foreground">
              Discover artworks listed for resale by collectors. Every purchase includes artist royalties.
            </p>
          </div>

          <Tabs defaultValue="all" className="mb-8" onValueChange={(v) => setFilter(v as any)}>
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                All Listings
              </TabsTrigger>
              <TabsTrigger value="fixed" className="gap-2">
                <Badge variant="outline" className="gap-1">
                  Fixed Price
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="auction" className="gap-2">
                <Clock className="w-4 h-4" />
                Auctions
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-8">
              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading listings...</p>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-muted-foreground">No listings available yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Check back soon for new artworks on the secondary market
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <div key={listing.id} className="relative">
                      <ArtworkCard
                        id={listing.artworks.slug}
                        title={listing.artworks.title}
                        artistName={listing.artworks.artists.name}
                        imageUrl={listing.artworks.primary_image_url}
                        priceUsd={listing.price_usd}
                      />
                      <div className="absolute top-3 left-3">
                        {listing.listing_type === 'auction' ? (
                          <Badge className="bg-primary/90 backdrop-blur-sm">
                            <Clock className="w-3 h-3 mr-1" />
                            Auction
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="backdrop-blur-sm">
                            Resale
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SecondaryMarket;
