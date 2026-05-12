import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_only_for_dev'

export async function POST(request: Request) {
  try {
    const { email, telephone } = await request.json()

    if (!email || !telephone) {
      return NextResponse.json({ error: "Email et numéro de téléphone requis" }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanPhone = telephone.replace(/\s+/g, '')
    
    // Anti-doublon hash to match registration logic
    const hashStr = `${cleanEmail}-${cleanPhone}`;
    const hash = crypto.createHash('sha256').update(hashStr).digest('hex');

    const participant = await prisma.participant.findUnique({
      where: { hash },
      include: {
        commandes: true,
        paiements: true,
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: "Aucun participant trouvé avec ce numéro. Veuillez vous inscrire d'abord." },
        { status: 404 }
      )
    }

    // Check if there's a pending payment
    const hasPendingPayment = participant.paiements.some((p: any) => p.statut === "EN_ATTENTE")
    const hasPaidPayment = participant.paiements.some((p: any) => p.statut === "PAYE")
    const totalDue = participant.commandes.reduce((acc: number, cmd: any) => acc + cmd.prix * cmd.quantite, 0)

    // Create session token
    const tokenPayload = {
      id: participant.id,
      email: participant.email,
      statut: participant.statut
    }
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' })

    cookies().set('participant_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return NextResponse.json({
      participantId: participant.id,
      nom: participant.nom,
      prenom: participant.prenom,
      statut: participant.statut,
      montantTotal: totalDue,
      paiementValide: hasPaidPayment,
      paiementEnAttente: hasPendingPayment,
    })
  } catch (error) {
    console.error("Erreur connexion participant:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
