import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { generateParticipantQR } from "@/lib/qrcode";

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_only_for_dev';

export async function PUT(req: NextRequest) {
  try {
    // 1. Verify admin session
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Session expirée" }, { status: 401 });
    }

    const body = await req.json();
    const { paiementId, action } = body; // action: "CONFIRMER" | "REJETER"

    if (!paiementId || !["CONFIRMER", "REJETER"].includes(action)) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    const paiement = await prisma.paiement.findUnique({
      where: { id: paiementId },
      include: { participant: { include: { commandes: true } } }
    });

    if (!paiement) {
      return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });
    }

    if (paiement.statut !== "EN_ATTENTE") {
      return NextResponse.json({ error: "Ce paiement a déjà été traité" }, { status: 400 });
    }

    if (action === "CONFIRMER") {
      // Confirmer le paiement: marquer le paiement et toutes les commandes EN_ATTENTE comme PAYÉ
      await prisma.$transaction(async (tx: any) => {
        // 1. Passer le paiement en PAYE
        await tx.paiement.update({
          where: { id: paiementId },
          data: { statut: "PAYE" }
        });

        // 2. Passer toutes les commandes EN_ATTENTE de ce participant en PAYE
        await tx.commande.updateMany({
          where: {
            participantId: paiement.participantId,
            statut: "EN_ATTENTE"
          },
          data: { statut: "PAYE" }
        });

        // 3. Générer/activer le QR Code si pas encore fait
        const participant = paiement.participant;
        if (!participant.qrToken) {
          const protocol = req.headers.get('x-forwarded-proto') || 'http'
          const host = req.headers.get('host') || 'localhost:3000'
          const requestBaseUrl = `${protocol}://${host}`
          
          const qrData = await generateParticipantQR(participant.id, participant.email, participant.statut, requestBaseUrl);
          await tx.participant.update({
            where: { id: participant.id },
            data: { qrToken: qrData.token }
          });
        }
      });

      return NextResponse.json({ success: true, message: "Paiement confirmé. QR Code activé." });

    } else {
      // Rejeter le paiement: marquer comme REJETE
      // Utilisation d'une requête brute pour contourner le cache Prisma du serveur de dev
      await prisma.$executeRawUnsafe(`UPDATE "Paiement" SET "statut" = 'REJETE' WHERE "id" = $1`, paiementId);

      return NextResponse.json({ success: true, message: "Paiement rejeté." });
    }

  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
