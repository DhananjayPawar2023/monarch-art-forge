import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ArtworkCard from "@/components/ArtworkCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Collection {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  curator_name: string | null;
  cover_image_url: string | null;
  published_at: string | null;
}

interface Artwork {
  id: string;
  title: string;
  slug: string;
  primary_image_url: string | null;
  price_usd: number | null;
  edition_total: number | null;
  artists: {
    name: string;
  };
}

const CollectionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        // Fetch collection
        const { data: collectionData, error: collectionError } = await supabase
          .from("collections")
          .select("*")
          .eq("slug", slug)
          .not("published_at", "is", null)
          .single();

        if (collectionError) throw collectionError;
        setCollection(collectionData);

        // Fetch artworks in this collection
        const { data: artworksData, error: artworksError } = await supabase
          .from("artworks")
          .select(`
            id,
            title,
            slug,
            primary_image_url,
            price_usd,
            edition_total,
            artists (name)
          `)
          .eq("collection_id", collectionData.id)
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (artworksError) throw artworksError;
        setArtworks(artworksData || []);
      } catch (error: any) {
        console.error("Error fetching collection:", error);
        toast({
          title: "Error",
          description: "Failed to load collection",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCollectionData();
    }
  }, [slug, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-12" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="aspect-square w-full" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-4xl font-serif font-medium mb-4">Collection Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The collection you're looking for doesn't exist or hasn't been published yet.
            </p>
            <Link to="/collections">
              <Button>Back to Collections</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${collection.title} - Collection`}
        description={collection.description || `${collection.title} - A curated collection at Monarch Gallery.`}
        image={collection.cover_image_url || undefined}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 pt-16">
          {/* Hero Section */}
          {collection.cover_image_url && (
            <section className="relative h-[50vh] min-h-[400px] overflow-hidden bg-muted">
              <img
                src={collection.cover_image_url}
                alt={collection.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/20" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <div className="container mx-auto">
                  <h1 className="text-4xl md:text-6xl font-serif font-medium text-white mb-2">
                    {collection.title}
                  </h1>
                  {collection.curator_name && (
                    <p className="text-lg text-white/90">
                      Curated by {collection.curator_name}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Collection Info */}
          <section className="py-16 border-b border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              {!collection.cover_image_url && (
                <div className="mb-8">
                  <h1 className="text-5xl md:text-6xl font-serif font-medium mb-2">
                    {collection.title}
                  </h1>
                  {collection.curator_name && (
                    <p className="text-xl text-muted-foreground">
                      Curated by {collection.curator_name}
                    </p>
                  )}
                </div>
              )}
              
              {collection.description && (
                <div className="max-w-3xl">
                  <p className="text-lg leading-relaxed text-foreground">
                    {collection.description}
                  </p>
                </div>
              )}

              <div className="mt-8 text-sm text-muted-foreground">
                {artworks.length} {artworks.length === 1 ? 'artwork' : 'artworks'}
              </div>
            </div>
          </section>

          {/* Artworks Grid */}
          <section className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              {artworks.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">
                  No artworks in this collection yet
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {artworks.map((artwork) => (
                    <ArtworkCard
                      key={artwork.id}
                      id={artwork.id}
                      title={artwork.title}
                      artistName={artwork.artists.name}
                      image={artwork.primary_image_url || ""}
                      price={artwork.price_usd ? `$${artwork.price_usd.toLocaleString()}` : undefined}
                      edition={artwork.edition_total === 1 ? "1/1" : `Edition of ${artwork.edition_total}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CollectionDetail;
