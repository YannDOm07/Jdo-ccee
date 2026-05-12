import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic' // Évite la mise en cache agressive

export async function GET() {
  try {
    const goodies = await prisma.goodie.findMany({
      where: {
        actif: true
      },
      orderBy: {
        prix: 'desc' // Optional ordering, or by name
      }
    })

    return NextResponse.json({ goodies })
  } catch (error) {
    console.error("Error fetching goodies:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
