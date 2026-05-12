"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const { isLoggedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);


  const navLinks = isLoggedIn
    ? [
        { label: "Accueil", href: "/" },
        { label: "L'Événement", href: "/#about" },
        { label: "Tarifs", href: "/#tarifs" },
        { label: "Mon Jardin", href: "/profil" },
      ]
    : [
        { label: "Accueil", href: "/" },
        { label: "L'Événement", href: "/#about" },
        { label: "Tarifs", href: "/#tarifs" },
        { label: "Connexion", href: "/connexion" },
      ];

  const isOnProfil = pathname.startsWith('/profil');

  if (
    pathname.startsWith('/admin') || 
    pathname.startsWith('/inscription') || 
    pathname.startsWith('/confirmation') || 
    pathname.startsWith('/connexion') ||
    pathname.startsWith('/scan')
  ) {
    return null;
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[90] transition-all duration-700 ${
          isOnProfil
            ? "py-4 bg-[var(--ink)]/90 backdrop-blur-md border-b border-[var(--gold)]/10"
            : scrolled
              ? "py-4 bg-[var(--cream)]/80 backdrop-blur-md shadow-sm border-b border-[var(--gold)]/20"
              : "py-6 bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between">
          
          <Link href="/" className="font-display italic text-2xl lg:text-3xl text-[var(--gold)]">
            JDO
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-12">
            <ul className={`flex items-center gap-10 font-body text-[11px] font-medium tracking-[3px] uppercase transition-colors duration-500 ${
              isOnProfil ? "text-white/80" : scrolled ? "text-[var(--forest)]" : "text-white/80"
            }`}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="relative group p-2"
                  >
                    <span className="relative z-10 transition-colors group-hover:text-[var(--gold)]">{link.label}</span>
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[var(--gold)] scale-x-0 origin-right transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-x-100 group-hover:origin-left" />
                  </Link>
                </li>
              ))}
            </ul>
            {isLoggedIn ? (
              <Link href="/profil" className="btn-primary py-3 px-8 text-[10px] flex items-center gap-2">
                <User size={14} />
                <span>Mon Profil</span>
              </Link>
            ) : (
              <Link href="/inscription" className="btn-primary py-3 px-8 text-[10px]">
                <span>S'inscrire</span>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className={`lg:hidden p-2 ${isOnProfil ? "text-[var(--gold)]" : "text-[var(--gold)] mix-blend-difference"}`}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </header>

      {/* Fullscreen Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%", transition: { delay: 0.2, duration: 0.6, ease: [0.76, 0, 0.24, 1] } }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[100] bg-[var(--forest)] flex flex-col justify-center px-8 overflow-hidden"
          >
            <button
              className="absolute top-8 right-8 text-[var(--gold)] p-2"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <motion.div animate={{ rotate: 90 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <X size={32} />
              </motion.div>
            </button>

            <div className="absolute top-10 left-10 opacity-5">
              <span className="font-display italic text-9xl text-[var(--gold)]">JO</span>
            </div>

            <ul className="flex flex-col gap-8 relative z-10">
              {navLinks.map((link, i) => (
                <li key={link.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <Link
                      href={link.href}
                      className="font-display text-5xl md:text-7xl text-white hover:text-[var(--gold)] transition-colors inline-block"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
              <li className="overflow-hidden mt-8">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.6, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  {isLoggedIn ? (
                    <Link
                      href="/profil"
                      className="font-body text-sm font-medium tracking-[4px] uppercase text-[var(--gold)] border-b border-[var(--gold)] pb-2 inline-block"
                      onClick={() => setMenuOpen(false)}
                    >
                      Mon Profil â†’
                    </Link>
                  ) : (
                    <Link
                      href="/inscription"
                      className="font-body text-sm font-medium tracking-[4px] uppercase text-[var(--gold)] border-b border-[var(--gold)] pb-2 inline-block"
                      onClick={() => setMenuOpen(false)}
                    >
                      S'inscrire maintenant â†’
                    </Link>
                  )}
                </motion.div>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
