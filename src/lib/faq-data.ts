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
        answer: 'Velg en sjanger fra forsiden, beskriv hva sangen skal handle om i tekstfeltet, og trykk "Lag sang". AI-en genererer teksten og musikken for deg. En generering tar vanligvis mellom 2-4 minutter.'
      },
      {
        id: 'what-are-credits',
        question: 'Hva er kreditter og hvordan fungerer de?',
        answer: 'Kreditter er valutaen du bruker for å lage sanger. Én full sang koster 10 kreditter. Du kan kjøpe kredittpakker på Priser-siden eller under "Innstillinger".'
      },
      {
        id: 'generation-time',
        question: 'Hvor lang tid tar det å generere en sang?',
        answer: 'En sanggenerering tar vanligvis mellom 2-4 minutter. Du kan følge med på fremdriften, og sangen vil automatisk vises i "Mine sanger" når den er ferdig.'
      },
      {
        id: 'how-to-login',
        question: 'Hvordan logger jeg inn?',
        answer: 'Trykk på "Logg inn"-knappen og velg Vipps eller Google. Med Vipps logger du inn raskt og trygt med telefonnummeret ditt!'
      }
    ]
  },
  {
    id: 'credits-payments',
    title: 'Kreditter og betaling',
    items: [
      {
        id: 'credit-packages',
        question: 'Hvilke kredittpakker finnes?',
        answer: 'Vi tilbyr tre pakker: 10 sanger (99 kr for 100 kreditter), 25 sanger (199 kr for 250 kreditter), og 100 sanger (499 kr for 1000 kreditter). Kredittene utløper aldri og er knyttet til din konto.'
      },
      {
        id: 'payment-methods',
        question: 'Hvordan betaler jeg?',
        answer: 'Vi bruker Vipps for sikker betaling. Velg en kredittpakke, trykk "Betal med Vipps", og godkjenn betalingen i Vipps-appen. Kredittene blir tilgjengelige umiddelbart etter betaling.'
      },
      {
        id: 'song-cost',
        question: 'Hva koster det å lage en sang?',
        answer: 'En full sang koster 10 kreditter. Med vår største pakke (499 kr for 1000 kreditter) blir det under 5 kr per sang!'
      },
      {
        id: 'refunds',
        question: 'Får jeg pengene tilbake hvis noe går galt?',
        answer: 'Hvis sanggenereringen feiler, vil kredittene automatisk bli refundert til kontoen din. Du har også 14 dagers angrerett på ubrukte kreditter. Kontakt oss på hei@kimusikk.no ved spørsmål.'
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
        answer: 'Sangene dine lagres i 30 dager fra genereringstidspunktet. Husk å laste ned sangene du vil beholde før de slettes automatisk.'
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
    id: 'technology',
    title: 'Teknologi og kvalitet',
    items: [
      {
        id: 'what-technology',
        question: 'Hvilken teknologi bruker KiMusikk?',
        answer: 'Vi bruker den nyeste Suno-modellen for musikkgenerering, kombinert med en spesialisert KI-tekstforfatter som er trent på norsk låtstruktur. Alle musikkprompter er norsk-optimaliserte for å gi best mulig resultat.'
      },
      {
        id: 'why-norwegian',
        question: 'Hvorfor er KiMusikk bedre på norsk enn andre tjenester?',
        answer: 'De fleste KI-musikktjenester er laget for engelsk. KiMusikk bruker en egen KI-modul som forstår norsk fonetikk, rim og låtstruktur (vers, refreng, bro). Dette gir langt mer naturlig norsk uttale og bedre sangbare tekster.'
      },
      {
        id: 'song-quality',
        question: 'Hvor god er kvaliteten på sangene?',
        answer: 'Sangene genereres i høy kvalitet med profesjonell lyd. Resultatet avhenger av konseptet og sjangeren du velger. Vi anbefaler å prøve ulike sjangre og konsepter for å finne det som fungerer best.'
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
