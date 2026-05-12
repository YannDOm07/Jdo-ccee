import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_only_for_dev'

export async function GET(request: NextRequest) {
  try {
    const token = (await cookies()).get("participant_token")?.value
    if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const payload: any = jwt.verify(token, JWT_SECRET)
    const url = new URL(request.url)
    const participantIdParam = url.searchParams.get("participantId")
    
    // Auth check
    if (participantIdParam && participantIdParam !== payload.id) {
       return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const targetId = participantIdParam || payload.id

    const commandes = await prisma.commande.findMany({
      where: {
        participantId: targetId,
        goodieId: { not: null } // Ne retourne que les goodies, pas les frais d'inscription ou tshirt externe
      },
      include: {
        goodie: true
      },
      orderBy: {
        id: 'desc'
      }
    })

    return NextResponse.json({ commandes })
  } catch (error) {
    console.error("Erreur récupération commandes:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
