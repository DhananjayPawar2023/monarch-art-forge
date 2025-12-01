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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, Eye, Heart, Users, ImageIcon, Edit2, ExternalLink } from "lucide-react";

interface ArtistProfile {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  specialty: string | null;
  avatar_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  artwork_count: number | null;
  follower_count: number | null;
  is_verified: boolean | null;
}

interface Artwork {
  id: string;
  title: string;
  primary_image_url: string | null;
  price_usd: number | null;
  status: string;
  view_count: number | null;
  created_at: string;
}

const ArtistDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchArtistData();
    }
  }, [user]);

  const fetchArtistData = async () => {
    try {
      // Fetch artist profile linked to this user
      const { data: artist, error: artistError } = await supabase
        .from('artists')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (artistError && artistError.code !== 'PGRST116') throw artistError;

      if (artist) {
        setArtistProfile(artist);
        
        // Fetch artworks by this artist
        const { data: artworksData } = await supabase
          .from('artworks')
          .select('id, title, primary_image_url, price_usd, status, view_count, created_at')
          .eq('artist_id', artist.id)
          .order('created_at', { ascending: false });

        setArtworks(artworksData || []);
      }
    } catch (error: any) {
      console.error('Error fetching artist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!artistProfile) return;

    setUploading(true);
    try {
      const formData = new FormData(e.currentTarget);
      
      const { error } = await supabase
        .from('artists')
        .update({
          bio: formData.get('bio') as string,
          specialty: formData.get('specialty') as string,
          instagram_url: formData.get('instagram_url') as string || null,
          twitter_url: formData.get('twitter_url') as string || null,
          website_url: formData.get('website_url') as string || null,
        })
        .eq('id', artistProfile.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your artist profile has been updated successfully.",
      });
      
      fetchArtistData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!artistProfile) return;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${artistProfile.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(`avatars/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('artworks')
        .getPublicUrl(`avatars/${fileName}`);

      await supabase
        .from('artists')
        .update({ avatar_url: publicUrl })
        .eq('id', artistProfile.id);

      toast({
        title: "Avatar updated",
        description: "Your profile image has been updated.",
      });
      
      fetchArtistData();
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

  if (!artistProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEO title="Artist Dashboard" description="Manage your artist profile and artworks" />
        <Header />
        <main className="flex-1 container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-serif font-medium mb-6">No Artist Profile</h1>
          <p className="text-muted-foreground mb-8">
            You don't have an artist profile yet. Apply to become a Monarch artist.
          </p>
          <Link to="/apply-artist">
            <Button size="lg">Apply as Artist</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const totalViews = artworks.reduce((sum, a) => sum + (a.view_count || 0), 0);
  const publishedCount = artworks.filter(a => a.status === 'published').length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <SEO title="Artist Dashboard" description="Manage your artist profile and artworks" />
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-32">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-serif font-medium flex items-center gap-3">
                Welcome, {artistProfile.name}
                {artistProfile.is_verified && (
                  <Badge variant="secondary" className="text-accent">Verified</Badge>
                )}
              </h1>
              <p className="text-muted-foreground mt-2">Manage your artist profile and artworks</p>
            </div>
            <Link to={`/artist/${artistProfile.slug}`}>
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public Profile
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{artworks.length}</p>
                    <p className="text-sm text-muted-foreground">Total Artworks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-full">
                    <Eye className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalViews}</p>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{artistProfile.follower_count || 0}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <Heart className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{publishedCount}</p>
                    <p className="text-sm text-muted-foreground">Published</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="artworks" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="artworks">My Artworks</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
              <TabsTrigger value="profile">Edit Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="artworks" className="mt-8">
              {artworks.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No artworks yet</h3>
                    <p className="text-muted-foreground mb-4">Start by uploading your first artwork</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artworks.map((artwork) => (
                    <Card key={artwork.id} className="overflow-hidden">
                      <div className="aspect-square bg-muted relative">
                        {artwork.primary_image_url && (
                          <img
                            src={artwork.primary_image_url}
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <Badge 
                          className="absolute top-3 right-3"
                          variant={artwork.status === 'published' ? 'default' : 'secondary'}
                        >
                          {artwork.status}
                        </Badge>
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-medium mb-1">{artwork.title}</h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{artwork.price_usd ? `$${artwork.price_usd}` : 'Price on request'}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {artwork.view_count || 0}
                          </span>
                        </div>
                        <Link to={`/artwork/${artwork.id}`}>
                          <Button variant="outline" size="sm" className="w-full mt-4">
                            <Edit2 className="w-3 h-3 mr-2" /> View Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Upload New Artwork</CardTitle>
                  <CardDescription>Add a new piece to your portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" name="title" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" rows={4} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (USD)</Label>
                        <Input id="price" name="price" type="number" step="0.01" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="medium">Medium</Label>
                        <Input id="medium" name="medium" placeholder="e.g. Digital, Oil on Canvas" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="image">Artwork Image</Label>
                      <Input id="image" name="image" type="file" accept="image/*" required />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Artwork
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your artist information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-muted overflow-hidden">
                        {artistProfile.avatar_url ? (
                          <img src={artistProfile.avatar_url} alt={artistProfile.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-serif">
                            {artistProfile.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
                        />
                        <p className="text-sm text-muted-foreground mt-1">Upload a new profile image</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialty">Specialty</Label>
                      <Input id="specialty" name="specialty" defaultValue={artistProfile.specialty || ''} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biography</Label>
                      <Textarea id="bio" name="bio" rows={6} defaultValue={artistProfile.bio || ''} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="instagram_url">Instagram URL</Label>
                        <Input id="instagram_url" name="instagram_url" defaultValue={artistProfile.instagram_url || ''} placeholder="https://instagram.com/..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter_url">X (Twitter) URL</Label>
                        <Input id="twitter_url" name="twitter_url" defaultValue={artistProfile.twitter_url || ''} placeholder="https://x.com/..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website_url">Website</Label>
                        <Input id="website_url" name="website_url" defaultValue={artistProfile.website_url || ''} placeholder="https://..." />
                      </div>
                    </div>

                    <Button type="submit" disabled={uploading}>
                      {uploading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default ArtistDashboard;