import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface TouchImageViewerProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

const TouchImageViewer = ({ src, alt, isOpen, onClose }: TouchImageViewerProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const lastPinchDistanceRef = useRef<number | null>(null);
  const isMobile = useIsMobile();

  const minScale = 1;
  const maxScale = 5;

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Prevent body scroll when viewer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, maxScale));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, minScale));
    if (scale <= 1.5) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Touch handlers for pinch zoom
  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastPinchDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
    } else if (e.touches.length === 1 && scale > 1) {
      lastTouchRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      setIsDragging(true);
    }
  }, [scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDistanceRef.current !== null) {
      // Pinch zoom
      e.preventDefault();
      const distance = getDistance(e.touches[0], e.touches[1]);
      const delta = distance - lastPinchDistanceRef.current;
      const scaleChange = delta * 0.01;
      
      setScale(prev => Math.min(Math.max(prev + scaleChange, minScale), maxScale));
      lastPinchDistanceRef.current = distance;
    } else if (e.touches.length === 1 && lastTouchRef.current && scale > 1) {
      // Pan
      const deltaX = e.touches[0].clientX - lastTouchRef.current.x;
      const deltaY = e.touches[0].clientY - lastTouchRef.current.y;
      
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      lastTouchRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  }, [scale]);

  const handleTouchEnd = useCallback(() => {
    lastTouchRef.current = null;
    lastPinchDistanceRef.current = null;
    setIsDragging(false);
  }, []);

  // Mouse drag handlers for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      lastTouchRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [scale]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && lastTouchRef.current && scale > 1) {
      const deltaX = e.clientX - lastTouchRef.current.x;
      const deltaY = e.clientY - lastTouchRef.current.y;
      
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      lastTouchRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [isDragging, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    lastTouchRef.current = null;
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setScale(prev => Math.min(Math.max(prev + delta, minScale), maxScale));
    
    if (scale + delta <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  // Double tap to zoom
  const lastTapRef = useRef<number>(0);
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (scale === 1) {
        setScale(2.5);
      } else {
        handleReset();
      }
    }
    lastTapRef.current = now;
  }, [scale]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] bg-background/98 backdrop-blur-xl"
          ref={containerRef}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            aria-label="Close viewer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 p-2 rounded-full bg-muted/80 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={scale <= minScale}
              className="h-9 w-9 rounded-full"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <span className="text-xs font-mono w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={scale >= maxScale}
              className="h-9 w-9 rounded-full"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-6 bg-border" />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="h-9 w-9 rounded-full"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Hint for mobile */}
          {isMobile && scale === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 backdrop-blur-sm"
            >
              <Move className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Pinch to zoom • Double-tap to zoom</span>
            </motion.div>
          )}

          {/* Image container */}
          <div
            className={`w-full h-full flex items-center justify-center overflow-hidden ${
              isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-zoom-in'
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onClick={handleDoubleTap}
          >
            <motion.img
              ref={imageRef}
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain select-none"
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
              }}
              draggable={false}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TouchImageViewer;
