import QRCode from 'qrcode'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_only_for_dev'

export async function generateParticipantQR(
  participantId: string, 
  email: string, 
  statut: string,
  requestBaseUrl?: string
) {
  // Create signed JWT
  const token = jwt.sign(
    { participantId, email, statut },
    JWT_SECRET,
    { expiresIn: '90d' }
  )

  const resolvedBaseUrl = requestBaseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const scanUrl = `${resolvedBaseUrl}/billet/${token}`

  // Generate Base64 QR code from the scan URL
  const qrCodeDataUrl = await QRCode.toDataURL(scanUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })

  return { token, qrCodeDataUrl }
}

export function verifyParticipantToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}
