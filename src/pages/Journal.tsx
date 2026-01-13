import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface JournalPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  artists: { name: string; slug: string } | null;
  collections: { title: string; slug: string } | null;
}

const Journal = () => {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          cover_image_url,
          published_at,
          artists (name, slug),
          collections (title, slug)
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching journal posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const estimateReadTime = (excerpt: string | null) => {
    // Rough estimate based on excerpt
    return "5 min read";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Stories"
        description="Artist philosophy, cultural commentary, and deep storytelling from the world of contemporary art."
      />
      <Header />
      
      <main className="flex-1 pt-20 lg:pt-24">
        {/* Hero Section */}
        <section className="py-16 md:py-24 border-b border-border/50">
          <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-12">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-normal tracking-tight mb-6">
              Stories
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl font-serif italic">
              Artist philosophy, cultural commentary, and the ideas that shape contemporary art
            </p>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-12">
            {loading ? (
              <div className="space-y-24">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="max-w-4xl">
                    <Skeleton className="aspect-[16/9] w-full mb-8" />
                    <Skeleton className="h-10 w-3/4 mb-4" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-6 w-2/3" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-2xl font-serif text-muted-foreground mb-4">
                  No stories yet
                </p>
                <p className="text-muted-foreground">
                  Check back soon for essays and cultural commentary.
                </p>
              </div>
            ) : (
              <div className="space-y-24 lg:space-y-32">
                {posts.map((post, index) => (
                  <Link 
                    key={post.id} 
                    to={`/journal/${post.slug}`}
                    className="group block"
                  >
                    <article className={index === 0 ? "max-w-full" : "max-w-4xl"}>
                      {/* Cover Image */}
                      {post.cover_image_url && (
                        <div className={`relative overflow-hidden bg-muted mb-8 md:mb-10 image-frame ${
                          index === 0 ? "aspect-[21/9]" : "aspect-[16/9]"
                        }`}>
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                          />
                        </div>
                      )}
                      
                      {/* Meta */}
                      <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                        {post.artists && (
                          <span className="font-serif">{post.artists.name}</span>
                        )}
                        {post.artists && post.published_at && (
                          <span className="opacity-30">·</span>
                        )}
                        {post.published_at && (
                          <time className="font-serif">{formatDate(post.published_at)}</time>
                        )}
                        <span className="opacity-30">·</span>
                        <span className="font-serif">{estimateReadTime(post.excerpt)}</span>
                      </div>
                      
                      {/* Title */}
                      <h2 className={`font-serif font-normal tracking-tight mb-4 transition-opacity duration-300 group-hover:opacity-70 ${
                        index === 0 
                          ? "text-3xl sm:text-4xl md:text-5xl lg:text-6xl" 
                          : "text-2xl sm:text-3xl md:text-4xl"
                      }`}>
                        {post.title}
                      </h2>
                      
                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-lg text-muted-foreground font-serif leading-relaxed max-w-2xl">
                          {post.excerpt}
                        </p>
                      )}
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Journal;
