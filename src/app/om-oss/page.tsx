import type { Metadata } from 'next'
import { Sparkles, Heart, Globe } from 'lucide-react'
import { AppLogo } from '@/components/app-logo'

export const metadata: Metadata = {
  title: 'Om oss - KI MUSIKK',
  description: 'KI MUSIKK er Norges første AI-drevne plattform for personlige sanger med autentisk norsk uttale. Les om vår visjon og teknologi.',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">Om KI MUSIKK</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-muted-foreground mb-8">
          KI MUSIKK er Norges første AI-drevne plattform for å lage personlige sanger
          med autentisk norsk uttale. Vi gjør det enkelt for alle å skape unike musikkopplevelser.
        </p>

        <div className="grid gap-8 md:grid-cols-2 my-12">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <AppLogo size={24} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Norsk musikk med AI</h3>
              <p className="text-muted-foreground">
                Vi bruker avansert AI-teknologi til å generere sanger med tekster som faktisk
                høres norske ut - ikke bare oversatt engelsk.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Unik uttale-optimalisering</h3>
              <p className="text-muted-foreground">
                Vår spesialteknologi optimaliserer teksten slik at AI-stemmen synger med
                naturlig norsk uttale og intonasjon.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Laget med kjærlighet</h3>
              <p className="text-muted-foreground">
                KI MUSIKK er utviklet av norske musikk- og teknologientusiaster som
                ønsker å gjøre musikkskaping tilgjengelig for alle.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">For alle anledninger</h3>
              <p className="text-muted-foreground">
                Perfekt til bursdager, bryllup, firmafester, studentrevyer eller bare for
                moro skyld. Lag sanger som virkelig betyr noe.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 rounded-xl p-8 my-12">
          <h2 className="text-2xl font-bold mb-4">Hvordan det fungerer</h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</span>
              <div>
                <strong>Velg sjanger</strong> - Fra pop til country, vise til rap - vi har noe for enhver smak.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</span>
              <div>
                <strong>Beskriv sangen din</strong> - Fortell oss hva sangen skal handle om, så genererer AI-en teksten.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</span>
              <div>
                <strong>Optimaliser uttalen</strong> - Vår teknologi sørger for at sangen høres ekte norsk ut.
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</span>
              <div>
                <strong>Generer og del</strong> - På under 2 minutter har du en ferdig sang å dele med verden!
              </div>
            </li>
          </ol>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Har du spørsmål? <a href="/kontakt" className="text-primary hover:underline">Ta kontakt med oss</a>
          </p>
        </div>
      </div>
    </div>
  )
}
