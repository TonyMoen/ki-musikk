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
        answer: 'Kreditter er valutaen du bruker for å lage sanger. Hver generering koster 10 kreditter — og du får to ulike versjoner av sangen, som begge havner i biblioteket ditt. Du kan kjøpe kredittpakker på Priser-siden eller under "Innstillinger".'
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
        answer: 'Vi tilbyr tre pakker: Allsang (99 kr — 10 sanger), Hitmaker (199 kr — 25 sanger) og Studio (299 kr — 50 sanger). Hver sang lages i to versjoner, så du får dobbelt så mange filer i biblioteket. Kredittene utløper aldri og er knyttet til din konto.'
      },
      {
        id: 'payment-methods',
        question: 'Hvordan betaler jeg?',
        answer: 'Vi bruker Vipps for sikker betaling. Velg en kredittpakke, trykk "Betal med Vipps", og godkjenn betalingen i Vipps-appen. Kredittene blir tilgjengelige umiddelbart etter betaling.'
      },
      {
        id: 'song-cost',
        question: 'Hva koster det å lage en sang?',
        answer: 'Med Studio-pakken (299 kr for 50 generasjoner) blir det 5,98 kr per generering — og siden hver generering gir deg to versjoner, ender du på under 3 kr per sang.'
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
        question: 'Hvilken teknologi bruker AI MUSIKK?',
        answer: 'Vi bruker den nyeste Suno-modellen for musikkgenerering, kombinert med en spesialisert AI-tekstforfatter som er trent på norsk låtstruktur. Alle musikkprompter er norsk-optimaliserte for å gi best mulig resultat.'
      },
      {
        id: 'why-norwegian',
        question: 'Hvorfor er AI MUSIKK bedre på norsk enn andre tjenester?',
        answer: 'De fleste AI-musikktjenester er laget for engelsk. AI MUSIKK bruker en egen AI-modul som forstår norsk fonetikk, rim og låtstruktur (vers, refreng, bro). Dette gir langt mer naturlig norsk uttale og bedre sangbare tekster.'
      },
      {
        id: 'song-quality',
        question: 'Hvor god er kvaliteten på sangene?',
        answer: 'Sangene genereres i høy kvalitet med profesjonell lyd. Resultatet avhenger av konseptet og sjangeren du velger. Vi anbefaler å prøve ulike sjangre og konsepter for å finne det som fungerer best.'
      }
    ]
  },
  {
    id: 'about-ai-musikk',
    title: 'Om AI MUSIKK og AI-musikk',
    items: [
      {
        id: 'what-is-ai-musikk',
        question: 'Hva er AI MUSIKK?',
        answer: 'AI MUSIKK er Norges eneste AI-sanggenerator med autentisk norsk uttale-optimalisering. Du beskriver hva sangen skal handle om, og AI-en lager en komplett sang med vokal, melodi og produksjon — ferdig på under 2 minutter. Vi tilbyr Vipps-betaling og engangskjøp uten abonnement.'
      },
      {
        id: 'ai-vs-ki',
        question: 'Hva er forskjellen på AI og KI?',
        answer: 'Ingen forskjell — det er samme begrep. AI (Artificial Intelligence) er den engelske termen, mens KI (kunstig intelligens) er det norske ordet. I Norge brukes begge begrepene om hverandre, og AI-musikk og KI-musikk betyr nøyaktig det samme.'
      },
      {
        id: 'ai-musikk-vs-suno',
        question: 'Hva er forskjellen mellom AI MUSIKK og Suno?',
        answer: 'AI MUSIKK er spesialisert på norsk og optimaliserer uttalen slik at sangene høres naturlig norske ut. Suno er en generell internasjonal plattform der norsk uttale ofte blir unaturlig. I tillegg tilbyr AI MUSIKK Vipps-betaling og engangskjøp — Suno krever kredittkort og månedlig abonnement.'
      },
      {
        id: 'no-subscription',
        question: 'Kan jeg lage AI-musikk uten abonnement?',
        answer: 'Ja! AI MUSIKK er det eneste AI-musikkverktøyet med engangskjøp. Du kjøper kreditter når du trenger dem — fra 99 kr for 10 sanger, og hver sang lages i to versjoner. Ingen månedlige kostnader, ingen automatisk fornyelse. Betal enkelt med Vipps.'
      },
      {
        id: 'norwegian-ai-music',
        question: 'Finnes det en norsk AI-musikktjeneste?',
        answer: 'Ja — AI MUSIKK (kimusikk.no) er en norsk AI-sanggenerator med helt norsk grensesnitt, autentisk norsk uttale-optimalisering, og betaling med Vipps. Tjenesten er utviklet i Norge av Moen Studio i Notodden.'
      },
      {
        id: 'best-norwegian-ai-music',
        question: 'Hva er det beste AI-musikkverktøyet for norske sanger?',
        answer: 'AI MUSIKK er det eneste AI-musikkverktøyet som er spesialisert på norsk uttale. Andre verktøy som Suno støtter norsk tekst, men uttalen blir ofte unaturlig — spesielt r-lyder og sammensatte ord. AI MUSIKK optimaliserer uttalen for autentisk norsk sang.'
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
