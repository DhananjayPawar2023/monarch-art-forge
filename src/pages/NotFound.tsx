import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-6 pt-20">
        <div className="max-w-2xl mx-auto text-center py-24 md:py-32">
          {/* Museum-style number */}
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-sans mb-8">
            Error 404
          </p>

          {/* Editorial heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight mb-6">
            This work could not be found
          </h1>

          {/* Subtle description */}
          <p className="text-lg text-muted-foreground font-serif leading-relaxed mb-12 max-w-md mx-auto">
            The page you're looking for may have been moved, archived, or is no longer on view.
          </p>

          {/* Divider */}
          <div className="w-12 h-px bg-border mx-auto mb-12" />

          {/* Navigation options */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <Link
              to="/"
              className="text-sm font-serif tracking-wide text-foreground/70 hover:text-foreground transition-colors duration-300 underline underline-offset-4"
            >
              Return to Gallery
            </Link>
            <span className="hidden sm:block text-muted-foreground/50">·</span>
            <Link
              to="/explore"
              className="text-sm font-serif tracking-wide text-foreground/70 hover:text-foreground transition-colors duration-300 underline underline-offset-4"
            >
              Explore Works
            </Link>
            <span className="hidden sm:block text-muted-foreground/50">·</span>
            <Link
              to="/artists"
              className="text-sm font-serif tracking-wide text-foreground/70 hover:text-foreground transition-colors duration-300 underline underline-offset-4"
            >
              View Artists
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
