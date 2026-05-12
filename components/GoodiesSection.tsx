"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { useCart } from "@/contexts/CartContext"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ShoppingBag, ChevronRight, ChevronLeft } from "lucide-react"

export type Goodie = {
  id: string
  nom: string
  description: string
  prix: number
  stock: number
  imageUrl: string | null
  tag: string | null
}

export function GoodiesSection() {
  const [showSection, setShowSection] = useState(false)
  const [goodies, setGoodies] = useState<Goodie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAdded, setIsAdded] = useState(false)

  const searchParams = useSearchParams()
  const { addToCart } = useCart()

  useEffect(() => {
    const isWelcome = searchParams.get('welcome') === 'true'
    
    fetch("/api/auth/status")
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn || isWelcome) {
          setShowSection(true)
          fetchGoodies()
        } else {
           setIsLoading(false)
        }
      })
      .catch(() => setIsLoading(false))
  }, [searchParams])

  const fetchGoodies = async () => {
    try {
      const res = await fetch("/api/goodies")
      const data = await res.json()
      if (data.goodies) {
        // Filter out inactive ones
        const activeGoodies = data.goodies.filter((g: any) => g.actif !== false)
        setGoodies(activeGoodies)
      }
    } catch (error) {
      console.error("Erreur chargement goodies:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    if (!goodies[activeIndex]) return
    const goodie = goodies[activeIndex]
    
    addToCart({
      goodieId: goodie.id,
      nom: goodie.nom,
      prix: goodie.prix,
      quantite: 1,
      imageUrl: goodie.imageUrl
    })

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  if (isLoading || !showSection) return null

  const activeGoodie = goodies[activeIndex]

  if (!activeGoodie) {
    return (
      <section className="py-20 text-center text-white/50 bg-[#0d1a09]">
        Aucun article disponible pour le moment.
      </section>
    )
  }

  const nextGoodie = () => setActiveIndex((prev) => (prev + 1) % goodies.length)
  const prevGoodie = () => setActiveIndex((prev) => (prev - 1 + goodies.length) % goodies.length)

  return (
    <section className="relative overflow-hidden border-y border-[var(--gold)]/20 min-h-[800px] flex flex-col justify-center py-20" style={{ background: "radial-gradient(circle at 20% 0%, rgba(200,153,42,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 100%, rgba(200,153,42,0.2) 0%, transparent 50%), linear-gradient(135deg, var(--forest) 0%, #0d1a09 100%)" }}>
      
      {/* Background Decorative Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `
            linear-gradient(#fff 1px, transparent 1px),
            linear-gradient(90deg, #fff 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px"
        }}
      />
      
      {/* Huge Background Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none w-full text-center mix-blend-overlay opacity-10">
        <h1 className="font-display font-black text-[clamp(100px,25vw,350px)] text-white leading-none whitespace-nowrap tracking-tighter uppercase">
          JDO 2026
        </h1>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
        
        {/* Title Section */}
        <div className="text-center mb-16">
          <motion.div 
             initial={{ opacity: 0, y: -20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="inline-block border-2 border-white/30 bg-white/10 backdrop-blur-md text-white uppercase tracking-[6px] text-xs font-bold px-6 py-2 rounded-full mb-6"
          >
            Édition Limitée
          </motion.div>
          <motion.h2 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1, duration: 0.8 }}
             className="font-display text-[clamp(40px,8vw,80px)] font-black text-white leading-[0.9] uppercase tracking-tighter drop-shadow-2xl"
          >
            À Chacun<br/>
            <span className="text-[#ffdf70] relative inline-block mt-2">
              Son Goodie
              <svg className="absolute -bottom-4 left-0 w-full h-4 text-[#ffdf70]" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0 10 Q 50 20 100 10" fill="transparent" stroke="currentColor" strokeWidth="4" />
              </svg>
            </span>
          </motion.h2>
        </div>

        {/* Showcase Area */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
          
          {/* Thumbnails (Desktop) */}
          <div className="hidden lg:flex flex-col gap-6 order-2 lg:order-1 py-6 px-4">
            {goodies.map((g, i) => (
              <button 
                key={g.id}
                onClick={() => setActiveIndex(i)}
                className={`relative w-16 h-16 rotate-45 rounded-xl overflow-hidden transition-all duration-300 border-2 shadow-xl
                  ${i === activeIndex ? 'border-[#ffdf70] scale-110 shadow-[0_0_20px_rgba(255,223,112,0.4)]' : 'border-white/20 opacity-60 hover:opacity-100 hover:scale-105'}
                `}
              >
                <div className="absolute inset-0 -rotate-45 scale-[1.5]">
                  <Image src={g.imageUrl || "/fallback.png"} alt={g.nom} fill className="object-cover" unoptimized />
                </div>
              </button>
            ))}
          </div>

          {/* Center Main Image */}
          <div className="relative order-1 lg:order-2 w-full max-w-[280px] sm:max-w-[380px] aspect-square flex-shrink-0 mx-8 mt-8 lg:mt-0">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeGoodie.id}
                initial={{ opacity: 0, scale: 0.8, rotate: 30 }}
                animate={{ opacity: 1, scale: 1, rotate: 45 }}
                exit={{ opacity: 0, scale: 1.1, rotate: 60 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="absolute inset-0"
              >
                <div className="w-full h-full rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.6),0_0_50px_rgba(255,223,112,0.15)] overflow-hidden border-[3px] border-[#ffdf70]/40 relative group">
                  <div className="absolute inset-0 -rotate-45 scale-[1.45] w-full h-full">
                    <Image 
                      src={activeGoodie.imageUrl || "/fallback.png"} 
                      alt={activeGoodie.nom} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                      unoptimized 
                      priority
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Mobile Controls */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-12 lg:hidden">
              <button onClick={prevGoodie} className="w-12 h-12 rounded-full bg-white text-[var(--forest)] flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                <ChevronLeft size={24} />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-12 lg:hidden">
              <button onClick={nextGoodie} className="w-12 h-12 rounded-full bg-white text-[var(--forest)] flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Details & Action */}
          <div className="order-3 lg:order-3 flex-1 text-center lg:text-left min-w-[300px]">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeGoodie.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="inline-block px-4 py-1.5 bg-[#ffdf70] text-[var(--forest)] rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-lg">
                  {activeGoodie.tag || "OFFICIEL"}
                </div>
                
                <h3 className="font-display text-4xl sm:text-5xl font-black text-white mb-4 leading-tight drop-shadow-md">
                  {activeGoodie.nom}
                </h3>
                
                <p className="font-body text-lg text-white/80 font-medium mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
                  {activeGoodie.description}
                </p>
                
                <div className="font-display text-6xl font-black text-[#ffdf70] mb-10 drop-shadow-lg">
                  {activeGoodie.prix} <span className="text-2xl opacity-80">FCFA</span>
                </div>

                <button 
                  onClick={handleAdd}
                  disabled={activeGoodie.stock === 0}
                  className={`
                    group relative overflow-hidden w-full sm:w-auto px-10 py-5 rounded-2xl font-body text-sm uppercase tracking-[4px] font-bold transition-all duration-300 shadow-2xl
                    ${activeGoodie.stock === 0 
                      ? 'bg-white/20 text-white/50 cursor-not-allowed' 
                      : isAdded
                        ? 'bg-[var(--forest)] text-white scale-105'
                        : 'bg-white text-[var(--forest)] hover:bg-[#ffdf70] hover:scale-105 hover:shadow-[0_20px_40px_rgba(255,223,112,0.4)]'
                    }
                  `}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isAdded ? (
                      <><Check size={20} className="stroke-[3px]" /> Ajouté au panier</>
                    ) : activeGoodie.stock === 0 ? (
                      'Rupture de stock'
                    ) : (
                      <><ShoppingBag size={20} className="transition-transform group-hover:-translate-y-1" /> Je le veux !</>
                    )}
                  </span>
                </button>
              </motion.div>
            </AnimatePresence>
            
            {/* Dots for mobile */}
            <div className="flex justify-center gap-3 mt-12 lg:hidden">
              {goodies.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-8 bg-[#ffdf70]' : 'w-2.5 bg-white/30'}`}
                />
              ))}
            </div>
          </div>
          
        </div>
        
        {/* Footer Text */}
        <div className="mt-20 text-center">
           <p className="text-white/60 font-body text-sm font-medium tracking-widest uppercase">
             JARDIN DES OLIVIERS 2026
           </p>
        </div>
      </div>
    </section>
  )
}
