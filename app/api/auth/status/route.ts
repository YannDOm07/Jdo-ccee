import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_only_for_dev'

export async function GET() {
  try {
    const token = cookies().get("participant_token")?.value

    if (!token) {
      return NextResponse.json({ loggedIn: false })
    }

    const payload: any = jwt.verify(token, JWT_SECRET)

    return NextResponse.json({
      loggedIn: true,
      prenom: payload.email ? undefined : undefined, // We only have id, email, statut in token
      id: payload.id,
      statut: payload.statut
    })
  } catch {
    return NextResponse.json({ loggedIn: false })
  }
}
