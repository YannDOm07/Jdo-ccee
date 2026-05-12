"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { DigitalTicket } from "@/components/DigitalTicket";
import { Download, ChevronLeft } from "lucide-react";

export default function BilletPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  
  const [participant, setParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We decode the JWT payload to get the participantId
    try {
      if (!token) return;
      
      // Simple base64 decode of jwt payload just to extract ID without secret
      const payloadB64 = token.split('.')[1];
      const payloadStr = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadStr);
      
      const id = payload.participantId || payload.id;
      
      fetch(`/api/billet?id=${id}`)
        .then(res => res.json())
        .then(data => {
          setParticipant(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [token]);

  const handleDownloadPDF = async () => {
    if (!ticketRef.current || !participant) return;
    setIsDownloading(true);

    try {
      const element = ticketRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true, 
        allowTaint: true,
        backgroundColor: '#0D1A09' // matches Ticket bg
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Calculate A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgRatio = canvas.width / canvas.height;
      const pdfRatio = pdfWidth / pdfHeight;
      
      let finalWidth = pdfWidth;
      let finalHeight = finalWidth / imgRatio;
      
      if (finalHeight > pdfHeight) {
        finalHeight = pdfHeight;
        finalWidth = finalHeight * imgRatio;
      }
      
      // Center the image
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
      pdf.save(`Billet_JDO_2026_${participant.nom}_${participant.prenom}.pdf`);
      
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const qrUrl = typeof window !== 'undefined' 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + '/billet/' + token)}&color=1B3A1F&bgcolor=ffffff`
    : '';

  if (loading) {
    return <div className="min-h-screen bg-[var(--ink)] flex items-center justify-center text-[var(--gold)]">Chargement...</div>;
  }

  if (!participant) {
    return (
      <div className="min-h-screen bg-[var(--ink)] flex items-center justify-center flex-col text-white p-6">
        <h1 className="text-2xl font-display mb-4">Billet Introuvable</h1>
        <button onClick={() => router.push('/')} className="text-[var(--gold)] underline">Retourner à l'accueil</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1407] flex flex-col items-center py-10 px-4">
      
      <button 
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 text-white/50 hover:text-[var(--gold)] transition-colors flex items-center gap-2"
      >
        <ChevronLeft size={20} /> Retour
      </button>

      <div className="text-center mb-8">
        <h1 className="font-display text-4xl text-[var(--gold)] mb-2">Billet Virtuel</h1>
        <p className="font-body text-white/60">Présentez ce code à l'entrée ou téléchargez-le.</p>
      </div>

      <div className="relative shadow-2xl shadow-black/50 overflow-hidden" style={{ width: '100%', maxWidth: '400px' }}>
        {/* We transform the 800px component to fit on mobile screens purely via css scale so it looks perfect! */}
        <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '800px', height: '1130px' }}>
          <DigitalTicket ref={ticketRef} participant={participant} qrUrl={qrUrl} />
        </div>
        <div style={{ height: '565px' /* half of 1130px */ }} /> 
      </div>

      <button 
        onClick={handleDownloadPDF} 
        disabled={isDownloading}
        className="mt-10 bg-[var(--gold)] text-black px-8 py-4 font-bold uppercase tracking-[2px] rounded-sm flex items-center gap-3 hover:bg-white transition-colors"
      >
        <Download size={20} />
        {isDownloading ? "Génération en cours..." : "Télécharger mon PDF"}
      </button>

    </div>
  );
}
