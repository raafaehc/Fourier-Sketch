export const canvasReveal = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export const overlayVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 2.2, ease: 'easeInOut' },
  },
};

export const eduVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.2 } },
};

export const coachmarkVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.8, transition: { delay: 0.1 } },
};
