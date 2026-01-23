import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArtworkCard from "@/components/ArtworkCard";
import FeaturedArtist from "@/components/FeaturedArtist";
import SEO from "@/components/SEO";
import ScrollIndicator from "@/components/ScrollIndicator";
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
        {/* Hero Section - Asymmetrical, Editorial Layout */}
        <section className="relative min-h-screen flex items-center pt-20 lg:pt-0">
          {/* Background Image - Faint overlay */}
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-[0.04] dark:opacity-[0.08]"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1920&q=80)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
          </div>

          <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column - Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="lg:col-span-7 xl:col-span-6"
              >
                <span className="text-[10px] uppercase tracking-[0.3em] text-foreground/50 mb-6 block">
                  Est. 2024
                </span>
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-serif font-medium leading-[0.9] hero-heading tracking-[-0.04em] mb-8">
                  Where Art
                  <br />
                  <span className="text-foreground/70">Meets Story</span>
                </h1>
                <p className="text-lg md:text-xl text-foreground/60 max-w-md leading-relaxed mb-10">
                  A curated platform showcasing digital and physical artworks from visionary artists worldwide.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/explore">
                    <Button size="lg" className="min-w-[180px]">
                      <span>Explore Collection</span>
                    </Button>
                  </Link>
                  <Link to="/artists">
                    <Button size="lg" variant="outline" className="min-w-[180px]">
                      <span>Meet Artists</span>
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Right Column - Featured Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="lg:col-span-5 xl:col-span-6 hidden lg:block"
              >
                <div className="relative">
                  {/* Main featured image */}
                  <div className="aspect-[3/4] rounded-sm overflow-hidden bg-muted shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80"
                      alt="Featured artwork"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Floating accent */}
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 border border-foreground/10 rounded-sm" />
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-foreground/5 rounded-sm" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <ScrollIndicator />
        </section>

        {/* Featured Section */}
        <section className="py-24 lg:py-32 border-t border-border">
          <div className="container mx-auto px-6 sm:px-8 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12 lg:mb-16"
            >
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-foreground/50 mb-3 block">
                  Latest Releases
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-[-0.02em]">
                  Featured
                </h2>
              </div>
              <Link to="/explore">
                <Button variant="minimal" className="hidden sm:inline-flex">
                  View all works →
                </Button>
              </Link>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {featuredArtworks.length > 0 ? (
                featuredArtworks.map((artwork, index) => (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <ArtworkCard {...artwork} />
                  </motion.div>
                ))
              ) : (
                <p className="col-span-3 text-center text-foreground/50 font-serif py-12">
                  No artworks available yet
                </p>
              )}
            </div>

            <div className="mt-12 text-center sm:hidden">
              <Link to="/explore">
                <Button variant="minimal">View all works →</Button>
              </Link>
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
        <section className="py-24 lg:py-32 border-t border-border">
          <div className="container mx-auto px-6 sm:px-8 lg:px-12">
            <div className="max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-[10px] uppercase tracking-[0.3em] text-foreground/50 mb-4 block">
                  Stay Connected
                </span>
                <h2 className="text-4xl md:text-5xl font-serif font-medium mb-6 tracking-[-0.02em]">
                  Join Our Community
                </h2>
                <p className="text-lg text-foreground/60 max-w-md mx-auto mb-10 leading-relaxed">
                  Be the first to discover new releases, artist stories, and exclusive exhibitions.
                </p>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 h-12 bg-transparent border-foreground/20 focus:border-foreground/40"
                  />
                  <Button size="lg" type="submit" disabled={subscribing}>
                    {subscribing ? 'Subscribing...' : 'Subscribe'}
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
