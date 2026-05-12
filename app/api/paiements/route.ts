import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { generateParticipantQR } from "@/lib/qrcode"

const schema = z.object({
  participantId: z.string(),
  transactionId: z.string().min(1),
  operateur: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    // Vérifier si le participant existe
    const participant = await prisma.participant.findUnique({
      where: { id: data.participantId },
      include: { commandes: true }
    })

    if (!participant) {
      return NextResponse.json({ error: "Participant introuvable" }, { status: 404 })
    }

    // Calculer le montant dû (uniquement les commandes en attente)
    const montantTotal = participant.commandes
      .filter((cmd: any) => cmd.statut === "EN_ATTENTE")
      .reduce((acc, cmd: any) => acc + cmd.prix * cmd.quantite, 0)

    if (montantTotal === 0) {
       return NextResponse.json({ error: "Aucun paiement requis" }, { status: 400 })
    }

    // Pour éviter le blocage de doublon sur la DB avec un numéro de téléphone,
    // on va accoler un timestamp unique au numéro pour la référence en base de données.
    const dbTransactionId = `${data.transactionId}_${Date.now()}`

    // Enregistrement et création de QRCode
    // NOTE : Puisqu'il s'agit d'une vérification manuelle a posteriori, 
    // le statut est mis "EN_ATTENTE" jusqu'à vérification admin, 
    // MAIS nous générons quand même le QR Code pour le reçu provisoire
    await prisma.$transaction(async (tx) => {
      // 1. Sauvegarder l'intention de paiement
      await tx.paiement.create({
         data: {
            participantId: participant.id,
            montant: montantTotal,
            operateur: data.operateur,
            transactionId: dbTransactionId,
            statut: "EN_ATTENTE" // Sera validé par l'admin plus tard
         }
      })

      // 2. Générer le QR Code (accès basé sur identité, validation admin faite à l'entrée ou dans le dashboard)
      if (!participant.qrToken) {
         const protocol = req.headers.get('x-forwarded-proto') || 'http'
         const host = req.headers.get('host') || 'localhost:3000'
         const requestBaseUrl = `${protocol}://${host}`
         
         const { token } = await generateParticipantQR(participant.id, participant.email, participant.statut, requestBaseUrl)
         await tx.participant.update({
            where: { id: participant.id },
            data: { qrToken: token }
         })
      }
    })

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
