"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Faster fake loading progress
    let max = 0;
    const interval = setInterval(() => {
      max += Math.random() * 25; // Faster steps
      if (max >= 100) {
        max = 100;
        clearInterval(interval);
        setTimeout(() => setLoading(false), 200); // Shorter pause
      }
      setProgress(max);
    }, 80); // Shorter interval

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          id="preloader"
          initial={{ y: 0 }}
          exit={{ y: "-100%", transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }} // Slightly faster
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="font-display italic text-5xl md:text-7xl mb-4" style={{ color: "var(--gold)" }}>
              JDO
            </div>
            <div className="font-body text-[10px] tracking-[4px] uppercase" style={{ color: "var(--mist)" }}>
              Jardin des Oliviers 2026
            </div>
          </motion.div>
          <div className="preloader-line" style={{ width: `${progress}%` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      <motion.div key={pathname} className="min-h-screen">
        {/* The overlay that comes UP from bottom */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: "-100%" }}
          exit={{ y: 0 }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }} // Reduced to 0.5s
          className="fixed inset-0 z-[99998] flex items-center justify-center pointer-events-none"
          style={{ background: "var(--forest)" }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1, 0.8], opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="font-display italic text-4xl"
            style={{ color: "var(--gold)" }}
          >
            JO
          </motion.div>
        </motion.div>

        {/* The actual page content, fading in */}
        <motion.div
          initial={{ opacity: 0, y: 5 }} // Even smaller offset
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3, delay: 0, ease: "easeOut" }} // No delay, 0.3s duration
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
