"use client";

import Image from "next/image";
import { Music, HandHeart, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export function AboutSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Importation dynamique des 14 photos de l'édition passée (jdo-1.jpeg à jdo-14.jpeg)
  const carouselImages = Array.from({ length: 14 }, (_, i) => `/images/about-carousel/jdo-${i + 1}.jpeg`);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000); // Défilement toutes les 4 secondes
    return () => clearInterval(timer);
  }, [carouselImages.length]);
  return (
    <section 
      id="about" 
      className="relative w-full py-24 lg:py-40 bg-[var(--cream)] overflow-hidden"
      data-scroll-section
    >
      {/* Decorative SVG branch */}
      <svg 
        className="absolute top-[-5%] right-[-10%] md:right-[-5%] h-[600px] opacity-[0.03] text-[var(--forest)] rotate-12 pointer-events-none"
        viewBox="0 0 200 600"
        fill="currentColor"
        data-scroll
        data-scroll-speed="-1"
      >
        <path d="M100,600 C120,400 60,300 80,100 C90,80 120,60 150,50" stroke="currentColor" strokeWidth="4" fill="none" />
        <path d="M80,100 C60,110 40,140 50,160 Z M100,200 C130,190 160,220 140,250 Z" />
      </svg>

      <div className="absolute top-10 left-10 font-display font-black text-[200px] leading-none opacity-[0.03] pointer-events-none select-none text-[var(--forest)]" data-scroll data-scroll-speed="1">
        01
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="mb-8 reveal" data-scroll>
          <span className="inline-block py-2 px-4 border border-[var(--gold)]/30 rounded-full text-[10px] uppercase tracking-[3px] font-medium text-[var(--gold)]">
            L'Événement
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Ligne gauche - Textes */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <h2 className="font-display text-4xl lg:text-5xl xl:text-[64px] leading-tight text-[var(--ink)] mb-10 reveal" data-scroll>
              Une expérience qui <span className="text-[var(--gold)] italic">transforme</span> l'âme
            </h2>
            
            <div className="mb-12 font-body text-lg text-[var(--moss)] leading-relaxed max-w-lg relative reveal reveal-delay-1" data-scroll>
              <div className="drop-cap">
                L
              </div>
              e Jardin des Oliviers est le rassemblement phare de la Communauté Catholique des Étudiants de l'ESATIC. Plus qu'un simple événement, c'est un moment de louange, d'adoration et de communion fraternelle où chant et prière se mêlent.
            </div>

            <div className="space-y-6">
              {[
                { icon: Music, text: "Chants de louange animés." },
                { icon: HandHeart, text: "Temps d'adoration et exhortations." },
                { icon: Sparkles, text: "Moments intenses de fraternité et de partage." },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 group reveal" data-scroll style={{ transitionDelay: `${0.1 * (i + 2)}s` }}>
                  <div className="w-14 h-14 rounded-none bg-[var(--forest)] flex flex-shrink-0 items-center justify-center text-[var(--gold)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:bg-[var(--gold)] group-hover:text-[var(--forest)] group-hover:scale-110 group-hover:rotate-6">
                    <item.icon size={24} strokeWidth={1.5} />
                  </div>
                  <p className="font-body text-base text-[var(--ink)] font-medium">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Ligne droite - Image avec overlay et tilt */}
          <div className="w-full lg:w-1/2 relative reveal reveal-delay-2" data-scroll>
            <div className="relative aspect-[4/5] lg:aspect-[4/5] w-full overflow-hidden group">
              {carouselImages.map((src, index) => (
                <div 
                  key={src}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <Image
                    src={src}
                    alt={`Édition passée ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={index === 0}
                  />
                </div>
              ))}
              <div 
                className="absolute inset-0 mix-blend-multiply transition-opacity duration-700 opacity-60 group-hover:opacity-40"
                style={{
                  background: "linear-gradient(45deg, var(--forest) 0%, transparent 100%)",
                }}
              />
              <div 
                className="absolute inset-0"
                style={{
                  clipPath: "polygon(0 0, 85% 0, 100% 100%, 0 100%)",
                  background: "var(--forest)",
                  opacity: 0.15,
                }}
              />
              
              {/* Citation Parallax */}
              <div 
                className="absolute bottom-10 left-10 lg:bottom-16 lg:left-[-40px] z-20 w-[80%] max-w-sm"
                data-scroll
                data-scroll-speed="0.8"
              >
                <div className="bg-white/10 backdrop-blur-md p-8 border border-white/20 shadow-2xl relative">
                  <div className="absolute -top-12 -left-6 font-display text-[120px] text-[var(--gold)] opacity-40 leading-none">
                    "
                  </div>
                  <p className="font-accent italic text-white text-xl leading-snug drop-shadow-lg relative z-10">
                    Veillez et priez, afin que vous ne tombiez pas dans la tentation.
                  </p>
                  <p className="font-body text-xs text-white/70 uppercase tracking-widest mt-4 relative z-10">
                    Matthieu 26:41
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
