import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
}

const ImageViewer = ({ isOpen, onClose, src, alt }: ImageViewerProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const positionStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.max(0.5, Math.min(4, prev + delta)));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      positionStart.current = { ...position };
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;
      setPosition({
        x: positionStart.current.x + deltaX,
        y: positionStart.current.y + deltaY,
      });
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      handleReset();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[300] bg-black"
        >
          {/* Controls */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomIn}
                className="p-3 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-3 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button
                onClick={handleReset}
                className="p-3 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300"
                aria-label="Reset view"
              >
                <RotateCcw className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <span className="ml-3 text-sm text-white/60 font-mono">
                {Math.round(scale * 100)}%
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-3 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300"
              aria-label="Close viewer"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Image Container */}
          <div
            ref={containerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            className="w-full h-full flex items-center justify-center overflow-hidden"
            style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
          >
            <motion.img
              src={src}
              alt={alt}
              animate={{
                scale,
                x: position.x,
                y: position.y,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="max-w-[90vw] max-h-[85vh] object-contain select-none"
              draggable={false}
            />
          </div>

          {/* Instructions */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
            <p className="text-xs text-white/40">
              Double-click to zoom • Scroll to adjust • Drag to pan
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageViewer;
