import { motion } from 'framer-motion';
import { coachmarkVariants } from '../lib/animation';

export function Coachmarks() {
  return (
    <motion.div
      aria-live="polite"
      variants={coachmarkVariants}
      initial="hidden"
      animate="visible"
      className="pointer-events-none absolute inset-x-0 top-4 mx-auto flex max-w-xl flex-wrap justify-center gap-3 text-center text-xs text-muted"
    >
      <span className="rounded-full bg-white/5 px-3 py-1">Draw freely — we parameterize by arc length.</span>
      <span className="rounded-full bg-white/5 px-3 py-1">Pen-only mode filters touch & mouse wobbles.</span>
      <span className="rounded-full bg-white/5 px-3 py-1">Use presets to compare analytic signals.</span>
    </motion.div>
  );
}
