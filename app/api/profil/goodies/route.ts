import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_only_for_dev'

const PRIX = {
  BRACELET: 500,
  CASQUETTE: 1500,
  BADGE: 500,
}

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("participant_token")?.value
    if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const payload: any = jwt.verify(token, JWT_SECRET)
    const { article, quantite } = await request.json()

    if (!article || !quantite || quantite < 1) {
      return NextResponse.json({ error: "Commande invalide" }, { status: 400 })
    }

    const prixUnitaire = PRIX[article.toUpperCase() as keyof typeof PRIX]
    if (!prixUnitaire) {
      return NextResponse.json({ error: "Article inconnu" }, { status: 400 })
    }

    const commande = await prisma.commande.create({
      data: {
        participantId: payload.id,
        article: article,
        quantite: quantite,
        prix: prixUnitaire,
        statut: "EN_ATTENTE"
      }
    })

    return NextResponse.json({ success: true, commande })
  } catch (e) {
    return NextResponse.json({ error: "Erreur lors de la commande" }, { status: 500 })
  }
}
