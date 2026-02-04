import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { Palette, AudioLines, Image, Users } from "lucide-react";
import { z } from "zod";

const artistSubmissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  portfolio: z.string().url("Please enter a valid URL"),
  statement: z.string().min(50, "Artist statement must be at least 50 characters").max(1000),
});

const ForArtists = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    portfolio: "",
    statement: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const validated = artistSubmissionSchema.parse(formData);
      
      // Here you would send to your backend or email service
      console.log("Artist submission:", validated);
      
      toast({
        title: "Submission received!",
        description: "We'll review your work and get back to you within 5-7 days.",
      });
      
      setFormData({ name: "", email: "", portfolio: "", statement: "" });
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
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "For Artists - Monarch Gallery",
    "description": "Join Monarch Gallery. Submit your work and share your story with collectors worldwide.",
    "url": `${window.location.origin}/for-artists`,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="For Artists - Join Our Gallery"
        description="Submit your artwork to Monarch Gallery. Get featured in curated exhibitions, share your story through audio, and connect with collectors worldwide."
        keywords="artist submission, art gallery submission, sell art online, artist opportunities, contemporary art platform"
        structuredData={structuredData}
      />
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium mb-6">
              For Artists
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Your art deserves to be seen, felt, and remembered.
            </p>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6">Our Vision</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At Monarch, we believe every artwork holds a story worth sharing. We're building a platform 
              where art transcends the visual—where collectors don't just see your work, they feel it, 
              understand it, and connect with the journey behind each piece.
            </p>
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
                <Palette className="w-10 h-10 mb-4 text-accent" />
                <h3 className="text-xl font-serif font-medium mb-3">Curated Exhibitions</h3>
                <p className="text-muted-foreground">
                  Featured in both digital showcases and physical gallery spaces, reaching collectors worldwide.
                </p>
              </Card>

              <Card className="p-8 transition-shadow duration-300 ease-out hover:shadow-md">
                <AudioLines className="w-10 h-10 mb-4 text-accent" />
                <h3 className="text-xl font-serif font-medium mb-3">Audio Storytelling</h3>
                <p className="text-muted-foreground">
                  Share your artistic journey through intimate audio interviews that bring your work to life.
                </p>
              </Card>

              <Card className="p-8 transition-shadow duration-300 ease-out hover:shadow-md">
                <Image className="w-10 h-10 mb-4 text-accent" />
                <h3 className="text-xl font-serif font-medium mb-3">Platform Amplification</h3>
                <p className="text-muted-foreground">
                  Get featured across our platforms, expanding your reach to engaged collectors and art enthusiasts.
                </p>
              </Card>

              <Card className="p-8 transition-shadow duration-300 ease-out hover:shadow-md">
                <Users className="w-10 h-10 mb-4 text-accent" />
                <h3 className="text-xl font-serif font-medium mb-3">Limited Editions</h3>
                <p className="text-muted-foreground">
                  Collaborate on exclusive collections that create scarcity and value for your work.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Submission Guidelines */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-serif font-medium mb-8">
              Submission Guidelines
            </h2>
            
            <div className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Portfolio</h3>
                <p>Submit 5–10 high-quality images of your best work (JPG or PNG format)</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Artist Statement</h3>
                <p>Share your artistic philosophy and what drives your creative process (max 300 words)</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Your Story</h3>
                <p>Optional: Include an audio clip (2-3 minutes) sharing the story behind your art</p>
              </div>
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-16 border-t border-border bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-serif font-medium mb-8 text-center">
              Submit Your Work
            </h2>
            
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Your Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                      />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="artist@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="portfolio" className="block text-sm font-medium mb-2">
                    Portfolio URL *
                  </label>
                  <Input
                    id="portfolio"
                    type="url"
                    required
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <div>
                  <label htmlFor="statement" className="block text-sm font-medium mb-2">
                    Artist Statement *
                  </label>
                  <Textarea
                    id="statement"
                    required
                    value={formData.statement}
                    onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                    placeholder="Tell us about your artistic journey and vision..."
                    rows={6}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.statement.length}/1000 characters
                  </p>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Submitting
                    </span>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ForArtists;
