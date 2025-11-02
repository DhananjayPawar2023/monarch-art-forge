import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Twitter, Mail } from "lucide-react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
});

const Contact = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const validated = contactSchema.parse(formData);
      
      // Here you would send to your backend email service
      console.log("Contact submission:", validated);
      
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24-48 hours.",
      });
      
      setFormData({ name: "", email: "", message: "" });
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
    "@type": "ContactPage",
    "name": "Contact - Monarch Gallery",
    "description": "Get in touch with Monarch Gallery. We'd love to hear from artists, collectors, and curators.",
    "url": `${window.location.origin}/contact`,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Contact Us"
        description="Get in touch with Monarch Gallery. Whether you're an artist, collector, or curator, we'd love to hear from you."
        keywords="contact art gallery, art inquiry, artist contact, collector contact"
        structuredData={structuredData}
      />
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium mb-6">
              Let's Connect
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're an artist, collector, or curator—we'd love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="text-3xl font-serif font-medium mb-6">Send a Message</h2>
                
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
                        placeholder="Jane Doe"
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
                        placeholder="jane@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us how we can help..."
                        rows={6}
                        maxLength={1000}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.message.length}/1000 characters
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-serif font-medium mb-6">Get in Touch</h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Email Us</h3>
                    <a 
                      href="mailto:hello@monarch.gallery" 
                      className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                    >
                      <Mail className="w-5 h-5" />
                      hello@monarch.gallery
                    </a>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Follow Us</h3>
                    <div className="flex gap-4">
                      <a 
                        href="https://instagram.com/monarchgallery" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Instagram"
                      >
                        <Instagram className="w-6 h-6" />
                      </a>
                      <a 
                        href="https://twitter.com/monarchgallery" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Twitter"
                      >
                        <Twitter className="w-6 h-6" />
                      </a>
                      <a 
                        href="mailto:hello@monarch.gallery"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Email"
                      >
                        <Mail className="w-6 h-6" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Location</h3>
                    <p className="text-muted-foreground">
                      Based online—connecting art and story globally.
                    </p>
                  </div>

                  <Card className="p-6 bg-secondary/30">
                    <h3 className="text-lg font-medium mb-3">Office Hours</h3>
                    <p className="text-muted-foreground text-sm">
                      We typically respond within 24-48 hours during business days.
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                      For urgent inquiries, please include "URGENT" in your subject line.
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="py-16 border-t border-border bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-medium mb-4">
              Looking for Something Specific?
            </h2>
            <div className="flex flex-wrap gap-4 justify-center mt-6">
              <Button variant="outline" asChild>
                <a href="/for-artists">Artist Submissions</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/for-collectors">Collector Inquiries</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/about">About Monarch</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
