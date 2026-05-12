"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Phone, ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const [telephone, setTelephone] = useState("+225")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telephone }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error)
        return
      }

      setResult(data)
      toast.success(`Bienvenue ${data.prenom} !`)
    } catch {
      toast.error("Erreur de connexion au serveur")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <div className="space-y-6">
      {/* Lookup Form */}
      <Card className="border-stone-200 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  type="tel"
                  placeholder="+2250102030405"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="pl-10 h-12 text-base"
                  required
                />
              </div>
              <p className="text-xs text-stone-400">
                Entrez le numéro utilisé lors de votre inscription.
              </p>
            </div>
            <Button
              type="submit"
              disabled={isLoading || telephone.length < 13}
              className="w-full h-12 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Retrouver mon inscription
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CardContent className="p-6 space-y-5">
            {/* Participant Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {result.prenom?.[0]}{result.nom?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-lg">{result.prenom} {result.nom}</h3>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {result.statut === "ESATIC_CCEE" ? "ESATIC (CCEE)" : result.statut === "ANCIEN" ? "Ancien ESATIC" : "Externe"}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white rounded-xl p-4 border border-stone-200/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">Montant total</span>
                <span className="font-bold text-stone-800">{result.montantTotal} FCFA</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">Statut paiement</span>
                {result.paiementValide ? (
                  <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                    <CheckCircle2 className="h-4 w-4" /> Validé
                  </span>
                ) : result.paiementEnAttente ? (
                  <span className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                    <Clock className="h-4 w-4" /> En attente
                  </span>
                ) : result.montantTotal > 0 ? (
                  <span className="flex items-center gap-1 text-sm font-semibold text-red-500">
                    <AlertCircle className="h-4 w-4" /> Non payé
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                    <CheckCircle2 className="h-4 w-4" /> Gratuit
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {result.montantTotal > 0 && !result.paiementValide && (
                <Button
                  onClick={() => handleNavigate(`/paiement?participantId=${result.participantId}`)}
                  className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  Procéder au paiement
                </Button>
              )}
              <Button
                onClick={() => handleNavigate(`/confirmation?id=${result.participantId}`)}
                variant="outline"
                className="flex-1 h-11 border-primary/20 text-primary hover:bg-primary/5 font-semibold"
              >
                Voir ma confirmation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
