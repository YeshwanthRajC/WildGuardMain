import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useIsLoading } from '../../utils/loadingStore';
import logoImage from '../../assets/WildGuardLogoTransparent.png';

/**
 * Full-screen, centered loader shown while data is loading, saving or a page is changing.
 * The logo is a transparent cut-out (no white box) floating over a soft blurred backdrop,
 * ringed by a sweeping conic-gradient arc and a pulsing emerald glow.
 */
const LoadingOverlay = () => {
  const isLoading = useIsLoading();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-5000 flex items-center justify-center bg-background/50 backdrop-blur-md"
          role="status"
          aria-live="polite"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative h-36 w-36">
              {/* Pulsing glow */}
              <span className="absolute -inset-4 animate-pulse rounded-full bg-emerald-400/30 blur-2xl" />
              {/* Faint static track */}
              <span className="absolute inset-0 rounded-full border-2 border-emerald-600/15" />
              {/* Sweeping arc */}
              <span
                className="absolute inset-0 animate-spin rounded-full"
                style={{
                  animationDuration: '1.4s',
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, transparent 200deg, rgba(16,185,129,0.15) 240deg, #10b981 340deg, #059669 360deg)',
                  WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))',
                  mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))',
                }}
              />
              {/* Counter-rotating dashed ring */}
              <span
                className="absolute inset-2 animate-spin rounded-full border border-dashed border-emerald-500/40"
                style={{ animationDuration: '6s', animationDirection: 'reverse' }}
              />
              {/* Logo (transparent PNG, gently breathing) */}
              <motion.img
                src={logoImage}
                alt=""
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-5 h-26 w-26 object-contain drop-shadow-[0_6px_14px_rgba(5,80,50,0.35)]"
              />
            </div>

            <div className="flex items-center gap-1.5 text-sm font-medium tracking-wide text-emerald-900/80">
              <span>Syncing the wild</span>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-emerald-600"
                  animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
