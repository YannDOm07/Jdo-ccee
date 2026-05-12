"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function ConnexionPage() {
  const { setLoggedIn } = useAuth()
  const [email, setEmail] = useState("")
  const [telephone, setTelephone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleConnexion = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, telephone })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Informations incorrectes");
      }

      toast.success("✅ Heureux de vous revoir au Jardin !");
      setLoggedIn(true);
      router.push("/profil");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la connexion.");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100svh] bg-[var(--cream)] flex flex-col md:flex-row relative overflow-hidden">
      
      {/* ── Partie Gauche : Image & Ambiance ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[var(--ink)] overflow-hidden flex-col justify-between p-12 z-10">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity will-change-transform"
            style={{ 
              backgroundImage: `url("https://images.unsplash.com/photo-1511497584788-876760111969?q=60&w=800&auto=format")`,
              filter: "sepia(0.3) hue-rotate(-10deg) saturate(1.5)"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/40 to-transparent" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="font-display italic text-3xl text-[var(--gold)]">
             JDO
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-5xl lg:text-7xl text-white mb-6 leading-[0.9]">
            Bon retour<br/>
            <span className="italic text-[var(--gold)]">parmi nous.</span>
          </h1>
          <p className="font-body text-[var(--moss)] text-lg">
            Accédez à votre billet, vérifiez le statut de votre inscription ou commandez plus de goodies pour le Jardin des Oliviers.
          </p>
        </div>
      </div>

      {/* ── Partie Droite : Formulaire ── */}
      <div className="w-full lg:w-1/2 min-h-[100svh] flex flex-col justify-center p-8 md:p-16 lg:p-24 relative z-20 bg-[var(--cream)]">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex justify-between items-center mb-12">
          <Link href="/" className="font-display italic text-3xl text-[var(--gold)]">
             JDO
          </Link>
          <Link href="/" className="font-body text-[10px] font-medium tracking-[3px] uppercase text-[var(--forest)] border-b border-[var(--forest)] pb-1">
             Retour
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto">
          <span className="inline-block py-1.5 px-4 bg-[var(--forest)]/5 border border-[var(--forest)]/10 rounded-full text-[10px] uppercase tracking-[3px] font-semibold text-[var(--forest)] mb-6">
            Espace Participant
          </span>
          <h2 className="font-display text-4xl text-[var(--ink)] mb-10">Connexion</h2>

          <form onSubmit={handleConnexion} className="space-y-8">
            <div className="input-float-wrapper">
              <input 
                type="email" 
                id="email" 
                required 
                className="input-float bg-transparent border-[var(--moss)]/30 text-[var(--ink)] focus:border-[var(--forest)] placeholder-transparent" 
                placeholder=" " 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="email" className="label-float text-[var(--moss)] peer-focus:text-[var(--forest)]">
                Adresse Email
              </label>
            </div>

            <div className="input-float-wrapper">
              <input 
                type="tel" 
                id="telephone" 
                required 
                className="input-float bg-transparent border-[var(--moss)]/30 text-[var(--ink)] focus:border-[var(--forest)] placeholder-transparent" 
                placeholder=" " 
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />
              <label htmlFor="telephone" className="label-float text-[var(--moss)] peer-focus:text-[var(--forest)]">
                Numéro de téléphone
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !email || !telephone}
              className="btn-primary magnetic w-full py-5 relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              <span className="relative z-10 font-body text-xs font-bold uppercase tracking-[3px] flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> 
                    Vérification...
                  </>
                ) : (
                  <>
                    Accéder à mon billet <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-[var(--moss)]/20 text-center">
            <p className="font-body text-sm text-[var(--moss)]">
              Vous n'êtes pas encore inscrit ?<br/>
              <Link href="/inscription" className="text-[var(--forest)] font-medium underline mt-2 inline-block hover:text-[var(--gold)] transition-colors">
                Rejoignez le Jardin des Oliviers
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
