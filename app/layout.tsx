import type { Metadata } from "next";
import { Playfair_Display, Jost, Libre_Baskerville } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";
import { Preloader, PageTransition } from "@/components/PageTransition";
import { MagneticCursor } from "@/components/MagneticCursor";
import { KonamiCode } from "@/components/KonamiCode";
import { FaviconManager } from "@/components/FaviconManager";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-baskerville",
  display: "swap",
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Jardin des Oliviers 2026 — CCEE ESATIC",
  description: "Événement spirituel organisé par la Communauté Catholique des Étudiants de l'ESATIC. Inscription, paiement et goodies pour le JDO 2026.",
};

import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${playfair.variable} ${jost.variable} ${baskerville.variable}`}
    >
      <body>
        <AuthProvider>
          <Preloader />
          <MagneticCursor />
          <KonamiCode />
          <FaviconManager />
          <Navbar />
          <PageTransition>
            <main data-scroll-container id="scroll-container">{children}</main>
          </PageTransition>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: "var(--font-jost), sans-serif",
                borderRadius: 0,
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
