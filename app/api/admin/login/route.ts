import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_only_for_dev'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const validPassword = process.env.ADMIN_PASSWORD || 'jdo_admin_2026@'

    if (password === validPassword) {
      // Sign JWT for admin
      const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
      
      cookies().set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      })
      
      return NextResponse.json({ success: true, message: 'Connexion réussie' })
    }

    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 })
  }
}

