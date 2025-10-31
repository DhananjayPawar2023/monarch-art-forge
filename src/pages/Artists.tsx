import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Artists = () => {
  const artists = [
    {
      name: "Sarah Chen",
      slug: "sarah-chen",
      specialty: "Contemporary Digital Art",
      artworkCount: 24,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"
    },
    {
      name: "Marcus Rivera",
      slug: "marcus-rivera",
      specialty: "Abstract Expressionism",
      artworkCount: 18,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
    },
    {
      name: "Elena Volkov",
      slug: "elena-volkov",
      specialty: "Mixed Media & Installation",
      artworkCount: 32,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80"
    },
    {
      name: "James Park",
      slug: "james-park",
      specialty: "Minimalist Photography",
      artworkCount: 41,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium mb-6">
              Artists
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Meet the visionaries behind the art
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {artists.map((artist) => (
                <Link 
                  key={artist.slug} 
                  to={`/artist/${artist.slug}`}
                  className="group block"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-3 pt-2">
                      <h3 className="text-2xl font-serif font-medium group-hover:text-muted-foreground transition-colors">
                        {artist.name}
                      </h3>
                      <p className="text-muted-foreground">{artist.specialty}</p>
                      <p className="text-sm">{artist.artworkCount} artworks</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Artists;
