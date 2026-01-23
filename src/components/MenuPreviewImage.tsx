import { motion, AnimatePresence } from "framer-motion";

interface MenuPreviewImageProps {
  isVisible: boolean;
  imageUrl: string;
  alt: string;
}

const MenuPreviewImage = ({ isVisible, imageUrl, alt }: MenuPreviewImageProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <img
            src={imageUrl}
            alt={alt}
            className="w-full h-full object-cover blur-[2px] saturate-50 opacity-20 dark:opacity-15"
          />
          {/* Gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MenuPreviewImage;
