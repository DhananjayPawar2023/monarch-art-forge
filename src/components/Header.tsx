import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  // Editorial navigation - no web3/crypto language, museum-grade
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
      {/* Desktop Header - Editorial, restrained */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/40">
        <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo - Left aligned, serif */}
            <Link 
              to="/" 
              className="text-xl lg:text-2xl font-serif font-medium tracking-tight hover:opacity-60 transition-opacity duration-300"
            >
              Monarch
            </Link>

            {/* Desktop Navigation - Centered feel, text only */}
            <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
              {primaryNav.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-serif tracking-wide transition-opacity duration-300 ${
                    isActive(link.href) 
                      ? "opacity-100" 
                      : "opacity-50 hover:opacity-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side - Enter Monarch (ceremonial) */}
            <div className="flex items-center gap-6">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="hidden lg:flex">
                    <button className="text-sm font-serif tracking-wide opacity-50 hover:opacity-100 transition-opacity duration-300">
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
                  className="hidden lg:block text-sm font-serif tracking-wide opacity-50 hover:opacity-100 transition-opacity duration-300"
                >
                  Enter Monarch
                </Link>
              )}

              {/* Mobile Menu Toggle - Minimal hamburger */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2 -mr-2"
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

      {/* Full-screen Mobile Menu - Gallery entrance feel */}
      <div 
        className={`fixed inset-0 z-[100] bg-background transition-transform duration-500 ease-out lg:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-border/40">
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className="text-xl font-serif font-medium tracking-tight"
            >
              Monarch
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 -mr-2"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Mobile Navigation - Large typography, breathing space */}
          <nav className="flex-1 flex flex-col justify-center px-8 pb-24 overflow-y-auto">
            <div className="space-y-8">
              {primaryNav.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-3xl sm:text-4xl font-serif tracking-tight transition-opacity duration-300 ${
                    isActive(link.href) 
                      ? "opacity-100" 
                      : "opacity-40 hover:opacity-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="my-12 border-t border-border/40 w-16" />

            {/* Enter Monarch - Ceremonial */}
            <Link
              to={user ? "/collector-dashboard" : "/auth"}
              onClick={() => setIsMenuOpen(false)}
              className="text-lg font-serif tracking-wide opacity-50 hover:opacity-100 transition-opacity duration-300"
            >
              {user ? "My Collection" : "Enter Monarch"}
            </Link>

            {user && (
              <div className="mt-8 space-y-5">
                <Link
                  to="/artist-dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-base font-serif tracking-wide opacity-40 hover:opacity-100 transition-opacity"
                >
                  Artist Studio
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-base font-serif tracking-wide opacity-40 hover:opacity-100 transition-opacity"
                  >
                    Administration
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="block text-base font-serif tracking-wide opacity-40 hover:opacity-100 transition-opacity"
                >
                  Leave
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;
