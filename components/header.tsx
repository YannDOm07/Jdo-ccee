import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, Leaf } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-stone-200/50 supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
            <Leaf className="h-4.5 w-4.5" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-bold text-sm leading-tight text-foreground">
              Jardin des Oliviers
            </span>
            <span className="text-[10px] font-medium text-muted-foreground leading-tight">
              CCEE • 24 Mai 2026
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-stone-100/80 transition-all">
            Accueil
          </Link>
          <Link href="/inscription" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-stone-100/80 transition-all">
            S'inscrire
          </Link>
          <Link href="/admin" className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-stone-100/80 transition-all">
            Admin
          </Link>
          <Link 
            href="/inscription"
            className="ml-2 px-5 py-2 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
          >
            Rejoindre
          </Link>
        </nav>
        
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-10 w-10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col mt-8">
                <div className="flex items-center gap-2.5 mb-8 px-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white">
                    <Leaf className="h-4.5 w-4.5" />
                  </div>
                  <span className="font-bold text-foreground">JDO 2026</span>
                </div>
                <nav className="flex flex-col gap-1">
                  <Link href="/" className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium hover:bg-stone-100/80 transition-colors">
                    Accueil
                  </Link>
                  <Link href="/inscription" className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium hover:bg-stone-100/80 transition-colors">
                    S'inscrire
                  </Link>
                  <Link href="/admin" className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium text-muted-foreground hover:bg-stone-100/80 transition-colors">
                    Admin
                  </Link>
                </nav>
                <div className="mt-6 px-3">
                  <Link 
                    href="/inscription"
                    className="flex items-center justify-center w-full px-5 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all"
                  >
                    Rejoindre l'événement →
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
