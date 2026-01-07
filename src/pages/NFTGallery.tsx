import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import WalletConnect from "@/components/WalletConnect";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import { getOpenSeaAssetUrl } from "@/utils/nft";

interface NftArtwork {
  id: string;
  title: string;
  primary_image_url: string | null;
  price_eth: number | null;
  chain: string | null;
  contract_address: string | null;
  token_id: string | null;
  artists: {
    name: string;
  };
}

const NFTGallery = () => {
  const { toast } = useToast();
  const [artworks, setArtworks] = useState<NftArtwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMintedArtworks = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("artworks")
          .select(
            `
            id,
            title,
            primary_image_url,
            price_eth,
            chain,
            contract_address,
            token_id,
            artists (name)
          `
          )
          .eq("is_nft", true)
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setArtworks((data as NftArtwork[]) || []);
      } catch (error: any) {
        console.error("Error loading NFTs:", error);
        toast({
          title: "Error loading NFTs",
          description: "We couldn't load minted artworks. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMintedArtworks();
  }, [toast]);

  return (
    <>
      <SEO
        title="NFT Gallery - Monarch"
        description="Browse all Monarch NFTs minted on Ethereum and Base with on-chain verification and OpenSea links."
      />
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 pt-14 sm:pt-16">
          {/* Hero */}
          <section className="py-8 sm:py-12 md:py-16 border-b border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-8">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-medium mb-2 sm:mb-4">
                    NFT Gallery
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl">
                    All artworks minted on-chain through Monarch, verified on Ethereum and Base and viewable on OpenSea.
                  </p>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-3 flex-shrink-0">
                  <p className="hidden sm:block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Wallet & Mint
                  </p>
                  <WalletConnect />
                  <Link to="/mint">
                    <Button size="sm" variant="outline" className="h-9 sm:h-10 text-sm">
                      Mint Artwork
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Grid */}
          <section className="py-8 sm:py-12 md:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-3 sm:space-y-4">
                      <Skeleton className="aspect-square w-full" />
                      <Skeleton className="h-5 sm:h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : artworks.length === 0 ? (
                <div className="text-center py-12 sm:py-16 space-y-3 sm:space-y-4">
                  <p className="text-sm sm:text-base text-muted-foreground">
                    No NFTs have been minted on Monarch yet.
                  </p>
                  <Link to="/mint">
                    <Button variant="outline" size="sm" className="h-9 sm:h-10">
                      Be the first to mint
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {artworks.map((artwork) => {
                    const imageUrl =
                      artwork.primary_image_url ||
                      "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80";
                    const hasOnChainData =
                      !!artwork.chain &&
                      !!artwork.contract_address &&
                      !!artwork.token_id;
                    const openSeaUrl = hasOnChainData
                      ? getOpenSeaAssetUrl(
                          artwork.chain as string,
                          artwork.contract_address as string,
                          artwork.token_id as string
                        )
                      : null;

                    return (
                      <article key={artwork.id} className="group">
                        <Link to={`/artwork/${artwork.id}`} className="block">
                          <div className="relative aspect-square overflow-hidden bg-muted mb-3 sm:mb-4 rounded-sm">
                            <img
                              src={imageUrl}
                              alt={artwork.title}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <div className="space-y-0.5 sm:space-y-1">
                            <h2 className="font-serif text-base sm:text-lg group-hover:text-muted-foreground transition-colors truncate">
                              {artwork.title}
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {artwork.artists?.name || "Unknown artist"}
                            </p>
                          </div>
                        </Link>

                        <div className="mt-2 sm:mt-3 flex items-start justify-between gap-2 text-xs sm:text-sm">
                          <div className="space-y-0.5 sm:space-y-1 min-w-0">
                            {artwork.price_eth !== null && (
                              <p className="font-medium">
                                {artwork.price_eth.toLocaleString()} ETH
                              </p>
                            )}
                            <p className="text-[10px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-[0.16em] text-muted-foreground">
                              {artwork.chain ? artwork.chain.toUpperCase() : "ON-CHAIN"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 sm:gap-1 flex-shrink-0 text-right">
                            {hasOnChainData ? (
                              <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                                <CheckCircle2 className="w-3 h-3" />
                                <span className="hidden xs:inline">Verified</span>
                              </div>
                            ) : (
                              <span className="text-[10px] sm:text-xs text-muted-foreground">
                                Pending
                              </span>
                            )}
                            {openSeaUrl && (
                              <a
                                href={openSeaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-primary hover:underline"
                              >
                                OpenSea
                                <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default NFTGallery;
