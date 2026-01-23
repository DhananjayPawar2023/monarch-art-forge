import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Preview images for each nav category - abstract, architectural, artistic
const navPreviewImages: Record<string, string> = {
  "/explore": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&q=80",
  "/artists": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&q=80",
  "/journal": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
  "/collections": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80",
  "/nfts": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
  "/secondary-market": "https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=1200&q=80",
  "/about": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80",
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Editorial navigation
  const primaryNav = [
    { label: "Explore", href: "/explore" },
    { label: "Artists", href: "/artists" },
    { label: "Stories", href: "/journal" },
    { label: "Collections", href: "/collections" },
    { label: "Exhibitions", href: "/nfts" },
    { label: "Editions", href: "/secondary-market" },
    { label: "About", href: "/about" },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* Desktop Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/40">
        <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo - Tightened letter-spacing */}
            <Link 
              to="/" 
              className="text-xl lg:text-2xl font-serif font-medium tracking-[-0.03em] hover:opacity-70 transition-opacity duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            >
              Monarch
            </Link>

            {/* Desktop Navigation with hover preview area */}
            <nav className="hidden lg:flex items-center gap-8 xl:gap-10 relative">
              {/* Background preview image */}
              <AnimatePresence>
                {hoveredLink && navPreviewImages[hoveredLink] && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute -inset-x-8 -inset-y-4 -z-10 pointer-events-none overflow-hidden rounded-sm"
                  >
                    <img
                      src={navPreviewImages[hoveredLink]}
                      alt=""
                      className="w-full h-full object-cover blur-[3px] saturate-[0.4] opacity-15 dark:opacity-10"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background" />
                  </motion.div>
                )}
              </AnimatePresence>

              {primaryNav.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onMouseEnter={() => setHoveredLink(link.href)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className={`relative text-sm font-serif tracking-wide transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm ${
                    isActive(link.href) 
                      ? "text-foreground after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-px after:bg-foreground/60" 
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4 lg:gap-6">
              <button
                onClick={toggleTheme}
                className="hidden lg:block text-xs font-sans uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                {theme === "light" ? "Night" : "Day"}
              </button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="hidden lg:flex">
                    <button className="text-sm font-serif tracking-wide text-foreground/70 hover:text-foreground transition-colors duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm">
                      Account
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[180px] border-border/50">
                    <DropdownMenuItem asChild>
                      <Link to="/collector-dashboard" className="font-serif text-sm">
                        My Collection
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/artist-dashboard" className="font-serif text-sm">
                        Artist Studio
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wishlist" className="font-serif text-sm">
                        Saved Works
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="font-serif text-sm">
                            Administration
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="font-serif text-sm">
                      Leave
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link 
                  to="/auth" 
                  className="hidden lg:block text-sm font-serif tracking-wide text-foreground/70 hover:text-foreground transition-colors duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                >
                  Enter Monarch
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2 -mr-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                aria-label="Open menu"
              >
                <div className="w-6 flex flex-col gap-1.5">
                  <span className="block h-px bg-foreground" />
                  <span className="block h-px bg-foreground" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop overlay */}
      <div 
        className={`fixed inset-0 z-[99] bg-background/80 backdrop-blur-sm lg:hidden transition-opacity duration-500 ease-in-out ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Full-screen Mobile Menu */}
      <div 
        className={`fixed inset-0 z-[100] bg-background lg:hidden transition-all duration-500 ease-in-out ${
          isMenuOpen 
            ? "opacity-100 translate-x-0" 
            : "opacity-0 translate-x-full pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="h-full w-full flex flex-col">
          {/* Mobile Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 h-16 border-b border-border/40">
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className="text-xl font-serif font-medium tracking-[-0.03em]"
            >
              Monarch
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 -mr-2 hover:opacity-70 transition-opacity duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 flex flex-col justify-center px-8 overflow-y-auto">
            <div className="space-y-6 sm:space-y-8">
              {primaryNav.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  <Link
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block text-3xl sm:text-4xl font-serif tracking-tight transition-colors duration-300 ease-in-out ${
                      isActive(link.href) 
                        ? "text-foreground border-l-2 border-foreground pl-4" 
                        : "text-foreground/80 hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="my-10 sm:my-12 border-t border-border/40 w-16" />

            <Link
              to={user ? "/collector-dashboard" : "/auth"}
              onClick={() => setIsMenuOpen(false)}
              className="text-lg font-serif tracking-wide text-foreground/80 hover:text-foreground transition-colors duration-300 ease-in-out"
            >
              {user ? "My Collection" : "Enter Monarch"}
            </Link>

            {user && (
              <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
                <Link
                  to="/artist-dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-base font-serif tracking-wide text-foreground/70 hover:text-foreground transition-colors duration-300 ease-in-out"
                >
                  Artist Studio
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-base font-serif tracking-wide text-foreground/70 hover:text-foreground transition-colors duration-300 ease-in-out"
                  >
                    Administration
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="block text-base font-serif tracking-wide text-foreground/70 hover:text-foreground transition-colors duration-300 ease-in-out"
                >
                  Leave
                </button>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="mt-8 text-sm font-sans uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors duration-300 ease-in-out text-left"
            >
              {theme === "light" ? "Night Mode" : "Day Mode"}
            </button>
          </nav>

          <div className="flex-shrink-0 h-8 sm:h-12" />
        </div>
      </div>
    </>
  );
};

export default Header;
