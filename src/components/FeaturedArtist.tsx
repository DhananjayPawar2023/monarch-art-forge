import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface FeaturedArtistProps {
  name: string;
  title: string;
  bio: string;
  image: string;
  artworkCount: number;
  slug: string;
}

const FeaturedArtist = ({ name, title, bio, image, artworkCount, slug }: FeaturedArtistProps) => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] overflow-hidden rounded-sm">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 sm:mb-3">Featured Artist</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium mb-2">{name}</h2>
              <p className="text-base sm:text-lg font-serif italic text-muted-foreground">{title}</p>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
              {bio}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium">{artworkCount} artworks</span>
            </div>
            <Link to={`/artist/${slug}`}>
              <Button variant="default" size="lg" className="w-full sm:w-auto">
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtist;
