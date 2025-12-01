import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

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

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Journal"
        description="Stories, interviews, and insights from the world of contemporary art at Monarch Gallery."
      />
      <Header />
      
      <main className="flex-1 pt-16">
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium mb-6">
              Journal
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Stories, interviews, and insights from the world of contemporary art
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[16/10] w-full" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg mb-4">No journal entries yet</p>
                <p className="text-sm text-muted-foreground">Check back soon for stories and insights.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {posts.map((post, index) => (
                  <Link 
                    key={post.id} 
                    to={`/journal/${post.slug}`}
                    className={`group block ${index === 0 ? 'md:col-span-2' : ''}`}
                  >
                    <article>
                      <div className={`relative overflow-hidden bg-muted mb-6 ${index === 0 ? 'aspect-[21/9]' : 'aspect-[16/10]'}`}>
                        {post.cover_image_url ? (
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        {post.artists && (
                          <Badge variant="outline">{post.artists.name}</Badge>
                        )}
                        {post.collections && (
                          <Badge variant="outline">{post.collections.title}</Badge>
                        )}
                        {post.published_at && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.published_at).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        )}
                      </div>
                      
                      <h2 className={`font-serif font-medium mb-3 group-hover:text-muted-foreground transition-colors ${index === 0 ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
                        {post.title}
                      </h2>
                      
                      {post.excerpt && (
                        <p className="text-muted-foreground line-clamp-3">
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