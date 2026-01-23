import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArtworkCard from "@/components/ArtworkCard";
import FeaturedArtist from "@/components/FeaturedArtist";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email();

const Index = () => {
  const [featuredArtworks, setFeaturedArtworks] = useState<any[]>([]);
  const [featuredArtist, setFeaturedArtist] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    const { data: artworks } = await supabase
      .from('artworks')
      .select(`
        id,
        title,
        slug,
        primary_image_url,
        price_usd,
        edition_total,
        artists (name)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(3);

    if (artworks) {
      setFeaturedArtworks(
        artworks.map(a => ({
          id: a.id,
          title: a.title,
          artistName: a.artists?.name || 'Unknown Artist',
          image: a.primary_image_url || 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80',
          price: a.price_usd ? `$${a.price_usd}` : 'Price on request',
          edition: a.edition_total === 1 ? '1/1' : `Edition of ${a.edition_total}`,
        }))
      );
    }

    const { data: artist } = await supabase
      .from('artists')
      .select('*')
      .eq('is_featured', true)
      .single();

    if (artist) {
      setFeaturedArtist(artist);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);

    try {
      const validated = emailSchema.parse(email);
      
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: validated });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already subscribed",
            description: "This email is already on our list!",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success!",
          description: "You've been added to our newsletter.",
        });
        setEmail("");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address",
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
      setSubscribing(false);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ArtGallery",
    "name": "Monarch Gallery",
    "description": "A curated platform showcasing digital and physical artworks from visionary artists",
    "url": window.location.origin,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Home - Curated Art Marketplace"
        description="Discover unique artworks from visionary artists. Buy digital and physical art, connect with creators, and build your collection at Monarch Gallery."
        keywords="art marketplace, buy art online, digital art, NFT art, contemporary artists, art collectors"
        structuredData={structuredData}
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Editorial, ceremonial feel */}
        <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-8">
              {/* Hero heading with tightened letter-spacing for bespoke feel */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-medium leading-tight hero-heading tracking-[-0.04em]">
                Where Art<br />Meets Story
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                A curated platform showcasing digital and physical artworks from visionary artists
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Link to="/explore">
                  <Button size="lg" className="min-w-[160px] transition-all duration-300 ease-in-out">
                    Explore Art
                  </Button>
                </Link>
                <Link to="/artists">
                  <Button size="lg" variant="outline" className="min-w-[160px] transition-all duration-300 ease-in-out">
                    Meet Artists
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Section */}
        <section className="py-24 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif font-medium mb-4 tracking-[-0.02em]">Featured</h2>
                <p className="text-lg text-muted-foreground">Latest releases from our artists</p>
              </div>
              <Link to="/explore">
                <Button variant="ghost" className="hidden sm:inline-flex transition-all duration-300 ease-in-out">
                  View all →
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {featuredArtworks.length > 0 ? (
                featuredArtworks.map((artwork) => (
                  <ArtworkCard key={artwork.id} {...artwork} />
                ))
              ) : (
                <p className="col-span-3 text-center text-muted-foreground font-serif">
                  No artworks available yet
                </p>
              )}
            </div>
          </div>
        </section>

        {featuredArtist && (
          <FeaturedArtist
            name={featuredArtist.name}
            title={featuredArtist.specialty || 'Artist'}
            bio={featuredArtist.bio || 'Featured artist at Monarch Gallery'}
            image={featuredArtist.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80'}
            artworkCount={featuredArtist.artwork_count || 0}
            slug={featuredArtist.slug}
          />
        )}

        {/* Newsletter Section */}
        <section className="py-24 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-medium mb-6 tracking-[-0.02em]">
              Join Our Community
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Be the first to discover new releases and artist stories
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 transition-all duration-300 ease-in-out"
              />
              <Button size="lg" type="submit" disabled={subscribing} className="transition-all duration-300 ease-in-out">
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
