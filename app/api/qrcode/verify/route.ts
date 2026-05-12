import { NextRequest, NextResponse } from "next/server"
import { verifyParticipantToken } from "@/lib/qrcode"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 })
    }

    // Décrypter le JWT
    const decoded: any = verifyParticipantToken(token)

    if (!decoded || !decoded.participantId) {
      return NextResponse.json({ error: "Billet Invalide ou falsifié" }, { status: 401 })
    }

    const participant = await prisma.participant.findUnique({
      where: { id: decoded.participantId },
      include: {
         commandes: true,
         paiements: true,
      }
    })

    if (!participant) {
      return NextResponse.json({ error: "Participant inexistant en base" }, { status: 404 })
    }

    // Vérifier si le paiement a bien été validé par l'admin.
    const totalA_Payer = participant.commandes.reduce((acc: any, c: any) => acc + c.prix * c.quantite, 0)
    if (totalA_Payer > 0) {
       const isPaiementOK = participant.paiements.some((p: any) => p.statut === 'PAYE')
       if (!isPaiementOK) {
         return NextResponse.json({ error: "Paiement en attente de validation. Billet bloqué." }, { status: 403 })
       }
    }

    return NextResponse.json({ success: true, participant }, { status: 200 })

  } catch (error) {
     console.error("Erreur de scan:", error)
    return NextResponse.json({ error: "Erreur lors de la lecture du code" }, { status: 500 })
  }
}
