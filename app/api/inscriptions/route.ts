import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { generateParticipantQR } from "@/lib/qrcode"
import crypto from 'crypto'
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_only_for_dev'

const STATUTS = ["ESATIC_CCEE", "ANCIEN", "EXTERNE"] as const

const formSchema = z.object({
  nom: z.string().min(2),
  prenom: z.string().min(2),
  telephone: z.string().regex(/^\+?[0-9]{8,15}$/, "Le numéro de téléphone n'est pas valide"),
  email: z.string().email(),
  statut: z.enum(STATUTS),
  promo: z.string().optional(),
  casquette_blanche: z.boolean().default(false),
  casquette_noire: z.boolean().default(false),
  casquette_verte: z.boolean().default(false),
  tshirt_beige: z.boolean().default(false),
  tshirt_vert: z.boolean().default(false),
  montantTotal: z.number().min(0),
})

const PRIX = {
  CASQUETTE_BLANCHE: 2000,
  CASQUETTE_NOIRE: 2000,
  CASQUETTE_VERTE: 2000,
  TSHIRT_BEIGE: 3000,
  TSHIRT_VERT: 3000,
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = formSchema.parse(body)

    // Normalisation
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.telephone.replace(/\s+/g, ''); // Suppression des espaces pour éviter les contournements

    // Anti-doublon (email + telephone) hash
    const hashStr = `${cleanEmail}-${cleanPhone}`;
    const hash = crypto.createHash('sha256').update(hashStr).digest('hex');

    // Vérifier si existant
    const existing = await prisma.participant.findUnique({
      where: { hash }
    })

    if (existing) {
      return NextResponse.json(
        { error: "Un participant avec cet email ou ce numéro existe déjà." },
        { status: 409 }
      )
    }

    // Gestion de la transaction de base de données
    const participant = await prisma.$transaction(async (tx: any) => {
      // 1. Créer le participant
      const p = await tx.participant.create({
        data: {
          nom: data.nom.toUpperCase(),
          prenom: data.prenom,
          email: cleanEmail,
          telephone: cleanPhone,
          statut: data.statut,
          promo: data.promo || null,
          hash: hash,
        }
      })

      // 2. Créer les commandes
      const commandes: any[] = []
      
      // a) Frais d'inscription (CCEE / ANCIEN) - Calculés en fonction de l'IT
      if (data.statut === "ESATIC_CCEE" || data.statut === "ANCIEN") {
        let fraisInscription = 0;
        if (data.promo) {
          const itMatch = data.promo.match(/\d+/);
          if (itMatch) {
            const it = parseInt(itMatch[0]);
            if (it === 14) fraisInscription = 5000;
            else if (it === 13) fraisInscription = 7000;
            else if (it === 12) fraisInscription = 7500;
            else if (it === 11) fraisInscription = 8000;
            else if (it === 10 || it === 9) fraisInscription = 10000;
            else if (it <= 8) fraisInscription = 10000; // Anciens
          }
        }
        if (fraisInscription > 0) {
          commandes.push({ 
            participantId: p.id, 
            article: `Frais d'inscription (${data.promo})`, 
            quantite: 1, 
            prix: fraisInscription,
            statut: "EN_ATTENTE" // Paiement en espèces auprès de la communauté
          })
        }
      }

      // c) Goodies
      if (data.casquette_blanche) commandes.push({ participantId: p.id, article: 'Casquette Blanche JDO', quantite: 1, prix: PRIX.CASQUETTE_BLANCHE, statut: "EN_ATTENTE" })
      if (data.casquette_noire) commandes.push({ participantId: p.id, article: 'Casquette Noire JDO', quantite: 1, prix: PRIX.CASQUETTE_NOIRE, statut: "EN_ATTENTE" })
      if (data.casquette_verte) commandes.push({ participantId: p.id, article: 'Casquette Verte JDO', quantite: 1, prix: PRIX.CASQUETTE_VERTE, statut: "EN_ATTENTE" })
      if (data.tshirt_beige) commandes.push({ participantId: p.id, article: 'T-Shirt Beige JDO', quantite: 1, prix: PRIX.TSHIRT_BEIGE, statut: "EN_ATTENTE" })
      if (data.tshirt_vert) commandes.push({ participantId: p.id, article: 'T-Shirt Vert JDO', quantite: 1, prix: PRIX.TSHIRT_VERT, statut: "EN_ATTENTE" })

      if (commandes.length > 0) {
        await tx.commande.createMany({ data: commandes })
      }

      // 3. Générer le QR Code & le sauvegarder SI gratuit 
      // Si c'est gratuit (Pas d'achats), on lui donne directement son QR Code.
      let qrData = null
      if (data.montantTotal === 0) {
         const protocol = req.headers.get('x-forwarded-proto') || 'http'
        const host = req.headers.get('host') || 'localhost:3000'
        const requestBaseUrl = `${protocol}://${host}`
        
        qrData = await generateParticipantQR(p.id, p.email, p.statut, requestBaseUrl)
         await tx.participant.update({
            where: { id: p.id },
            data: { qrToken: qrData.token }
         })
      }

      return { ...p, qrData }
    })

    // Auto-login: Set session cookie
    const token = jwt.sign(
      { id: participant.id, email: participant.email, statut: participant.statut },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    ;(await cookies()).set('participant_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return NextResponse.json({ 
      success: true, 
      participantId: participant.id, 
      montantTotal: data.montantTotal,
      qrData: participant.qrData // Sera null si un paiement est attendu
    }, { status: 201 })

  } catch (error: any) {
    console.error("Erreur Inscription:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
