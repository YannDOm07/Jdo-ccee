"use client";

import Link from "next/link";

export function CtaBand() {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--forest)" }}>
      {/* Subtle bg pattern */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1511497584788-876760111969?w=1600&q=85")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "luminosity",
        }}
      />
      <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-[120px]" style={{ background: "rgba(200,153,42,0.08)" }} />

      <div className="relative z-10 max-w-[700px] mx-auto text-center px-6 py-20 lg:py-24">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
          Prêt à rejoindre le{" "}
          <span className="italic" style={{ color: "var(--gold-light)" }}>
            Jardin
          </span>{" "}
          ?
        </h2>
        <p className="font-body text-sm mb-10" style={{ color: "rgba(200,223,201,0.5)" }}>
          Les places sont limitées. Inscrivez-vous maintenant pour réserver la vôtre et vivre cette expérience unique.
        </p>
        <Link href="/inscription" className="btn-gold">
          S'inscrire maintenant →
        </Link>
      </div>
    </section>
  );
}
