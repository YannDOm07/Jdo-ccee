"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Download, Share2, ArrowRight } from "lucide-react";
import { FloatingLeaves } from "@/components/FloatingLeaves";
import { DigitalTicket } from "@/components/DigitalTicket";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [stage, setStage] = useState(0);
  const [participant, setParticipant] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animation Sequence Engine
    const seq = async () => {
      // Stage 0: Black background (initial)
      await new Promise(r => setTimeout(r, 500));
      
      // Stage 1: Reveal Background & trigger confetti
      setStage(1);
      
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#C8992A', '#E8C060', '#ffffff', '#1B3A1F'] }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#C8992A', '#E8C060', '#ffffff', '#1B3A1F'] }));
      }, 250);

      await new Promise(r => setTimeout(r, 1000));
      setStage(2); // Checkmark + Title
      
      await new Promise(r => setTimeout(r, 1000));
      setStage(3); // QR Code Card
    };

    seq();

    // Fetch details
    if (id) {
      fetch(`/api/billet?id=${id}`)
        .then(res => res.json())
        .then(data => setParticipant(data))
        .catch(err => console.error("Failed to load ticket", err));
    }
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!ticketRef.current || !participant) return;
    setIsDownloading(true);

    try {
      const element = ticketRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true, 
        allowTaint: true,
        backgroundColor: '#0D1A09'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const shareText = participant 
          ? "Je serai au Jardin des Oliviers 2026 ! Rejoins-moi, je suis inscrit sous le nom de " + participant.nom + " " + participant.prenom + "."
          : "Je serai au Jardin des Oliviers 2026 ! Rejoins-moi.";
        
        await navigator.share({
          title: "Mon Billet JDO 2026",
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    }
  };

  const getQRUrl = () => {
    if (participant?.qrToken) {
      // Create absolute URL for the scanner
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://jdo2026.com';
      const scanUrl = `${baseUrl}/scan/${participant.qrToken}`;
      return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(scanUrl)}&color=1B3A1F&bgcolor=ffffff`;
    }
    // Fallback exactly like before
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${id || 'GUEST'}&color=1B3A1F&bgcolor=ffffff`;
  };

  const getTicketStatus = () => {
    if (!participant) return { label: '...', className: 'bg-gray-100 text-gray-500' };
    
    // Check if free (Étudiant CCEE sans goodies ou avec tous les paiements confirmés)
    if (participant.statut === 'ESATIC_CCEE' || participant.statut === 'ANCIEN') {
       const unpaid = participant.commandes?.some((c: any) => c.statut === 'EN_ATTENTE');
       if (unpaid) return { label: 'À FINALISER', className: 'bg-[rgba(200,153,42,0.1)] text-[var(--gold)]' };
       return { label: 'VALIDÉ', className: 'bg-[rgba(123,174,131,0.1)] text-[var(--forest)]' };
    }
    
    // External depends on payments
    const hasPaid = participant.paiements?.some((p: any) => p.statut === 'PAYE');
    if (hasPaid) return { label: 'PAYÉ', className: 'bg-[rgba(123,174,131,0.1)] text-[var(--forest)]' };
    return { label: 'À PAYER', className: 'bg-[rgba(200,153,42,0.1)] text-[var(--gold)]' };
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-1000 ${stage === 0 ? "bg-black" : "bg-[var(--cream)]"}`}>
      
      {/* Background Decor */}
      {stage > 0 && (
        <>
          <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-white to-[var(--cream)] pointer-events-none" />
          <FloatingLeaves />
        </>
      )}

      <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center">
        
        {/* Hidden Ticket for PDF Export */}
        <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
          <DigitalTicket ref={ticketRef} participant={participant} qrUrl={getQRUrl()} />
        </div>

        {/* Animated Checkmark */}
        <div className={`mb-8 transition-all duration-1000 transform ${stage >= 2 ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
          <svg className="w-24 h-24" viewBox="0 0 52 52">
            <circle className="check-circle" cx="26" cy="26" r="25" fill="none" stroke="var(--forest)" strokeWidth="1" />
            <path className="check-path" fill="none" stroke="var(--forest)" strokeWidth="2" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        {/* Title Reveal */}
        <div className={`text-center mb-12 overflow-hidden transition-all duration-1000 delay-300 ${stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-[var(--ink)] mb-4">
            {participant ? (
              <>
                 Bienvenue <span className="text-[var(--gold)] italic">{participant.prenom}</span>
              </>
            ) : (
              <>
                 Bienvenue au <span className="text-[var(--gold)] italic">Jardin</span> !
              </>
            )}
          </h1>
          <p className="font-accent text-[var(--moss)] text-lg">
            Votre inscription est enregistrée. Préparez votre cœur.
          </p>
        </div>

        {/* QR Code Card */}
        <div 
          className={`w-full bg-white p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-[var(--mist)] flex flex-col items-center text-center transition-all duration-1000 delay-700 spring-bounce ${stage >= 3 ? "translate-y-0 opacity-100 scale-100 rotate-0" : "translate-y-20 opacity-0 scale-75 -rotate-6"}`}
        >
          {/* Logo Watermark */}
          <div className="absolute top-4 left-4 opacity-10">
            <span className="font-display italic text-4xl text-[var(--gold)]">JO</span>
          </div>

          <p className="font-body text-[10px] uppercase tracking-widest text-[#A8BCA9] mb-8">
            Billet Officiel
          </p>

          <div className="w-[200px] h-[200px] border-2 border-[var(--mist)] bg-white p-2 mb-8 relative">
            <Image
              src={getQRUrl()}
              alt="QR Code Billet"
              fill
              className="object-contain"
              unoptimized // External API
            />
          </div>

          {participant ? (
            <>
              <h2 className="font-display text-3xl text-[var(--ink)] mb-1 uppercase tracking-tight">
                {participant.nom} {participant.prenom}
              </h2>
              <p className="font-body text-xs text-[var(--moss)] uppercase tracking-[3px] mb-4">
                {participant.statut === "ESATIC_CCEE" ? "ÉTUDIANT CCEE" + (participant.promo ? " (" + participant.promo + ")" : "") : 
                 participant.statut === "ANCIEN" ? "ANCIEN DE L'ESATIC" + (participant.promo ? " (" + participant.promo + ")" : "") : 
                 "PARTICIPANT EXTERNE"}
              </p>
              <span className={`inline-block px-3 py-1 text-[10px] uppercase tracking-wider font-bold mb-10 ${getTicketStatus().className}`}>
                {getTicketStatus().label}
              </span>
            </>
          ) : (
            <>
              <h2 className="font-display text-2xl text-[var(--ink)] mb-3 opacity-50">Chargement...</h2>
              <div className="h-6" />
            </>
          )}

          <div className="w-full flex gap-4">
            <button 
              onClick={handleDownloadPDF} 
              disabled={isDownloading || !participant}
              className="flex-1 btn-primary !py-4 magnetic group/dl disabled:opacity-50"
            >
              <Download size={16} className={`relative z-10 transition-transform ${isDownloading ? 'animate-bounce' : 'group-hover/dl:-translate-y-1'}`} />
              <span className="relative z-10 hidden md:inline">
                {isDownloading ? "Génération..." : "Télécharger"}
              </span>
            </button>
            <button onClick={handleShare} disabled={!participant} className="flex-1 btn-ghost !py-4 !border-[var(--mist)] !text-[var(--forest)] hover:!border-[var(--gold)] magnetic group/sh disabled:opacity-50">
              <Share2 size={16} className="relative z-10 transition-transform group-hover/sh:rotate-12" />
              <span className="relative z-10 hidden md:inline">Partager</span>
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className={`mt-12 w-full flex flex-col gap-4 transition-all duration-1000 delay-1000 ${stage >= 3 ? "opacity-100" : "opacity-0"}`}>
          <Link href="/profil" className="w-full bg-[var(--forest)] text-[var(--gold)] px-8 py-4 text-xs font-bold uppercase tracking-[3px] flex items-center justify-center gap-2 hover:bg-[var(--gold)] hover:text-[var(--forest)] transition-all">
             Mon Profil <ArrowRight size={16} />
          </Link>
          <Link href="/" className="w-full font-body text-xs font-medium uppercase tracking-[3px] text-[var(--moss)] hover:text-[var(--gold)] transition-colors flex items-center justify-center gap-2 py-4">
            Retour à l'accueil
          </Link>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .check-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .check-path {
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
        }
        @keyframes stroke {
          100% { stroke-dashoffset: 0; }
        }
        .spring-bounce {
          transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}} />
    </div>
  );
}
