import QRCode from 'qrcode'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_only_for_dev'

export async function generateParticipantQR(
  participantId: string, 
  email: string, 
  statut: string
) {
  // Create signed JWT
  const token = jwt.sign(
    { participantId, email, statut },
    JWT_SECRET,
    { expiresIn: '90d' }
  )

  // Generate Base64 QR code from the token
  const qrCodeDataUrl = await QRCode.toDataURL(token, {
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
