import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ArtworkCard from "@/components/ArtworkCard";
import { Heart, Users, ShoppingBag, Bell, UserPlus } from "lucide-react";

interface FollowedArtist {
  id: string;
  artist_id: string;
  artists: {
    id: string;
    name: string;
    slug: string;
    avatar_url: string | null;
    specialty: string | null;
  };
}

interface WishlistItem {
  id: string;
  artworks: {
    id: string;
    title: string;
    primary_image_url: string | null;
    price_usd: number | null;
    artists: { name: string } | null;
  };
}

interface PurchaseHistory {
  id: string;
  order_number: string;
  amount_usd: number | null;
  payment_status: string;
  created_at: string;
  artworks: {
    title: string;
    primary_image_url: string | null;
  };
}

const CollectorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [followedArtists, setFollowedArtists] = useState<FollowedArtist[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCollectorData();
    }
  }, [user]);

  const fetchCollectorData = async () => {
    try {
      // Fetch followed artists
      const { data: follows } = await supabase
        .from('artist_follows')
        .select(`
          id,
          artist_id,
          artists (id, name, slug, avatar_url, specialty)
        `)
        .eq('follower_id', user?.id);

      setFollowedArtists((follows as any) || []);

      // Fetch wishlist
      const { data: wishlistData } = await supabase
        .from('wishlist')
        .select(`
          id,
          artworks (id, title, primary_image_url, price_usd, artists (name))
        `)
        .eq('user_id', user?.id);

      setWishlist((wishlistData as any) || []);

      // Fetch purchase history
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          amount_usd,
          payment_status,
          created_at,
          artworks (title, primary_image_url)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setPurchases((ordersData as any) || []);
    } catch (error: any) {
      console.error('Error fetching collector data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (artistId: string) => {
    try {
      const { error } = await supabase
        .from('artist_follows')
        .delete()
        .eq('follower_id', user?.id)
        .eq('artist_id', artistId);

      if (error) throw error;

      setFollowedArtists(prev => prev.filter(f => f.artist_id !== artistId));
      toast({
        title: "Unfollowed",
        description: "You've unfollowed this artist.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-32">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <SEO title="Collector Dashboard" description="Manage your collection and followed artists" />
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-32">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-medium">Your Collection</h1>
            <p className="text-muted-foreground mt-2">Manage your wishlist, followed artists, and purchases</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{wishlist.length}</p>
                    <p className="text-sm text-muted-foreground">Saved Artworks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-full">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{followedArtists.length}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <ShoppingBag className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{purchases.length}</p>
                    <p className="text-sm text-muted-foreground">Purchases</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <Bell className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">New Releases</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="wishlist" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
              <TabsTrigger value="purchases">Purchases</TabsTrigger>
            </TabsList>

            <TabsContent value="wishlist" className="mt-8">
              {wishlist.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No saved artworks</h3>
                    <p className="text-muted-foreground mb-4">Browse and save artworks you love</p>
                    <Link to="/explore">
                      <Button>Explore Art</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((item) => (
                    <ArtworkCard
                      key={item.id}
                      id={item.artworks.id}
                      title={item.artworks.title}
                      artistName={item.artworks.artists?.name || 'Unknown Artist'}
                      imageUrl={item.artworks.primary_image_url || ''}
                      priceUsd={item.artworks.price_usd}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="following" className="mt-8">
              {followedArtists.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Not following anyone yet</h3>
                    <p className="text-muted-foreground mb-4">Follow artists to get updates on their new work</p>
                    <Link to="/artists">
                      <Button>Browse Artists</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {followedArtists.map((follow) => (
                    <Card key={follow.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-muted overflow-hidden">
                            {follow.artists.avatar_url ? (
                              <img src={follow.artists.avatar_url} alt={follow.artists.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl font-serif">
                                {follow.artists.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <Link to={`/artist/${follow.artists.slug}`} className="font-medium hover:underline">
                              {follow.artists.name}
                            </Link>
                            {follow.artists.specialty && (
                              <p className="text-sm text-muted-foreground">{follow.artists.specialty}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Link to={`/artist/${follow.artists.slug}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">View Profile</Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleUnfollow(follow.artist_id)}
                          >
                            Unfollow
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="purchases" className="mt-8">
              {purchases.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No purchases yet</h3>
                    <p className="text-muted-foreground mb-4">Your purchase history will appear here</p>
                    <Link to="/explore">
                      <Button>Start Collecting</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <Card key={purchase.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-muted rounded overflow-hidden">
                            {purchase.artworks.primary_image_url && (
                              <img src={purchase.artworks.primary_image_url} alt={purchase.artworks.title} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{purchase.artworks.title}</h3>
                            <p className="text-sm text-muted-foreground">Order #{purchase.order_number}</p>
                            <p className="text-sm">{new Date(purchase.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${purchase.amount_usd}</p>
                            <Badge variant={purchase.payment_status === 'completed' ? 'default' : 'secondary'}>
                              {purchase.payment_status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default CollectorDashboard;