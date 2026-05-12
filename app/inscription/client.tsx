"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X as XIcon, ChevronDown, ArrowRight } from "lucide-react";
import { useLocomotiveScroll } from "@/hooks/useLocomotiveScroll";
import { useAuth } from "@/contexts/AuthContext";

type InscriptionStatus = "CCEE" | "ANCIEN" | "EXTERNE";

export function InscriptionClient() {
  useLocomotiveScroll();
  const router = useRouter();
  const { setLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showDesktopNotice, setShowDesktopNotice] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    statut: "" as InscriptionStatus | "",
    promo: "",
  });
  const [promoDropdownOpen, setPromoDropdownOpen] = useState(false);

  // UI State
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    setMounted(true);
    
    // Date de l'événement: 24 Mai 2026
    const eventDate = new Date("2026-05-24T00:00:00").getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = eventDate - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        });
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  const total = 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "nom" || name === "prenom") {
      formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }
    
    // Telephone auto-format loosely
    if (name === "telephone") {
      formattedValue = value.replace(/[^\d+ ]/g, "");
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const validateEmail = (email: string) => {
    if (!email) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isMobile = () => {
    if (typeof window === "undefined") return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  };

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Check if external and on Desktop
    if (formData.statut === "EXTERNE" && !isMobile() && !showDesktopNotice) {
      setShowDesktopNotice(true);
      return;
    }

    setLoading(true);

    try {
      const dbStatus = formData.statut === "CCEE" ? "ESATIC_CCEE" : formData.statut === "ANCIEN" ? "ANCIEN" : "EXTERNE";

      const response = await fetch("/api/inscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          email: formData.email,
          statut: dbStatus,
          promo: formData.promo || undefined,
          montantTotal: total,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Fix for [object Object] error: handle both string and object error responses
        const errorMsg = result.error ? (typeof result.error === 'object' ? JSON.stringify(result.error) : result.error) : "Erreur d'inscription";
        throw new Error(errorMsg);
      }

      toast.success("Inscription réussie !");
      setLoggedIn(true);
      
      if (total > 0) {
        if (isMobile()) {
          // Direct Wave redirect on mobile
          window.location.href = "https://pay.wave.com/m/M_ci_P2KvInolTvzh/c/ci/";
        } else {
          router.push(`/paiement?participantId=${result.participantId || result.id}`);
        }
      } else {
        router.push(`/confirmation?id=${result.participantId || result.id}`);
      }
      
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const emailIsValid = validateEmail(formData.email);

  return (
    <div className="flex flex-col lg:flex-row min-h-[100svh] bg-[var(--cream)]" data-scroll-container>
      {/* ── Left Panel (Dark) ── */}
      <div className="lg:w-1/2 relative bg-[var(--ink)] overflow-hidden lg:h-[100svh] h-[40svh] flex flex-col justify-between p-8 md:p-12 z-10 lg:fixed lg:top-0 lg:left-0">
        <div className="absolute inset-0 pointer-events-none z-0 bg-[var(--ink)]">
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #0a1407 0%, #152912 40%, #0d1a09 100%)',
              opacity: 0.6
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] to-transparent opacity-80" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="font-display italic text-2xl text-[var(--gold)] magnetic inline-block mb-12 lg:mb-0">
            JDO
          </Link>
          
          <div className="hidden lg:block mt-32">
            <h1 className="font-display text-5xl xl:text-7xl text-white leading-tight">
              <span className="block" style={{ animation: mounted ? "revealUp 1s cubic-bezier(0.16,1,0.3,1) forwards" : "", opacity: 0, transform: "translateY(50%)" }}>Rejoignez</span>
              <span className="block italic text-[var(--gold)]" style={{ animation: mounted ? "revealUp 1s cubic-bezier(0.16,1,0.3,1) forwards 0.2s" : "", opacity: 0, transform: "translateY(50%)" }}>le Jardin</span>
            </h1>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-sm mt-auto">
          <div className="bg-white/5 backdrop-blur-md border border-[var(--gold)]/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="animate-pulse">⏳</span>
              <span className="font-body text-sm font-medium text-[var(--gold)] uppercase tracking-[2px]">Le grand jour approche</span>
            </div>
            
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-col items-center">
                <span className="font-display text-4xl text-white">{timeLeft.days}</span>
                <span className="font-body text-[10px] uppercase tracking-widest text-[#A8BCA9] mt-1">Jours</span>
              </div>
              <span className="font-display text-2xl text-[var(--gold)]/50 pb-4">:</span>
              <div className="flex flex-col items-center">
                <span className="font-display text-4xl text-white">{timeLeft.hours}</span>
                <span className="font-body text-[10px] uppercase tracking-widest text-[#A8BCA9] mt-1">Heures</span>
              </div>
              <span className="font-display text-2xl text-[var(--gold)]/50 pb-4">:</span>
              <div className="flex flex-col items-center">
                <span className="font-display text-4xl text-white">{timeLeft.minutes}</span>
                <span className="font-body text-[10px] uppercase tracking-widest text-[#A8BCA9] mt-1">Min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] p-6 md:p-12 lg:p-20 relative z-20 flexflex-col pt-12 lg:pt-20">
        <div className="max-w-md mx-auto w-full pb-48">
          
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl text-[var(--ink)] mb-2">Vos coordonnées</h2>
              <p className="font-body text-[var(--moss)] text-sm">Remplissez ces informations avec la plus grande précision.</p>
            </div>
            <Link href="/connexion" className="text-xs font-body font-medium uppercase tracking-[2px] text-[var(--forest)] border-b border-[var(--forest)] pb-0.5 hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors self-start md:self-auto">
              Déjà inscrit ? Se connecter
            </Link>
          </div>

          <form onSubmit={handleFinalSubmit} className="space-y-8">
            
            {/* Nom & Prénom */}
            <div className="grid grid-cols-2 gap-6">
              <div className="input-float-wrapper">
                <input 
                  type="text" 
                  name="nom" 
                  id="nom" 
                  required 
                  className="input-float" 
                  placeholder=" " 
                  value={formData.nom}
                  onChange={handleInputChange}
                />
                <label htmlFor="nom" className="label-float">Nom</label>
              </div>
              <div className="input-float-wrapper">
                <input 
                  type="text" 
                  name="prenom" 
                  id="prenom" 
                  required 
                  className="input-float" 
                  placeholder=" " 
                  value={formData.prenom}
                  onChange={handleInputChange}
                />
                <label htmlFor="prenom" className="label-float">Prénom</label>
              </div>
            </div>

            {/* Email */}
            <div className="input-float-wrapper relative">
              <input 
                type="email" 
                name="email" 
                id="email" 
                required 
                className="input-float pr-10" 
                placeholder=" " 
                value={formData.email}
                onChange={handleInputChange}
              />
              <label htmlFor="email" className="label-float">Adresse Email</label>
              {emailIsValid === true && (
                <Check className="absolute right-0 top-8 text-[#7BAE83]" size={20} />
              )}
              {emailIsValid === false && formData.email.length > 0 && (
                <XIcon className="absolute right-0 top-8 text-red-400" size={20} />
              )}
            </div>

            {/* Téléphone */}
            <div className="input-float-wrapper relative">
              <input 
                type="text" 
                name="telephone" 
                id="telephone" 
                required 
                className="input-float pr-10" 
                placeholder=" " 
                value={formData.telephone}
                onChange={handleInputChange}
              />
              <label htmlFor="telephone" className="label-float">Numéro Mobile (ex: +225 07... ou 07...)</label>
            </div>

            {/* Statut Custom Dropdown */}
            <div className="relative z-50">
              <span className="block font-body text-[10px] tracking-[2px] uppercase text-[var(--moss)] mb-2">
                Votre Statut
              </span>
              <div 
                className={`w-full p-4 border flex justify-between items-center cursor-pointer transition-colors ${dropdownOpen ? 'border-[var(--forest)]' : 'border-[var(--mist)]'}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className={formData.statut ? "text-[var(--ink)] font-medium" : "text-[var(--moss)]"}>
                  {formData.statut === "CCEE" ? "Étudiant ESATIC (CCEE)" :
                   formData.statut === "ANCIEN" ? "Ancien ESATIC" :
                   formData.statut === "EXTERNE" ? "Participant Externe" : "Sélectionner..."}
                </span>
                <ChevronDown size={16} className={`text-[var(--moss)] transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </div>

              {dropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-[var(--mist)] shadow-2xl flex flex-col py-2 animate-[revealDown_0.2s_ease-out]">
                  {[
                    { value: "CCEE", label: "Étudiant ESATIC (CCEE)" },
                    { value: "ANCIEN", label: "Ancien ESATIC" },
                    { value: "EXTERNE", label: "Participant Externe" }
                  ].map((option) => (
                    <div 
                      key={option.value}
                      className={`px-4 py-3 cursor-pointer transition-colors hover:bg-[rgba(200,153,42,0.05)] flex items-center justify-between ${formData.statut === option.value ? 'bg-[rgba(200,153,42,0.05)]' : ''}`}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, statut: option.value as InscriptionStatus, promo: "" }));
                        setDropdownOpen(false);
                        setPromoDropdownOpen(false);
                      }}
                    >
                      <span className="font-body text-sm text-[var(--ink)]">{option.label}</span>
                      {formData.statut === option.value && <Check size={16} className="text-[var(--gold)]" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Promo Dropdown — CCEE/ANCIEN only */}
            {(formData.statut === "CCEE" || formData.statut === "ANCIEN") && (
              <div className="relative z-40 animate-[revealDown_0.3s_ease]">
                <span className="block font-body text-[10px] tracking-[2px] uppercase text-[var(--moss)] mb-2">
                  Votre Promotion
                </span>
                <div
                  className={`w-full p-4 border flex justify-between items-center cursor-pointer transition-colors ${
                    promoDropdownOpen ? 'border-[var(--forest)]' : 'border-[var(--mist)]'
                  }`}
                  onClick={() => setPromoDropdownOpen(!promoDropdownOpen)}
                >
                  <span className={formData.promo ? "text-[var(--ink)] font-medium" : "text-[var(--moss)]"}>
                    {formData.promo || "Sélectionner votre promotion..."}
                  </span>
                  <ChevronDown size={16} className={`text-[var(--moss)] transition-transform ${promoDropdownOpen ? "rotate-180" : ""}`} />
                </div>

                {promoDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-[var(--mist)] shadow-2xl flex flex-col py-2 animate-[revealDown_0.2s_ease-out] max-h-60 overflow-y-auto">
                    {[
                      { value: "IT14", label: "IT14 (5 000 FCFA)" },
                      { value: "IT13", label: "IT13 (7 000 FCFA)" },
                      { value: "IT12", label: "IT12 (7 500 FCFA)" },
                      { value: "IT11", label: "IT11 (8 000 FCFA)" },
                      { value: "IT10", label: "IT10 (10 000 FCFA)" },
                      { value: "IT9", label: "IT9 (10 000 FCFA)" },
                      ...(formData.statut === "ANCIEN" ? [
                        { value: "IT8", label: "IT8 (10 000 FCFA)" },
                        { value: "IT7", label: "IT7 (10 000 FCFA)" },
                        { value: "IT6", label: "IT6 (10 000 FCFA)" },
                        { value: "IT5", label: "IT5 (10 000 FCFA)" },
                        { value: "IT4", label: "IT4 (10 000 FCFA)" },
                        { value: "IT3", label: "IT3 (10 000 FCFA)" },
                        { value: "IT2", label: "IT2 (10 000 FCFA)" },
                        { value: "IT1", label: "IT1 (10 000 FCFA)" },
                      ] : []),
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`px-4 py-3 cursor-pointer transition-colors hover:bg-[rgba(200,153,42,0.05)] flex items-center justify-between ${
                          formData.promo === option.value ? 'bg-[rgba(200,153,42,0.05)]' : ''
                        }`}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, promo: option.value }));
                          setPromoDropdownOpen(false);
                        }}
                      >
                        <span className="font-body text-sm text-[var(--ink)]">{option.label}</span>
                        {formData.promo === option.value && <Check size={16} className="text-[var(--gold)]" />}
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-2 text-xs font-body text-[var(--moss)] italic">
                  Les frais d'inscription seront payés en espèces auprès des organisateurs.
                </p>
              </div>
            )}

            {/* Notice supprimée selon la demande */}
            {/* Sticky Total Bar */}
            <div className="fixed bottom-0 left-0 lg:left-1/2 w-full lg:w-1/2 p-0 z-40">
              <div className="bg-[var(--forest)] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] px-6 py-4 flex items-center justify-between border-t border-[var(--gold)]/20">
                <div>
                  <span className="block font-body text-[10px] tracking-widest text-[#A8BCA9] uppercase mb-1">
                    Total
                  </span>
                  <div className="font-display text-2xl md:text-3xl text-[var(--gold)] flex items-baseline gap-2">
                    {total} <span className="text-sm font-body">FCFA</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !formData.statut}
                  className="btn-gold magnetic shrink-0 px-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed group/submit"
                >
                  <span className="relative z-10 font-body text-[10px] tracking-[2px] uppercase whitespace-nowrap">
                    {loading ? "Traitement..." : total > 0 ? `Payer ${total} FCFA` : "Inscription Gratuite"}
                  </span>
                  {!loading && <ArrowRight size={14} className="ml-2 relative z-10 transition-transform group-hover/submit:translate-x-1" />}
                </button>
              </div>
            </div>

            {/* Desktop Notice Modal-like */}
            {showDesktopNotice && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--ink)]/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white max-w-sm w-full p-8 shadow-2xl border border-[var(--gold)]/20 relative group overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-[var(--gold)]" />
                   <h3 className="font-display text-2xl text-[var(--ink)] mb-4">Paiement Mobile requis</h3>
                   <p className="font-body text-sm text-[var(--moss)] mb-6 leading-relaxed">
                     Le paiement par <b>Wave</b> est optimisé pour mobile. 
                     <br/><br/>
                     Nous vous conseillons d'ouvrir ce site sur votre téléphone pour une expérience directe, ou de continuer ici pour obtenir les instructions de paiement manuel.
                   </p>
                   <div className="flex flex-col gap-3">
                     <button 
                       type="button"
                       onClick={() => {
                         setShowDesktopNotice(false);
                         // Trigger actual submit
                         const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                         handleFinalSubmit(fakeEvent);
                       }}
                       className="w-full bg-[var(--forest)] text-[var(--gold)] py-4 text-[10px] font-bold uppercase tracking-[2px] hover:bg-[var(--gold)] hover:text-[var(--forest)] transition-all"
                     >
                       Continuer sur PC
                     </button>
                     <button 
                       type="button"
                       onClick={() => setShowDesktopNotice(false)}
                       className="w-full py-4 text-[10px] font-bold uppercase tracking-[2px] text-[var(--moss)] hover:text-[var(--ink)] transition-colors"
                     >
                       Retour
                     </button>
                   </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes revealUp {
          from { opacity: 0; transform: translateY(50%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes revealDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="Mm12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}
