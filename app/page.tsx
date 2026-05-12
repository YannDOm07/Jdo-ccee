"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocomotiveScroll } from "@/hooks/useLocomotiveScroll";
import { HeroSection } from "@/components/HeroSection";
import { StatsBand } from "@/components/StatsBand";
import { AboutSection } from "@/components/AboutSection";
import { TarifsSection } from "@/components/TarifsSection";
import { Footer } from "@/components/Footer";
import { CtaBand } from "@/components/CtaBand";
import { GoodiesSection } from "@/components/GoodiesSection";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/contexts/CartContext";

export default function Home() {
  const { locomotive, update } = useLocomotiveScroll();
  const { isLoggedIn } = useAuth();


  // Force Locomotive to recalculate heights when everything is loaded
  useEffect(() => {
    if (locomotive) {
      setTimeout(() => {
        update();
      }, 100);
    }
  }, [locomotive, update]);

  return (
    <CartProvider>
      <div className="bg-[var(--cream)] min-h-screen pb-16 md:pb-0">
        <HeroSection />
        <StatsBand />
        <AboutSection />
        
        {isLoggedIn ? (
          <>
            <GoodiesSection />
            <CartDrawer />
          </>
        ) : (
          <>
            <TarifsSection />
            <CtaBand />
          </>
        )}
        
        <Footer />
      </div>
    </CartProvider>
  );
}
