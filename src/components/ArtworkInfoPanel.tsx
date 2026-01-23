import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ShoppingCart, DollarSign, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MakeOfferDialog from "@/components/MakeOfferDialog";
import OffersList from "@/components/OffersList";
import PurchaseInquiryDialog from "@/components/PurchaseInquiryDialog";

interface ArtworkInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  artwork: {
    id: string;
    title: string;
    description: string | null;
    price_usd: number | null;
    price_eth: number | null;
    medium: string | null;
    dimensions: string | null;
    year: number | null;
    edition_total: number | null;
    edition_available: number | null;
    is_nft: boolean | null;
    chain: string | null;
    contract_address: string | null;
    token_id: string | null;
    royalty_percentage: number | null;
    current_owner_id: string | null;
    artists: {
      name: string;
      slug: string;
      user_id: string | null;
    };
  };
  user: any;
  inWishlist: boolean;
  wishlistLoading: boolean;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
  onRefreshArtwork: () => void;
}

const ArtworkInfoPanel = ({
  isOpen,
  onClose,
  artwork,
  user,
  inWishlist,
  wishlistLoading,
  onToggleWishlist,
  onAddToCart,
  onRefreshArtwork,
}: ArtworkInfoPanelProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 z-[250]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-background z-[260] shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-xs uppercase tracking-widest text-foreground/50">
                  Artwork Details
                </span>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 text-foreground/60 hover:text-foreground transition-colors"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Title & Artist */}
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-medium leading-tight mb-3">
                  {artwork.title}
                </h2>
                <Link
                  to={`/artist/${artwork.artists?.slug}`}
                  className="inline-flex items-center gap-1 text-lg text-foreground/70 hover:text-foreground transition-colors group"
                >
                  {artwork.artists?.name || 'Unknown Artist'}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Description */}
              {artwork.description && (
                <p className="text-base leading-relaxed text-foreground/80">
                  {artwork.description}
                </p>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 py-6 border-y border-border">
                {artwork.medium && (
                  <div>
                    <span className="text-xs uppercase tracking-wider text-foreground/50">Medium</span>
                    <p className="mt-1 font-serif">{artwork.medium}</p>
                  </div>
                )}
                {artwork.dimensions && (
                  <div>
                    <span className="text-xs uppercase tracking-wider text-foreground/50">Dimensions</span>
                    <p className="mt-1 font-serif">{artwork.dimensions}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs uppercase tracking-wider text-foreground/50">Edition</span>
                  <p className="mt-1 font-serif">
                    {artwork.edition_total === 1
                      ? 'Unique work'
                      : `${artwork.edition_available}/${artwork.edition_total}`}
                  </p>
                </div>
                {artwork.year && (
                  <div>
                    <span className="text-xs uppercase tracking-wider text-foreground/50">Year</span>
                    <p className="mt-1 font-serif">{artwork.year}</p>
                  </div>
                )}
              </div>

              {/* NFT Details */}
              {artwork.is_nft && (
                <div className="p-4 bg-muted/50 rounded-sm space-y-3">
                  <span className="text-xs uppercase tracking-wider text-foreground/50">
                    NFT Details
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {artwork.chain && (
                      <p className="text-foreground/70">
                        Chain: <span className="text-foreground">{artwork.chain}</span>
                      </p>
                    )}
                    {artwork.token_id && (
                      <p className="text-foreground/70">
                        Token ID: <span className="text-foreground">{artwork.token_id}</span>
                      </p>
                    )}
                    {artwork.contract_address && (
                      <a
                        href={`https://etherscan.io/address/${artwork.contract_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="col-span-2 flex items-center gap-1 text-foreground/70 hover:text-foreground transition-colors"
                      >
                        View Contract
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="space-y-4">
                <div>
                  <p className="text-3xl md:text-4xl font-serif font-medium">
                    {artwork.price_usd ? `$${artwork.price_usd.toLocaleString()}` : 'Price on request'}
                  </p>
                  {artwork.price_eth && (
                    <span className="text-lg text-foreground/60">
                      {artwork.price_eth} ETH
                    </span>
                  )}
                  {artwork.royalty_percentage && (
                    <p className="text-xs text-foreground/50 mt-2">
                      Artist royalty: {artwork.royalty_percentage}% on secondary sales
                    </p>
                  )}
                </div>

                {/* Actions */}
                {artwork.edition_available && artwork.edition_available > 0 ? (
                  <div className="flex gap-3">
                    <Button
                      onClick={onAddToCart}
                      className="flex-1 gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </Button>
                    <MakeOfferDialog
                      artworkId={artwork.id}
                      sellerId={artwork.artists?.user_id || artwork.current_owner_id || ''}
                      currentPriceUsd={artwork.price_usd || undefined}
                      trigger={
                        <Button variant="outline" className="gap-2">
                          <DollarSign className="w-4 h-4" />
                          Offer
                        </Button>
                      }
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onToggleWishlist}
                      disabled={wishlistLoading}
                    >
                      <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button disabled className="w-full">
                      Sold Out
                    </Button>
                    <PurchaseInquiryDialog
                      artworkId={artwork.id}
                      artworkTitle={artwork.title}
                    />
                  </div>
                )}
              </div>

              {/* Tabs */}
              <Tabs defaultValue="provenance" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="provenance" className="flex-1">Provenance</TabsTrigger>
                  <TabsTrigger value="offers" className="flex-1">Offers</TabsTrigger>
                </TabsList>
                <TabsContent value="provenance" className="pt-4">
                  <div className="text-sm text-foreground/70 space-y-2">
                    <p>Full artwork details and provenance information available upon request.</p>
                    {artwork.is_nft && (
                      <p>This artwork is minted as an NFT on {artwork.chain}.</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="offers" className="pt-4">
                  <OffersList
                    artworkId={artwork.id}
                    sellerId={artwork.artists?.user_id || artwork.current_owner_id || ''}
                    onOfferAccepted={onRefreshArtwork}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ArtworkInfoPanel;
