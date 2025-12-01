import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Palette, Users, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const ApplyArtist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to apply as an artist.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      
      const { error } = await supabase
        .from('artist_applications')
        .insert({
          user_id: user.id,
          artist_name: formData.get('artist_name') as string,
          email: formData.get('email') as string,
          portfolio_url: formData.get('portfolio_url') as string || null,
          instagram_url: formData.get('instagram_url') as string || null,
          bio: formData.get('bio') as string,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Application exists",
            description: "You already have a pending application.",
          });
        } else {
          throw error;
        }
      } else {
        setSubmitted(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEO title="Application Submitted" description="Your artist application has been submitted" />
        <Header />
        <main className="flex-1 container mx-auto px-4 py-32 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-6" />
          <h1 className="text-4xl font-serif font-medium mb-4">Application Submitted</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Thank you for your interest in joining Monarch Gallery. Our team will review your application and get back to you soon.
          </p>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Apply as Artist"
        description="Join Monarch Gallery as an artist. Showcase your work to collectors worldwide."
      />
      <Header />
      
      <main className="flex-1 pt-16">
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6">
              Join Monarch
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Apply to showcase your work alongside visionary artists from around the world
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Benefits */}
              <div>
                <h2 className="text-3xl font-serif font-medium mb-8">Why Join Monarch?</h2>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="p-3 bg-primary/10 rounded-full h-fit">
                      <Palette className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Curated Platform</h3>
                      <p className="text-muted-foreground">
                        Join a carefully curated community of artists. We maintain high standards to ensure quality and discoverability.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="p-3 bg-accent/10 rounded-full h-fit">
                      <Users className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Connect with Collectors</h3>
                      <p className="text-muted-foreground">
                        Get discovered by passionate collectors who appreciate meaningful art and are ready to support your work.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="p-3 bg-primary/10 rounded-full h-fit">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Global Reach</h3>
                      <p className="text-muted-foreground">
                        Showcase your work to a worldwide audience. Our platform handles everything from display to secure transactions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-6 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">What we look for</h3>
                  <ul className="text-muted-foreground space-y-2">
                    <li>• Original, authentic artistic voice</li>
                    <li>• Consistent body of work</li>
                    <li>• Professional presentation</li>
                    <li>• Commitment to the craft</li>
                  </ul>
                </div>
              </div>

              {/* Application Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Artist Application</CardTitle>
                    <CardDescription>Tell us about yourself and your work</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="artist_name">Artist / Studio Name *</Label>
                        <Input id="artist_name" name="artist_name" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" name="email" type="email" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="portfolio_url">Portfolio Website</Label>
                        <Input id="portfolio_url" name="portfolio_url" type="url" placeholder="https://..." />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instagram_url">Instagram</Label>
                        <Input id="instagram_url" name="instagram_url" placeholder="@username or full URL" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Tell us about your work *</Label>
                        <Textarea 
                          id="bio" 
                          name="bio" 
                          rows={6} 
                          required
                          placeholder="Describe your artistic practice, inspirations, and what makes your work unique..."
                        />
                      </div>

                      {!user && (
                        <p className="text-sm text-muted-foreground">
                          Please <Link to="/auth" className="underline">sign in</Link> before submitting your application.
                        </p>
                      )}

                      <Button type="submit" className="w-full" disabled={submitting || !user}>
                        {submitting ? 'Submitting...' : 'Submit Application'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ApplyArtist;