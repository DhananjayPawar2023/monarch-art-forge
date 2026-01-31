import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

interface JournalPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  artists: { name: string; slug: string } | null;
  collections: { title: string; slug: string } | null;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
}

const JournalPostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<JournalPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          cover_image_url,
          published_at,
          artists (name, slug),
          collections (title, slug)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      setPost(data);

      // Fetch related posts
      const { data: related } = await supabase
        .from('journal_posts')
        .select('id, title, slug, cover_image_url')
        .eq('is_published', true)
        .neq('slug', slug)
        .limit(3);

      setRelatedPosts(related || []);
    } catch (error) {
      console.error('Error fetching journal post:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 lg:pt-24">
          <div className="max-w-3xl mx-auto px-6 py-16">
            <Skeleton className="h-12 w-3/4 mb-6" />
            <Skeleton className="h-6 w-1/3 mb-12" />
            <Skeleton className="aspect-[16/9] w-full mb-12" />
            <div className="space-y-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 lg:pt-24">
          <div className="max-w-3xl mx-auto px-6 py-24 text-center">
            <h1 className="text-4xl font-serif mb-4">Story not found</h1>
            <p className="text-muted-foreground mb-8">
              The story you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/journal" className="font-serif underline underline-offset-4 hover:opacity-70 transition-opacity">
              Back to Stories
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title={post.title}
        description={post.excerpt || `Read ${post.title} on Monarch`}
        image={post.cover_image_url || undefined}
      />
      <ReadingProgressBar />
      <Header />
      
      <main className="flex-1 pt-20 lg:pt-24">
        {/* Article Header */}
        <article>
          <header className="max-w-3xl mx-auto px-6 sm:px-8 py-12 md:py-16">
            {/* Back link */}
            <Link 
              to="/journal" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-serif">Stories</span>
            </Link>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal tracking-tight mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Subtitle/Excerpt */}
            {post.excerpt && (
              <p className="text-xl md:text-2xl text-muted-foreground font-serif italic mb-8">
                {post.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {post.artists && (
                <Link 
                  to={`/artist/${post.artists.slug}`}
                  className="font-serif hover:text-foreground transition-colors"
                >
                  {post.artists.name}
                </Link>
              )}
              {post.artists && post.published_at && (
                <span className="opacity-30">·</span>
              )}
              {post.published_at && (
                <time className="font-serif">{formatDate(post.published_at)}</time>
              )}
            </div>
          </header>

          {/* Hero Image */}
          {post.cover_image_url && (
            <figure className="max-w-5xl mx-auto px-6 sm:px-8 mb-12 md:mb-16">
              <div className="aspect-[16/9] overflow-hidden bg-muted image-frame">
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </figure>
          )}

          {/* Article Body - Centered reading column */}
          <div className="max-w-[700px] mx-auto px-6 sm:px-8 pb-16 md:pb-24">
            {post.content ? (
              <div 
                className="article-body font-serif"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <p className="text-lg font-serif text-muted-foreground italic">
                Full article coming soon.
              </p>
            )}
          </div>
        </article>

        {/* Minimal divider */}
        <div className="max-w-[700px] mx-auto px-6 sm:px-8">
          <div className="border-t border-border/50" />
        </div>

        {/* Continue Reading */}
        {relatedPosts.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 sm:px-8 py-16 md:py-24">
            <h2 className="text-2xl font-serif font-normal mb-10">Continue Reading</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((related) => (
                <Link 
                  key={related.id}
                  to={`/journal/${related.slug}`}
                  className="group"
                >
                  {related.cover_image_url && (
                    <div className="aspect-[4/3] overflow-hidden bg-muted mb-4 image-frame">
                      <img
                        src={related.cover_image_url}
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                  )}
                  <h3 className="font-serif text-lg group-hover:opacity-70 transition-opacity">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default JournalPostDetail;
