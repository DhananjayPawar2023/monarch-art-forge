import { Link } from "react-router-dom";
import { Instagram, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-lg sm:text-xl font-serif font-medium mb-2 sm:mb-4">monarch</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Where Art Meets Story
            </p>
            <div className="flex gap-2 sm:gap-4">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <Instagram className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <Twitter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-4 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/explore" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Releases
                </Link>
              </li>
              <li>
                <Link to="/artists" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Artists
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Work With Us */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-4 uppercase tracking-wider">Work With Us</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/apply-artist" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Apply as Artist
                </Link>
              </li>
              <li>
                <Link to="/collector-dashboard" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Collector Dashboard
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-4 uppercase tracking-wider">Newsletter</h4>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Stay updated with new releases
            </p>
            <div className="flex gap-2 max-w-xs">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="text-xs sm:text-sm h-9"
              />
              <Button variant="default" size="sm" className="h-9 px-3 sm:px-4 text-xs sm:text-sm">
                Join
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center sm:text-left">
            © Monarch Gallery 2025. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6">
            <Link to="/terms" className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
