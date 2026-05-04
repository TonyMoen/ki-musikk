import Link from 'next/link'
import { Sparkles, CheckCircle2, ArrowRight, Music } from 'lucide-react'
import type { NicheLandingData } from '@/lib/niches'
import { getNiche } from '@/lib/niches'

interface NicheLandingProps {
  data: NicheLandingData
}

export function NicheLanding({ data }: NicheLandingProps) {
  const related = data.relatedSlugs
    .map((slug) => getNiche(slug))
    .filter((n): n is NicheLandingData => Boolean(n))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      {/* Hero */}
      <h1 className="text-4xl sm:text-5xl font-bold mb-6">{data.h1}</h1>
      <p className="text-xl text-muted-foreground mb-10 leading-relaxed">{data.intro}</p>

      {/* Primary CTA above the fold */}
      <div className="flex flex-wrap gap-3 mb-16">
        <Link
          href="/auth/logg-inn"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Lag {data.brand.replace('AI ', '').toLowerCase()} nå — gratis å prøve
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
        <Link
          href="/priser"
          className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          Se priser
        </Link>
      </div>

      {/* Sections */}
      {data.sections.map((section, i) => (
        <section key={i} className="mb-12">
          <h2 className="text-2xl font-bold mb-4">{section.heading}</h2>
          {section.paragraphs.map((p, j) => (
            <p key={j} className="text-muted-foreground mb-4 leading-relaxed">
              {p}
            </p>
          ))}
          {section.list && (
            <ul className="space-y-2 mt-4">
              {section.list.map((item, k) => (
                <li key={k} className="flex gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {/* Example prompts */}
      {data.examplePrompts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Eksempler på beskrivelser som funker</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Disse beskrivelsene gir typisk gode resultater. Bruk som inspirasjon — bytt ut navn,
            sted og detaljer med dine egne.
          </p>
          <div className="space-y-4">
            {data.examplePrompts.map((prompt, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-muted/30 p-5 font-mono text-sm leading-relaxed text-foreground"
              >
                <Sparkles className="inline h-4 w-4 text-primary mr-2 align-text-top" />
                {prompt}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why AI MUSIKK */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Hvorfor velge AI MUSIKK for {data.brand.replace('AI ', '').toLowerCase()}?</h2>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Det finnes flere AI-musikkverktøy. Her er hva som gjør AI MUSIKK best for denne sjangeren:
        </p>
        <div className="space-y-4">
          {data.whyAiMusikk.map(({ title, desc }) => (
            <div key={title} className="flex gap-4 p-4 rounded-lg bg-muted/30">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Music className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Vanlige spørsmål om {data.brand}</h2>
        <div className="space-y-6">
          {data.faqs.map(({ q, a }) => (
            <div key={q} className="border-b border-border pb-4">
              <h3 className="font-semibold mb-2">{q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related niches — internal linking */}
      {related.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Andre AI-musikk-typer du kan utforske</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Hver sjanger og anledning har sin egen guide og prompt-eksempler. Disse er de mest
            relevante for deg som lager {data.brand.replace('AI ', '').toLowerCase()}:
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((rel) => (
              <Link
                key={rel.slug}
                href={`/ai-${rel.slug}`}
                className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Music className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {rel.brand}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {rel.intro.split('.')[0]}.
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <div className="rounded-xl bg-primary/10 border border-primary/20 p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">{data.ctaTitle}</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{data.ctaText}</p>
        <Link
          href="/auth/logg-inn"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Kom i gang nå
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
