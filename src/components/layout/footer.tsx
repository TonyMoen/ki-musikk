import Link from 'next/link'
import { AppLogo } from '@/components/app-logo'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AppLogo size={24} />
              <span className="text-lg font-bold">KI MUSIKK</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Lag norske sanger med KI - autentisk norsk uttale!
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="h-4 w-4 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span>Lagd av Grøftefyll - 80.000+ månedlige lyttere</span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Navigasjon</h3>
            <nav className="flex flex-col gap-2" aria-label="Bunntekst navigasjon">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Hjem
              </Link>
              <Link href="/om-oss" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Om oss
              </Link>
              <Link href="/hjelp" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Hjelp & FAQ
              </Link>
              <Link href="/kontakt" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Kontakt
              </Link>
              <Link href="/priser" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Priser
              </Link>
            </nav>
          </div>

          {/* Column 3: Legal & Company Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Juridisk</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/vilkaar" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Vilkår og betingelser
              </Link>
              <Link href="/personvern" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Personvernerklæring
              </Link>
            </nav>
            <div className="pt-2 space-y-1 text-sm text-muted-foreground">
              <p><span className="font-medium">Moen Studio</span></p>
              <p>Org.nr: 931 659 685</p>
              <p>
                <a href="mailto:groftefyllband@gmail.com" className="hover:text-foreground transition-colors">
                  groftefyllband@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} KI MUSIKK. Alle rettigheter reservert.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#FF5B24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Sikker betaling med Vipps</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
