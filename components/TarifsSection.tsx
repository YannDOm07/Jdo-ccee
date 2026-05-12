"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export function TarifsSection() {
  const cceeCardRef = useRef<HTMLDivElement>(null);
  const externeCardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement | null>) => {
    // Only tilt on desktop
    if (window.innerWidth < 1024 || !ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    ref.current.style.transform = `perspective(1000px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg) translateZ(10px)`;
  };

  const handleMouseLeave = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    ref.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
  };

  return (
    <section 
      id="tarifs" 
      className="relative w-full py-24 lg:py-40 border-t border-[var(--mist)]/20"
      style={{ background: "linear-gradient(180deg, var(--mist) 0%, var(--cream) 100%)" }}
      data-scroll-section
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        <div className="text-center mb-16 md:mb-24 reveal" data-scroll>
          <span className="inline-block py-2 px-4 border border-[var(--moss)]/30 rounded-full text-[10px] uppercase tracking-[3px] font-medium text-[var(--forest)] mb-6">
            Passeports
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-[var(--ink)]">
            Accès au <span className="font-accent text-[var(--gold)]">Jardin</span>
          </h2>
          <p className="mt-4 font-body text-lg font-medium text-[var(--moss)]">Événement gratuit et inscription obligatoire</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-center">
          
          {/* Card CCEE */}
          <div 
            ref={cceeCardRef}
            onMouseMove={(e) => handleMouseMove(e, cceeCardRef)}
            onMouseLeave={() => handleMouseLeave(cceeCardRef)}
            className="w-full max-w-md relative p-8 lg:p-12 overflow-hidden reveal group shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ 
              background: "linear-gradient(135deg, var(--forest) 0%, #2a522f 100%)",
              transformStyle: "preserve-3d"
            }}
            data-scroll
            data-scroll-speed="1"
          >
            {/* Subtle Texture */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="leaves" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="#fff"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#leaves)" />
              </svg>
            </div>

            {/* Sheen Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] skew-x-[-20deg] transition-transform duration-1000 group-hover:translate-x-[400%] pointer-events-none" />

            <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
              <h3 className="font-display text-3xl text-white mb-2">ESATIC & Anciens</h3>
              <p className="font-body text-sm text-[var(--mist)] mb-10">Pour les membres honoraires et étudiants.</p>

              <div className="space-y-4 mb-12">
                {["Accès complet à l'événement", "T-shirt disponible", "Goodies disponibles en option"].map((feature, i) => (
                  <div key={i} className="flex items-start gap-4 text-white/90 font-body text-sm">
                    <Check size={18} className="text-[var(--gold)] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/inscription" className="btn-gold w-full text-center group/btn relative overflow-hidden magnetic">
                <span className="relative z-10">Réserver ma place</span>
                <ArrowRight size={16} className="ml-2 relative z-10 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Card Externe */}
          <div 
            ref={externeCardRef}
            onMouseMove={(e) => handleMouseMove(e, externeCardRef)}
            onMouseLeave={() => handleMouseLeave(externeCardRef)}
            className="w-full max-w-md relative p-8 lg:p-12 border border-[var(--mist)] reveal reveal-delay-2 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] bg-white/50 backdrop-blur-sm"
            style={{ transformStyle: "preserve-3d" }}
            data-scroll
          >
            <div className="relative z-10" style={{ transform: "translateZ(20px)" }}>
              <h3 className="font-display text-3xl text-[var(--ink)] mb-2">Participant Externe</h3>
              <p className="font-body text-sm text-[var(--moss)] mb-10">Rejoignez-nous pour ce grand moment.</p>

              <div className="space-y-4 mb-12">
                {["Accès complet à l'événement", "T-shirt disponible", "Goodies disponibles en option"].map((feature, i) => (
                  <div key={i} className="flex items-start gap-4 text-[var(--ink)] font-body text-sm">
                    <Check size={18} className="text-[var(--forest)] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/inscription" className="btn-primary w-full text-center group/btn relative overflow-hidden magnetic">
                <span className="relative z-10">S'inscrire</span>
                <ArrowRight size={16} className="ml-2 relative z-10 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
