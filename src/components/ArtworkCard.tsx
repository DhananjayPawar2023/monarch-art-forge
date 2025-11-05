import { Link } from "react-router-dom";

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
  const displayImage = imageUrl || image || '';
  const displayPrice = price || (priceUsd ? `$${priceUsd.toLocaleString()}` : undefined);

  return (
    <Link to={`/artwork/${id}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-muted mb-4">
        <img
          src={displayImage || 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80'}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-1">
        <h3 className="font-serif text-lg group-hover:text-muted-foreground transition-colors">
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
