"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { LogOut, Save, Settings, Package, QrCode, ShoppingCart, Plus, Minus, Loader2, Trash2, Home } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function ProfilClient({ participant, qrCodeUrl }: { participant: any, qrCodeUrl: string }) {
  const router = useRouter()
  const { logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nom: participant.nom,
    prenom: participant.prenom
  })
  const [isSaving, setIsSaving] = useState(false)
  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch("/api/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error("Erreur de mise à jour")
      toast.success("Profil mis à jour avec succès")
      setIsEditing(false)
      router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const [isDeletingGoodie, setIsDeletingGoodie] = useState<string | null>(null)

  const handleDeleteGoodie = async (commandeId: string) => {
    if (!confirm("Supprimer cet article de votre liste ?")) return
    setIsDeletingGoodie(commandeId)
    try {
      const res = await fetch(`/api/profil/goodies/${commandeId}`, {
        method: "DELETE"
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur lors de la suppression")
      }
      toast.success("Article supprimé")
      router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsDeletingGoodie(null)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--ink)] text-white font-body selection:bg-[var(--gold)] selection:text-[var(--forest)]">
      
      {/* ── Background Ambiance ── */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[var(--ink)]">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0a1407 0%, #152912 40%, #0d1a09 100%)',
            opacity: 0.5
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-12 lg:pt-32 lg:pb-24">
        
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/10 pb-6 gap-6">
          <div>
            <h1 className="font-display text-4xl lg:text-5xl text-[var(--gold)] italic mb-2">Mon Jardin</h1>
            <p className="font-body text-xs tracking-widest uppercase text-white/50">
              {participant.statut === "ESATIC_CCEE" ? "Étudiant ESATIC" : participant.statut === "ANCIEN" ? "Ancien ESATIC" : "Participant Externe"}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-[2px] text-white/60 hover:text-[var(--gold)] transition-colors"
            >
              <Home size={16} /> Accueil
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-[2px] text-white/60 hover:text-[var(--gold)] transition-colors"
            >
              <LogOut size={16} /> Se déconnecter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── LEFT COLUMN: QR & DETAILS ── */}
          <div className="col-span-1 lg:col-span-5 space-y-8">
            
            {/* QR Code Card */}
            <div className="bg-white/5 border border-[var(--gold)]/20 p-8 backdrop-blur-md flex flex-col items-center text-center">
              <QrCode className="text-[var(--gold)] mb-4" size={32} />
              <h2 className="font-display text-2xl mb-6">Votre Laissez-passer</h2>
              
              {qrCodeUrl ? (
                <div className="bg-white p-4 inline-block rounded-xl shadow-[0_0_30px_rgba(200,153,42,0.15)] glow-pulse mb-6">
                  <Image src={qrCodeUrl} alt="QR Code" width={200} height={200} />
                </div>
              ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200/80 p-6 text-sm mb-6">
                  En attente de paiement.<br/>Votre QR Code sera généré une fois le paiement validé.
                </div>
              )}
              
              <p className="font-body text-xs text-white/60 max-w-[250px]">
                Présentez ce QR code à l'entrée du Jardin des Oliviers pour valider votre accès.
              </p>
            </div>

          </div>

          {/* ── RIGHT COLUMN: INFO & GOODIES ── */}
          <div className="col-span-1 lg:col-span-7 space-y-8">
            
            {/* Infos Personnelles */}
            <div className="bg-white/5 border border-white/10 p-8 backdrop-blur-sm relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-6 text-white/20 group-hover:text-[var(--gold)]/20 transition-colors">
                <Settings size={64} />
              </div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="font-display text-2xl text-[var(--gold)]">Informations</h3>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-xs font-semibold uppercase tracking-[2px] border-b border-white/30 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors pb-1">
                    Modifier
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2">Nom</label>
                      <input 
                        type="text" 
                        value={formData.nom} 
                        onChange={e => setFormData({...formData, nom: e.target.value.toUpperCase()})}
                        className="w-full bg-black/20 border border-white/20 p-3 text-white focus:border-[var(--gold)] outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2">Prénom</label>
                      <input 
                        type="text" 
                        value={formData.prenom} 
                        onChange={e => setFormData({...formData, prenom: e.target.value})}
                        className="w-full bg-black/20 border border-white/20 p-3 text-white focus:border-[var(--gold)] outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 text-xs uppercase tracking-widest text-white/60 hover:text-white">Annuler</button>
                    <button type="submit" disabled={isSaving} className="bg-[var(--gold)] text-[var(--ink)] font-bold px-6 py-3 flex items-center gap-2 text-xs uppercase tracking-widest hover:bg-white transition-colors">
                      {isSaving ? "Enregistrement..." : <><Save size={16} /> Sauvegarder</>}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-y-6 relative z-10">
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Nom Complet</span>
                    <span className="text-lg">{participant.nom} {participant.prenom}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Contact</span>
                    <span className="text-lg opacity-80">{participant.telephone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Email</span>
                    <span className="text-lg opacity-80">{participant.email}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mes Goodies */}
            <div className="bg-[var(--forest)]/40 border border-[var(--gold)]/10 p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <Package className="text-[var(--gold)]" />
                <h3 className="font-display text-2xl text-[var(--gold)]">Mes Goodies</h3>
              </div>
              
              {(() => {
                const goodiesList = participant.commandes.filter((cmd: any) => !cmd.article.startsWith("Frais d'inscription"));
                
                return goodiesList.length > 0 ? (
                  <ul className="space-y-4 mb-8">
                    {goodiesList.map((cmd: any) => (
                      <li key={cmd.id} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0 hover:bg-white/5 px-2 transition-colors">
                        <div>
                          <span className="font-display text-[var(--gold)] mr-3">{cmd.id.substring(0,4)}</span>
                          <span className="font-body text-[15px]">{cmd.article}</span>
                          <span className="ml-3 text-xs text-white/40">x{cmd.quantite}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-body text-[13px] text-white/80">{cmd.prix * cmd.quantite} <span className="text-[10px]">FCFA</span></span>
                          <span className={`text-[10px] px-2 py-0.5 border ${cmd.statut === 'PAYE' ? 'border-green-500/30 text-green-400 bg-green-500/5' : 'border-amber-500/30 text-amber-400 bg-amber-500/5'}`}>
                            {cmd.statut === 'PAYE' ? 'PAYÉ' : 'À PAYER'}
                          </span>
                          {cmd.statut !== 'PAYE' && (
                            <button
                              onClick={() => handleDeleteGoodie(cmd.id)}
                              disabled={isDeletingGoodie === cmd.id}
                              className="p-1 text-white/30 hover:text-red-400 transition-colors"
                              title="Supprimer cet article"
                            >
                              {isDeletingGoodie === cmd.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-white/50 text-sm mb-4 italic">Vous n'avez pas encore commandé de souvenirs.</p>
                    <Link href="/" className="inline-block px-6 py-2 border border-[var(--gold)]/30 text-[var(--gold)] font-body text-[10px] tracking-widest uppercase hover:bg-[var(--gold)] hover:text-[var(--ink)] transition-colors">
                      Découvrir les goodies →
                    </Link>
                  </div>
                )
              })()}

            </div>

          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .glow-pulse {
          animation: pulseGlow 4s infinite alternate ease-in-out;
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 20px rgba(200,153,42,0.1); }
          100% { box-shadow: 0 0 60px rgba(200,153,42,0.4); }
        }
      `}} />
    </div>
  )
}
