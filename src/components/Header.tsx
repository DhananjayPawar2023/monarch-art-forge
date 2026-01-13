import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  // Editorial navigation - no web3/crypto language
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo - Left aligned */}
            <Link 
              to="/" 
              className="text-xl lg:text-2xl font-serif font-medium tracking-tight hover:opacity-60 transition-opacity duration-300"
            >
              Monarch
            </Link>

            {/* Desktop Navigation - Center/Left aligned */}
            <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
              {primaryNav.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-serif tracking-wide transition-opacity duration-300 ${
                    isActive(link.href) 
                      ? "opacity-100" 
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side - Enter Monarch */}
            <div className="flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="hidden lg:flex">
                    <button className="text-sm font-serif tracking-wide opacity-60 hover:opacity-100 transition-opacity duration-300">
                      Account
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[180px]">
                    <DropdownMenuItem asChild>
                      <Link to="/collector-dashboard" className="font-serif">
                        My Collection
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/artist-dashboard" className="font-serif">
                        Artist Studio
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wishlist" className="font-serif">
                        Saved Works
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/cart" className="font-serif">
                        Cart
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="font-serif">
                            Administration
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="font-serif">
                      Leave
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link 
                  to="/auth" 
                  className="hidden lg:block text-sm font-serif tracking-wide opacity-60 hover:opacity-100 transition-opacity duration-300"
                >
                  Enter Monarch
                </Link>
              )}

              {/* Mobile Menu Toggle */}
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

      {/* Full-screen Mobile Menu */}
      <div 
        className={`fixed inset-0 z-[100] bg-background transition-transform duration-500 ease-out lg:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-border/50">
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
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 flex flex-col justify-center px-8 pb-20">
            <div className="space-y-6">
              {primaryNav.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-3xl sm:text-4xl font-serif tracking-tight transition-opacity duration-300 ${
                    isActive(link.href) 
                      ? "opacity-100" 
                      : "opacity-50 hover:opacity-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="my-10 border-t border-border/50" />

            {/* Enter Monarch */}
            <Link
              to={user ? "/collector-dashboard" : "/auth"}
              onClick={() => setIsMenuOpen(false)}
              className="text-xl font-serif tracking-wide opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              {user ? "My Collection" : "Enter Monarch"}
            </Link>

            {user && (
              <div className="mt-6 space-y-4">
                <Link
                  to="/artist-dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-lg font-serif tracking-wide opacity-50 hover:opacity-100 transition-opacity"
                >
                  Artist Studio
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-lg font-serif tracking-wide opacity-50 hover:opacity-100 transition-opacity"
                >
                  Cart
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-lg font-serif tracking-wide opacity-50 hover:opacity-100 transition-opacity"
                  >
                    Administration
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="block text-lg font-serif tracking-wide opacity-50 hover:opacity-100 transition-opacity"
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
