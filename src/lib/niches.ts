/**
 * Niche landing page data — one entry per /ai-{slug} route.
 * Each niche has unique SEO copy, FAQs, examples, and 3 cross-links.
 */

export interface NicheSection {
  heading: string
  paragraphs: string[]
  list?: string[]
}

export interface NicheFaq {
  q: string
  a: string
}

export interface NicheLandingData {
  slug: string
  brand: string
  metaTitle: string
  metaDescription: string
  keywords: string
  ogTitle: string
  ogDescription: string
  h1: string
  intro: string
  sections: NicheSection[]
  examplePrompts: string[]
  whyAiMusikk: { title: string; desc: string }[]
  faqs: NicheFaq[]
  relatedSlugs: [string, string, string]
  ctaTitle: string
  ctaText: string
}

export const niches: NicheLandingData[] = [
  // ─────────────────────────── RUSSEMUSIKK ───────────────────────────
  {
    slug: 'russemusikk',
    brand: 'AI Russemusikk',
    metaTitle: 'AI Russemusikk — lag din egen russelåt på minutter (fra 99 kr)',
    metaDescription:
      'Lag profesjonell AI-russemusikk for bussen, gruppa eller knuten. Norsk uttale, ferdig på under 2 minutter, fra 99 kr — uten dyre artister og uten abonnement.',
    keywords:
      'AI russemusikk, AI russelåt, lag russelåt med AI, russemusikk AI, billig russelåt, russelåt generator, AI russesang, norsk AI russemusikk, lag russelåt selv',
    ogTitle: 'AI Russemusikk — lag din egen russelåt på minutter',
    ogDescription:
      'Profesjonell russemusikk laget med AI. Norsk uttale, fra 99 kr, ingen abonnement. Perfekt for bussen, gruppa eller knuten.',
    h1: 'AI Russemusikk — lag din egen russelåt med AI',
    intro:
      'Russelåter koster fra 10 000 til over 100 000 kroner når dere bestiller fra artister — og ventetiden er ofte uker eller måneder. Med AI-russemusikk får dere en proff låt med ekte norsk uttale på 2 minutter, for en brøkdel av prisen. Ingen kontrakter, ingen ventetid, ingen abonnement.',
    sections: [
      {
        heading: 'Hvorfor lage russemusikken med AI?',
        paragraphs: [
          'Russetiden er kort, og hvert øre teller. AI-russemusikk lar dere lage så mange versjoner dere vil — bytt tema, kast inn nye memes, prøv ny sjanger — uten å betale ekstra. Når låten endelig sitter, er den klar til å pumpe på bussen samme kveld.',
          'NRK og flere norske medier har dekket trenden: russen i 2025 og 2026 lager musikken sin med AI fordi det funker. Resultatet høres profesjonelt ut, og når det synges på autentisk norsk er det umulig å høre at det ikke er en menneskelig artist.',
        ],
        list: [
          'Spar 90–99 % vs. å bestille fra artister',
          'Ferdig på minutter — ikke uker',
          'Lag uendelig mange versjoner til dere finner den perfekte',
          'Helt eierskap — ingen royalties eller deling med artist',
          'Vipps-betaling — bare spleis i Vipps-gruppa, så er dere i gang',
          'Engangskjøp — ingen abonnement å huske å si opp',
        ],
      },
      {
        heading: 'Hvilken sjanger passer russelåten?',
        paragraphs: [
          'De aller fleste russelåter ligger i sjangrene EDM, hip-hop/rap eller hard pop. Velg den stilen som matcher bussen eller gruppa deres:',
        ],
        list: [
          'EDM / house — for energiske bussfester og stoltheten over å åpne dansegulvet',
          'Hip-hop / rap — for harde tekster, slang og insider-jokes',
          'Pop — for catchy refrenger som hele festen skal synge med på',
          'Rock — for rockebussen som ikke gir seg',
          'Festlåt — generisk høyenergi-mix som funker overalt',
        ],
      },
      {
        heading: 'Slik lager dere russelåten på 2 minutter',
        paragraphs: [
          'Selve prosessen er enklere enn dere tror — null musikkerfaring nødvendig. Slik gjør dere det:',
        ],
        list: [
          'Logg inn med Vipps eller Google på AI MUSIKK — første sang er gratis',
          'Velg sjanger (EDM og rap er mest brukt blant russ)',
          'Beskriv bussen, knuten eller gruppa — navn, slagord, insider-jokes, sted',
          'Trykk «Lag sang» og vent ca. 1–2 minutter',
          'Hør gjennom — er noe ikke perfekt, juster beskrivelsen og prøv igjen',
          'Last ned MP3 og send til DJ-ansvarlig på bussen',
        ],
      },
      {
        heading: 'Tips for den beste AI-russelåten',
        paragraphs: [
          'Kvaliteten på sangen henger direkte sammen med hvor god beskrivelsen er. Vær spesifikk og ikke vær redd for å være rar — det er ofte de spesifikke detaljene som gjør at hele bussen ler høyt når låten spilles.',
        ],
        list: [
          'Inkluder bussnavn, knute eller gruppe — gjør det personlig',
          'Nevn slagord eller insider-jokes — gjør det umulig å glemme',
          'Beskriv sted og skole — lokal forankring gir ekthet',
          'Vær klar på stemningen — energisk, kjekk, råtass eller romantisk?',
          'Spesifiser tempo — «hard og rask EDM» vs. «catchy mellom-tempo pop»',
          'Beskriv refrenget separat — det er den delen folk husker',
        ],
      },
    ],
    examplePrompts: [
      'Energisk EDM-russelåt for Blå Buss 2026 fra Asker. Refrenget skal handle om at vi er de kuleste på Karl Johan og at vi aldri gir oss før kl. 06.',
      'Hard rap-russelåt for Knute Skjelven fra Stavanger. Slagord: «Vi e knuten alle vil va med i». Inkluder insider-joke om at Per alltid mister mobilen.',
      'Catchy pop-russelåt for jentebussen Roselina fra Drammen. Tema: vennskap, festing og at vi tar over Strömstad. Skal være sangbar og glad.',
    ],
    whyAiMusikk: [
      {
        title: 'Norsk uttale som faktisk treffer',
        desc: 'Vi optimaliserer teksten slik at AI-stemmen synger med autentisk norsk uttale — ikke generisk «engelsk-norsk» som de fleste internasjonale verktøyene leverer.',
      },
      {
        title: 'Vipps + spleis = enkel finansiering',
        desc: 'Russen bruker Vipps på alt. Med Vipps-betaling kan hele bussen spleise i en Vipps-gruppe og betale samlet — ingen kredittkort, ingen abonnement.',
      },
      {
        title: 'Engangskjøp fra 99 kr',
        desc: '10 sanger for 99 kr. Lag flere versjoner, prøv forskjellige sjangre, bytt tekst — uten å frykte månedlig regning.',
      },
    ],
    faqs: [
      {
        q: 'Kan vi bruke AI-russelåten kommersielt eller på Spotify?',
        a: 'Du har full bruksrett til russelåten du lager — spill den på bussen, del på sosiale medier, eller bruk i video. For kommersielle utgivelser eller distribusjon på Spotify, sjekk våre vilkår for de fulle rettighetene.',
      },
      {
        q: 'Hvor mye koster én AI-russelåt?',
        a: 'Én full sang koster 10 kreditter. Med 99 kr-pakken får du 100 kreditter (10 sanger). Med 499 kr-pakken får du 1000 kreditter (100 sanger) — under 5 kr per låt.',
      },
      {
        q: 'Kan AI-russelåten konkurrere med en bestillingslåt fra en artist?',
        a: 'For russefester og sosiale medier — definitivt. Kvaliteten på AI-musikk i 2026 er overraskende høy, og fordi vi optimaliserer norsk uttale slipper dere den «robotaktige» stemmen som mange internasjonale verktøy gir.',
      },
      {
        q: 'Hvor lang tid tar det å lage russelåten?',
        a: 'Fra dere skriver beskrivelsen til ferdig MP3-fil tar det vanligvis 2–4 minutter. Forhåndsvisning kommer på under ett minutt — så dere kan justere før dere bruker hele kreditten.',
      },
      {
        q: 'Hvilken sjanger gir best russelåt?',
        a: 'EDM og hard pop dominerer russemusikken, men de mest virale russelåtene de siste årene er ofte rap med tunge beats. Test flere sjangre — det koster lite og dere finner ofte gull i en stil dere ikke hadde tenkt på.',
      },
      {
        q: 'Kan vi lage flere versjoner av samme låt?',
        a: 'Ja, og det anbefaler vi sterkt. Selv små endringer i beskrivelsen kan gi vesentlig forskjellig resultat. Lag 3–5 versjoner og la bussen stemme på favoritten.',
      },
    ],
    relatedSlugs: ['festmusikk', 'edm', 'rap'],
    ctaTitle: 'Lag russelåten deres nå',
    ctaText:
      'Første sang er gratis. Vipps-betaling, ingen abonnement, ferdig på 2 minutter. Logg inn og test selv — bussen din venter.',
  },

  // ─────────────────────────── BURSDAGSSANG ───────────────────────────
  {
    slug: 'bursdagssang',
    brand: 'AI Bursdagssang',
    metaTitle: 'AI Bursdagssang — lag personlig bursdagssang med AI på 2 minutter',
    metaDescription:
      'Lag en personlig AI-bursdagssang med navn, minner og innsidespøker. Norsk uttale, klar på 2 minutter, fra 99 kr. Bursdagsgaven ingen glemmer.',
    keywords:
      'AI bursdagssang, bursdagssang AI, lag bursdagssang, personlig bursdagssang, AI sang bursdag, bursdagssang generator, bursdagssang norsk, lag personlig bursdagssang',
    ogTitle: 'AI Bursdagssang — personlig bursdagssang på 2 minutter',
    ogDescription:
      'Personlig AI-bursdagssang med navn, minner og innsidespøker. Norsk uttale, fra 99 kr, ingen abonnement.',
    h1: 'AI Bursdagssang — den mest personlige bursdagsgaven du kan gi',
    intro:
      'Etter «Hurra for deg» nummer tjue blir det litt repeterende. Med AI-bursdagssang lager du en helt unik sang som handler om akkurat den personen som har bursdag — med navn, hobbyer, innsidespøker og morsomme detaljer. Klar på 2 minutter, sunget med autentisk norsk uttale, og den eneste i sitt slag i hele verden.',
    sections: [
      {
        heading: 'Hvorfor lage bursdagssangen med AI?',
        paragraphs: [
          'En personlig sang er gaven som folk husker. Den koster en brøkdel av en konsertbillett, tar 2 minutter å lage, og har 100 % treffsikkerhet — fordi du vet hva som får akkurat denne personen til å le, gråte eller bli rørt.',
          'Det fine med AI-bursdagssang er at du kan lage flere versjoner. Test en rørende vise og en humoristisk roast-rap til samme person, så velger du favoritten. Eller spill begge på festen — én før kaken, én etter.',
        ],
        list: [
          'Helt unik sang med personens navn, alder og egenskaper',
          'Velg mellom pop, rock, vise, rap, country, EDM eller akustisk',
          'Ferdig på 2 minutter — perfekt for siste-liten-gaver',
          'Norsk uttale som høres profesjonelt ut',
          'Mye billigere enn å bestille sang fra artist',
          'Vipps-betaling og engangskjøp — ingen abonnement',
        ],
      },
      {
        heading: 'Hvem passer en AI-bursdagssang for?',
        paragraphs: [
          'Det korte svaret: alle. Det lengre svaret: den fungerer ekstra godt for milepæler og personer som «har alt» — der en vanlig gave virker tom.',
        ],
        list: [
          'Mamma og pappa — spesielt ved 50, 60 eller 70-årsdager',
          'Bestevennen — en humoristisk roast som gjør hele festen kjekk',
          'Kjæresten eller partneren — rørende vise med felles minner',
          'Barn og barnebarn — søt og enkel sang med navn og favorittting',
          'Kollega — overraskelse på jobb-bursdagen, gjerne som «firmasang»',
          'Bestemor eller bestefar — vise i country eller akustisk stil',
        ],
      },
      {
        heading: 'Slik lager du den perfekte bursdagssangen',
        paragraphs: [
          'Hemmeligheten bak en god bursdagssang er konkrete detaljer. Generiske beskrivelser gir generiske sanger. Spesifikke beskrivelser gir sanger som treffer rett i hjertet.',
        ],
        list: [
          'Skriv ned 3–5 ting bursdagsbarnet er kjent for blant venner og familie',
          'Ta med innsidespøker — de morsomste linjene kommer ofte herfra',
          'Inkluder konkrete steder — hytta, hjembyen, favorittpuben',
          'Velg sjanger som matcher personen — vise for de rolige, rap for de røffe',
          'Bestem stemning før du skriver — rørende, morsom, energisk eller frekk',
          'Forhåndsvis sangen før du bruker full kreditt — juster om noe ikke sitter',
        ],
      },
    ],
    examplePrompts: [
      'Rørende akustisk vise til mamma som fyller 60. Hun elsker hagen sin, hatter, og kaller alle barnebarna for «smultringen min». Tema: takknemlighet og at hun alltid stiller opp.',
      'Humoristisk rap-roast til Per som blir 30. Han er kjent for å miste mobilen overalt, drikker bare Hansa, og påstår han skal flytte til Lofoten hvert år uten å gjøre det.',
      'Søt barnesang til Emma som blir 5. Hun elsker Bluey, dinosaurer og er livredd for støvsugeren. Refrenget skal handle om at hun er den modigste prinsessen i hele Bergen.',
    ],
    whyAiMusikk: [
      {
        title: 'Norsk uttale uten kleine pauser',
        desc: 'Norske navn som «Synnøve», «Bjørn» og «Ådne» tygger seg gjennom internasjonale AI-verktøy. Vi optimaliserer uttalen så navnet uttales rett.',
      },
      {
        title: 'Forhåndsvisning før du bruker kreditten',
        desc: 'Hør et utdrag før du forplikter deg. Hvis stemningen er feil, juster beskrivelsen og prøv på nytt — uten å sløse penger.',
      },
      {
        title: 'Last ned MP3 og spill hvor som helst',
        desc: 'Sangen er din. Spill på festen, send i SMS eller legg på USB-stick til bilen. Ingen avspillingsbegrensninger eller streaming-låsing.',
      },
    ],
    faqs: [
      {
        q: 'Kan jeg bruke navnet til bursdagsbarnet i sangen?',
        a: 'Absolutt — navnet er ofte det viktigste. Skriv det inn i beskrivelsen, og AI-en bygger sangen rundt det. Vi anbefaler å skrive uttalen fonetisk hvis navnet er uvanlig (f.eks. «Synnøve = sin-nø-ve»).',
      },
      {
        q: 'Hvor lang er en AI-bursdagssang?',
        a: 'Normalt 2–3 minutter — som en vanlig låt. Du kan be om kortere eller lengre versjoner i beskrivelsen, men standard er ferdig sang med vers, refreng og bro.',
      },
      {
        q: 'Kan jeg lage en sang til en avdød kjær?',
        a: 'Ja, mange bruker AI til å lage minnesanger. Velg vise eller akustisk sjanger og beskriv minnene du vil hedre. Vi anbefaler å lese gjennom flere ganger før du deler — det er ekstra viktig at hver setning sitter når sangen er emosjonell.',
      },
      {
        q: 'Hva koster en bursdagssang?',
        a: 'Én full sang koster 10 kreditter. Med 99 kr-pakken (100 kreditter) får du altså 10 bursdagssanger. Du kan lage flere versjoner til samme person og velge den beste.',
      },
      {
        q: 'Kan jeg redigere teksten etterpå?',
        a: 'Du kan redigere lyric-teksten før selve musikken genereres. Etter generering er låten ferdig — men du kan alltid lage en ny versjon med oppdatert tekst.',
      },
      {
        q: 'Fungerer det også for barnebursdager?',
        a: 'Veldig godt. Beskriv barnets favoritt-tema (Bluey, dinosaurer, prinsesser, fotball), og velg pop eller akustisk sjanger. Resultatet blir en sang barnet vil høre på i ukevis.',
      },
    ],
    relatedSlugs: ['barnesang', 'bryllupssang', 'pop'],
    ctaTitle: 'Lag bursdagssangen i dag',
    ctaText:
      'Første sang er gratis. Det tar 2 minutter, og resultatet er den mest personlige bursdagsgaven du kan gi.',
  },

  // ─────────────────────────── BRYLLUPSSANG ───────────────────────────
  {
    slug: 'bryllupssang',
    brand: 'AI Bryllupssang',
    metaTitle: 'AI Bryllupssang — personlig sang til bryllupsdagen (lag på 2 min)',
    metaDescription:
      'Lag en personlig AI-bryllupssang til brudeparet, første dans eller talen. Autentisk norsk uttale, ferdig på 2 minutter, fra 99 kr — uten dyre artister.',
    keywords:
      'AI bryllupssang, bryllupssang AI, lag bryllupssang med AI, første dans sang, bryllupssang generator, personlig bryllupssang, norsk bryllupssang, AI sang bryllup, bryllupsmusikk AI',
    ogTitle: 'AI Bryllupssang — personlig sang til bryllupsdagen',
    ogDescription:
      'Personlig AI-bryllupssang til brudeparet, første dans eller talen. Norsk uttale, fra 99 kr.',
    h1: 'AI Bryllupssang — sangen som gjør dagen uforglemmelig',
    intro:
      'En personlig bryllupssang er en av de fineste gavene du kan gi — eller skape selv som brudepar. Med AI-bryllupssang lager du en låt som inneholder navnene, kjærlighetshistorien og de små detaljene som gjør paret unikt. Klar på 2 minutter, sunget med autentisk norsk uttale, og en gang-i-livet-opplevelse.',
    sections: [
      {
        heading: 'Når passer en AI-bryllupssang?',
        paragraphs: [
          'Bryllupsdagen har mange musikk-øyeblikk, og de fleste tjener på å være personlig. AI-bryllupssang passer spesielt godt der dere vil ha noe som ikke alle andre par har:',
        ],
        list: [
          'Første dans — låten som starter resten av livet sammen',
          'Inntog i kirken eller seremoni — i stedet for klassisk standardlåt',
          'Forrett-musikk — bakgrunnsmusikk under måltidet',
          'Talen — overraskelseslåt fra forloveren etter brudgomstalen',
          'Avslutning — siste dans før festen slutter',
          'Til brudeparet som gave fra venner og familie',
        ],
      },
      {
        heading: 'Hvorfor velge AI-bryllupssang fremfor en standardlåt?',
        paragraphs: [
          'En klassisk bryllupslåt er trygg, men forutsigbar. Halve gjestelisten har hørt «Perfect» av Ed Sheeran på et tidligere bryllup. En personlig AI-sang gjør dagen unik — og koster mindre enn én flaske bryllupsbobbel.',
          'Det handler ikke om å erstatte tradisjonen, men å legge til et øyeblikk som er unikt for akkurat dette paret. Lag den klassiske listen for danse-musikken, og bruk AI til den ene sangen som handler om dere.',
        ],
      },
      {
        heading: 'Slik lager dere bryllupssangen',
        paragraphs: [
          'En bryllupssang trenger varme, spesifikke detaljer og rett stemning. Vis-sjangeren eller akustisk pop fungerer ofte best — men en country-låt med norsk uttale kan også være magisk.',
        ],
        list: [
          'Skriv ned hvordan dere møttes — tid, sted, hvem som tok kontakt først',
          'Inkluder spesielle steder — første dato, hjembyen, hyttetur',
          'Nevn felles ritualer — søndagstur, fredagstaco, sommerferie samme sted',
          'Bestem stemning — rolig og rørende, eller energisk og festlig',
          'Velg sjanger med omhu — akustisk vise er klassikeren, men test gjerne country',
          'Lag flere versjoner — kanskje den «morsomme» blir favoritten på festen',
        ],
      },
      {
        heading: 'Bryllupssang fra venner og familie',
        paragraphs: [
          'Skal du gi sangen som gave, har du et lite spionoppdrag før du starter. Snakk med beste-venn, søsken eller foreldre om innsidespøker, fortell hvordan paret møttes, og samle 5–10 konkrete detaljer. Jo mer spesifikk, jo bedre.',
          'Forrett-tale-trikset: spill sangen direkte etter talen din. Si noen ord om paret, drypp inn at du har laget noe spesielt, og sett på låten. Det blir et øyeblikk hele festen husker.',
        ],
      },
    ],
    examplePrompts: [
      'Rolig akustisk vise til bryllupet til Sara og Ole. De møttes på russetreff i 2018, flyttet sammen til Trondheim, og elsker fjellturer. Tema: at livet ble større fordi de fant hverandre.',
      'Country-bryllupssang til første dans. Brudeparet er fra Telemark, gift på fjellet i Rauland. Inkluder linjen «vi danser hjem til oss to». Stemning: rørende men varm.',
      'Pop-bryllupssang til talen fra forloveren. Skal handle om at brudeparet alltid mister bilnøkler, kjærligheten til kaffepauser, og at bestevenn-rollen nå offisielt er nummer to.',
    ],
    whyAiMusikk: [
      {
        title: 'Bryllup er emosjonelt — uttalen må sitte',
        desc: 'Norske navn og stedsnavn er kjernen i bryllupssanger. Vi optimaliserer for autentisk norsk uttale — ingen kleine «Sa-rah» eller «Tronn-hejm».',
      },
      {
        title: 'Lag flere versjoner uten dyrt regning',
        desc: 'Vis-versjon for første dans, country-versjon til kakekutting, pop til avslutning. Med engangskjøp fra 99 kr har dere råd til å eksperimentere.',
      },
      {
        title: 'Last ned i god tid',
        desc: 'Generer låten dager før bryllupet, last ned MP3 og last over til DJ-en. Ingen wifi-stress, ingen streaming-glipp på selveste dagen.',
      },
    ],
    faqs: [
      {
        q: 'Hvor lang er en AI-bryllupssang — passer den til første dans?',
        a: 'Ferdig sang er typisk 2–3 minutter — perfekt lengde for en første dans. Spesifiser «kort vers, langt refreng» i beskrivelsen hvis du vil styre lengden.',
      },
      {
        q: 'Kan vi få sangen som gave fra venner uten å ødelegge overraskelsen?',
        a: 'Absolutt. Vennen lager sangen i sin egen konto og laster ned MP3 — brudeparet ser ingenting før låten spilles på dagen. Lag den noen dager før så er det god tid til å justere.',
      },
      {
        q: 'Kan vi spille sangen i kirken?',
        a: 'Sjekk med presten på forhånd — de fleste norske kirker tillater personlige låter til vielse. Ta med MP3-filen på USB eller mobil.',
      },
      {
        q: 'Hva slags sjanger funker best på første dans?',
        a: 'Akustisk vise og country er klassiske trygge valg. Men hvis dere er et par som elsker pop eller rock, ikke vær redd for å gå mot strømmen — det er deres dag, og deres musikk.',
      },
      {
        q: 'Kan vi inkludere flere personer i sangen, ikke bare brudeparet?',
        a: 'Ja. Mange velger å nevne barn, foreldre eller forlovere i bryllupssangen. Skriv navnene i beskrivelsen og angi rollen («Lars, sønn»; «Bestefar Olav, salig»).',
      },
      {
        q: 'Får vi noe digital sertifikat på at sangen er deres?',
        a: 'Du eier sangen du lager — vi gir ingen NFT eller sertifikat, men du har fulle bruksrettigheter. Sangen kan ikke gjenskapes identisk, så den er reelt sett unik for dere.',
      },
    ],
    relatedSlugs: ['bursdagssang', 'country', 'festmusikk'],
    ctaTitle: 'Lag bryllupssangen i god tid',
    ctaText:
      'Første sang er gratis. Test ut, juster, last ned. Bryllupsdagen kommer kun én gang — gjør musikken unik.',
  },

  // ─────────────────────────── FESTMUSIKK ───────────────────────────
  {
    slug: 'festmusikk',
    brand: 'AI Festmusikk',
    metaTitle: 'AI Festmusikk — lag energisk festlåt til vors og fest med AI',
    metaDescription:
      'Lag AI-festmusikk skreddersydd for vors, fest, jubileum eller utdrikningslag. Norsk uttale, full energi, ferdig på 2 minutter — fra 99 kr uten abonnement.',
    keywords:
      'AI festmusikk, AI festlåt, lag festmusikk, festmusikk AI, vors-musikk, drikkesang AI, festlåt generator, norsk festlåt, AI sang fest, festsang generator',
    ogTitle: 'AI Festmusikk — energisk festlåt på 2 minutter',
    ogDescription:
      'AI-festmusikk for vors, fest og jubileum. Norsk uttale, full energi, fra 99 kr.',
    h1: 'AI Festmusikk — låten som setter stemningen',
    intro:
      'Festmusikk er ryggraden i enhver god kveld. Med AI-festmusikk lager du en høyenergi-låt skreddersydd for nøyaktig din anledning — vors, hagefest, utdrikningslag, jubileum eller bedriftsfest. Sangen handler om gjengen din, festen din og stemningen du vil sette. Klar på 2 minutter, sunget med ekte norsk uttale.',
    sections: [
      {
        heading: 'Hva slags fester passer AI-festmusikk for?',
        paragraphs: [
          'AI-festmusikk er ekstra effektivt når festen har et tema, en gjeng eller et øyeblikk som fortjener egen soundtrack. Disse fungerer spesielt godt:',
        ],
        list: [
          'Vors og pre-party — sett stemningen før byen',
          'Hagefest og sommerfest — låten alle synger med på',
          'Utdrikningslag (gutta- og jentekveld) — overraskelse til den som skal gifte seg',
          'Jubileer — 30-, 40-, 50-årsdager med en låt om bursdagsbarnet',
          'Bedriftsfester — overraskelse om sjefen, gjengen eller årets høydepunkter',
          'Studentfester — låten som handler om dere som lesegjeng',
          'Hyttetur og fjellfest — sangen om turen som ble en historie',
        ],
      },
      {
        heading: 'Hvorfor lage festmusikken med AI?',
        paragraphs: [
          'En generisk Spotify-playlist er trygg, men ingen husker hvilken låt som spilte. En personlig festlåt — der gjengens navn, slagord og insider-jokes er innebygd — blir et øyeblikk gjengen snakker om i flere år.',
          'Plus: det går fort. På tiden det tar å rydde stua før gjestene kommer, har du ferdig en sang som setter tonen for hele kvelden.',
        ],
        list: [
          'Personlig festlåt for under 10 kr (med 499 kr-pakken)',
          'Klar på 2 minutter — selv på partyet samme kveld',
          'Full energi: pop, EDM, rock eller drikkevise',
          'Norsk uttale som hele festen skjønner',
          'Vipps-betaling — ingen kortregistrering',
        ],
      },
      {
        heading: 'Slik lager du festlåten',
        paragraphs: [
          'Hemmelig formel: gjeng + slagord + insider-joke = perfekt festlåt. Spesifikke detaljer trumfer alltid generiske beskrivelser når målet er å få hele festen til å le og synge med.',
        ],
        list: [
          'Velg sjanger: pop og EDM dominerer, men drikkeviser i vise-stil treffer ofte hardest',
          'Bruk konkrete navn og kallenavn på gjengen',
          'Inkluder slagord — gruppen har sikkert ett',
          'Drypp inn 1–2 insider-jokes som bare gjengen forstår',
          'Beskriv stedet — hagefest i Vestfold, hytte i Rauland, byferie i Berlin',
          'Velg refrenglinje med omhu — det er den hele festen synger med på',
        ],
      },
    ],
    examplePrompts: [
      'Energisk EDM-festlåt for vorset til Lasse-gjengen i Tromsø før Bukta-festivalen. Slagord: «Vi tar nattskiftet». Inkluder insider om at Pål alltid bestiller siste runde.',
      'Drikkesang i vise-stil til hyttetur for ingeniørgjengen. Hytte i Rauland, fast vors med karaoke. Refreng: «vi tar oss en til, med Marit på piano».',
      'Pop-festlåt til 50-årsfesten til Linn fra Lillehammer. Hun er kjent for å synge Tom Jones, drikker bare Cava, og påstår hun «aldri går av før klokken tre».',
    ],
    whyAiMusikk: [
      {
        title: 'Bygget for høy energi på norsk',
        desc: 'Pop, EDM og festlåter er sjangrene flest tester først — og våre uttale-optimaliseringer holder energien selv når teksten er full av norsk slang.',
      },
      {
        title: 'Spleis i Vipps på sekunder',
        desc: 'Gjengen kan spleise i Vipps-gruppe og noen lager låten — bursdagsbarnet får aldri vite at noen «handlet inn». Engangskjøp, ingen abonnement.',
      },
      {
        title: 'Last ned i forkant — spill offline',
        desc: 'Hytter og fjell-fester har ofte dårlig dekning. Last ned MP3 hjemme, og spill av uten wifi-stress.',
      },
    ],
    faqs: [
      {
        q: 'Kan vi spille AI-festmusikk på offentlige steder?',
        a: 'For private fester og uformelle samlinger har du fulle bruksrettigheter. For offentlige arrangementer (utesteder, kommersielle events) gjelder TONO-regelverk på vanlig vis — sjekk vilkårene våre for detaljer.',
      },
      {
        q: 'Hvilken sjanger er mest brukt til festmusikk?',
        a: 'EDM og hard pop dominerer for «pumpe-låter». Drikkeviser og folkemusikk-pop fungerer overraskende godt på vors og bredere familielag. Test 2–3 sjangre med samme tekst og hør forskjellen.',
      },
      {
        q: 'Hvor lang er en typisk festlåt?',
        a: 'Standardlengde er 2–3 minutter. For festkontekst anbefaler vi å spesifisere «catchy refreng som gjentas tre ganger» — det øker dansegulv-effekten.',
      },
      {
        q: 'Hva koster en festlåt?',
        a: '10 kreditter (én full sang). Med 199 kr-pakken får du 25 sanger — nok til en hel sesong med vors og fester.',
      },
      {
        q: 'Kan vi lage festlåter med temaer som er litt grove?',
        a: 'Innenfor god skikk og bruk er det mye rom. Drikkeviser og roast-låter er populære. Vi blokkerer kun innhold som er ulovlig, hatefullt eller diskriminerende — se vilkårene for full liste.',
      },
      {
        q: 'Kan jeg lage et helt soundtrack til festen?',
        a: 'Mange gjør det. 4–5 låter dekker ulike stemninger (oppvarming, dansegulv, sentimental gjenkjennelse, avslutning). Med 25- eller 100-pakken har du mer enn nok kreditter.',
      },
    ],
    relatedSlugs: ['russemusikk', 'edm', 'pop'],
    ctaTitle: 'Lag festlåten før gjestene kommer',
    ctaText:
      'Første sang er gratis. På 2 minutter har du soundtracket som gjør festen kveldens prat-emne.',
  },

  // ─────────────────────────── BARNESANG ───────────────────────────
  {
    slug: 'barnesang',
    brand: 'AI Barnesang',
    metaTitle: 'AI Barnesang — lag søt og personlig barnesang med AI',
    metaDescription:
      'Lag personlige AI-barnesanger med barnets navn og favorittting. Norsk uttale, perfekt til barnehagen, bursdager og leggetid. Fra 99 kr, ingen abonnement.',
    keywords:
      'AI barnesang, lag barnesang, personlig barnesang, AI sang barn, barnesang norsk, barnesang generator, barnehagesang, sovesang AI, AI sang barnehage',
    ogTitle: 'AI Barnesang — søt og personlig sang til barnet',
    ogDescription:
      'Personlig AI-barnesang med navn og favorittting. Norsk uttale, fra 99 kr.',
    h1: 'AI Barnesang — sangen som er kun for barnet ditt',
    intro:
      'Barn elsker sanger om seg selv. Med AI-barnesang lager du en låt med barnets navn, favorittting og lille personlighet — perfekt til leggetid, bursdager, barnehagen eller bilturen. Klar på 2 minutter, sunget med autentisk norsk uttale, og garantert minst tjue ganger på loop neste uke.',
    sections: [
      {
        heading: 'Hva slags barnesanger kan du lage?',
        paragraphs: [
          'AI-barnesanger fungerer på tvers av aldre, fra spedbarn til skolebarn. Tilpass tekst og sjanger til alderen — søte og enkle for de minste, mer rytmiske og morsomme for barn som har begynt å like Bluey og Frozen.',
        ],
        list: [
          'Sovesang med barnets navn — for trygg leggetid',
          'Bursdagssang skreddersydd til 1-, 2-, 3-årsdagen',
          'Barnehage-sang om vennene og favorittlek',
          'Bilturssang som gjør lange reiser kortere',
          'Teppe-prinsesse / superhelt-sang basert på barnets fantasi',
          'Læringssang om bokstaver, dyr eller farger',
        ],
      },
      {
        heading: 'Hvorfor barn elsker personlige sanger',
        paragraphs: [
          'Når barn hører sitt eget navn i en sang, lyser de opp. Hjernen registrerer sangen som «min», og den blir umiddelbart favoritt. Det er den enkle, kraftige effekten som gjør AI-barnesanger til noe spesielt — og det er grunnen til at en personlig sang ofte slår ut TV-favoritten på topp-listen i barnerommet.',
          'Bonus: foreldre som har laget sangen blir noe nær guder i barnets øyne.',
        ],
      },
      {
        heading: 'Slik lager du barnesangen',
        paragraphs: [
          'Hemmeligheten er enkelhet. Bruk korte setninger, gjentakelser og konkrete detaljer som barnet kan kjenne igjen. Akustisk pop, vise og enkel country fungerer best — unngå tunge beats og mye tekst per linje.',
        ],
        list: [
          'Velg sjanger: akustisk eller pop er trygt — vise er klassisk for de minste',
          'Bruk barnets navn flere ganger — gjerne i refrenget',
          'Inkluder favoritt-tema (dinosaurer, prinsesse, traktor, Bluey)',
          'Beskriv barnets personlighet («modig», «glad», «alltid sulten på ostepop»)',
          'Hold lengden kort — be om enkel struktur uten lange instrumentalpartier',
          'Be om «høy og klar vokal» — barn liker når stemmen er tydelig',
        ],
      },
      {
        heading: 'Sovesang som faktisk får barnet til å sove',
        paragraphs: [
          'Sovesanger har en egen formel: rolig tempo, blød melodi, og repetitive linjer som «små stjerner sover», «pappa er her», «bjørnen er hjemme». AI-en forstår dette hvis du beskriver det tydelig.',
        ],
        list: [
          'Velg akustisk sjanger og spesifiser «rolig tempo»',
          'Be om at vokalen er «mjuk og varm»',
          'Bruk gjentakelser — barnehjerner finner trygghet i mønster',
          'Inkluder kosedyret eller bamsen som hovedperson',
          'Hold lengden til 2 minutter — lenger gir ofte motsatt effekt',
        ],
      },
    ],
    examplePrompts: [
      'Søt akustisk sovesang for Mathea (3 år) i Bergen. Hun har en bamse som heter Bjørka, sover med nattlampe, og er livredd for støvsugeren. Tema: at Bjørka passer på henne hele natten.',
      'Glad og energisk pop-barnesang til Aksels 5-årsdag i Oslo. Han elsker traktorer, dinosaurer og brannbiler. Refrenget skal handle om at han er Norges modigste prinse-traktorfører.',
      'Vise om barnehagen til Stine (4) på Storfjell. Inkluder hennes beste venn Selma, favorittleken hoppetau, og at de spiser mat utendørs. Stemning: glad og enkel.',
    ],
    whyAiMusikk: [
      {
        title: 'Norsk uttale barn forstår',
        desc: 'Barnesanger som synges på «engelsk-norsk» er forvirrende for små ører. Vår uttale-optimalisering gjør at hvert ord uttales klart og naturlig.',
      },
      {
        title: 'Trygt innhold som standard',
        desc: 'Vi blokkerer voksent og uegnet innhold automatisk — du kan trygt la barnet ditt høre sangen uten å sjekke teksten linje for linje.',
      },
      {
        title: 'Last ned MP3 for offline avspilling',
        desc: 'Bilturer, hytteturer, fly — last ned sangen og spill av uten internett. Ingen streaming-stress når 3-åringen krever låten på loop.',
      },
    ],
    faqs: [
      {
        q: 'Egnet for hvilken alder?',
        a: 'Vi anbefaler 0–10 år. For helt små (under 1 år) virker rolige akustiske sanger best. For 6–10-åringer kan du gå mot pop og enkel rap. Bruk beskrivelsen til å styre stemning og kompleksitet.',
      },
      {
        q: 'Kan jeg lage en sang om barnehagegruppa?',
        a: 'Ja, det er populært. Beskriv navn på de andre barna (få samtykke fra foreldrene først), favoritt-aktiviteter og pedagogen. Mange foreldre lager sang som gave til barnehagen.',
      },
      {
        q: 'Er innholdet trygt for barn?',
        a: 'Vi har innholdsfilter som blokkerer voksent og hatefullt innhold. Likevel anbefaler vi alltid å lytte gjennom én gang før du lar barnet høre — for å være helt sikker på at stemningen er riktig.',
      },
      {
        q: 'Hvor lang er en typisk barnesang?',
        a: 'Standardlengde er 2 minutter — perfekt før barn mister konsentrasjonen. For sovesanger anbefaler vi å spesifisere «kort og repeterende» i beskrivelsen.',
      },
      {
        q: 'Kan vi bruke sangen i barnehagen?',
        a: 'Ja, sangen er din. Mange barnehager spiller AI-barnesanger på samlingsstunder eller ved bursdagsfeiringer.',
      },
      {
        q: 'Kan barnet være med å lage sangen?',
        a: 'Absolutt — det gjør det ekstra magisk. La barnet beskrive favorittfargen, kosedyret og hvilken superhelt-evne det vil ha. Skriv det inn i beskrivelsen så blir sangen «laget av» barnet selv.',
      },
    ],
    relatedSlugs: ['bursdagssang', 'pop', 'country'],
    ctaTitle: 'Lag barnesangen i kveld',
    ctaText:
      'Første sang er gratis. Det tar 2 minutter — og barnet ditt får en låt som er kun deres.',
  },

  // ─────────────────────────── COUNTRY ───────────────────────────
  {
    slug: 'country',
    brand: 'AI Country',
    metaTitle: 'AI Country — lag norsk country-sang med AI på 2 minutter',
    metaDescription:
      'Lag autentisk norsk AI-country med banjo, gitar og varm vokal. Perfekt til hyttetur, bryllup og fjelltur. Norsk uttale, fra 99 kr — uten abonnement.',
    keywords:
      'AI country, AI country norsk, lag country-sang, norsk countrymusikk AI, AI country generator, countrysang norsk, hytte-country, fjellcountry, AI norsk country',
    ogTitle: 'AI Country — norsk country-sang på 2 minutter',
    ogDescription:
      'Norsk AI-country med banjo, gitar og autentisk uttale. Fra 99 kr.',
    h1: 'AI Country — norsk country med ekte norsk uttale',
    intro:
      'Norsk country har en egen sjarm — hyttekjær, fjellnær og varm. Med AI-country lager du en låt som klinger som om den ble innspilt på en låvestue i Telemark, men med din historie i teksten. Klar på 2 minutter, sunget med autentisk norsk uttale, og perfekt for både hyttetur og bryllup.',
    sections: [
      {
        heading: 'Hva passer AI-country til?',
        paragraphs: [
          'Country som sjanger kler historier om hjem, kjærlighet og natur — alt som står sterkt i norsk kultur. Disse anledningene fungerer ekstra godt:',
        ],
        list: [
          'Hyttetur og fjelltur — låten om gjengen og turen',
          'Bryllupssang — varm og rolig vise til første dans',
          'Bursdagssang til foreldre eller besteforeldre',
          'Sang om hjemstedet — Telemark, Røros, Lofoten, Hardanger',
          'Hyllest til avdød kjær — country er en av de varmeste sjangrene for minneord',
          'Sang til hesten, hunden eller traktoren — country elsker dyr og maskiner',
        ],
      },
      {
        heading: 'Hva gjør norsk country annerledes?',
        paragraphs: [
          'Amerikansk country er skreddersydd for prærien. Norsk country handler om fjell, fjord, hytte, sus og varme i kalde stuer. Når du lager AI-country på norsk, sørger vår uttale-optimalisering for at stedsnavn som «Hardanger», «Røros» og «Lofoten» uttales riktig — ikke som «Hard-anger» eller «Loff-toten».',
          'Den norske country-tradisjonen ligger nær trubadur-sjangeren — gitar, banjo, varme akkorder, og tekster som forteller en historie. Det er en sjanger som kler høst og vinter, men også varme sommerkvelder ved bålet.',
        ],
      },
      {
        heading: 'Slik lager du AI-countrylåten',
        paragraphs: [
          'Country lever av historiefortelling. En god country-låt har et tydelig anker — et sted, en person, en hendelse — og bygger sangen rundt det.',
        ],
        list: [
          'Velg ankret: en hytte, en bil, en bestefar, et fjell, en tur',
          'Beskriv stemningen — varm, vemodig, tilfredsstillende, sentimental',
          'Inkluder konkrete detaljer — vedovn, gummistøvler, kaffe på primus',
          'Spesifiser instrumenter — «akustisk gitar og banjo» gir klassisk country',
          'Be om «warm vocal» eller «storyteller-stemme»',
          'Hold tekst enkel — country tygger ikke kompliserte setninger',
        ],
      },
    ],
    examplePrompts: [
      'Norsk AI-country om hyttetur i Rauland med kompiser. Tema: kaffe på primus, fiske i Mårfjell, og at byen kan vente. Stemning: rolig og takknemlig.',
      'Country-bursdagssang til pappa Olav som fyller 70 i Vinje. Han er traktorbonde, elsker Hank Williams, og kaller alle barnebarna «smårollinger». Refreng: «Olav på Vinje».',
      'Vemodig country-vise om bestefars hytte ved Hardangervidda. Han er borte nå, men hytta står. Stemning: takknemlig sorg, varme minner, vedovn-os.',
    ],
    whyAiMusikk: [
      {
        title: 'Norske stedsnavn uttales rett',
        desc: 'Country lever av sted. Vi optimaliserer for autentisk norsk uttale så «Hardanger» og «Røros» klinger som de skal.',
      },
      {
        title: 'Banjo og gitar i god produksjon',
        desc: 'Bestill konkret instrumentering i beskrivelsen — Suno-modellen håndterer akustisk gitar, banjo og pedalsteel godt.',
      },
      {
        title: 'Test flere versjoner uten å betale abonnement',
        desc: 'Country er en sjanger der nyansene betyr alt. Lag 3 versjoner og velg den som klinger mest «hjemmehørende».',
      },
    ],
    faqs: [
      {
        q: 'Funker AI-country på dialekt?',
        a: 'Ja, men det krever litt eksperimentering. Skriv dialekt fonetisk i teksten du legger inn («æ kjøre traktor ned te tørrgrasenga»). Resultatet blir ikke perfekt dialekt, men en bokmålssunget versjon med dialektvendinger funker overraskende godt.',
      },
      {
        q: 'Kan jeg lage country-musikk inspirert av Hellbillies eller Vamp?',
        a: 'Du kan beskrive stilen i prompten: «inspirert av Hellbillies — akustisk, varm, telemark-stemt». Vi kan ikke garantere lydlikhet, men sjangeren og stemningen kommer ofte gjennom.',
      },
      {
        q: 'Hva slags instrumenter får jeg i AI-country?',
        a: 'Som standard: akustisk gitar, vokal, lett trommer. Skriv «banjo», «pedalsteel», «mandolin» eller «munnspill» i beskrivelsen for å be om mer instrumentering — modellen prøver å levere.',
      },
      {
        q: 'Passer AI-country til bryllup?',
        a: 'Veldig godt. Country er en av de varmeste sjangrene for første dans — velg rolig tempo, akustisk gitar og storyteller-vokal i beskrivelsen.',
      },
      {
        q: 'Kan jeg lage country på engelsk?',
        a: 'AI MUSIKK er optimalisert for norsk uttale. Engelsk fungerer, men da utnytter du ikke vår største styrke. For engelsk country anbefaler vi internasjonale verktøy.',
      },
      {
        q: 'Hvor lang er en typisk country-låt?',
        a: '3 minutter er klassisk country-lengde. AI MUSIKK leverer 2–3 minutters sanger som standard — du kan be om kortere/lengre i beskrivelsen.',
      },
    ],
    relatedSlugs: ['bryllupssang', 'rock', 'pop'],
    ctaTitle: 'Lag countrylåten i kveld',
    ctaText:
      'Første sang er gratis. Beskriv hytta, gjengen eller minnet — la AI-en gi det varme stemmer og banjo.',
  },

  // ─────────────────────────── POP ───────────────────────────
  {
    slug: 'pop',
    brand: 'AI Pop',
    metaTitle: 'AI Pop — lag norsk pop-sang med AI (catchy refreng på minutter)',
    metaDescription:
      'Lag fengende AI-popmusikk på norsk. Catchy refrenger, autentisk uttale, perfekt til bursdager og fester. Fra 99 kr — uten abonnement, ingen kortregistrering.',
    keywords:
      'AI pop, AI popmusikk, lag pop-sang AI, norsk pop AI, AI pop generator, pop sang norsk, AI catchy pop, lag norsk pop, popmusikk AI norsk',
    ogTitle: 'AI Pop — fengende norsk pop på 2 minutter',
    ogDescription:
      'Catchy AI-pop på norsk med autentisk uttale. Fra 99 kr, ingen abonnement.',
    h1: 'AI Pop — fengende popmusikk skreddersydd til deg',
    intro:
      'Pop er popmusikkens kjerne — fengende refrenger, klar produksjon og en sjanger som passer til nesten alle anledninger. Med AI-pop lager du en personlig poplåt med autentisk norsk uttale, klar på 2 minutter, og uten abonnement å huske på.',
    sections: [
      {
        heading: 'Hvorfor er pop den mest fleksible AI-sjangeren?',
        paragraphs: [
          'Pop fungerer som universalverktøy. Den kler bursdager, fester, sosiale medier, bryllup, kjærlighetshilsener og spøkelåter. Hvis du ikke vet hvilken sjanger du skal velge, er pop nesten alltid trygt valg.',
          'AI-pop er også sjangeren der vår uttale-optimalisering skinner mest. Pop lever av at refrenget treffer rett — og det krever klar, naturlig norsk uttale uten kunstige pauser.',
        ],
      },
      {
        heading: 'Hva passer AI-pop til?',
        paragraphs: [
          'Pop er bredspektret, og det er en grunn til at den dominerer hitlistene. Disse anvendelsene er ekstra populære:',
        ],
        list: [
          'Bursdagssanger — pop er klassikeren',
          'Bryllupssanger — fengende første dans',
          'Festlåter med catchy refreng',
          'Sosiale medier — TikTok og Instagram-kompatible hooks',
          'Kjærlighetshilsener — Valentines, jubileer, småsanger',
          'Avskjedssanger på jobb',
          'Reklame eller intro-musikk til podcast',
        ],
      },
      {
        heading: 'Slik lager du den perfekte AI-poplåten',
        paragraphs: [
          'Hemmeligheten med pop: refrenget. Pop er bygget rundt et hook som gjentas, og hvis hooket ikke sitter, faller hele sangen. Bruk tid på å beskrive akkurat hva refrenget skal handle om.',
        ],
        list: [
          'Velg ett enkelt tema — pop blir rotete med for mange ideer',
          'Spesifiser refrenget separat i beskrivelsen',
          'Be om «catchy hook» og «sangbare ord»',
          'Velg tempo — opptempo (120+) for fest, mid-tempo for kjærlighet',
          'Inkluder navn og spesifikke detaljer i versene',
          'Test 2 versjoner — små endringer i refrengtekst gir store forskjeller',
        ],
      },
    ],
    examplePrompts: [
      'Catchy norsk pop til Marens 25-årsdag i Stavanger. Hun er kjent for å danse på bord, bestiller alltid mojito, og ler høyere enn alle. Refreng: «Maren, Maren, sjefen på Stavanger».',
      'Romantisk pop-ballade til årsdagen til Lars og Ida i Trondheim. De møttes på Samfundet, har en bulldog som heter Pluto, og elsker fredagstaco. Stemning: varm og fengende.',
      'Energisk pop-festlåt om jentegjengen Bestiene fra Tromsø. Slagord: «Vi tar nordlyset». Refrenget skal være sangbar og enkel — én linje gjentatt.',
    ],
    whyAiMusikk: [
      {
        title: 'Catchy hooks med klar norsk uttale',
        desc: 'Pop dør hvis refrenget ikke synges klart. Vår uttale-optimalisering gjør at hvert ord i hooket sitter — ingen kunstige pauser eller rare lydene.',
      },
      {
        title: 'Mest populære sjanger blant brukerne',
        desc: 'Pop er førstevalget for over halvparten av sangene laget på AI MUSIKK. Modellen er dermed ekstra finjustert for norsk pop.',
      },
      {
        title: 'Sosiale medier-vennlig',
        desc: 'Pop-låter passer rett inn på TikTok, Reels og Shorts. Last ned MP3 og legg over til redigeringsappen — TikTok-favoritt på 5 minutter.',
      },
    ],
    faqs: [
      {
        q: 'Hvorfor velger flest pop-sjangeren?',
        a: 'Pop er allsidig, fengende og passer nesten enhver anledning. For brukere som ikke har sterke sjanger-preferanser, er pop nesten alltid et trygt valg som leverer forventet resultat.',
      },
      {
        q: 'Kan AI-pop sammenlignes med Astrid S, Sigrid eller Aurora?',
        a: 'Du kan beskrive stilen i prompten («inspirert av norsk synth-pop som Aurora»), men vi garanterer ikke lydlikhet. Vi kan ramme stemning og produksjon, ikke kopiere artister.',
      },
      {
        q: 'Hvor lang er en typisk pop-låt?',
        a: '2:30–3 minutter er pop-standard. AI MUSIKK leverer i dette området som default — be om kortere eller lengre i beskrivelsen.',
      },
      {
        q: 'Kan jeg styre vokalstil?',
        a: 'Du kan beskrive stilen — «høy klar vokal», «mørk og varm stemme», «luftig og lett». Modellen tolker beskrivelsen og leverer i den retningen, men eksakt stemmevalg er ikke mulig.',
      },
      {
        q: 'Får jeg både vers og refreng?',
        a: 'Ja — full poplåt har vers, refreng, vers, refreng, bro, refreng som standard. Du kan be om alternativ struktur i beskrivelsen («kun refreng» eller «to vers før refreng»).',
      },
      {
        q: 'Kan jeg bruke pop-låten på sosiale medier?',
        a: 'Ja, du har full bruksrett. Vær obs på at TikTok og Instagram noen ganger flagger AI-musikk i sine systemer — i praksis er det sjelden et problem.',
      },
    ],
    relatedSlugs: ['bursdagssang', 'festmusikk', 'rock'],
    ctaTitle: 'Lag poplåten i kveld',
    ctaText:
      'Første sang er gratis. Pop er trygt, fengende og funker overalt — perfekt sjanger å starte med.',
  },

  // ─────────────────────────── RAP ───────────────────────────
  {
    slug: 'rap',
    brand: 'AI Rap',
    metaTitle: 'AI Rap — lag norsk hip-hop og rap-sang med AI på minutter',
    metaDescription:
      'Lag norsk AI-rap med tunge beats og autentisk uttale. Perfekt til russelåter, roast og festmusikk. Fra 99 kr — engangskjøp, Vipps-betaling, ingen abonnement.',
    keywords:
      'AI rap, AI norsk rap, lag rap-sang AI, AI hiphop, AI rap norsk, rap-låt generator, AI rap-tekst, AI rap-bedrift, lag rap norsk',
    ogTitle: 'AI Rap — norsk hip-hop på 2 minutter',
    ogDescription:
      'Norsk AI-rap med tunge beats og autentisk norsk uttale. Fra 99 kr.',
    h1: 'AI Rap — norsk hip-hop med ekte uttale og tunge beats',
    intro:
      'Norsk rap har gått fra undergrunnen til topplistene — Karpe, OnklP, Cezinando og Arif beviser at norsk språk og hip-hop kler hverandre. Med AI-rap lager du en personlig norsk rap-låt med autentisk uttale på 2 minutter, fra 99 kr. Ferdig for russebussen, festen, eller bare for å imponere kompisen.',
    sections: [
      {
        heading: 'Hva passer AI-rap til?',
        paragraphs: [
          'Rap er en sjanger som kler historiefortelling, slang og intensitet. Disse anledningene fungerer ekstra godt med AI-rap:',
        ],
        list: [
          'Russelåt — rap er en av de mest populære russe-sjangrene',
          'Roast på bursdager — kjærlig hån som ingen kan misforstå',
          'Festlåt med tunge beats — pumper opp dansegulvet',
          'Diss-tracks (i god ånd) — bursdagsbarnet, kollegaen, broren',
          'Fortellinger — rap er overlegen for narrativ form',
          'Bedriftsfest-overraskelse — rap om sjefen som faktisk treffer',
        ],
      },
      {
        heading: 'Hvorfor er norsk rap så vanskelig for andre AI-verktøy?',
        paragraphs: [
          'Internasjonale AI-verktøy som Suno og Udio er trent på engelsk hip-hop. Når de prøver å rappe på norsk, høres det ofte ut som en utlending som leser et fonetisk ark — feil rytme, feil flyt, feil norsk.',
          'Vår uttale-optimalisering bygger inn norsk fonetikk og rim-mønster i selve teksten før den sendes til musikk-modellen. Resultatet er rap som faktisk treffer flow på norsk — slik OnklP og Karpe ville rappet det.',
        ],
      },
      {
        heading: 'Slik lager du AI-rapen',
        paragraphs: [
          'Rap krever spesifikk struktur og tett tekst. Mer detaljer = bedre rap, fordi sjangeren lever av navn, steder og spesifikke referanser.',
        ],
        list: [
          'Velg under-stil — old-school, trap, melodisk rap eller drill',
          'Spesifiser tempo — «sakte og tungt» vs. «raskt og hardt»',
          'Bruk konkrete navn og kallenavn — flere er bedre',
          'Inkluder steder — Oslo Øst, Stavanger, Tromsø, Nedre Eiker',
          'Skriv slang — det matcher sjangeren bedre enn formell norsk',
          'Be om «punchline-fokus» hvis det er roast-rap',
        ],
      },
    ],
    examplePrompts: [
      'Hard norsk rap-roast til 30-årsbursdagen til Henrik fra Oslo Øst. Han er kjent for å si «sjefskaptein», bestiller alltid Mack på pub, og påstår han er sjefen i Excel.',
      'Russe-rap for Knute Skavlan fra Trondheim. Slagord: «Vi e knuten med stil». Inkluder lokal referanse til Samfundet og NTNU. Tunge trap-beats.',
      'Melodisk rap til avskjedsfest for kollega Anette på SAS. Stemning: kjærlig nostalgisk. Tema: kaffepauser, mandagsmøter, og at hun alltid stjal stoler fra møterom.',
    ],
    whyAiMusikk: [
      {
        title: 'Norsk flow som faktisk klinger',
        desc: 'Rap dør hvis flowen er feil. Vi optimaliserer norsk fonetikk og rim slik at rap-en flyter naturlig, ikke som lest fra ark.',
      },
      {
        title: 'Bygget for slang og dialekt',
        desc: 'Skriv inn slang og dialekt i beskrivelsen — modellen håndterer Oslo-rap, bergensk og trønder-rap overraskende godt.',
      },
      {
        title: 'Tunge beats uten å betale Suno-abonnement',
        desc: 'Suno tar 88 kr/mnd. Hos oss får du 10 rap-låter for 99 kr — engangskjøp og Vipps.',
      },
    ],
    faqs: [
      {
        q: 'Funker AI-rap på dialekt eller bare bokmål?',
        a: 'Du kan skrive dialekt fonetisk i beskrivelsen («æ vil hjem te trøndelag»), og modellen håndterer det stort sett godt. Bergensk og trøndersk gir best resultat — Sørlandsk er litt mer utfordrende for AI.',
      },
      {
        q: 'Kan jeg lage diss-track eller roast-rap?',
        a: 'Ja, så lenge det er innenfor god ånd og ikke faller i trakassering eller hat. Roast-rap til bursdagsbarnet eller venner er populært. Vi blokkerer ulovlig og hatefullt innhold automatisk.',
      },
      {
        q: 'Hvor lang er en typisk rap-låt?',
        a: 'Standard 2:30–3 minutter med 2 vers og refreng. Du kan be om lengre rap (8 vers, ingen refreng) — fungerer godt for fortellings-rap.',
      },
      {
        q: 'Kan AI-rap konkurrere med ekte norske rappere?',
        a: 'For private formål — ja, kvaliteten er overraskende høy. For kommersiell utgivelse mot Karpe og OnklP — nei, den menneskelige finess i norsk rap er ikke fullt ut replikerbar enda.',
      },
      {
        q: 'Hva slags beats får jeg som standard?',
        a: 'Beskriv beats konkret: «trap-beats med 808», «old-school boombap», «melodisk drill». Modellen følger beskrivelsen, og resultatet matcher i stor grad det du ber om.',
      },
      {
        q: 'Kan jeg bruke AI-rapen på Spotify?',
        a: 'For privat bruk og deling, ja. For utgivelse på Spotify må du følge plattformens regler om AI-musikk og dokumentere fulle bruksrettigheter — sjekk våre vilkår for detaljer.',
      },
    ],
    relatedSlugs: ['russemusikk', 'edm', 'festmusikk'],
    ctaTitle: 'Lag rap-låten i kveld',
    ctaText:
      'Første sang er gratis. Rap krever flow på norsk — og det er nettopp det vi er bygget for.',
  },

  // ─────────────────────────── EDM ───────────────────────────
  {
    slug: 'edm',
    brand: 'AI EDM',
    metaTitle: 'AI EDM — lag elektronisk dansemusikk med AI på 2 minutter',
    metaDescription:
      'Lag energisk AI-EDM med drop, bass og produsert lyd. Perfekt til russemusikk, vors og festlåter. Fra 99 kr — uten abonnement, betal med Vipps.',
    keywords:
      'AI EDM, AI elektronisk musikk, AI EDM norsk, lag EDM med AI, AI house generator, AI tropic house, EDM generator, lag elektronisk musikk, AI dansemusikk',
    ogTitle: 'AI EDM — elektronisk dansemusikk på 2 minutter',
    ogDescription:
      'AI-EDM med drop, bass og produsert lyd. Perfekt til fest. Fra 99 kr.',
    h1: 'AI EDM — elektronisk dansemusikk skreddersydd til ditt øyeblikk',
    intro:
      'EDM (Electronic Dance Music) lever av drop, bass og energi. Med AI-EDM lager du en proff-klingende elektronisk låt på 2 minutter — perfekt til russebussen, vorset, hagefesten eller TikTok-bakgrunnen. Norsk vokal når du vil, instrumental når du heller vil ha drop alene.',
    sections: [
      {
        heading: 'Hva slags EDM kan du lage?',
        paragraphs: [
          'EDM er paraplyen for mange under-stiler. AI-modellen håndterer flere godt — spesifiser i beskrivelsen for å få akkurat det du vil ha:',
        ],
        list: [
          'House — klassisk 4-på-gulvet, perfekt til vors',
          'Tropical house — Kygo-aktig, varm og luftig',
          'Big-room EDM — festival-energi, tunge drops',
          'Dance pop — vokaldrevet, sangbart, høy energi',
          'Future bass — Flume-aktig, melodisk og produsert',
          'Eurodance — for retro-festen og 90-talls vibes',
        ],
      },
      {
        heading: 'Hvorfor passer EDM perfekt til AI-generering?',
        paragraphs: [
          'EDM er den mest produserte sjangeren — laget av elektroniske instrumenter, layered i en datamaskin, og bygget for repetisjon. Det betyr at AI-modeller har enklere jobb med EDM enn med f.eks. akustisk vise. Resultatet er ofte overraskende profft.',
          'Plus: vokal er sekundært i mye EDM. Du kan be om instrumental EDM eller minimal vokal-hook — perfekt hvis du vil unngå at AI-vokal eventuelt skurrer.',
        ],
      },
      {
        heading: 'Slik lager du den perfekte AI-EDM',
        paragraphs: [
          'EDM lever av tempo, drop og struktur. Vær spesifikk om hva slags energi du vil ha, og når dropet skal komme.',
        ],
        list: [
          'Spesifiser BPM eller energinivå («124 BPM festival house»)',
          'Be om drop-struktur — «build-up i 16 takter, så hard drop»',
          'Velg vokalstil — «kvinnelig pop-vokal», «vocoder», eller «instrumental»',
          'Inkluder instrumenter — synth, sub-bass, side-chained pads',
          'Beskriv stemningen — «sommernatt på Nordstrand-festivalen»',
          'Hold tekst kort — EDM krever ikke mye lyrikk',
        ],
      },
    ],
    examplePrompts: [
      'Tropical house EDM i Kygo-stil til hyttetur til Sjusjøen. Lett vokalhook om sommer og fjell, varm produksjon, moderat tempo. Stemning: solnedgang ved peisen.',
      'Big-room festival-EDM for Mads sin 30-års burdsdag i Oslo. Hard drop, festival-energi. Vokalhook: «vi er hard som Mads i kveld!». Tempo: 128.',
      'Future bass-instrumentale til TikTok-videoer om reise. Melodisk, dansbar, produsert lyd. Ingen vokal — bare bygg-opp og drop.',
    ],
    whyAiMusikk: [
      {
        title: 'Bygget for høy produksjon',
        desc: 'EDM trenger fett-lydende produksjon. Suno-modellen leverer overraskende profft EDM-master, og vi optimaliserer mix-instruksjoner i bakgrunnen.',
      },
      {
        title: 'Norsk vokal når du vil',
        desc: 'Be om norsk vokalhook for et russe- eller fest-publikum. Vår uttale-optimalisering gjelder også på EDM med norsk vokal.',
      },
      {
        title: 'Engangskjøp = perfekt for festsesong',
        desc: 'Russe- og festsesongen krever ofte mange låter på kort tid. Med 199 kr-pakken får du 25 sanger — nok til en hel sommersesong.',
      },
    ],
    faqs: [
      {
        q: 'Kan jeg lage instrumental EDM uten vokal?',
        a: 'Ja, skriv «instrumental» eller «no vocals» i beskrivelsen. Du får hele struktur (build, drop, breakdown) uten vokalspor — perfekt for video-bakgrunn eller DJ-mix.',
      },
      {
        q: 'Funker AI-EDM som DJ-pakke til en privat fest?',
        a: 'Mange bruker det slik. Lag 5–10 EDM-låter med ulik energi (varm-up, top-energi, cool-down), last ned MP3 og spill av som playlist. Engangskjøp gjør det rimelig for et helt vors.',
      },
      {
        q: 'Hva er forskjellen på «house» og «EDM»?',
        a: 'EDM er paraplyen, house er en under-stil. Hvis du sier «EDM» får du ofte big-room/festival-stil. Hvis du sier «house» får du firetakts groove-orientert. Spesifiser tydelig.',
      },
      {
        q: 'Kan AI-EDM måle seg med Kygo eller Avicii?',
        a: 'Stemningen og strukturen — ofte overraskende nær. Den lille finess som gjør Kygo unik (lyd-design, miksing) er fortsatt menneske-laget. For private formål er kvaliteten mer enn god nok.',
      },
      {
        q: 'Kan jeg styre BPM (tempo)?',
        a: 'Ja, skriv det inn — «124 BPM», «128 BPM festival», «100 BPM tropical house». Modellen prøver å treffe, og lykkes nesten alltid innenfor 5 BPM.',
      },
      {
        q: 'Kan jeg legge AI-EDM som bakgrunn til TikTok?',
        a: 'Ja — last ned MP3 og last opp i TikTok-redigereren. Pass på TikToks regler om AI-musikk; vanligvis går det glatt for personlig innhold.',
      },
    ],
    relatedSlugs: ['russemusikk', 'festmusikk', 'rap'],
    ctaTitle: 'Lag EDM-låten i kveld',
    ctaText:
      'Første sang er gratis. Beskriv festen og dropet — la AI-en bygge build-up og drop på sekunder.',
  },

  // ─────────────────────────── ROCK ───────────────────────────
  {
    slug: 'rock',
    brand: 'AI Rock',
    metaTitle: 'AI Rock — lag norsk rocklåt med AI (gitar, trommer, ekte uttale)',
    metaDescription:
      'Lag fet AI-rock på norsk med distort gitar, tunge trommer og autentisk uttale. Perfekt til festen, hyllesten eller hyttekvelden. Fra 99 kr.',
    keywords:
      'AI rock, AI rocklåt, AI norsk rock, lag rocklåt AI, AI rock generator, norsk rock AI, hardrock AI, indie rock AI, lag norsk rock',
    ogTitle: 'AI Rock — norsk rocklåt med distort gitar',
    ogDescription:
      'Fet AI-rock på norsk med ekte uttale og tunge trommer. Fra 99 kr.',
    h1: 'AI Rock — norsk rock med distort gitar og ekte trøkk',
    intro:
      'Norsk rock har en lang og stolt tradisjon — DumDum Boys, Madrugada, Turbonegro, Kvelertak. Med AI-rock lager du en ny rocklåt på norsk med distort gitar, tunge trommer og autentisk uttale på 2 minutter. Perfekt til hyllesten, festen eller bare fordi noen i gjengen elsker rock.',
    sections: [
      {
        heading: 'Hva slags rock kan du lage med AI?',
        paragraphs: [
          'Rock er en bred sjanger, og AI-modellen håndterer flere under-stiler godt. Spesifiser i beskrivelsen for å treffe akkurat din vibe:',
        ],
        list: [
          'Klassisk rock — distort gitar, tunge trommer, kraftig vokal',
          'Indie rock — luftig, melodisk, lett produksjon',
          'Hardrock og metal — tunge riff, høy energi',
          'Pop-rock — fengende refrenger, klar produksjon',
          'Punk — rask, råe, kortere låter',
          'Country-rock — krysning som fungerer godt for hyttetur og bryllup',
        ],
      },
      {
        heading: 'Hvorfor lage rock med AI?',
        paragraphs: [
          'Rock er en sjanger som krever bandmedlemmer, øvingslokale og innspillingstid. Med AI-rock får du fet rocklåt på 2 minutter — perfekt for situasjoner der du trenger noe «rocka og personlig» uten å samle 4 musikere først.',
          'For hyllester, fester og overraskelser er det nesten umulig å slå en personlig rocklåt om gjengen, jubilanten eller anledningen. Distort gitar + sangbar refreng = umiddelbar fest-energi.',
        ],
      },
      {
        heading: 'Slik lager du den perfekte AI-rocklåten',
        paragraphs: [
          'Rock lever av riff, energi og stemmeløft. Vær spesifikk om hva slags rock du vil ha — generisk «rock» kan tolkes alt fra Bon Jovi til Black Sabbath.',
        ],
        list: [
          'Velg under-stil — klassisk rock, indie, hardrock, punk',
          'Spesifiser instrumenter — «distort gitar», «dobbel pedal trommer»',
          'Be om vokalstil — «kraftig», «raspy», «klar og tydelig»',
          'Inkluder konkrete navn, steder og hendelser',
          'Bestem energi — «midt-tempo arena-rock» vs. «hard punk»',
          'Test 2 versjoner — riffene varierer betydelig mellom genereringer',
        ],
      },
    ],
    examplePrompts: [
      'Klassisk norsk rock til 50-årsbursdagen til Tor Erik fra Drammen. Han er gitarist på fritiden, elsker DumDum Boys, og kaller alle gamle kompiser «rocka». Distort gitar, kraftig refreng.',
      'Indie-rock om hyttekameratene fra Nittedal. Tema: peisbål, øl og at Vebjørn alltid mister fjernkontrollen. Stemning: nostalgisk og varm.',
      'Hardrock-roast til Pers 40-års bursdag. Han er HMS-sjef, men elsker å bryte regler privat. Tunge riff, raspy vokal, refreng om at «Per har flammen».',
    ],
    whyAiMusikk: [
      {
        title: 'Norsk rock med ekte uttale',
        desc: 'Rock-vokal på norsk er sårbart for kunstig uttale. Vår optimalisering gjør at vokalen klinger som en faktisk norsk rocker — ikke en utenlandsk imitator.',
      },
      {
        title: 'Distort og energi som standard',
        desc: 'Be konkret om «distort gitar», «overdrive», «kraftige trommer» — modellen leverer fett-lydende rock-produksjon.',
      },
      {
        title: 'Lag flere riff-varianter',
        desc: 'Rock varierer mye mellom genereringer fordi gitarriff er kreativt. Lag 3 versjoner og velg favoritten — engangskjøp gjør det billig.',
      },
    ],
    faqs: [
      {
        q: 'Kan AI-rock måle seg med Kvelertak eller Madrugada?',
        a: 'For privat bruk og fester — overraskende godt. Den særegne miksen og produksjonsfilosofien til ekte band er fortsatt unike. Som hyllest eller personlig låt fungerer det fett.',
      },
      {
        q: 'Hvor lang er en typisk rocklåt?',
        a: '3 minutter er klassisk rock-format. Du kan be om kortere (punk-stil, 2 minutter) eller lengre (arena-rock med gitar-solo, 4 minutter).',
      },
      {
        q: 'Får jeg gitar-solo i AI-rock?',
        a: 'Hvis du ber om det. Skriv «inkluder gitar-solo etter andre refreng» i beskrivelsen. Resultatene varierer, men modellen prøver å levere.',
      },
      {
        q: 'Funker hardrock og metal?',
        a: 'Klassisk hardrock går veldig godt. Death-metal og ekstrem-metal er mer utfordrende — modellen er trent på mainstream rock og leverer best i den retningen.',
      },
      {
        q: 'Kan jeg lage rock på engelsk i stedet for norsk?',
        a: 'Ja, men da utnytter du ikke vår uttale-optimalisering. For engelsk-rock fungerer internasjonale verktøy som Suno også godt.',
      },
      {
        q: 'Kan jeg lage rock-cover av en eksisterende sang?',
        a: 'Nei — vi tilbyr kun original musikk. Du kan lage en sang inspirert av en stemning eller stil, men ikke kopiere eksisterende verk.',
      },
    ],
    relatedSlugs: ['country', 'pop', 'festmusikk'],
    ctaTitle: 'Lag rocklåten i kveld',
    ctaText:
      'Første sang er gratis. Beskriv gjengen, jubilanten eller hyttekvelden — la AI-en gi det distort gitar og full trøkk.',
  },
]

export const nichesBySlug: Record<string, NicheLandingData> = Object.fromEntries(
  niches.map((n) => [n.slug, n])
)

export function getNiche(slug: string): NicheLandingData | undefined {
  return nichesBySlug[slug]
}
