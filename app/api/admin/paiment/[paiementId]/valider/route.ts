import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: { paiementId: string } }
) {
  try {
    const { paiementId } = params

    // Mettre à jour le paiement
    const payment = await prisma.paiement.update({
      where: { id: paiementId },
      data: { statut: "PAYE" },
      include: { participant: true }
    })

    // (Optionnel) Ici on pourrait envoyer le SMS de confirmation final avec Africa's Talking.
    // ...

    return NextResponse.json({ success: true, payment })

  } catch (error) {
     console.error("Admin validation error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
