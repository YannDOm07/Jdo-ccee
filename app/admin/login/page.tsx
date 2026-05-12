"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, ArrowRight } from "lucide-react"

export default function AdminLogin() {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      })

      if (res.ok) {
        toast.success("✅ Connexion réussie à l'espace Admin")
        router.push("/admin")
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || "Mot de passe incorrect")
      }
    } catch (e) {
      toast.error("Erreur de connexion serveur")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100svh] bg-[var(--ink)] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative Forest Background Overlay */}
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url("https://images.unsplash.com/photo-1511497584788-876760111969?w=1600&q=85")`, filter: "saturate(0)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/80 to-[var(--ink)]" />

      {/* Mini Navbar / Header */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-20">
        <Link href="/" className="font-display italic text-2xl text-[var(--gold)]">
          JDO
        </Link>
        <Link href="/" className="font-body text-xs font-medium uppercase tracking-[3px] text-white hover:text-[var(--gold)] transition-colors">
          Retour au Jardin
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <span className="inline-block py-1.5 px-4 bg-[var(--forest)]/50 border border-[var(--gold)]/30 rounded-full text-[10px] uppercase tracking-[3px] font-medium text-[var(--gold)] mb-4 backdrop-blur-sm">
            Accès Sécurisé
          </span>
          <h1 className="font-display text-4xl lg:text-5xl text-white mb-2">Espace <span className="text-[var(--gold)] italic">Admin</span></h1>
          <p className="font-body text-sm text-[var(--moss)]">Saisissez la clé pour accéder au sanctuaire.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="input-float-wrapper">
            <input 
              type="password" 
              id="password" 
              required 
              className="input-float bg-white/5 border-[var(--moss)]/50 text-white focus:border-[var(--gold)] placeholder-transparent" 
              placeholder=" " 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="password" className="label-float text-[var(--moss)] peer-focus:text-[var(--gold)]">
              Clé d'administration
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || password.length === 0}
            className="btn-gold magnetic w-full py-4 relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 font-body text-xs font-bold uppercase tracking-[3px] flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> 
                  Vérification...
                </>
              ) : (
                <>
                  Déverrouiller <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}
