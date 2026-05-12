"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   HOOK — useCountUp (easeOutExpo, self-contained)
   ═══════════════════════════════════════════════════════ */
function useCountUp(target: number, duration: number = 2500) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const start = performance.now();
          const animate = (time: number) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return { count, ref };
}

/* ═══════════════════════════════════════════════════════
   SVG ICONS (inline, zero-dependency)
   ═══════════════════════════════════════════════════════ */
function CandleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c-1 4-4 6-4 10a4 4 0 0 0 8 0c0-4-3-6-4-10Z" />
      <path d="M10 16v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-5" />
    </svg>
  );
}

function PeopleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 1 8-1.5 5.5-4 6-8 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function CrossIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20" />
      <path d="M6 6h12" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   DECORATIVE LEAF (large, corner element)
   ═══════════════════════════════════════════════════════ */
function OliveLeafDecor({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M95 15C85 5 55 0 30 20S0 70 10 90c5-20 15-40 35-50s40-15 50-25Z"
        fill="currentColor"
      />
      <path
        d="M10 90C20 80 30 60 45 45"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   STAR DOTS (seeded positions)
   ═══════════════════════════════════════════════════════ */
const STARS = [
  { x: 8, y: 20, delay: 0, dur: 4 },
  { x: 15, y: 65, delay: 1.2, dur: 5 },
  { x: 25, y: 30, delay: 0.5, dur: 3.5 },
  { x: 38, y: 80, delay: 2.1, dur: 4.5 },
  { x: 52, y: 15, delay: 0.8, dur: 5.5 },
  { x: 65, y: 70, delay: 1.6, dur: 3.8 },
  { x: 78, y: 25, delay: 0.3, dur: 4.2 },
  { x: 85, y: 55, delay: 2.5, dur: 5 },
  { x: 92, y: 40, delay: 1.0, dur: 3 },
  { x: 45, y: 50, delay: 1.8, dur: 6 },
];

/* ═══════════════════════════════════════════════════════
   STAT ITEM COMPONENT
   ═══════════════════════════════════════════════════════ */
interface StatConfig {
  title: string;
  value: number | string;
  suffix: string;
  icon: React.ComponentType<{ className?: string }>;
  italic: boolean;
  duration: number;
}

function StatItem({ stat, index, isVisible }: { stat: StatConfig; index: number; isVisible: boolean }) {
  const isNumeric = typeof stat.value === "number";
  const { count, ref } = useCountUp(isNumeric ? (stat.value as number) : 0, stat.duration);
  const iconDelay = 400 + index * 150;
  const numberDelay = 500 + index * 150;
  const labelDelay = 1000;
  const Icon = stat.icon;

  return (
    <div className="stats-band__item group" data-scroll>
      {/* Hover halo */}
      <div className="stats-band__item-halo" />

      {/* Icon */}
      <div
        className="stats-band__icon"
        style={{
          transitionDelay: `${iconDelay}ms`,
          opacity: isVisible ? 0.6 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(10px)",
        }}
      >
        <Icon className="w-6 h-6 md:w-[24px] md:h-[24px]" />
      </div>

      {/* Number */}
      <div
        ref={ref}
        className={`stats-band__number ${stat.italic ? "italic" : ""} ${!isNumeric ? "stats-band__number--text" : ""}`}
        style={{
          transitionDelay: `${numberDelay}ms`,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <span className="stats-band__number-text">
          {isNumeric ? count : stat.value}{stat.suffix}
        </span>
        {/* Sheen overlay */}
        <div className="stats-band__sheen" />
      </div>

      {/* Micro-divider */}
      <div
        className="stats-band__micro-divider"
        style={{
          transitionDelay: `${numberDelay + 200}ms`,
          opacity: isVisible ? 1 : 0,
        }}
      />

      {/* Label */}
      <span
        className="stats-band__label"
        style={{
          animationDelay: `${labelDelay}ms`,
          animationPlayState: isVisible ? "running" : "paused",
        }}
      >
        {stat.title}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SEPARATOR
   ═══════════════════════════════════════════════════════ */
function Separator({ isVisible, delay }: { isVisible: boolean; delay: number }) {
  return (
    <div
      className="stats-band__separator"
      style={{
        transitionDelay: `${delay}ms`,
        transform: isVisible ? "scaleY(1)" : "scaleY(0)",
        opacity: isVisible ? 1 : 0,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export function StatsBand() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stats: StatConfig[] = [
    { title: "Heures de Prière", value: 5, suffix: "h+", icon: CandleIcon, italic: false, duration: 1500 },
    { title: "Tous au Jardin", value: "Venez", suffix: " Massivement", icon: PeopleIcon, italic: true, duration: 2500 },
    { title: "Édition", value: 8, suffix: "ème", icon: LeafIcon, italic: false, duration: 1500 },
  ];

  return (
    <>
      <section
        ref={sectionRef}
        className="stats-band"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.98)",
        }}
        data-scroll-section
      >
        {/* ── Couche 2: Halo doré central ── */}
        <div className="stats-band__halo" />

        {/* ── Couche 3: Grille texture ── */}
        <div className="stats-band__grid" />

        {/* ── Ligne décorative top-left ── */}
        <div className="stats-band__deco-line" />

        {/* ── Star particles ── */}
        {STARS.map((star, i) => (
          <div
            key={i}
            className="stats-band__star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.dur}s`,
            }}
          />
        ))}

        {/* ── Corner Leaves ── */}
        <OliveLeafDecor className="stats-band__leaf stats-band__leaf--bl" />
        <OliveLeafDecor className="stats-band__leaf stats-band__leaf--tr" />

        {/* ── Content ── */}
        <div className="stats-band__container">
          {stats.map((stat, i) => (
            <div key={i} className="contents">
              {i > 0 && <Separator isVisible={isVisible} delay={200} />}
              <StatItem stat={stat} index={i} isVisible={isVisible} />
            </div>
          ))}
        </div>
      </section>

      {/* ═══ ALL STYLES ═══ */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* ── Section ── */
        .stats-band {
          width: 100%;
          position: relative;
          overflow: hidden;
          padding: 80px 0;
          background: radial-gradient(
            ellipse 120% 200% at 50% 150%,
            #0D2410 0%,
            #1B3A1F 40%,
            #0A1A0C 100%
          );
          border-top: 1px solid rgba(200,153,42,0.2);
          border-bottom: 1px solid rgba(200,153,42,0.2);
          transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1),
                      transform 0.8s cubic-bezier(0.16,1,0.3,1);
        }

        /* ── Couche 2 — Gold Halo ── */
        .stats-band__halo {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
            ellipse 60% 100% at 50% 50%,
            rgba(200,153,42,0.07) 0%,
            transparent 70%
          );
        }

        /* ── Couche 3 — Grid Texture ── */
        .stats-band__grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(200,153,42,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,153,42,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ── Deco Line ── */
        .stats-band__deco-line {
          position: absolute;
          top: 24px;
          left: 40px;
          width: 40px;
          height: 1px;
          background: rgba(200,153,42,0.3);
        }

        /* ── Star Particles ── */
        .stats-band__star {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: rgba(200,153,42,0.15);
          pointer-events: none;
          animation: star-pulse infinite ease-in-out;
        }

        @keyframes star-pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.6); }
        }

        /* ── Corner Leaves ── */
        .stats-band__leaf {
          position: absolute;
          width: 120px;
          height: 120px;
          color: rgba(200,153,42,1);
          pointer-events: none;
        }

        .stats-band__leaf--bl {
          bottom: -10px;
          left: -10px;
          opacity: 0.04;
          transform: rotate(-30deg);
        }

        .stats-band__leaf--tr {
          top: -10px;
          right: -10px;
          opacity: 0.03;
          transform: rotate(150deg) scaleX(-1);
        }

        /* ── Container ── */
        .stats-band__container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 60px;
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        /* ── Separator ── */
        .stats-band__separator {
          width: 1px;
          height: 80px;
          align-self: center;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(200,153,42,0.5) 30%,
            rgba(200,153,42,0.8) 50%,
            rgba(200,153,42,0.5) 70%,
            transparent 100%
          );
          transition: transform 0.6s cubic-bezier(0.16,1,0.3,1),
                      opacity 0.6s ease;
          transform-origin: center;
        }

        /* ── Stat Item ── */
        .stats-band__item {
          padding: 60px 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          overflow: hidden;
          cursor: default;
          transition: background 0.4s ease;
        }

        .stats-band__item:hover {
          background: rgba(255,255,255,0.02);
        }

        /* ── Hover Halo ── */
        .stats-band__item-halo {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(200,153,42,0.06) 0%,
            transparent 70%
          );
          opacity: 0;
          transform: scale(0.5);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .stats-band__item:hover .stats-band__item-halo {
          opacity: 1;
          transform: scale(1);
        }

        /* ── Icon ── */
        .stats-band__icon {
          color: #C8992A;
          margin-bottom: 16px;
          position: relative;
          z-index: 2;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .stats-band__item:hover .stats-band__icon {
          opacity: 1 !important;
          transform: translateY(-4px) !important;
        }

        /* ── Number ── */
        .stats-band__number {
          position: relative;
          font-family: 'Playfair Display', 'Georgia', serif;
          font-weight: 400;
          font-size: clamp(42px, 5vw, 72px);
          color: #E8C060;
          letter-spacing: -1px;
          line-height: 1;
          z-index: 2;
          transition: opacity 0.6s ease, transform 0.6s ease,
                      color 0.3s cubic-bezier(0.34,1.56,0.64,1);
          overflow: hidden;
        }

        .stats-band__number-text {
          position: relative;
          z-index: 1;
        }

        .stats-band__item:hover .stats-band__number {
          color: #fff;
          transform: scale(1.05) translateY(0) !important;
        }
        
        .stats-band__number--text {
          font-size: clamp(28px, 3.5vw, 42px) !important;
          letter-spacing: 0px !important;
          font-family: var(--font-jost), sans-serif !important;
          font-weight: 600 !important;
          text-transform: uppercase;
        }

        /* ── Sheen Effect ── */
        .stats-band__sheen {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background: linear-gradient(
            105deg,
            transparent 40%,
            rgba(255,255,255,0.15) 50%,
            transparent 60%
          );
          background-size: 200% 100%;
          background-position: -200% 0;
          transition: background-position 0.8s ease;
        }

        .stats-band__item:hover .stats-band__sheen {
          background-position: 200% 0;
        }

        /* ── Micro Divider ── */
        .stats-band__micro-divider {
          width: 24px;
          height: 1px;
          background: rgba(200,153,42,0.4);
          margin: 16px auto;
          z-index: 2;
          transition: width 0.3s ease, background 0.3s ease, opacity 0.5s ease;
        }

        .stats-band__item:hover .stats-band__micro-divider {
          width: 40px;
          background: rgba(200,153,42,0.8);
        }

        /* ── Label ── */
        .stats-band__label {
          font-family: 'Jost', 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(200,222,200,0.5);
          font-weight: 400;
          margin-top: 4px;
          z-index: 2;
          opacity: 0;
          animation: label-contract 0.8s cubic-bezier(0.16,1,0.3,1) forwards;
          animation-play-state: paused;
          transition: letter-spacing 0.3s ease, color 0.3s ease, opacity 0.3s ease;
        }

        .stats-band__item:hover .stats-band__label {
          letter-spacing: 5px;
          color: rgba(200,222,200,0.75);
        }

        @keyframes label-contract {
          from {
            opacity: 0;
            letter-spacing: 10px;
            transform: translateY(8px);
          }
          to {
            opacity: 0.5;
            letter-spacing: 4px;
            transform: translateY(0);
          }
        }

        /* ════════════════════════════════════
           RESPONSIVE
           ════════════════════════════════════ */

        /* Tablet */
        @media (max-width: 1024px) {
          .stats-band {
            padding: 60px 0;
          }

          .stats-band__container {
            padding: 0 40px;
          }

          .stats-band__number {
            font-size: clamp(48px, 8vw, 80px);
          }

          .stats-band__separator {
            height: 60px;
          }

          .stats-band__item {
            padding: 40px 24px;
          }
        }

        /* Mobile */
        @media (max-width: 640px) {
          .stats-band {
            padding: 40px 0;
          }

          .stats-band__container {
            grid-template-columns: 1fr;
            padding: 0 24px;
            gap: 0;
          }

          .stats-band__separator {
            width: 40px;
            height: 1px;
            background: linear-gradient(
              90deg,
              transparent 0%,
              rgba(200,153,42,0.5) 30%,
              rgba(200,153,42,0.8) 50%,
              rgba(200,153,42,0.5) 70%,
              transparent 100%
            );
            justify-self: center;
            transform-origin: center;
          }

          .stats-band__item {
            padding: 40px 24px;
          }

          .stats-band__item-halo {
            display: none;
          }

          .stats-band__number {
            font-size: 56px;
          }

          .stats-band__icon svg {
            width: 20px;
            height: 20px;
          }

          .stats-band__deco-line {
            left: 16px;
            top: 16px;
          }
        }
      `}} />
    </>
  );
}
