import { prisma } from "@/lib/prisma"
import { AdminDashboardClient } from "./client"

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const participantsRaw = await prisma.participant.findMany({
    include: {
       commandes: true,
       paiements: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  // Transformer les données pour le client
  const participants = participantsRaw.map((p: any) => {
    // Calculer le montant total à payer (Somme des commandes)
    const totalA_Payer = p.commandes.reduce((sum: any, c: any) => sum + c.prix * c.quantite, 0)
    
    // Calculer le statut de paiement de manière précise :
    // 1. S'il n'y a aucune commande → GRATUIT
    // 2. S'il reste des commandes EN_ATTENTE → EN_ATTENTE
    // 3. Si toutes les commandes sont PAYE → PAYE
    const hasCommandes = p.commandes.length > 0
    const hasUnpaidCommandes = p.commandes.some((c: any) => c.statut === 'EN_ATTENTE')
    const allCommandesPaid = hasCommandes && p.commandes.every((c: any) => c.statut === 'PAYE')
    
    let statutPaiement = 'GRATUIT'
    if (!hasCommandes) {
      statutPaiement = 'GRATUIT'
    } else if (hasUnpaidCommandes) {
      statutPaiement = 'EN_ATTENTE'
    } else if (allCommandesPaid) {
      statutPaiement = 'PAYE'
    }
    
    return {
      ...p,
      promo: p.promo,
      montant: totalA_Payer,
      statutPaiement
    }
  })

  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <AdminDashboardClient participants={participants} />
    </div>
  )
}
