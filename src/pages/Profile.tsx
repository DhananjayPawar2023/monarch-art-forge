import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, User as UserIcon, Wallet } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  payment_status: string;
  amount_usd: number;
  artwork: {
    title: string;
    primary_image_url: string;
    artists: { name: string };
  };
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        created_at,
        payment_status,
        amount_usd,
        artwork:artworks (
          title,
          primary_image_url,
          artists (name)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error loading orders",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEO title="Profile" description="Your profile and orders" />
        <Header />
        <main className="flex-1 pt-32 pb-24 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-serif font-medium mb-4">Please sign in</h1>
            <p className="text-muted-foreground mb-8">You need to be signed in to view your profile</p>
            <Link to="/auth">
              <Button size="lg">Sign In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="My Profile" description="Manage your account and view orders" />
      <Header />
      
      <main className="flex-1 pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-5xl font-serif font-medium mb-4">My Account</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
          
          <Tabs defaultValue="orders" className="space-y-8">
            <TabsList>
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-2">
                <UserIcon className="w-4 h-4" />
                Profile
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders" className="space-y-6">
              <h2 className="text-2xl font-serif font-medium">Order History</h2>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 border border-border rounded-lg">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No orders yet</p>
                  <Link to="/explore">
                    <Button>Start Shopping</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-border p-6 rounded-lg flex gap-6">
                      <img
                        src={order.artwork?.primary_image_url || '/placeholder.svg'}
                        alt={order.artwork?.title}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <h3 className="font-medium text-lg">{order.artwork?.title}</h3>
                          <span className="text-sm px-3 py-1 bg-muted rounded-full">
                            {order.payment_status}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          by {order.artwork?.artists?.name}
                        </p>
                        <div className="flex justify-between items-end">
                          <div className="text-sm text-muted-foreground">
                            Order #{order.order_number}
                            <br />
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-lg font-medium">
                            ${order.amount_usd.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="profile" className="space-y-6">
              <h2 className="text-2xl font-serif font-medium">Profile Information</h2>
              
              <div className="border border-border p-6 rounded-lg space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="text-lg">{user.email}</p>
                </div>
                
                {profile?.full_name && (
                  <div>
                    <label className="text-sm text-muted-foreground">Name</label>
                    <p className="text-lg">{profile.full_name}</p>
                  </div>
                )}
                
                {profile?.wallet_address && (
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Connected Wallet
                    </label>
                    <p className="text-lg font-mono">
                      {profile.wallet_address.slice(0, 8)}...{profile.wallet_address.slice(-6)}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
