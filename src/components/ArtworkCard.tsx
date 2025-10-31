import { Link } from "react-router-dom";

interface ArtworkCardProps {
  id: string;
  title: string;
  artistName: string;
  image: string;
  price?: string;
  edition?: string;
}

const ArtworkCard = ({ id, title, artistName, image, price, edition }: ArtworkCardProps) => {
  return (
    <Link to={`/artwork/${id}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-muted mb-4">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-1">
        <h3 className="font-serif text-lg group-hover:text-muted-foreground transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{artistName}</p>
        {price && (
          <p className="text-sm font-medium">{price} {edition && <span className="text-muted-foreground">· {edition}</span>}</p>
        )}
      </div>
    </Link>
  );
};

export default ArtworkCard;
