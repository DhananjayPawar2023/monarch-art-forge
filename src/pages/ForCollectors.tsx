import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Crown, Bell, Handshake } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email();

const ForCollectors = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

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
            description: "This email is already part of our Collectors Circle!",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Welcome to the Collectors Circle!",
          description: "You'll receive early access to new releases and exclusive content.",
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
    "@type": "WebPage",
    "name": "For Collectors - Monarch Gallery",
    "description": "Start your art collection with Monarch Gallery. Collect meaningful art that speaks beyond visuals.",
    "url": `${window.location.origin}/for-collectors`,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="For Collectors - Build Your Collection"
        description="Discover and collect meaningful art at Monarch Gallery. Get early access to limited editions, artist collaborations, and curated collections."
        keywords="art collecting, buy contemporary art, limited edition art, art investment, curated art collections"
        structuredData={structuredData}
      />
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium mb-6">
              For Collectors
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Collect meaningful art that speaks beyond visuals.
            </p>
          </div>
        </section>

        {/* Why Collect from Monarch */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6">
              Why Collect from Monarch
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                At Monarch Gallery, we believe art collecting should be more than an investment—it's about 
                building a connection with the stories, emotions, and visions that artists pour into their work.
              </p>
              <p>
                Every piece in our collection comes with the artist's voice, their journey, and the meaning 
                behind their creative choices. You're not just acquiring art; you're becoming part of a narrative 
                that unfolds with each viewing.
              </p>
              <p>
                We focus on authenticity, quality, and emotional resonance—because the best collections are 
                built on passion, not just aesthetics.
              </p>
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="py-16 border-t border-border bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-serif font-medium mb-12 text-center">
              What We Offer
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 transition-shadow duration-300 ease-out hover:shadow-md">
                <Crown className="w-10 h-10 mb-4 text-accent" />
                <h3 className="text-xl font-serif font-medium mb-3">Limited Editions</h3>
                <p className="text-muted-foreground">
                  Access exclusive artworks with certified authenticity and limited availability, 
                  ensuring the value and uniqueness of your collection.
                </p>
              </Card>

              <Card className="p-8 transition-shadow duration-300 ease-out hover:shadow-md">
                <Handshake className="w-10 h-10 mb-4 text-accent" />
                <h3 className="text-xl font-serif font-medium mb-3">Artist Collaborations</h3>
                <p className="text-muted-foreground">
                  Participate in special projects where collectors and artists co-create unique pieces 
                  and experiences.
                </p>
              </Card>

              <Card className="p-8 transition-shadow duration-300 ease-out hover:shadow-md">
                <Bell className="w-10 h-10 mb-4 text-accent" />
                <h3 className="text-xl font-serif font-medium mb-3">Early Access</h3>
                <p className="text-muted-foreground">
                  Be the first to discover and acquire new releases before they're available to the public.
                </p>
              </Card>

              <Card className="p-8 transition-shadow duration-300 ease-out hover:shadow-md">
                <Heart className="w-10 h-10 mb-4 text-accent" />
                <h3 className="text-xl font-serif font-medium mb-3">Concierge Support</h3>
                <p className="text-muted-foreground">
                  Get personalized art sourcing assistance tailored to your taste, space, and collecting goals.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Provenance Section */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6">
              Digital Provenance
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Selected artworks include optional blockchain certificates on Ethereum, providing immutable 
              proof of authenticity and ownership history. This digital provenance ensures your investment 
              is protected and verifiable for future generations.
            </p>
            <p className="text-sm text-muted-foreground italic">
              Coming soon: Full NFT integration with on-chain royalties for artists.
            </p>
          </div>
        </section>

        {/* Join Collectors Circle */}
        <section className="py-16 border-t border-border bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6">
              Join the Monarch Collectors Circle
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get exclusive updates, early access to new releases, and invitations to private viewings.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button size="lg" type="submit" disabled={subscribing} className="min-w-[120px]">
                {subscribing ? <LoadingSpinner size="sm" /> : 'Join Circle'}
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ForCollectors;
