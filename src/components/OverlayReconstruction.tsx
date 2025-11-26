import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { pointsToPath } from '../lib/drawing';
import { overlayVariants } from '../lib/animation';

export type OverlayReconstructionProps = {
  path: { x: number; y: number }[];
  width: number;
  height: number;
};

export function OverlayReconstruction({ path, width, height }: OverlayReconstructionProps) {
  const d = useMemo(() => pointsToPath(path), [path]);
  if (!path.length) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
    >
      <motion.path
        d={d}
        fill="none"
        stroke="url(#reconGradient)"
        strokeWidth={2.4}
        strokeLinecap="round"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
      />
      <defs>
        <linearGradient id="reconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--accent-hover-color)" stopOpacity="0.9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
