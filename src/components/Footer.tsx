import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link 
              to="/" 
              className="text-2xl font-serif font-medium tracking-tight hover:opacity-60 transition-opacity"
            >
              Monarch
            </Link>
            <p className="mt-4 text-sm text-muted-foreground font-serif leading-relaxed max-w-xs">
              A curated platform for artists, ideas, and culture. 
              Where serious art finds its home.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-sans mb-6">Explore</h3>
            <nav className="flex flex-col gap-3">
              <Link to="/artists" className="text-sm font-serif text-muted-foreground hover:text-foreground transition-colors">
                Artists
              </Link>
              <Link to="/journal" className="text-sm font-serif text-muted-foreground hover:text-foreground transition-colors">
                Stories
              </Link>
              <Link to="/collections" className="text-sm font-serif text-muted-foreground hover:text-foreground transition-colors">
                Collections
              </Link>
              <Link to="/nfts" className="text-sm font-serif text-muted-foreground hover:text-foreground transition-colors">
                Exhibitions
              </Link>
            </nav>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-sans mb-6">Information</h3>
            <nav className="flex flex-col gap-3">
              <Link to="/about" className="text-sm font-serif text-muted-foreground hover:text-foreground transition-colors">
                About Monarch
              </Link>
              <Link to="/for-artists" className="text-sm font-serif text-muted-foreground hover:text-foreground transition-colors">
                For Artists
              </Link>
              <Link to="/for-collectors" className="text-sm font-serif text-muted-foreground hover:text-foreground transition-colors">
                For Collectors
              </Link>
              <Link to="/contact" className="text-sm font-serif text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Newsletter - Simple */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-sans mb-6">Stay Informed</h3>
            <p className="text-sm text-muted-foreground font-serif mb-4">
              Occasional updates on new artists, exhibitions, and cultural commentary.
            </p>
            <Link 
              to="/" 
              className="text-sm font-serif underline underline-offset-4 hover:opacity-70 transition-opacity"
            >
              Subscribe to Newsletter
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground font-serif">
            © {currentYear} Monarch. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="text-xs text-muted-foreground font-serif hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/about" className="text-xs text-muted-foreground font-serif hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
