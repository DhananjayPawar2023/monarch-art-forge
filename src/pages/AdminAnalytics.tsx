import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { 
  Users, 
  ImageIcon, 
  Eye, 
  DollarSign, 
  TrendingUp, 
  UserPlus,
  FileText,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

interface Stats {
  totalArtists: number;
  totalArtworks: number;
  totalCollectors: number;
  totalViews: number;
  pendingApplications: number;
  pendingInquiries: number;
  recentOrders: number;
}

interface Application {
  id: string;
  artist_name: string;
  email: string;
  status: string;
  created_at: string;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
  artworks: { title: string } | null;
}

const AdminAnalytics = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch counts
      const [
        { count: artistCount },
        { count: artworkCount },
        { count: profileCount },
        { data: artworksViews },
        { count: pendingApps },
        { count: pendingInq },
        { count: recentOrderCount }
      ] = await Promise.all([
        supabase.from('artists').select('*', { count: 'exact', head: true }),
        supabase.from('artworks').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('artworks').select('view_count'),
        supabase.from('artist_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('purchase_inquiries').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const totalViews = artworksViews?.reduce((sum, a) => sum + (a.view_count || 0), 0) || 0;

      setStats({
        totalArtists: artistCount || 0,
        totalArtworks: artworkCount || 0,
        totalCollectors: profileCount || 0,
        totalViews,
        pendingApplications: pendingApps || 0,
        pendingInquiries: pendingInq || 0,
        recentOrders: recentOrderCount || 0,
      });

      // Fetch pending applications
      const { data: appsData } = await supabase
        .from('artist_applications')
        .select('id, artist_name, email, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      setApplications(appsData || []);

      // Fetch pending inquiries
      const { data: inqData } = await supabase
        .from('purchase_inquiries')
        .select('id, name, email, status, created_at, artworks(title)')
        .order('created_at', { ascending: false })
        .limit(10);

      setInquiries((inqData as any) || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('artist_applications')
        .update({ 
          status,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const handleInquiryAction = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('purchase_inquiries')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error updating inquiry:', error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
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
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen flex flex-col">
        <SEO title="Admin Analytics" description="Platform analytics and management" />
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-32">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-serif font-medium">Analytics & Management</h1>
              <p className="text-muted-foreground mt-2">Overview of platform activity</p>
            </div>
            <Link to="/admin">
              <Button variant="outline">Back to Admin</Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalArtists}</p>
                    <p className="text-sm text-muted-foreground">Artists</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-full">
                    <ImageIcon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalArtworks}</p>
                    <p className="text-sm text-muted-foreground">Artworks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <Eye className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalViews}</p>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.recentOrders}</p>
                    <p className="text-sm text-muted-foreground">Orders (7d)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {(stats?.pendingApplications || 0) > 0 || (stats?.pendingInquiries || 0) > 0 ? (
            <div className="flex gap-4 mb-8">
              {(stats?.pendingApplications || 0) > 0 && (
                <Badge variant="destructive" className="px-4 py-2">
                  <UserPlus className="w-4 h-4 mr-2" />
                  {stats?.pendingApplications} pending artist applications
                </Badge>
              )}
              {(stats?.pendingInquiries || 0) > 0 && (
                <Badge variant="secondary" className="px-4 py-2">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {stats?.pendingInquiries} pending inquiries
                </Badge>
              )}
            </div>
          ) : null}

          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="applications">Artist Applications</TabsTrigger>
              <TabsTrigger value="inquiries">Purchase Inquiries</TabsTrigger>
            </TabsList>

            <TabsContent value="applications" className="mt-8">
              {applications.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No applications</h3>
                    <p className="text-muted-foreground">Artist applications will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <Card key={app.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{app.artist_name}</h3>
                            <p className="text-sm text-muted-foreground">{app.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Applied {new Date(app.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              app.status === 'approved' ? 'default' : 
                              app.status === 'rejected' ? 'destructive' : 'secondary'
                            }>
                              {app.status}
                            </Badge>
                            {app.status === 'pending' && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => handleApplicationAction(app.id, 'approved')}>
                                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleApplicationAction(app.id, 'rejected')}>
                                  <XCircle className="w-4 h-4 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="inquiries" className="mt-8">
              {inquiries.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No inquiries</h3>
                    <p className="text-muted-foreground">Purchase inquiries will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq) => (
                    <Card key={inq.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{inq.name}</h3>
                            <p className="text-sm text-muted-foreground">{inq.email}</p>
                            {inq.artworks && (
                              <p className="text-sm">Re: {inq.artworks.title}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(inq.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              inq.status === 'completed' ? 'default' : 
                              inq.status === 'contacted' ? 'secondary' : 'outline'
                            }>
                              {inq.status}
                            </Badge>
                            {inq.status === 'pending' && (
                              <Button size="sm" variant="outline" onClick={() => handleInquiryAction(inq.id, 'contacted')}>
                                <Clock className="w-4 h-4 mr-1" /> Mark Contacted
                              </Button>
                            )}
                            {inq.status === 'contacted' && (
                              <Button size="sm" variant="outline" onClick={() => handleInquiryAction(inq.id, 'completed')}>
                                <CheckCircle className="w-4 h-4 mr-1" /> Complete
                              </Button>
                            )}
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

export default AdminAnalytics;