import { motion } from 'framer-motion';

export const TransitionOverlay = () => (
  <motion.div
    className="fixed inset-0 bg-[#f7f8fa] z-50 pointer-events-none"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2, ease: 'easeInOut' }}
  />
);
