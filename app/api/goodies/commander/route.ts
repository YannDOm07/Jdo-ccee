import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_only_for_dev'

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("participant_token")?.value
    if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const payload: any = jwt.verify(token, JWT_SECRET)
    const { items } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 })
    }

    // Vérifier l'existence du participant
    const participant = await prisma.participant.findUnique({
      where: { id: payload.id }
    })
    
    if (!participant) {
      return NextResponse.json({ error: "Participant introuvable" }, { status: 404 })
    }

    // Process the order in a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      const commandesCrees = []
      let montantTotal = 0

      for (const item of items) {
        // Fetch current goodie to check stock
        const goodie = await tx.goodie.findUnique({
          where: { id: item.goodieId }
        })

        if (!goodie) {
          throw new Error(`Article ${item.nom || item.goodieId} introuvable`)
        }

        if (!goodie.actif) {
          throw new Error(`L'article ${goodie.nom} n'est plus disponible`)
        }

        if (goodie.stock < item.quantite) {
          throw new Error(`Stock insuffisant pour ${goodie.nom} (Reste: ${goodie.stock})`)
        }

        // Décrémenter le stock
        await tx.goodie.update({
          where: { id: goodie.id },
          data: { stock: goodie.stock - item.quantite }
        })

        // Créer la commande
        const commande = await tx.commande.create({
          data: {
            participantId: payload.id,
            goodieId: goodie.id,
            article: goodie.nom, // compatibilité avec le code existant
            quantite: item.quantite,
            prix: goodie.prix,
            statut: "EN_ATTENTE"
          }
        })

        commandesCrees.push(commande)
        montantTotal += (goodie.prix * item.quantite)
      }

      return { commandes: commandesCrees, total: montantTotal }
    })

    return NextResponse.json({ success: true, participantId: payload.id, ...result })
  } catch (error: any) {
    console.error("Erreur lors de la commande de goodies:", error)
    return NextResponse.json({ error: error.message || "Erreur serveur lors de la commande" }, { status: error.message?.includes('Stock') ? 409 : 500 })
  }
}
