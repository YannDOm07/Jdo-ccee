"use client";

import { useEffect } from "react";

export function FaviconManager() {
  useEffect(() => {
    const handleVisibilityChange = () => {
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) return;
      
      if (document.hidden) {
        // Use a generic emoji as raw SVG if actual sleep file doesn't exist
        link.href = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💤</text></svg>";
        document.title = "Revenez au Jardin... ✨";
      } else {
        link.href = "/favicon.ico"; // Restore default
        document.title = "Jardin des Oliviers 2026 — CCEE ESATIC";
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return null;
}
