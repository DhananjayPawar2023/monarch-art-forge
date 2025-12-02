import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import MintNFTDialog from "@/components/MintNFTDialog";

// Validation schema
const artworkSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  artist_id: z.string().uuid("Invalid artist"),
  price_usd: z.number().min(0).optional(),
  medium: z.string().max(100).optional(),
  dimensions: z.string().max(100).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  edition_total: z.number().int().min(1).optional(),
  status: z.enum(["draft", "published", "sold", "archived"]),
});

const AdminArtworkEdit = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [artwork, setArtwork] = useState<any>(null);
  const [artists, setArtists] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [artworkRes, artistsRes] = await Promise.all([
        supabase.from("artworks").select("*").eq("id", id).single(),
        supabase.from("artists").select("id, name").order("name"),
      ]);

      if (artworkRes.error) throw artworkRes.error;
      if (artistsRes.error) throw artistsRes.error;

      setArtwork(artworkRes.data);
      setArtists(artistsRes.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const data = {
        title: formData.get("title") as string,
        description: formData.get("description") as string || null,
        artist_id: formData.get("artist_id") as string,
        price_usd: formData.get("price_usd") ? Number(formData.get("price_usd")) : null,
        medium: formData.get("medium") as string || null,
        dimensions: formData.get("dimensions") as string || null,
        year: formData.get("year") ? Number(formData.get("year")) : null,
        edition_total: formData.get("edition_total") ? Number(formData.get("edition_total")) : 1,
        status: formData.get("status") as "draft" | "published" | "sold" | "archived",
      };

      // Validate
      artworkSchema.parse(data);

      // Update
      const { error } = await supabase
        .from("artworks")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Artwork updated",
        description: "Changes saved successfully.",
      });

      navigate("/admin/artworks");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-32 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (!artwork) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-32 text-center">
            <h1 className="text-2xl font-serif font-medium mb-4">Artwork not found</h1>
            <Button onClick={() => navigate("/admin/artworks")}>
              Back to Artworks
            </Button>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen flex flex-col">
        <SEO title="Edit Artwork" description="Edit artwork details" />
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-32">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-serif font-medium mb-8">Edit Artwork</h1>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>NFT Options</CardTitle>
              </CardHeader>
              <CardContent>
                {artwork.is_nft ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      This artwork is already minted as an NFT.
                    </p>
                    <div className="space-y-1 text-sm">
                      <p>Chain: {artwork.chain}</p>
                      {artwork.contract_address && (
                        <p className="font-mono">Contract: {artwork.contract_address.slice(0, 10)}...</p>
                      )}
                      {artwork.token_id && <p>Token ID: {artwork.token_id}</p>}
                    </div>
                  </div>
                ) : (
                  <MintNFTDialog
                    artworkId={artwork.id}
                    artworkTitle={artwork.title}
                    artworkImage={artwork.primary_image_url || ""}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Artwork Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" name="title" defaultValue={artwork.title} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="artist_id">Artist *</Label>
                    <Select name="artist_id" defaultValue={artwork.artist_id} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {artists.map((artist) => (
                          <SelectItem key={artist.id} value={artist.id}>
                            {artist.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      rows={4}
                      defaultValue={artwork.description || ""}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price_usd">Price (USD)</Label>
                      <Input
                        id="price_usd"
                        name="price_usd"
                        type="number"
                        step="0.01"
                        defaultValue={artwork.price_usd || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        name="year"
                        type="number"
                        defaultValue={artwork.year || ""}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medium">Medium</Label>
                      <Input id="medium" name="medium" defaultValue={artwork.medium || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dimensions">Dimensions</Label>
                      <Input
                        id="dimensions"
                        name="dimensions"
                        defaultValue={artwork.dimensions || ""}
                        placeholder="e.g. 24 x 36 in"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edition_total">Edition Size</Label>
                      <Input
                        id="edition_total"
                        name="edition_total"
                        type="number"
                        min="1"
                        defaultValue={artwork.edition_total || 1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select name="status" defaultValue={artwork.status} required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/admin/artworks")}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default AdminArtworkEdit;
