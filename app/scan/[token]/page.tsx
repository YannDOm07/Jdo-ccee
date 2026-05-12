import { verifyParticipantToken } from "@/lib/qrcode"
import { prisma } from "@/lib/prisma"
import { CheckCircle, XCircle, AlertTriangle, User, Package, CreditCard } from "lucide-react"
import Link from "next/link"

export default async function ScanValidatePage({ params }: { params: any }) {
  // Handle both Next.js 14 and 15 params API safely
  const token = typeof params?.then === 'function' ? (await params).token : params.token

  const payload = verifyParticipantToken(token) as any

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--ink)] text-white p-6">
        <div className="bg-red-500/10 border border-red-500/50 p-8 text-center max-w-md w-full rounded-2xl">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="font-display text-3xl mb-2">Billet Invalide</h1>
          <p className="font-body text-red-200/80">Ce QR Code est corrompu ou expiré.</p>
        </div>
      </div>
    )
  }

  // Use either participantId or id depending on how it was signed.
  // In lib/qrcode.ts we signed { participantId, email, statut }.
  // Wait, early inscriptions might not have the new format? We just used participantId.
  const participant = await prisma.participant.findUnique({
    where: { id: payload.participantId || payload.id },
    include: {
      commandes: true,
      paiements: true
    }
  })

  if (!participant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--ink)] text-white p-6">
        <div className="bg-orange-500/10 border border-orange-500/50 p-8 text-center max-w-md w-full rounded-2xl">
          <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="font-display text-3xl mb-2">Participant Introuvable</h1>
          <p className="font-body text-orange-200/80">Le billet est lisible mais aucun participant ne correspond dans la base de données.</p>
        </div>
      </div>
    )
  }

  const isValid = participant.montant === 0 || participant.paiements.some((p: any) => p.statut === "PAYE")

  return (
    <div className="min-h-screen bg-[var(--cream)] pb-20 selection:bg-[var(--gold)] selection:text-[var(--forest)]">
      
      {/* -- Topbar Sécurisée -- */}
      <div className="w-full bg-[var(--forest)] h-[72px] flex items-center justify-between px-6 shadow-md sticky top-0 z-50">
        <div>
          <h1 className="font-display text-xl text-[var(--gold)]">Validation <span className="opacity-50">· JDO</span></h1>
          <p className="font-body text-[10px] text-white/50 tracking-widest uppercase mt-0.5">Contrôle Accès</p>
        </div>
        <Link href="/" className="text-xs uppercase tracking-[2px] font-medium text-[var(--gold)]">
          Retour
        </Link>
      </div>

      <div className="max-w-xl mx-auto px-6 mt-12">
        {/* Validation Status */}
        <div className={`p-8 shadow-xl ${isValid ? "bg-[#1B3A1F] text-white" : "bg-red-900 border border-red-500 text-white"}`}>
          <div className="flex items-center gap-4 mb-6">
            {isValid ? (
              <CheckCircle className="w-12 h-12 text-[#7BAE83]" />
            ) : (
              <XCircle className="w-12 h-12 text-red-500" />
            )}
            <div>
              <h2 className="font-display text-3xl">{isValid ? "Accès Autorisé" : "Accès Refusé"}</h2>
              <p className="font-body text-sm opacity-80 mt-1 uppercase tracking-widest">
                {isValid ? "Billet Payé & Valide" : "Paiement en attente ou échoué"}
              </p>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6 grid grid-cols-2 gap-6 font-body">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Participant</p>
              <p className="text-lg font-bold">{participant.prenom} {participant.nom}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Statut</p>
              <p className="text-lg">
                {participant.statut === "ESATIC_CCEE" ? "Étudiant CCEE" : participant.statut === "ANCIEN" ? "Ancien ESATIC" : "Externe"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Contact</p>
              <p className="opacity-90">{participant.telephone} · {participant.email}</p>
            </div>
          </div>
        </div>

        {/* Goodies & Achats */}
        <div className="bg-white border border-[var(--mist)] mt-8 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--mist)] pb-4">
            <Package className="text-[var(--gold)]" />
            <h3 className="font-display text-2xl text-[var(--ink)]">Achats & Goodies</h3>
          </div>
          
          <ul className="space-y-4 font-body">
            <li className="flex justify-between border-b border-[var(--mist)]/50 pb-3">
              <span className="text-[var(--ink)] font-medium">T-Shirt Officiel</span>
              {participant.statut !== "EXTERNE" || isValid ? (
                <span className="text-[#5F8A66] font-bold">À REMETTRE</span>
              ) : (
                <span className="text-red-500">NON PAYÉ</span>
              )}
            </li>
            
            {participant.commandes.map((cmd: any) => (
              <li key={cmd.id} className="flex justify-between border-b border-[var(--mist)]/50 pb-3">
                <span className="text-[var(--moss)]">{cmd.article} <span className="text-[10px] text-gray-400 ml-2">x{cmd.quantite}</span></span>
                {isValid ? (
                  <span className="text-[var(--gold)] font-bold">À REMETTRE</span>
                ) : (
                  <span className="text-[var(--mist)]">BLOQUÉ</span>
                )}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}
