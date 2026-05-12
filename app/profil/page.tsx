import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import QRCode from 'qrcode'
import Link from "next/link"
import { ProfilClient } from "./ProfilClient"

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_only_for_dev'

export default async function ProfilPage() {
  const token = (await cookies()).get("participant_token")?.value

  if (!token) {
    redirect("/connexion")
  }

  let payload: any
  try {
    payload = jwt.verify(token, JWT_SECRET)
  } catch (e) {
    redirect("/connexion")
  }

  const participant = await prisma.participant.findUnique({
    where: { id: payload.id },
    include: {
      commandes: true,
      paiements: true
    }
  })

  if (!participant) {
    redirect("/connexion")
  }

  // Generate QR Code Data URL if token exists
  let qrCodeUrl = ""
  if (participant.qrToken) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const scanUrl = `${baseUrl}/scan/${participant.qrToken}`
    qrCodeUrl = await QRCode.toDataURL(scanUrl, {
      margin: 1,
      color: { dark: '#1B3A1F', light: '#ffffff' }
    })
  }

  return <ProfilClient participant={participant} qrCodeUrl={qrCodeUrl} />
}
