"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { GrainCanvas } from "./GrainCanvas";
import { FloatingLeaves } from "./FloatingLeaves";
import { Fireflies } from "./Fireflies";

const RotationalBadge = () => (
  <div
    className="absolute hidden md:flex items-center justify-center z-[5] w-[130px] h-[130px] lg:w-[150px] lg:h-[150px] xl:w-[160px] xl:h-[160px] md:right-[5%] lg:right-[12%] md:top-1/2 md:-translate-y-1/2"
    style={{
      background: "rgba(255,255,255,0.02)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      borderRadius: "50%",
      border: "1px solid rgba(200,153,42,0.15)",
    }}
    data-scroll
    data-scroll-speed="0.15"
  >
    <svg viewBox="0 0 160 160" className="w-full h-full" style={{ animation: "orbit 15s linear infinite" }}>
      <defs>
        <path id="circle-text" d="M 80,80 m -60,0 a 60,60 0 1,1 120,0 a 60,60 0 1,1 -120,0" />
      </defs>
      <text fill="var(--gold-light)" fontSize="11" letterSpacing="3" fontWeight="500" opacity="0.8">
        <textPath href="#circle-text" startOffset="0%">
          JARDIN DES OLIVIERS · 2026 · CCEE · ESATIC ·
        </textPath>
      </text>
    </svg>
    <div className="absolute font-display font-bold text-xl lg:text-2xl" style={{ color: "var(--gold)" }}>
      JDO
    </div>
  </div>
);

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showScroll, setShowScroll] = useState(true);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const containerRef = useRef(null);

  const heroImages = [
    "https://images.unsplash.com/photo-1511497584788-876760111969?w=1600&q=85",
    "/jdo-hero.png",
  ];

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    const handleScroll = () => setShowScroll(window.scrollY < 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Auto-cycle hero background images
    const bgTimer = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroImages.length);
    }, 8000);
  
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
      clearInterval(bgTimer);
    };
  }, [heroImages.length]);

  const eyebrowText = "CCEE · ESATIC · ABIDJAN";

  return (
    <section 
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-[#0d1a09]"
      data-scroll-section
    >
      {/* ── Layer 1: Parallax Image Carousel ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBgIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={heroImages[currentBgIndex]}
            alt="Jardin des Oliviers Background"
            fill
            priority={currentBgIndex === 0}
            className="object-cover"
            quality={90}
          />
          {/* Subtle gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0d1a09]/80" />
        </motion.div>
      </AnimatePresence>

      {/* ── Layer 2: Gradient Overlays ── */}
      <div 
        className="absolute inset-0 z-[1]"
        style={{
          background: isMobile 
            ? "linear-gradient(180deg, rgba(13,26,9,0.0) 0%, rgba(13,26,9,0.2) 40%, rgba(13,26,9,0.85) 100%)"
            : "linear-gradient(180deg, rgba(13,26,9,0.0) 0%, rgba(13,26,9,0.1) 30%, rgba(13,26,9,0.5) 70%, rgba(13,26,9,0.8) 100%)"
        }}
      />
      
      {!isMobile && (
        <div 
          className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none"
        >
          <div 
            className="w-[800px] h-[800px] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(circle, rgba(200,153,42,0.12) 0%, transparent 70%)" }}
          />
        </div>
      )}

      {/* ── Layer 3 & 4: Grain, Particles, Leaves ── */}
      <GrainCanvas opacity={isMobile ? 0.05 : 0.08} />
      {mounted && <Fireflies isMobile={isMobile} />}
      {mounted && <FloatingLeaves isMobile={isMobile} />}

      {/* ── Layer 5: Rotating Badge ── */}
      {mounted && <RotationalBadge />}

      {/* ── Layer 6: Main Content ── */}
      <div className="relative z-[10] w-full max-w-[1400px] mx-auto px-6 md:px-10 pt-32 md:pt-40 pb-20 lg:pb-24">
        
        {/* Eyebrow */}
        <div className="flex items-center mb-6">
          <span 
            className="inline-block h-[1px] bg-[var(--gold)] mr-3"
            style={{
              animation: mounted ? "line-grow 0.8s ease forwards 0.1s" : "none",
              width: 0,
            }}
          />
          <div className="font-body text-[10px] tracking-[4px] uppercase text-[var(--gold)] flex">
            {isMobile ? (
               <span 
                 className="opacity-0"
                 style={{ animation: mounted ? "fade-in-up 0.8s ease forwards 0.2s" : "none" }}
               >
                 {eyebrowText}
               </span>
            ) : (
              eyebrowText.split("").map((char, i) => (
                <span
                  key={i}
                  className="inline-block whitespace-pre opacity-0"
                  style={{
                    animation: mounted ? `char-rise 0.6s cubic-bezier(0.16,1,0.3,1) forwards ${100 + i * 35}ms` : "none",
                    transform: "translateY(12px)"
                  }}
                >
                  {char}
                </span>
              ))
            )}
          </div>
        </div>
        {/* ── HIÉRARCHIE VISUELLE REPENSÉE ── */}
        <div className="mb-6 md:mb-8">
          {/* Niveau 1 : JARDIN */}
          <div className="overflow-visible pb-4 md:pb-6 -mb-4 md:-mb-8">
            <motion.h1 
              initial={{ translateY: "105%", opacity: 0 }}
              animate={{ translateY: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="font-display font-black text-white block"
              style={{
                fontSize: "clamp(64px, 12vw, 160px)",
                lineHeight: 1.1,
                letterSpacing: "-3px",
                fontStyle: "normal",
              }}
            >
              <span className="text-[var(--gold)] inline-block transform -translate-x-1 translate-y-2" style={{ fontStyle: 'italic', filter: 'drop-shadow(0 0 10px rgba(200,153,42,0.3))' }}>J</span>ardin
            </motion.h1>
          </div>
          
          {/* Niveau 2 : DES (Accent poétique) */}
          <div className="overflow-hidden pb-1 -mb-2 md:-mb-6">
            <motion.h1 
              initial={{ translateY: "105%" }}
              animate={{ translateY: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              className="font-display block"
              style={{
                fontSize: "clamp(52px, 9vw, 128px)",
                fontWeight: 400,
                color: "var(--gold-light)", // #E8C060
                fontStyle: "italic",
                letterSpacing: "2px",
                marginLeft: isMobile ? "20px" : "40px",
                lineHeight: 0.9,
              }}
            >
              des
            </motion.h1>
          </div>
 
          {/* Niveau 3 : OLIVIERS */}
          <div className="overflow-hidden pb-2">
            <motion.h1 
              initial={{ translateY: "105%" }}
              animate={{ translateY: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
              className="font-display font-black text-white block"
              style={{
                fontSize: "clamp(64px, 12vw, 160px)",
                lineHeight: 0.9,
                letterSpacing: "-3px",
                fontStyle: "normal",
              }}
            >
              Oliviers
            </motion.h1>
          </div>
        </div>

        {/* ── TAGLINE ── */}
        <div className="mb-10 md:mb-12 overflow-hidden">
          <p 
            className="opacity-0 flex flex-col items-start"
            style={{
              animation: mounted ? "slide-right-fade 0.8s cubic-bezier(0.16,1,0.3,1) forwards 1.1s" : "none",
              transform: "translateX(-20px)"
            }}
          >
            <span 
              className="font-display italic tracking-[1px]"
              style={{ fontSize: "clamp(16px, 2vw, 22px)", color: "rgba(255,255,255,0.8)" }}
            >
              Prière · Fraternité · Lumière
            </span>
            <span 
              className="font-body mt-2 text-[10px] md:text-[12px] tracking-[3px] md:tracking-[4px] uppercase"
              style={{ color: "rgba(200,153,42,0.7)" }}
            >
              — 24 Mai 2026, Abidjan
            </span>
          </p>
        </div>

        {/* ── CTA BUTTONS ── */}
        <div 
          className="flex flex-col sm:flex-row gap-4 items-center opacity-0"
          style={{
            animation: mounted ? "fade-in-up 0.8s cubic-bezier(0.16,1,0.3,1) forwards 1.4s" : "none",
            transform: "translateY(20px)"
          }}
        >
          {/* Ligne décorative */}
          <div 
            className="hidden sm:block h-[1px] bg-[var(--gold)] opacity-50 mr-4"
            style={{
              width: 0,
              animation: mounted ? "line-grow-cta 0.6s ease forwards 1.3s" : "none"
            }}
          />
          
          <Link href="/inscription" className="btn-primary-hero w-full sm:w-auto text-center group">
            <span className="relative z-10">REJOINDRE</span>
            <div className="btn-sheen" />
          </Link>
          
          <Link href="#about" className="btn-secondary-hero w-full sm:w-auto text-center">
            <span>DÉCOUVRIR</span>
          </Link>
        </div>

      </div>

      {/* ── Layer 7: Scroll Indicator ── */}
      <div 
        className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10 transition-opacity duration-500 ease-in-out"
        style={{ opacity: showScroll ? 1 : 0, pointerEvents: showScroll ? "auto" : "none" }}
      >
        <div className="scroll-line">
          <div className="scroll-line-fill" />
        </div>
        <span className="font-body text-[8px] md:text-[9px] tracking-[4px] uppercase text-[var(--gold)]/60">
          DÉFILER
        </span>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --gold-light: #E8C060;
        }

        @keyframes line-reveal {
          from { transform: translateY(105%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        @keyframes char-rise {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        @keyframes line-grow {
          to { width: 32px; }
        }

        @keyframes line-grow-cta {
          to { width: 48px; }
        }

        @keyframes slide-right-fade {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0);     }
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        @keyframes orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Boutons Hero ── */
        .btn-primary-hero {
          background: var(--gold);
          color: var(--ink);
          padding: 18px 44px;
          font-family: var(--font-jost), sans-serif;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          font-weight: 600;
          border: none;
          position: relative;
          overflow: hidden;
          transition: background 0.35s ease, color 0.35s ease;
          display: inline-block;
          cursor: pointer;
        }

        .btn-primary-hero:hover {
          background: white;
          color: var(--forest);
        }

        .btn-sheen {
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%);
          transform: translateX(-200%) skewX(-20deg);
          transition: transform 0.7s ease;
          pointer-events: none;
        }

        .btn-primary-hero:hover .btn-sheen {
          transform: translateX(300%);
        }

        .btn-secondary-hero {
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 18px 44px;
          font-family: var(--font-jost), sans-serif;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          transition: border-color 0.35s ease, color 0.35s ease;
          display: inline-block;
          cursor: pointer;
        }

        .btn-secondary-hero:hover {
          border-color: rgba(200, 153, 42, 0.6);
          color: rgba(200, 153, 42, 0.9);
          background: transparent;
        }

        /* ── Scroll Indicator ── */
        .scroll-line {
          width: 1px;
          height: 56px;
          background: rgba(200, 153, 42, 0.2);
          position: relative;
          overflow: hidden;
        }

        .scroll-line-fill {
          position: absolute;
          width: 100%;
          background: var(--gold);
          animation: scroll-fill 2.5s ease-in-out infinite;
        }

        @keyframes scroll-fill {
          0%   { height: 0%; top: 0%; }
          50%  { height: 100%; top: 0%; }
          51%  { height: 100%; top: 0%; }
          100% { height: 0%; top: 100%; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}} />
    </section>
  );
}
