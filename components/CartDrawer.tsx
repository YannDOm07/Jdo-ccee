"use client"

import { useState } from "react"
import { useCart } from "@/contexts/CartContext"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, ChevronUp, ChevronDown, X, Minus, Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import confetti from "canvas-confetti"

export function CartDrawer() {
  const { items, total, updateQuantity, removeFromCart, clearCart } = useCart()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  if (items.length === 0) return null

  const itemCount = items.reduce((acc, item) => acc + item.quantite, 0)

  const handleCheckout = async () => {
    setIsSubmitting(true)
    
    try {
      // API call to process the order
      const res = await fetch("/api/goodies/commander", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           items: items.map(i => ({ goodieId: i.goodieId, nom: i.nom, quantite: i.quantite })) 
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la commande")
      }

      // Success
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#C8992A', '#E8C060', '#F5E4A8', '#1B3A1F']
      })
      
      toast.success("🎉 Commande enregistrée ! Goodies réservés.", {
        style: { background: 'var(--forest)', border: '1px solid var(--gold)', color: 'white' }
      })

      clearCart()
      setIsExpanded(false)
      
      setTimeout(() => {
        // Open Wave link immediately
        window.open("https://pay.wave.com/m/M_ci_P2KvInolTvzh/c/ci/", "_blank");
        router.push(`/paiement?id=${data.participantId}`)
        router.refresh()
      }, 500)

    } catch (e: any) {
      toast.error(e.message, { style: { background: '#450a0a', border: '1px solid #7f1d1d', color: '#fecaca' }})
      if (e.message.includes('Stock') || e.message.includes('Non autorisé') || e.message.includes('Participant introuvable')) {
         // Modal condition would be triggered here in real app, but toast handles the user message nicely
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="fixed bottom-0 left-0 right-0 z-[800]"
      >
        <div className="bg-[rgba(13,26,9,0.96)] backdrop-blur-[20px] border-t border-[var(--gold)]/30 text-white font-body px-4 md:px-20">
          
          <div className="max-w-[1200px] mx-auto py-4 md:py-0">
            {/* ── Collapsed Bar ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 min-h-[64px]">
              
              {/* Left */}
              <div 
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <div className="relative text-[var(--gold)]">
                  <motion.div
                    key={itemCount}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.6 }}
                  >
                    <ShoppingBag size={24} />
                  </motion.div>
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                </div>
                <div>
                  <div className="text-[13px] text-white/80 select-none">Mon panier · {itemCount} article(s)</div>
                  
                  {/* Center info (Mobile: hidden, Desktop: shown) */}
                  <div className="hidden md:block text-[11px] text-white/50 select-none max-w-sm truncate mt-0.5">
                    {items.map(i => `${i.nom} x${i.quantite}`).join(" · ")}
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                <div className="font-display text-2xl text-[var(--gold-light)] whitespace-nowrap">
                  {total} <span className="text-[10px] text-white/40 font-body">FCFA</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="bg-[var(--gold)] text-[var(--ink)] px-6 py-3 font-body text-[11px] font-bold uppercase tracking-[3px] hover:bg-white hover:-translate-y-0.5 transition-all flex items-center gap-2 whitespace-nowrap rounded-xl shadow-[0_0_15px_rgba(200,153,42,0.3)]"
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Payer via Wave →'}
                  </button>
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 text-white/50 hover:text-white transition-colors"
                  >
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Expanded Content ── */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="max-h-[50vh] overflow-y-auto py-6 border-t border-white/10 mt-4 overflow-x-hidden custom-scrollbar pr-2">
                    
                    <div className="space-y-4">
                      {items.map(item => (
                        <div key={item.goodieId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-sm">
                          <div className="flex items-center gap-4">
                            {/* Dummy thumb */}
                            <div className="w-12 h-12 bg-black/40 rounded flex items-center justify-center overflow-hidden shrink-0">
                               {item.imageUrl ? (
                                  <img src={item.imageUrl} alt={item.nom} className="w-full h-full object-cover" />
                               ) : (
                                  <ShoppingBag size={18} className="text-white/20" />
                               )}
                            </div>
                            <div>
                              <div className="font-body text-[14px] font-medium text-white/90">{item.nom}</div>
                              <div className="font-body text-[11px] text-[var(--gold)]">{item.prix} FCFA / u.</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                            <div className="flex items-center gap-3 bg-black/30 rounded border border-white/10 px-2 py-1">
                              <button onClick={() => updateQuantity(item.goodieId, -1)} className="p-1 hover:text-[var(--gold)] disabled:opacity-30" disabled={item.quantite <= 1}><Minus size={12} /></button>
                              <span className="w-6 text-center text-xs font-bold">{item.quantite}</span>
                              <button onClick={() => updateQuantity(item.goodieId, 1)} className="p-1 hover:text-[var(--gold)]"><Plus size={12}/></button>
                            </div>
                            <div className="font-display text-lg text-white w-20 text-right">
                              {item.prix * item.quantite}
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.goodieId)}
                              className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-colors rounded-full"
                              title="Retirer l'article"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-end">
                      <div className="flex justify-between w-full max-w-sm text-[15px] mb-2">
                        <span className="text-white/60 font-body uppercase tracking-wider text-xs">Sous-total</span>
                        <span className="font-display text-2xl text-[var(--gold-light)]">{total} <span className="text-[10px] text-white/40">FCFA</span></span>
                      </div>
                      <p className="text-[11px] text-[#7BAE83] mt-2 flex items-center gap-2 italic">
                        ⚡ Achetez maintenant, payez directement via Wave P2P.
                      </p>
                      <button 
                         onClick={handleCheckout}
                         disabled={isSubmitting}
                         className="w-full max-w-sm mt-6 bg-[var(--gold)] text-[var(--ink)] py-4 font-body text-xs font-bold uppercase tracking-[3px] hover:bg-white transition-colors rounded-xl shadow-[0_0_20px_rgba(200,153,42,0.2)] hover:scale-[1.02]"
                      >
                         {isSubmitting ? 'Redirection...' : `Payer ${total} FCFA par Wave →`}
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(200,153,42,0.5); border-radius: 4px; }
        `}} />
      </motion.div>
    </AnimatePresence>
  )
}
