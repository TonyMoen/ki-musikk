/**
 * FAQ Data Constants (Norwegian)
 * Centralized FAQ content for the help page
 */

export interface FAQItem {
  id: string
  question: string
  answer: string
}

export interface FAQCategory {
  id: string
  title: string
  items: FAQItem[]
}

export const FAQ_DATA: FAQCategory[] = [
  {
    id: 'getting-started',
    title: 'Kom i gang',
    items: [
      {
        id: 'how-to-create',
        question: 'Hvordan lager jeg min første sang?',
        answer: 'Velg en sjanger fra karusellen på forsiden, beskriv hva sangen skal handle om i tekstfeltet, og trykk "Lag sang". AI-en genererer teksten og musikken for deg på under 5 minutter!'
      },
      {
        id: 'what-are-credits',
        question: 'Hva er kreditter og hvordan fungerer de?',
        answer: 'Kreditter er valutaen du bruker for å lage sanger. Én full sang koster 10 kreditter. Du kan kjøpe kredittpakker under "Innstillinger" - jo større pakke, jo bedre pris per sang.'
      },
      {
        id: 'free-preview',
        question: 'Kan jeg prøve gratis før jeg kjøper kreditter?',
        answer: 'Ja! Du kan generere en gratis 30-sekunders forhåndsvisning av sangen din for å høre hvordan den høres ut før du bruker kreditter på full versjon.'
      },
      {
        id: 'how-to-login',
        question: 'Hvordan logger jeg inn?',
        answer: 'Trykk på "Logg inn"-knappen og velg Google-kontoen din. Vi bruker Google-innlogging for sikker og enkel pålogging - ingen passord å huske!'
      }
    ]
  },
  {
    id: 'norwegian-pronunciation',
    title: 'Norsk uttale',
    items: [
      {
        id: 'what-is-uttale',
        question: 'Hva er "Uttalelse Bokmål"?',
        answer: 'Uttalelse Bokmål er vår unike teknologi som optimaliserer sangtekster for bedre norsk uttale. KI-en konverterer norske ord til fonetisk stavemåte som gir mer autentisk norsk uttale i sangene.'
      },
      {
        id: 'override-phonetic',
        question: 'Kan jeg overstyre fonetiske endringer?',
        answer: 'Ja, du kan se og redigere de fonetiske endringene i forhåndsvisningen før du genererer sangen. Endringer vises med grønn/rød markering så du kan se hva som er endret.'
      },
      {
        id: 'why-sounds-better',
        question: 'Hvorfor høres sangene mer norske ut enn andre AI-verktøy?',
        answer: 'KI MUSIKK bruker avansert fonetisk konvertering som er spesialtilpasset norsk språk. Vi har utviklet egne regler for hvordan norske lyder skal skrives for optimal uttale i AI-generert musikk.'
      },
      {
        id: 'dialects-nynorsk',
        question: 'Fungerer det med dialekter eller nynorsk?',
        answer: 'Per nå er systemet optimalisert for bokmål. Vi jobber med å utvide støtten til nynorsk og ulike dialekter i fremtidige versjoner.'
      }
    ]
  },
  {
    id: 'credits-payments',
    title: 'Kreditter og betaling',
    items: [
      {
        id: 'credit-packages',
        question: 'Hvordan fungerer kredittpakkene?',
        answer: 'Vi tilbyr tre pakker: Starter (500 kreditter), Pro (1000 kreditter), og Premium (2500 kreditter). Større pakker gir bedre verdi per kreditt. Kredittene utløper aldri!'
      },
      {
        id: 'payment-methods',
        question: 'Hvilke betalingsmetoder aksepterer dere?',
        answer: 'Vi aksepterer alle vanlige betalingskort (Visa, Mastercard, American Express) gjennom Stripe, som er en sikker betalingsplattform brukt av millioner av bedrifter.'
      },
      {
        id: 'song-cost',
        question: 'Hva koster det å lage en sang?',
        answer: 'En full sang koster 10 kreditter. Med vår mest populære Pro-pakke (kr 250 for 1000 kreditter) blir det ca. kr 25 per sang. Forhåndsvisning er alltid gratis!'
      },
      {
        id: 'refunds',
        question: 'Får jeg pengene tilbake hvis noe går galt?',
        answer: 'Hvis sanggenereringen feiler, vil kredittene automatisk bli refundert til kontoen din. Ved tekniske problemer, kontakt oss på hei@kimusikk.no så hjelper vi deg.'
      }
    ]
  },
  {
    id: 'songs-library',
    title: 'Sanger og bibliotek',
    items: [
      {
        id: 'storage-duration',
        question: 'Hvor lenge lagres sangene mine?',
        answer: 'Sangene dine lagres i 14 dager fra genereringstidspunktet. Husk å laste ned sangene du vil beholde før de slettes automatisk.'
      },
      {
        id: 'how-to-download',
        question: 'Hvordan laster jeg ned sangene mine?',
        answer: 'Gå til "Mine sanger" i menyen, finn sangen du vil laste ned, og trykk på nedlastingsknappen. Sangen lastes ned som MP3-fil til enheten din.'
      },
      {
        id: 'delete-song',
        question: 'Kan jeg slette en sang?',
        answer: 'Ja, du kan slette sanger fra biblioteket ditt når som helst. Gå til "Mine sanger", åpne sangen og velg "Slett". Merk at slettede sanger ikke kan gjenopprettes.'
      },
      {
        id: 'share-songs',
        question: 'Kan jeg dele sangene mine på sosiale medier?',
        answer: 'Ja! Last ned sangen og del den hvor du vil. Sangene du lager er dine å bruke - del gjerne på TikTok, Instagram, YouTube eller andre plattformer.'
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Feilsøking',
    items: [
      {
        id: 'generation-failed',
        question: 'Sanggenereringen mislyktes, hvorfor?',
        answer: 'Dette kan skyldes midlertidige serverproblemer. Prøv igjen om noen minutter. Hvis problemet vedvarer, kontakt support. Kredittene refunderes automatisk ved feil.'
      },
      {
        id: 'preview-different',
        question: 'Hvorfor hørtes forhåndsvisningen annerledes ut?',
        answer: 'Forhåndsvisningen og full versjon genereres separat av AI-en, så det kan være små variasjoner i hvordan sangen tolkes. Dette er normalt for AI-generert musikk.'
      },
      {
        id: 'app-not-working',
        question: 'Appen fungerer ikke - hva gjør jeg?',
        answer: 'Prøv først å laste siden på nytt (trykk på oppdater-knappen eller sveip ned). Hvis det ikke hjelper, prøv å logge ut og inn igjen. Vedvarer problemet, kontakt support.'
      },
      {
        id: 'contact-support',
        question: 'Hvordan kontakter jeg support?',
        answer: 'Send en e-post til hei@kimusikk.no. Beskriv problemet så detaljert som mulig, og inkluder gjerne skjermbilder. Vi svarer vanligvis innen 24 timer.'
      }
    ]
  }
]
