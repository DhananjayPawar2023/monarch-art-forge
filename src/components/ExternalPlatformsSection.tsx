import { motion } from 'framer-motion';
import { ExternalLink, Gem, Globe } from 'lucide-react';

interface ExternalWork {
  id: string;
  title: string;
  platform: 'verse' | 'superrare' | 'foundation' | 'zora';
  imageUrl: string;
  artistName: string;
  externalUrl: string;
  price?: string;
}

// Placeholder data - replace with actual API integration or database entries
const externalWorks: ExternalWork[] = [
  {
    id: '1',
    title: 'Untitled Study No. 4',
    platform: 'superrare',
    imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=800&q=80',
    artistName: 'Artist Name',
    externalUrl: 'https://superrare.com',
    price: '2.5 ETH'
  },
  {
    id: '2',
    title: 'Composition in Blue',
    platform: 'verse',
    imageUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80',
    artistName: 'Artist Name',
    externalUrl: 'https://verse.works',
    price: '1.8 ETH'
  },
  {
    id: '3',
    title: 'Form Study',
    platform: 'foundation',
    imageUrl: 'https://images.unsplash.com/photo-1578926288207-32356a632e53?w=800&q=80',
    artistName: 'Artist Name',
    externalUrl: 'https://foundation.app',
    price: '3.2 ETH'
  },
  {
    id: '4',
    title: 'Organic Pattern',
    platform: 'zora',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    artistName: 'Artist Name',
    externalUrl: 'https://zora.co',
  }
];

// Neutral hover states using design system tokens - no purple/pink gradients
const platformLabels: Record<string, string> = {
  superrare: 'SuperRare',
  verse: 'Verse',
  foundation: 'Foundation',
  zora: 'Zora'
};

const ExternalPlatformsSection = () => {
  return (
    <section className="py-20 md:py-32 border-t border-border/50">
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-sans">
                Across Platforms
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight">
              Selected Works
            </h2>
            <p className="mt-4 text-muted-foreground font-serif max-w-xl">
              Works from our represented artists available across leading digital art platforms.
            </p>
          </div>
          
          {/* Platform Pills */}
          <div className="flex flex-wrap gap-2">
            {['SuperRare', 'Verse', 'Foundation', 'Zora'].map((platform) => (
              <span 
                key={platform}
                className="px-3 py-1.5 text-xs font-sans uppercase tracking-wider border border-border/50 rounded-full text-muted-foreground"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>

        {/* Works Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {externalWorks.map((work, index) => (
            <motion.a
              key={work.id}
              href={work.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="group block"
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden bg-muted mb-4">
                <img
                  src={work.imageUrl}
                  alt={work.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Subtle overlay on hover - no colored gradients */}
                <div 
                  className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                
                {/* External Link Icon */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform translate-y-1 group-hover:translate-y-0">
                  <ExternalLink className="w-4 h-4" />
                </div>

                {/* Price Badge */}
                {work.price && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-full">
                    <Gem className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-mono">{work.price}</span>
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif text-base truncate group-hover:opacity-70 transition-opacity">
                    {work.title}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex-shrink-0">
                    {platformLabels[work.platform]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-serif">
                  {work.artistName}
                </p>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground font-serif mb-4">
            Interested in featuring your external works on Monarch?
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center gap-2 text-sm font-serif underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            Contact our curatorial team
          </a>
        </div>
      </div>
    </section>
  );
};

export default ExternalPlatformsSection;
