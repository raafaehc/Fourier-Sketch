import { motion } from 'framer-motion';
import { eduVariants } from '../lib/animation';

export function EduPanel() {
  return (
    <motion.section
      variants={eduVariants}
      initial="hidden"
      animate="visible"
      className="glass-card relative overflow-hidden rounded-3xl border border-white/5 p-6 text-sm text-muted"
      aria-label="Friendly explanation of Fourier steps"
    >
      <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-accent/10 to-transparent" aria-hidden />
      <p className="font-display text-lg text-white">Sketch → Series → Sound</p>
      <ol className="mt-4 space-y-2 text-xs leading-relaxed">
        <li>
          <strong className="text-white">1. Arc-length parameter.</strong> We measure progress along the stroke instead of sorting by x, so loops and spirals behave perfectly.
        </li>
        <li>
          <strong className="text-white">2. Uniform sampling.</strong> After smoothing & simplification, we interpolate evenly spaced "u" samples between 0 and 1.
        </li>
        <li>
          <strong className="text-white">3. Fourier blend.</strong> Each harmonic uses cosine (even) and sine (odd) basis functions that sum to your drawing.
        </li>
      </ol>
      <p className="mt-4 text-xs text-muted">Need a refresher? Hover each slider to see inline hints, or use the preset dropdown to compare against textbook signals.</p>
    </motion.section>
  );
}
