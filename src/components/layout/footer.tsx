import Link from 'next/link'

const footerLinks = [
  { href: '/about', label: 'Om oss' },
  { href: '/contact', label: 'Kontakt' },
  { href: '/terms', label: 'Vilkår' },
  { href: '/privacy', label: 'Personvern' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30 pb-20 md:pb-0 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col items-center gap-4">
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6" aria-label="Bunntekst navigasjon">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground focus:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-muted-foreground text-center">
            © {currentYear} KI MUSIKK. Alle rettigheter reservert.
          </p>
        </div>
      </div>
    </footer>
  )
}
