import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function GlassCard({ children, className, hover = true, delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.08, ease: 'easeOut' }}
      className={clsx(
        'glass-card rounded-lg',
        hover && 'hover:-translate-y-1 transition-transform duration-300',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
