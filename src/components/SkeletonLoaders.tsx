import { Skeleton } from "@/components/ui/skeleton";

// Editorial skeleton for artwork cards
export const ArtworkCardSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="aspect-[4/5] w-full bg-muted/50" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4 bg-muted/50" />
      <Skeleton className="h-3 w-1/2 bg-muted/50" />
    </div>
  </div>
);

// Grid of artwork skeletons
export const ArtworkGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <ArtworkCardSkeleton key={i} />
    ))}
  </div>
);

// Artist card skeleton
export const ArtistCardSkeleton = () => (
  <div className="space-y-4 py-8 border-b border-border/30">
    <Skeleton className="h-6 w-1/3 bg-muted/50" />
    <Skeleton className="h-4 w-1/4 bg-muted/50" />
  </div>
);

// Artist list skeleton
export const ArtistListSkeleton = ({ count = 6 }: { count?: number }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => (
      <ArtistCardSkeleton key={i} />
    ))}
  </div>
);

// Collection card skeleton
export const CollectionCardSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="aspect-[16/9] w-full bg-muted/50" />
    <div className="space-y-3">
      <Skeleton className="h-6 w-2/3 bg-muted/50" />
      <Skeleton className="h-4 w-full bg-muted/50" />
      <Skeleton className="h-4 w-3/4 bg-muted/50" />
    </div>
  </div>
);

// Collection list skeleton
export const CollectionListSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="space-y-16">
    {Array.from({ length: count }).map((_, i) => (
      <CollectionCardSkeleton key={i} />
    ))}
  </div>
);

// Story/Journal card skeleton
export const StoryCardSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="aspect-[3/2] w-full bg-muted/50" />
    <div className="space-y-2">
      <Skeleton className="h-3 w-1/4 bg-muted/50" />
      <Skeleton className="h-5 w-full bg-muted/50" />
      <Skeleton className="h-4 w-3/4 bg-muted/50" />
    </div>
  </div>
);

// Story grid skeleton
export const StoryGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
    {Array.from({ length: count }).map((_, i) => (
      <StoryCardSkeleton key={i} />
    ))}
  </div>
);

// Article detail skeleton
export const ArticleSkeleton = () => (
  <div className="max-w-3xl mx-auto space-y-8">
    <Skeleton className="h-12 w-3/4 bg-muted/50" />
    <Skeleton className="h-4 w-1/3 bg-muted/50" />
    <div className="space-y-4 pt-8">
      <Skeleton className="h-4 w-full bg-muted/50" />
      <Skeleton className="h-4 w-full bg-muted/50" />
      <Skeleton className="h-4 w-2/3 bg-muted/50" />
    </div>
    <Skeleton className="aspect-[16/9] w-full bg-muted/50" />
    <div className="space-y-4">
      <Skeleton className="h-4 w-full bg-muted/50" />
      <Skeleton className="h-4 w-full bg-muted/50" />
      <Skeleton className="h-4 w-full bg-muted/50" />
      <Skeleton className="h-4 w-1/2 bg-muted/50" />
    </div>
  </div>
);

// Hero section skeleton
export const HeroSkeleton = () => (
  <div className="relative h-[70vh] min-h-[500px]">
    <Skeleton className="absolute inset-0 bg-muted/30" />
    <div className="absolute inset-0 flex items-end p-8 lg:p-16">
      <div className="space-y-4 max-w-xl">
        <Skeleton className="h-3 w-24 bg-muted/50" />
        <Skeleton className="h-10 w-96 bg-muted/50" />
        <Skeleton className="h-4 w-64 bg-muted/50" />
      </div>
    </div>
  </div>
);
