import { Link } from "react-router-dom";
import { Instagram, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-serif font-medium mb-4">monarch</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Where Art Meets Story
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-medium mb-4 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/explore" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Releases
                </Link>
              </li>
              <li>
                <Link to="/artists" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Artists
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Work With Us */}
          <div>
            <h4 className="text-sm font-medium mb-4 uppercase tracking-wider">Work With Us</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/apply-artist" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Apply as Artist
                </Link>
              </li>
              <li>
                <Link to="/collector-dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Collector Dashboard
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-medium mb-4 uppercase tracking-wider">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Stay updated with new releases
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="text-sm"
              />
              <Button variant="default" size="sm">
                Join
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © Monarch Gallery 2025. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
