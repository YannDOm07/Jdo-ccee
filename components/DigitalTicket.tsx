"use client";

import React from 'react';

// We inline styles so html2canvas doesn't struggle with external CSS classes sometimes
export const DigitalTicket = React.forwardRef<HTMLDivElement, { participant: any, qrUrl: string }>(({ participant, qrUrl }, ref) => {
  return (
    <div 
      ref={ref}
      style={{
        width: '800px',
        height: '1130px', // A4 proportion approx
        position: 'relative',
        backgroundColor: '#0D1A09', // var(--ink)
        overflow: 'hidden',
        color: '#FFFFFF',
        fontFamily: 'sans-serif'
      }}
    >
      {/* Rich CSS Gradient Background */}
      <div 
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(135deg, #0a1407 0%, #152912 40%, #0d1a09 100%)',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 10%, rgba(232, 192, 96, 0.1) 0%, transparent 60%)'
        }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, padding: '80px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', whiteSpace: 'nowrap', fontStyle: 'italic', fontSize: '100px', color: '#E8C060', margin: 0, fontWeight: 300, letterSpacing: '-5px' }}>
             JDO
          </h1>
          <p style={{ letterSpacing: '8px', fontSize: '16px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginTop: '20px' }}>
            Billet Officiel
          </p>
        </div>

        {/* Big Text */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <h2 style={{ fontFamily: 'sans-serif', fontWeight: 900, fontSize: '64px', margin: 0, lineHeight: 1.1, letterSpacing: '-2px' }}>
            JARDIN <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#E8C060', fontWeight: 400 }}>des</span> OLIVIERS
          </h2>
          <p style={{ marginTop: '20px', fontSize: '24px', color: '#A8BCA9', letterSpacing: '4px', textTransform: 'uppercase' }}>
            — 24 Mai 2026, Abidjan —
          </p>
        </div>

        <div style={{ flex: 1 }} />

        {/* J'y Serai message */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
           <h3 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '48px', color: '#E8C060', margin: 0 }}>
             Je serai de la partie !
           </h3>
           <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)', marginTop: '16px' }}>
             Un moment de prière, de fraternité et de lumière.
           </p>
        </div>

        {/* Ticket Details Box */}
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          backdropFilter: 'blur(20px)', 
          border: '1px solid rgba(232, 192, 96, 0.3)',
          padding: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '40px'
        }}>
          {/* QR Code */}
          <div style={{ background: '#FFF', padding: '10px', width: '220px', height: '220px' }}>
            <img src={qrUrl} alt="QR" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          {/* User Info */}
          <div>
            <p style={{ letterSpacing: '4px', fontSize: '14px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
              Participant
            </p>
            <h4 style={{ fontSize: '42px', fontWeight: 700, margin: 0, textTransform: 'uppercase', lineHeight: 1.2 }}>
              {participant?.nom} {participant?.prenom}
            </h4>
            <p style={{ marginTop: '16px', fontSize: '18px', color: '#E8C060', letterSpacing: '2px', textTransform: 'uppercase' }}>
              {participant?.statut === "ESATIC_CCEE" ? "Étudiant CCEE" + (participant?.promo ? " (" + participant.promo + ")" : "") : 
               participant?.statut === "ANCIEN" ? "Ancien ESATIC" + (participant?.promo ? " (" + participant.promo + ")" : "") : 
               "Externe"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
});

DigitalTicket.displayName = 'DigitalTicket';
