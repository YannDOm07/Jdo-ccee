import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'Jardin des Oliviers 2026'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0D1A09',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #1B3A1F 0%, #0D1A09 100%)', zIndex: -1 }} />
        
        {/* Logo Equivalent */}
        <div style={{
          display: 'flex',
          width: 200,
          height: 200,
          borderRadius: 100,
          border: '4px solid rgba(200,153,42,0.3)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 40,
        }}>
          <span style={{ color: '#C8992A', fontSize: 60, fontStyle: 'italic', fontWeight: 'bold' }}>JO</span>
        </div>

        <h1 style={{ color: '#ffffff', fontSize: 80, margin: 0, marginBottom: 10, letterSpacing: -2 }}>
          Jardin des Oliviers
        </h1>
        
        <p style={{ color: '#C8992A', fontSize: 32, margin: 0, fontStyle: 'italic' }}>
          24 Mai 2026 — CCEE ESATIC
        </p>

        {/* Decorative elements */}
        <div style={{ position: 'absolute', bottom: 40, display: 'flex', width: '100%', justifyContent: 'center' }}>
          <div style={{ background: '#C8992A', height: 2, width: 120 }} />
        </div>
      </div>
    ),
    { ...size }
  )
}
