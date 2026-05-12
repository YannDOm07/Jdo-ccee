import { Metadata } from "next"
import { WavePaymentForm } from "@/components/forms/payment-form"
import { CreditCard, Shield, Sparkles } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Paiement | JDO 2026",
  description: "Effectuez votre paiement pour valider votre inscription au JDO.",
}

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ participantId?: string, id?: string }>
}) {
  const { participantId, id } = await searchParams
  const pId = participantId || id

  if (!pId) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-6 text-center min-h-[60vh]">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <CreditCard className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Erreur de Référence</h1>
        <p className="text-muted-foreground mt-2 max-w-sm">Aucun participant trouvé. Veuillez reprendre depuis l'inscription.</p>
        <Link href="/inscription" className="mt-6 px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 transition-all">
          Retour à l'inscription
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full py-12 md:py-20">
      <div className="container px-4 md:px-6">
        <div className="max-w-xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Dernière étape
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Finalisez votre paiement
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Il ne reste plus qu'à régler vos achats (T-Shirt / Goodies) via Wave Mobile Money.
            </p>
          </div>
          
          {/* Payment Form */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-premium p-6 md:p-8">
            <WavePaymentForm participantId={pId as string} />
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Paiement sécurisé
            </div>
            <div className="h-3 w-px bg-stone-200" />
            <div className="flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              Wave Mobile Money
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
