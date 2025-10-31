import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArtworkCard from "@/components/ArtworkCard";
import FeaturedArtist from "@/components/FeaturedArtist";

const Index = () => {
  const featuredArtworks = [
    {
      id: "1",
      title: "Ethereal Horizons",
      artistName: "Sarah Chen",
      image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
      price: "$2,400",
      edition: "1/1"
    },
    {
      id: "2",
      title: "Digital Dreams",
      artistName: "Marcus Rivera",
      image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80",
      price: "$1,800",
      edition: "Edition of 5"
    },
    {
      id: "3",
      title: "Chromatic Visions",
      artistName: "Elena Volkov",
      image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80",
      price: "$3,200",
      edition: "1/1"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-8">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-medium leading-tight">
                Where Art<br />Meets Story
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                A curated platform showcasing digital and physical artworks from visionary artists
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Link to="/explore">
                  <Button size="lg" className="min-w-[160px]">
                    Explore Art
                  </Button>
                </Link>
                <Link to="/artists">
                  <Button size="lg" variant="outline" className="min-w-[160px]">
                    Meet Artists
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Artworks */}
        <section className="py-24 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif font-medium mb-4">Featured</h2>
                <p className="text-lg text-muted-foreground">Latest releases from our artists</p>
              </div>
              <Link to="/explore">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  View all →
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {featuredArtworks.map((artwork) => (
                <ArtworkCard key={artwork.id} {...artwork} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Artist */}
        <FeaturedArtist
          name="Sarah Chen"
          title="Digital Etherealism"
          bio="Sarah Chen explores the intersection of technology and emotion through her ethereal digital compositions. Her work has been featured in galleries worldwide and collected by major institutions."
          image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80"
          artworkCount={24}
          slug="sarah-chen"
        />

        {/* CTA Section */}
        <section className="py-24 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-medium mb-6">
              Join Our Community
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Be the first to discover new releases and artist stories
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button size="lg">Subscribe</Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
