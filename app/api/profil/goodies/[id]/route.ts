import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_only_for_dev';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = (await cookies()).get("participant_token")?.value;
    if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const payload: any = jwt.verify(token, JWT_SECRET);
    const { id: commandeId } = await params;

    // Vérifier que la commande appartient bien à ce participant
    const commande = await prisma.commande.findUnique({
      where: { id: commandeId }
    });

    if (!commande) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    if (commande.participantId !== payload.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Seules les commandes EN_ATTENTE peuvent être supprimées
    if (commande.statut !== "EN_ATTENTE") {
      return NextResponse.json({ error: "Impossible de supprimer une commande déjà payée" }, { status: 400 });
    }

    await prisma.commande.delete({
      where: { id: commandeId }
    });

    return NextResponse.json({ success: true, message: "Commande supprimée" });
  } catch (e) {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
