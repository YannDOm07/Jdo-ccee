import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_only_for_dev';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Verify admin session
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Session expirée" }, { status: 401 });
    }

    // 2. Delete participant and associated data (Prisma will handle cascades if configured, 
    // but we'll do it manually to be safe or if not configured)
    await prisma.$transaction([
      prisma.commande.deleteMany({ where: { participantId: id } }),
      prisma.paiement.deleteMany({ where: { participantId: id } }),
      prisma.participant.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
