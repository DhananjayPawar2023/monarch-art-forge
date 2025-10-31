import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArtworkCard from "@/components/ArtworkCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Explore = () => {
  const [sortBy, setSortBy] = useState("newest");

  // Mock data
  const artworks = [
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
    {
      id: "4",
      title: "Abstract Resonance",
      artistName: "James Park",
      image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80",
      price: "$2,900",
      edition: "Edition of 3"
    },
    {
      id: "5",
      title: "Minimal Essence",
      artistName: "Yuki Tanaka",
      image: "https://images.unsplash.com/photo-1544967082-d9d25d867eeb?w=800&q=80",
      price: "$1,500",
      edition: "Edition of 10"
    },
    {
      id: "6",
      title: "Urban Poetry",
      artistName: "Diego Santos",
      image: "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800&q=80",
      price: "$2,100",
      edition: "1/1"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium mb-6">
              Explore
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Discover curated artworks from emerging and established artists
            </p>
          </div>
        </section>

        {/* Filters & Sort */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">All</Button>
                <Button variant="ghost" size="sm">Paintings</Button>
                <Button variant="ghost" size="sm">Digital</Button>
                <Button variant="ghost" size="sm">Photography</Button>
                <Button variant="ghost" size="sm">Sculpture</Button>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Artworks Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {artworks.map((artwork) => (
                <ArtworkCard key={artwork.id} {...artwork} />
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <Button variant="outline" size="lg">
                Load More
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Explore;
