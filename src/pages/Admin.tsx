import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Plus } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('artworks')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('artworks')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleCreateArtwork = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const file = formData.get('image') as File;

      if (!file || file.size === 0) {
        throw new Error('Please select an image');
      }

      const imageUrl = await handleImageUpload(file);

      const { error } = await supabase.from('artworks').insert({
        title: formData.get('title') as string,
        slug: (formData.get('title') as string).toLowerCase().replace(/\s+/g, '-'),
        description: formData.get('description') as string,
        primary_image_url: imageUrl,
        price_usd: parseFloat(formData.get('price') as string),
        medium: formData.get('medium') as string,
        artist_id: formData.get('artist_id') as string,
        status: 'published',
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Artwork created successfully",
      });

      (e.target as HTMLFormElement).reset();
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

  const handleCreateArtist = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const file = formData.get('avatar') as File;

      let avatarUrl = null;
      if (file && file.size > 0) {
        avatarUrl = await handleImageUpload(file);
      }

      const { error } = await supabase.from('artists').insert({
        name: formData.get('name') as string,
        slug: (formData.get('name') as string).toLowerCase().replace(/\s+/g, '-'),
        bio: formData.get('bio') as string,
        specialty: formData.get('specialty') as string,
        avatar_url: avatarUrl,
        user_id: user?.id,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Artist profile created successfully",
      });

      (e.target as HTMLFormElement).reset();
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

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <h1 className="text-4xl font-serif font-medium mb-8">Admin Dashboard</h1>

          <Tabs defaultValue="artworks" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="artworks">Artworks</TabsTrigger>
              <TabsTrigger value="artists">Artists</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
            </TabsList>

            <TabsContent value="artworks">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Artwork</CardTitle>
                  <CardDescription>Upload and publish new artworks to the gallery</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateArtwork} className="space-y-4">
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
                        <Input id="price" name="price" type="number" step="0.01" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medium">Medium</Label>
                        <Input id="medium" name="medium" placeholder="e.g. Oil on Canvas" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="artist_id">Artist ID</Label>
                      <Input id="artist_id" name="artist_id" placeholder="UUID of the artist" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Artwork Image</Label>
                      <Input id="image" name="image" type="file" accept="image/*" required />
                    </div>

                    <Button type="submit" disabled={uploading} className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Create Artwork'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="artists">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Artist Profile</CardTitle>
                  <CardDescription>Add new artists to the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateArtist} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="artist-name">Artist Name</Label>
                      <Input id="artist-name" name="name" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialty">Specialty</Label>
                      <Input id="specialty" name="specialty" placeholder="e.g. Contemporary Painter" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biography</Label>
                      <Textarea id="bio" name="bio" rows={6} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="avatar">Profile Image</Label>
                      <Input id="avatar" name="avatar" type="file" accept="image/*" />
                    </div>

                    <Button type="submit" disabled={uploading} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      {uploading ? 'Creating...' : 'Create Artist Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="collections">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Collections</CardTitle>
                  <CardDescription>Create and manage artwork collections</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Collection management coming soon...</p>
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

export default Admin;
