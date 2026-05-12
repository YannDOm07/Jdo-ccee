import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_only_for_dev'

export async function PUT(request: Request) {
  try {
    const token = (await cookies()).get("participant_token")?.value
    if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const payload: any = jwt.verify(token, JWT_SECRET)
    const { nom, prenom } = await request.json()

    if (!nom || !prenom) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 })
    }

    const updated = await prisma.participant.update({
      where: { id: payload.id },
      data: { nom, prenom }
    })

    return NextResponse.json({ success: true, participant: updated })
  } catch (e) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}
