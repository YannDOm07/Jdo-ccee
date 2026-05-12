import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { StatutPaiement } from "@prisma/client"
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

    // Gestion de la transaction de base de données - Optimisée pour réduire la latence
    const participant = await prisma.participant.create({
      data: {
        nom: data.nom.toUpperCase(),
        prenom: data.prenom,
        email: cleanEmail,
        telephone: cleanPhone,
        statut: data.statut,
        promo: data.promo || null,
        hash: hash,
        commandes: {
          create: [
            // Frais d'inscription (CCEE / ANCIEN)
            ...((data.statut === "ESATIC_CCEE" || data.statut === "ANCIEN") && data.promo ? (() => {
              const itMatch = data.promo.match(/\d+/);
              if (itMatch) {
                const it = parseInt(itMatch[0]);
                let prix = it <= 8 ? 10000 : it === 14 ? 5000 : it === 13 ? 7000 : it === 12 ? 7500 : it === 11 ? 8000 : 10000;
                return [{ article: `Frais d'inscription (${data.promo})`, quantite: 1, prix, statut: StatutPaiement.EN_ATTENTE }];
              }
              return [];
            })() : []),
            // Goodies
            ...(data.casquette_blanche ? [{ article: 'Casquette Blanche JDO', quantite: 1, prix: PRIX.CASQUETTE_BLANCHE, statut: StatutPaiement.EN_ATTENTE }] : []),
            ...(data.casquette_noire ? [{ article: 'Casquette Noire JDO', quantite: 1, prix: PRIX.CASQUETTE_NOIRE, statut: StatutPaiement.EN_ATTENTE }] : []),
            ...(data.casquette_verte ? [{ article: 'Casquette Verte JDO', quantite: 1, prix: PRIX.CASQUETTE_VERTE, statut: StatutPaiement.EN_ATTENTE }] : []),
            ...(data.tshirt_beige ? [{ article: 'T-Shirt Beige JDO', quantite: 1, prix: PRIX.TSHIRT_BEIGE, statut: StatutPaiement.EN_ATTENTE }] : []),
            ...(data.tshirt_vert ? [{ article: 'T-Shirt Vert JDO', quantite: 1, prix: PRIX.TSHIRT_VERT, statut: StatutPaiement.EN_ATTENTE }] : []),
          ]
        }
      },
      include: {
        commandes: true
      }
    })

    // 3. Générer le QR Code & le sauvegarder SI gratuit (opération asynchrone mais locale)
    let qrData = null
    if (data.montantTotal === 0) {
      const protocol = req.headers.get('x-forwarded-proto') || 'http'
      const host = req.headers.get('host') || 'localhost:3000'
      const requestBaseUrl = `${protocol}://${host}`
      
      qrData = await generateParticipantQR(participant.id, participant.email, participant.statut, requestBaseUrl)
      
      // Mise à jour finale du token (un seul petit appel)
      await prisma.participant.update({
        where: { id: participant.id },
        data: { qrToken: qrData.token }
      })
    }

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
      qrData: participant.qrToken // Sera null si un paiement est attendu
    }, { status: 201 })

  } catch (error: any) {
    console.error("Erreur Inscription:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
