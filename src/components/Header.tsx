import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, LogOut, Settings, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import WalletConnect from "@/components/WalletConnect";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();

  const navLinks = [
    { label: "Explore", href: "/explore" },
    { label: "Artists", href: "/artists" },
    { label: "Collections", href: "/collections" },
    { label: "Mint NFT", href: "/mint" },
    { label: "NFT Gallery", href: "/nfts" },
    { label: "Journal", href: "/journal" },
    { label: "Secondary Market", href: "/secondary-market" },
    { label: "About", href: "/about" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="text-lg sm:text-xl font-serif font-medium tracking-tight hover:opacity-70 transition-opacity flex-shrink-0">
            monarch
          </Link>

          {/* Desktop nav - hidden on smaller screens */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {totalItems > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
            
            {user ? (
              <>
                <div className="hidden md:block">
                  <WalletConnect />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="hidden lg:flex">
                    <Button variant="ghost" size="sm">
                      Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/collector-dashboard">
                        My Collection
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/artist-dashboard">
                        Artist Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wishlist">
                        My Wishlist
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-listings">
                        My Listings
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin">
                            <Settings className="w-4 h-4 mr-2" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth" className="hidden lg:block">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile/Tablet menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm overflow-y-auto">
                <nav className="flex flex-col gap-4 mt-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="text-base sm:text-lg hover:text-muted-foreground transition-colors py-1"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-border space-y-3">
                    {user ? (
                      <>
                        <WalletConnect />
                        <Link to="/profile" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full" size="sm">
                            My Profile
                          </Button>
                        </Link>
                        <Link to="/collector-dashboard" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full" size="sm">
                            My Collection
                          </Button>
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setIsOpen(false)}>
                            <Button variant="outline" className="w-full" size="sm">
                              Admin Dashboard
                            </Button>
                          </Link>
                        )}
                        <Button variant="default" className="w-full" size="sm" onClick={signOut}>
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button variant="default" className="w-full" size="sm">
                          Sign In
                        </Button>
                      </Link>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
