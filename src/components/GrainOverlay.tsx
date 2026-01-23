/**
 * Subtle film grain/paper texture overlay
 * Gives digital screens the warmth of physical art
 */
const GrainOverlay = () => {
  return (
    <svg 
      className="pointer-events-none fixed inset-0 z-[9999] h-full w-full opacity-[0.06] mix-blend-multiply dark:mix-blend-soft-light"
      aria-hidden="true"
    >
      <filter id="grain">
        <feTurbulence 
          type="fractalNoise" 
          baseFrequency="0.8" 
          numOctaves="4" 
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
};

export default GrainOverlay;
