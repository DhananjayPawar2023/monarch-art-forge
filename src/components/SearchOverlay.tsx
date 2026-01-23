import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  type: 'artwork' | 'artist' | 'collection';
  title: string;
  subtitle?: string;
  slug: string;
  image?: string;
}

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery("");
      setResults([]);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);

      try {
        // Search artworks
        const { data: artworks } = await supabase
          .from('artworks')
          .select('id, title, slug, primary_image_url, artists(name)')
          .eq('status', 'published')
          .ilike('title', `%${query}%`)
          .limit(4);

        // Search artists
        const { data: artists } = await supabase
          .from('artists')
          .select('id, name, slug, avatar_url, specialty')
          .ilike('name', `%${query}%`)
          .limit(3);

        // Search collections
        const { data: collections } = await supabase
          .from('collections')
          .select('id, title, slug, cover_image_url')
          .ilike('title', `%${query}%`)
          .limit(3);

        const combinedResults: SearchResult[] = [
          ...(artworks?.map(a => ({
            id: a.id,
            type: 'artwork' as const,
            title: a.title,
            subtitle: a.artists?.name,
            slug: `/artwork/${a.id}`,
            image: a.primary_image_url,
          })) || []),
          ...(artists?.map(a => ({
            id: a.id,
            type: 'artist' as const,
            title: a.name,
            subtitle: a.specialty,
            slug: `/artist/${a.slug}`,
            image: a.avatar_url,
          })) || []),
          ...(collections?.map(c => ({
            id: c.id,
            type: 'collection' as const,
            title: c.title,
            subtitle: 'Collection',
            slug: `/collection/${c.slug}`,
            image: c.cover_image_url,
          })) || []),
        ];

        setResults(combinedResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleResultClick = (slug: string) => {
    navigate(slug);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-foreground/60 hover:text-foreground transition-colors duration-300"
            aria-label="Close search"
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>

          <div className="h-full flex flex-col items-center justify-start pt-[20vh] px-6">
            {/* Search Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-2xl"
            >
              <div className="relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-foreground/40" strokeWidth={1.5} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search artworks, artists, collections..."
                  className="w-full pl-10 pr-4 py-4 text-2xl md:text-3xl font-serif bg-transparent border-b border-border/60 focus:border-foreground/40 focus:outline-none transition-colors duration-300 placeholder:text-foreground/30"
                />
              </div>

              {/* Quick links */}
              {query.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 space-y-3"
                >
                  <p className="text-xs uppercase tracking-widest text-foreground/40 mb-4">Quick Links</p>
                  {['Featured Artists', 'New Releases', 'NFT Gallery', 'About Monarch'].map((link, i) => (
                    <button
                      key={link}
                      onClick={() => {
                        const routes: Record<string, string> = {
                          'Featured Artists': '/artists',
                          'New Releases': '/explore',
                          'NFT Gallery': '/nfts',
                          'About Monarch': '/about',
                        };
                        navigate(routes[link]);
                        onClose();
                      }}
                      className="block text-lg font-serif text-foreground/60 hover:text-foreground transition-colors duration-300"
                    >
                      {link}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Results */}
              {query.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8"
                >
                  {loading ? (
                    <p className="text-foreground/50 font-serif">Searching...</p>
                  ) : results.length === 0 ? (
                    <p className="text-foreground/50 font-serif">No results found for "{query}"</p>
                  ) : (
                    <div className="space-y-4">
                      {results.map((result, index) => (
                        <motion.button
                          key={result.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleResultClick(result.slug)}
                          className="w-full flex items-center gap-4 p-4 rounded-sm bg-muted/30 hover:bg-muted/60 transition-colors duration-300 group text-left"
                        >
                          {result.image && (
                            <div className="w-16 h-16 rounded-sm overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={result.image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] uppercase tracking-widest text-foreground/40">
                              {result.type}
                            </span>
                            <h4 className="text-lg font-serif truncate">{result.title}</h4>
                            {result.subtitle && (
                              <p className="text-sm text-foreground/60 truncate">{result.subtitle}</p>
                            )}
                          </div>
                          <ArrowRight className="w-5 h-5 text-foreground/30 group-hover:text-foreground/60 transition-colors" />
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
