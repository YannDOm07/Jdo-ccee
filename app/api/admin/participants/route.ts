import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { generateParticipantQR } from "@/lib/qrcode";
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_only_for_dev';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify admin session
    const cookieStore = cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Session expirée" }, { status: 401 });
    }

    const body = await req.json();
    const { nom, prenom, email, telephone, statut, promo, casquette_blanche, casquette_noire, casquette_verte, tshirt_beige, tshirt_vert } = body;

    // Helper calculate registration fee (en fonction de la promotion IT)
    const calculateRegistrationFee = (p: string | null) => {
      if (!p) return 0;
      const it = parseInt(p.replace(/[^0-9]/g, ''));
      if (it === 14) return 5000;
      if (it === 13) return 7000;
      if (it === 12) return 7500;
      if (it === 11) return 8000;
      if (it === 10 || it === 9) return 10000;
      if (it <= 8) return 10000; // Minimum 10.000
      return 0;
    };

    // Normalisation
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = telephone.replace(/\s+/g, ''); // Suppression des espaces pour éviter les contournements

    // Anti-doublon hash
    const hashStr = `${cleanEmail}-${cleanPhone}`;
    const hash = crypto.createHash('sha256').update(hashStr).digest('hex');

    // Vérifier si existant
    const existing = await prisma.participant.findUnique({ where: { hash } });
    if (existing) {
      return NextResponse.json({ error: "Ce participant existe déjà." }, { status: 409 });
    }

    const participant = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Créer le participant
      const p = await tx.participant.create({
        data: {
          nom: nom.toUpperCase(),
          prenom: prenom,
          email: cleanEmail,
          telephone: cleanPhone,
          statut: statut,
          promo: promo || null,
          hash: hash,
        }
      });

      // 2. Créer les commandes
      const PRIX = { CASQUETTE_BLANCHE: 2000, CASQUETTE_NOIRE: 2000, CASQUETTE_VERTE: 2000, TSHIRT_BEIGE: 3000, TSHIRT_VERT: 3000 };

      // --- Commandes payées en ESPÈCES (inscription uniquement) ---
      const commandesCash: { participantId: string; article: string; quantite: number; prix: number }[] = [];

      // Frais d'inscription (basé sur la promo IT pour CCEE/ANCIEN)
      const regFee = calculateRegistrationFee(promo);
      if (regFee > 0) {
        commandesCash.push({ participantId: p.id, article: "Frais d'inscription", quantite: 1, prix: regFee });
      }

      // --- Commandes GOODIES (restent EN_ATTENTE, à payer via Wave) ---
      const commandesGoodies: { participantId: string; article: string; quantite: number; prix: number }[] = [];
      if (casquette_blanche) commandesGoodies.push({ participantId: p.id, article: 'Casquette Blanche JDO', quantite: 1, prix: PRIX.CASQUETTE_BLANCHE });
      if (casquette_noire) commandesGoodies.push({ participantId: p.id, article: 'Casquette Noire JDO', quantite: 1, prix: PRIX.CASQUETTE_NOIRE });
      if (casquette_verte) commandesGoodies.push({ participantId: p.id, article: 'Casquette Verte JDO', quantite: 1, prix: PRIX.CASQUETTE_VERTE });
      if (tshirt_beige) commandesGoodies.push({ participantId: p.id, article: 'T-Shirt Beige JDO', quantite: 1, prix: PRIX.TSHIRT_BEIGE });
      if (tshirt_vert) commandesGoodies.push({ participantId: p.id, article: 'T-Shirt Vert JDO', quantite: 1, prix: PRIX.TSHIRT_VERT });

      // Créer les commandes cash comme PAYÉES
      if (commandesCash.length > 0) {
        await tx.commande.createMany({
          data: commandesCash.map(c => ({ ...c, statut: "PAYE" }))
        });
      }

      // Créer les commandes goodies comme EN_ATTENTE
      if (commandesGoodies.length > 0) {
        await tx.commande.createMany({
          data: commandesGoodies // statut par défaut EN_ATTENTE dans le schéma
        });
      }

      const totalCash = commandesCash.reduce((sum, c) => sum + c.prix, 0);

      // 3. Créer le paiement en espèces (seulement pour l'inscription/T-shirt)
      if (totalCash > 0) {
        await tx.paiement.create({
          data: {
            participantId: p.id,
            montant: totalCash,
            operateur: "ESPECES",
            transactionId: `CASH-${p.id.substring(0, 8)}-${Date.now()}`,
            statut: "PAYE"
          }
        });
      }

      // 4. Générer le QR Code
      const protocol = req.headers.get('x-forwarded-proto') || 'http'
      const host = req.headers.get('host') || 'localhost:3000'
      const requestBaseUrl = `${protocol}://${host}`
      
      const qrData = await generateParticipantQR(p.id, p.email, p.statut, requestBaseUrl);
      const updated = await tx.participant.update({
        where: { id: p.id },
        data: { qrToken: qrData.token }
      });

      return updated;
    });

    return NextResponse.json({ success: true, participant });
  } catch (error: any) {
    console.error("Manual registration error:", error);
    return NextResponse.json({ error: "Erreur lors de l'inscription manuelle" }, { status: 500 });
  }
}
