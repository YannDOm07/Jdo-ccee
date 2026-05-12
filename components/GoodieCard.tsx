"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Check } from "lucide-react"

export type Goodie = {
  id: string
  nom: string
  description: string
  prix: number
  stock: number
  imageUrl: string | null
  tag: string | null
}

export function GoodieCard({ goodie, onAdd }: { goodie: Goodie, onAdd: (g: Goodie) => void }) {
  const cardRef = useRef<HTMLElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  
  const [isHovered, setIsHovered] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const isSoldOut = goodie.stock === 0
  const isLowStock = goodie.stock > 0 && goodie.stock <= 20

  const defaultImages: Record<string, string> = {
    "SOUVENIR": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80",
    "OFFICIEL": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80",
    "COLLECTOR": "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=500&q=80",
  }

  const fallbackImage = defaultImages[goodie.tag || "SOUVENIR"] || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80"
  const imageToUse = goodie.imageUrl || fallbackImage

  const getTagStyle = (tag: string | null) => {
    switch(tag) {
      case "SOUVENIR": return "border border-[var(--gold)] text-[var(--gold)]"
      case "OFFICIEL": return "bg-[var(--gold)]/15 text-white/90"
      case "COLLECTOR": return "border border-[var(--gold)]/50 text-white/90"
      default: return "border border-white/20 text-white/60"
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isSoldOut || !cardRef.current || !glowRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Position glow
    glowRef.current.style.left = `${x}px`
    glowRef.current.style.top = `${y}px`
    glowRef.current.style.opacity = '1'

    // 3D Tilt (disable on mobile via CSS but JS logic here)
    if (window.innerWidth > 640) {
      const centerX = x / rect.width - 0.5
      const centerY = y / rect.height - 0.5
      cardRef.current.style.transform = `
        perspective(800px)
        rotateX(${-centerY * 10}deg)
        rotateY(${centerX * 10}deg)
        translateZ(8px)
        scale(1.02)
      `
    }
    
    // Scale image
    if (imageRef.current) {
      imageRef.current.style.transform = "scale(1.08)"
    }
  }

  const handleMouseLeave = () => {
    if (isSoldOut || !cardRef.current || !glowRef.current) return
    
    setIsHovered(false)
    glowRef.current.style.opacity = '0'
    cardRef.current.style.transform = ''
    
    if (imageRef.current) {
      imageRef.current.style.transform = ""
    }
  }

  const handleAddClick = () => {
    if (isSoldOut || isAdded) return
    
    onAdd(goodie)
    setIsAdded(true)
    
    setTimeout(() => {
      setIsAdded(false)
    }, 2000)
  }

  return (
    <article 
      ref={cardRef}
      className={`relative overflow-hidden bg-white/5 backdrop-blur-[12px] border border-[var(--gold)]/20 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-2xl ${isSoldOut ? 'opacity-50 grayscale select-none' : 'cursor-none hover:border-[var(--gold)]/60 hover:shadow-[0_20px_40px_-10px_rgba(200,153,42,0.15)] hover:-translate-y-2'}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => !isSoldOut && setIsHovered(true)}
    >
      {/* ── Glow Effect ── */}
      <div 
        ref={glowRef}
        className="absolute w-[250px] h-[250px] rounded-full pointer-events-none opacity-0 transition-opacity duration-300 z-0 mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(200,153,42,0.2) 0%, transparent 60%)",
          transform: "translate(-50%, -50%)"
        }}
      />

      {/* ── Image Section ── */}
      <div className="relative h-[220px] w-full overflow-hidden">
        <Image 
          ref={imageRef as any}
          src={imageToUse}
          alt={goodie.nom}
          fill
          unoptimized
          className="object-cover transition-transform duration-600 ease-out z-[1]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,26,9,0.9)] via-[rgba(13,26,9,0.2)] to-transparent z-[2]" />
        
        {/* Shine Animation */}
        <div 
          className="absolute inset-0 z-[3] pointer-events-none"
          style={{
            background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.12) 50%, transparent 80%)",
            backgroundSize: "200% 100%",
            backgroundPosition: isHovered ? "-100% 0" : "100% 0",
            transition: isHovered ? "background-position 1s ease" : "background-position 0s"
          }}
        />

        {/* Stock Badge */}
        <div className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-[rgba(13,26,9,0.75)] backdrop-blur-md border border-[var(--gold)]/30 rounded-full text-[9px] tracking-[0.2em] uppercase font-bold text-[var(--gold)]/90 flex flex-col items-center shadow-lg">
          {isSoldOut ? (
            <span className="text-white/60 line-through">ÉPUISÉ</span>
          ) : (
            <span>EN STOCK</span>
          )}
        </div>
      </div>

      {/* ── Body Section ── */}
      <div className="p-6 md:p-8 relative z-10 flex flex-col h-[calc(100%-220px)] justify-between">
        <div>
          {goodie.tag && (
            <div className={`inline-block px-2 py-0.5 text-[8px] uppercase tracking-[3px] font-bold mb-3 ${getTagStyle(goodie.tag)}`}>
              {goodie.tag}
            </div>
          )}
          <h3 className="font-display text-2xl font-bold text-white mb-2 leading-tight">
            {goodie.nom}
          </h3>
          <p className="font-body text-[13px] font-light text-white/55 leading-[1.6] mb-6 line-clamp-2">
            {goodie.description}
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-auto">
          <div className="font-display text-3xl font-black text-[var(--gold-light)] leading-none">
            {goodie.prix} <span className="font-body text-xs font-light text-white/40 tracking-wider">FCFA</span>
          </div>

          <button 
            onClick={handleAddClick}
            disabled={isSoldOut}
            className={`
              w-full py-3.5 px-6 font-body text-[11px] uppercase tracking-[3px] font-bold transition-all duration-300 flex items-center justify-center gap-2 rounded-xl
              ${isSoldOut ? 'bg-transparent border border-white/10 text-white/30 cursor-not-allowed' 
                : isAdded 
                  ? 'bg-[var(--gold)] border border-[var(--gold)] text-[var(--ink)] shadow-[0_0_20px_rgba(200,153,42,0.3)] shake-egg scale-105'
                  : 'bg-white/5 backdrop-blur-sm border border-[var(--gold)]/30 text-[var(--gold)] hover:bg-[var(--gold)] hover:border-[var(--gold)] hover:text-[var(--ink)] hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(200,153,42,0.2)]'
              }
            `}
          >
            {isAdded ? (
              <span className="flex items-center gap-1.5"><Check size={14} className="stroke-[3px]" /> Ajouté</span>
            ) : isSoldOut ? (
              'Épuisé'
            ) : (
              '+ Ajouter'
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
