import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Clock } from 'lucide-react';

interface Listing {
  id: string;
  listing_type: string;
  price_usd: number;
  is_active: boolean;
  created_at: string;
  auction_end_at: string | null;
  artworks: {
    id: string;
    title: string;
    slug: string;
    primary_image_url: string;
    artists: {
      name: string;
    };
  };
}

const MyListings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user]);

  const fetchListings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          artworks (
            id,
            title,
            slug,
            primary_image_url,
            artists (
              name
            )
          )
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: "Listing removed",
        description: "Your listing has been removed from the marketplace",
      });

      fetchListings();
    } catch (error: any) {
      toast({
        title: "Failed to remove listing",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (listingId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ is_active: !currentStatus })
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Listing deactivated" : "Listing activated",
        description: currentStatus 
          ? "Your listing is now hidden from the marketplace"
          : "Your listing is now visible on the marketplace",
      });

      fetchListings();
    } catch (error: any) {
      toast({
        title: "Failed to update listing",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <p className="text-xl text-muted-foreground">Please sign in to view your listings</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="My Listings - Manage Your Sales"
        description="Manage your artwork listings on the secondary marketplace"
      />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">My Listings</h1>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : listings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">You don't have any active listings</p>
                <Button onClick={() => navigate('/profile')}>
                  View Your Collection
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <Card key={listing.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <img
                          src={listing.artworks.primary_image_url}
                          alt={listing.artworks.title}
                          className="w-24 h-24 object-cover rounded-md"
                        />
                        <div>
                          <CardTitle>{listing.artworks.title}</CardTitle>
                          <CardDescription>
                            by {listing.artworks.artists.name}
                          </CardDescription>
                          <div className="flex gap-2 mt-2">
                            <Badge variant={listing.is_active ? 'default' : 'secondary'}>
                              {listing.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">
                              {listing.listing_type === 'auction' ? (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  Auction
                                </>
                              ) : (
                                'Fixed Price'
                              )}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          ${listing.price_usd.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/artwork/${listing.artworks.slug}`)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleToggleActive(listing.id, listing.is_active)}
                      >
                        {listing.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteListing(listing.id)}
                        className="gap-2 ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyListings;
