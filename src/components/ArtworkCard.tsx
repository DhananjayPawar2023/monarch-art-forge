import { Link } from "react-router-dom";
import OptimizedImage from "@/components/OptimizedImage";

interface ArtworkCardProps {
  id: string;
  title: string;
  artistName: string;
  artistSlug?: string;
  imageUrl?: string;
  image?: string;
  price?: string;
  priceUsd?: number | null;
  edition?: string;
}

const ArtworkCard = ({ id, title, artistName, image, imageUrl, price, priceUsd, edition }: ArtworkCardProps) => {
  const displayImage = imageUrl || image || 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80';
  const displayPrice = price || (priceUsd ? `$${priceUsd.toLocaleString()}` : undefined);

  return (
    <Link to={`/artwork/${id}`} className="group block">
      <div className="relative mb-4 image-frame">
        <OptimizedImage
          src={displayImage}
          alt={title}
          aspectRatio="portrait"
          className="transition-transform duration-500 ease-in-out group-hover:scale-[1.02]"
        />
      </div>
      <div className="space-y-1">
        <h3 className="font-serif text-lg tracking-tight group-hover:text-foreground/70 transition-colors duration-300 ease-in-out">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{artistName}</p>
        {displayPrice && (
          <p className="text-sm font-medium">{displayPrice} {edition && <span className="text-muted-foreground">· {edition}</span>}</p>
        )}
      </div>
    </Link>
  );
};

export default ArtworkCard;
