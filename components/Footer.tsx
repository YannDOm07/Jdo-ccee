export function Footer() {
  return (
    <footer style={{ background: "var(--ink)" }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 lg:py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-lg font-bold italic" style={{ color: "var(--gold)" }}>
              Jardin des Oliviers 2026
            </h3>
            <p className="font-body text-[10px] tracking-[2px] uppercase mt-2" style={{ color: "rgba(200,223,201,0.3)" }}>
              CCEE · ESATIC · Abidjan
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <p className="font-body text-xs" style={{ color: "rgba(200,223,201,0.25)" }}>
              © 2026 Communauté Catholique des Étudiants de l'ESATIC
            </p>
            <div className="hidden md:block w-1 h-1 rounded-full bg-[rgba(200,223,201,0.2)]" />
            <a href="/admin/login" className="font-body text-xs uppercase tracking-[2px] transition-colors hover:text-[var(--gold)]" style={{ color: "rgba(200,223,201,0.4)" }}>
              Administration
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
