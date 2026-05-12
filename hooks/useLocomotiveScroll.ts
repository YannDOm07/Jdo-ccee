"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function useLocomotiveScroll() {
  const [locomotive, setLocomotive] = useState<any>(null);
  const pathname = usePathname();
  const initRef = useRef(false);

  useEffect(() => {
    let scroll: any;

    const initScroll = async () => {
      // dynamically import to avoid SSR issues
      const LocomotiveScroll = (await import("locomotive-scroll")).default;

      // @ts-ignore
      scroll = new (LocomotiveScroll as any)({
        smooth: true,
        multiplier: 0.08, // Very smooth, almost oily
        smartphone: { smooth: true, multiplier: 0.1 },
        tablet: { smooth: true, multiplier: 0.08, breakpoint: 1024 },
        class: "is-inview",
        getDirection: true,
      });

      setLocomotive(scroll);
      initRef.current = true;
    };

    // Wait slightly for DOM and Framer Motion transitions to settle
    const timer = setTimeout(() => {
      initScroll();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (scroll) scroll.destroy();
    };
  }, [pathname]); // Re-init on path change because DOM changes

  // Expose a method to manually update/refresh scroll
  const update = () => {
    if (locomotive && typeof locomotive.update === 'function') {
      setTimeout(() => locomotive.update(), 100);
      setTimeout(() => locomotive.update(), 500);
    }
  };

  return { locomotive, update };
}
