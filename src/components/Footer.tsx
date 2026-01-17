import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim() });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed");
        } else {
          throw error;
        }
      } else {
        toast.success("Welcome to Monarch");
        setEmail("");
      }
    } catch (error) {
      toast.error("Could not subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link 
              to="/" 
              className="text-2xl font-serif font-medium tracking-tight hover:opacity-70 transition-opacity"
            >
              Monarch
            </Link>
            <p className="mt-4 text-sm text-muted-foreground font-serif leading-relaxed max-w-xs">
              A curated platform for artists, ideas, and culture. 
              Where serious art finds its home.
            </p>
            
            {/* Day/Night Toggle - Subtle, editorial */}
            <button
              onClick={toggleTheme}
              className="mt-6 text-xs font-sans uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              {theme === "light" ? "Night" : "Day"}
            </button>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-sans mb-6">Explore</h3>
            <nav className="flex flex-col gap-3">
              <Link to="/explore" className="text-sm font-serif text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
                All Works
              </Link>
              <Link to="/artists" className="text-sm font-serif text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
                Artists
              </Link>
              <Link to="/journal" className="text-sm font-serif text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
                Stories
              </Link>
              <Link to="/collections" className="text-sm font-serif text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
                Collections
              </Link>
              <Link to="/nfts" className="text-sm font-serif text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
                Exhibitions
              </Link>
            </nav>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-sans mb-6">Information</h3>
            <nav className="flex flex-col gap-3">
              <Link to="/about" className="text-sm font-serif text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
                About Monarch
              </Link>
              <Link to="/for-artists" className="text-sm font-serif text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
                For Artists
              </Link>
              <Link to="/for-collectors" className="text-sm font-serif text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
                For Collectors
              </Link>
              <Link to="/contact" className="text-sm font-serif text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
                Contact
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-sans mb-6">Stay Informed</h3>
            <p className="text-sm text-muted-foreground font-serif mb-4 leading-relaxed">
              Occasional updates on new artists, exhibitions, and cultural commentary.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full px-0 py-2 text-sm font-serif bg-transparent border-b border-border focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="text-sm font-serif underline underline-offset-4 hover:opacity-70 transition-opacity disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground font-serif">
            © {currentYear} Monarch. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="text-xs text-muted-foreground font-serif hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
              Privacy
            </Link>
            <Link to="/about" className="text-xs text-muted-foreground font-serif hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
