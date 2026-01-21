export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">Salgsbetingelser</h1>

      <p className="text-muted-foreground mb-8">
        Sist oppdatert: Januar 2026
      </p>

      <div className="prose prose-lg max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Avtalen</h2>
          <p className="text-muted-foreground">
            Avtalen består av disse salgsbetingelsene, opplysninger gitt i bestillingsløsningen
            og eventuelt særskilt avtalte vilkår. Ved motstrid mellom opplysningene, går det som
            særskilt er avtalt mellom partene foran, så fremt det ikke strider mot ufravikelig
            lovgivning.
          </p>
          <p className="text-muted-foreground mt-4">
            Avtalen vil i tillegg bli utfylt av relevante lovbestemmelser som regulerer kjøp av
            varer mellom næringsdrivende og forbrukere.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. Partene</h2>
          <p className="text-muted-foreground mb-4">
            <strong>Selger:</strong>
          </p>
          <ul className="list-none space-y-1 text-muted-foreground mb-4">
            <li>Moen Studio</li>
            <li>Organisasjonsnummer: 931 659 685</li>
            <li>Heddalsvegen 11, 3674 Notodden</li>
            <li>E-post: <a href="mailto:groftefyllband@gmail.com" className="text-primary hover:underline">groftefyllband@gmail.com</a></li>
          </ul>
          <p className="text-muted-foreground">
            <strong>Kjøper:</strong> Den forbrukeren som foretar bestillingen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. Pris</h2>
          <p className="text-muted-foreground">
            Den oppgitte prisen for varen og tjenester er den totale prisen kjøper skal betale.
            Denne prisen inkluderer alle avgifter og tilleggskostnader. Ytterligere kostnader
            som selger før kjøpet ikke har informert om, skal kjøper ikke bære.
          </p>
          <p className="text-muted-foreground mt-4">
            KI MUSIKK selger kreditter som brukes til å generere sanger. Prisene er:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
            <li>Starter: 79 kr for 500 kreditter (~50 sanger)</li>
            <li>Pro: 149 kr for 1000 kreditter (~100 sanger)</li>
            <li>Refill: 199 kr for 1000 kreditter (~100 sanger)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Avtaleinngåelse</h2>
          <p className="text-muted-foreground">
            Avtalen er bindende for begge parter når kjøperen har sendt sin bestilling til selgeren.
            Avtalen er likevel ikke bindende hvis det har forekommet skrive- eller tastefeil i
            tilbudet fra selgeren i bestillingsløsningen i nettbutikken eller i kjøperens bestilling,
            og den annen part innså eller burde ha innsett at det forelå en slik feil.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. Betaling</h2>
          <p className="text-muted-foreground">
            Selgeren kan kreve betaling for varen fra det tidspunkt den blir tilgjengelig for
            kjøperen. Betaling skjer via Vipps. Ved betaling med Vipps blir beløpet belastet
            umiddelbart ved gjennomført betaling.
          </p>
          <p className="text-muted-foreground mt-4">
            Kredittene blir tilgjengelige på kjøperens konto umiddelbart etter bekreftet betaling.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. Levering</h2>
          <p className="text-muted-foreground">
            KI MUSIKK er en digital tjeneste. Levering skjer ved at kreditter blir tilgjengelige
            på kjøperens brukerkonto umiddelbart etter bekreftet betaling. Sanger som genereres
            ved bruk av kreditter leveres digitalt og er tilgjengelige for nedlasting i 14 dager.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">7. Risikoen for varen</h2>
          <p className="text-muted-foreground">
            Risikoen for digitale tjenester går over på kjøper når tjenesten er levert, det vil
            si når kredittene er tilgjengelige på kjøperens konto.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">8. Angrerett</h2>
          <p className="text-muted-foreground">
            Med mindre avtalen er unntatt fra angrerett, kan kjøperen angre kjøpet av varen i
            henhold til angrerettloven.
          </p>
          <p className="text-muted-foreground mt-4">
            Kjøperen må gi selger melding om bruk av angreretten innen 14 dager fra fristen
            begynner å løpe. I fristen inkluderes alle kalenderdager. Fristen begynner å løpe
            dagen etter at kjøpet er gjennomført.
          </p>
          <p className="text-muted-foreground mt-4">
            For å benytte angreretten, kontakt oss på{' '}
            <a href="mailto:groftefyllband@gmail.com" className="text-primary hover:underline">
              groftefyllband@gmail.com
            </a>{' '}
            med informasjon om at du ønsker å benytte angreretten.
          </p>
          <p className="text-muted-foreground mt-4">
            <strong>Merk:</strong> Dersom kredittene er brukt til å generere sanger, anses
            tjenesten som levert og angreretten bortfaller for de brukte kredittene.
            Ubrukte kreditter kan refunderes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">9. Forsinkelse og manglende levering</h2>
          <p className="text-muted-foreground">
            Dersom selgeren ikke leverer varen eller leverer den for sent i henhold til avtalen
            mellom partene, og dette ikke skyldes kjøperen eller forhold på kjøperens side,
            kan kjøperen i henhold til reglene i forbrukerkjøpsloven kapittel 5 etter
            omstendighetene holde kjøpesummen tilbake, kreve oppfyllelse, heve avtalen og/eller
            kreve erstatning fra selgeren.
          </p>
          <p className="text-muted-foreground mt-4">
            Ved tekniske feil som hindrer levering av kreditter eller generering av sanger,
            vil kredittene automatisk refunderes til kjøperens konto.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">10. Mangel ved varen</h2>
          <p className="text-muted-foreground">
            Hvis det foreligger en mangel ved varen må kjøper innen rimelig tid etter at den
            ble oppdaget eller burde ha blitt oppdaget, gi selger melding om at han eller hun
            vil påberope seg mangelen.
          </p>
          <p className="text-muted-foreground mt-4">
            Hvis varen har en mangel og dette ikke skyldes kjøperen eller forhold på kjøperens
            side, kan kjøperen i henhold til reglene i forbrukerkjøpsloven kapittel 6 etter
            omstendighetene holde kjøpesummen tilbake, velge mellom retting og omlevering,
            kreve prisavslag, kreve avtalen hevet og/eller kreve erstatning fra selgeren.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">11. Selgerens rettigheter ved kjøperens mislighold</h2>
          <p className="text-muted-foreground">
            Dersom kjøperen ikke betaler eller oppfyller de øvrige pliktene etter avtalen eller
            loven, og dette ikke skyldes selgeren eller forhold på selgerens side, kan selgeren
            i henhold til reglene i forbrukerkjøpsloven kapittel 9 etter omstendighetene holde
            varen tilbake, kreve oppfyllelse av avtalen, kreve avtalen hevet samt kreve erstatning
            fra kjøperen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">12. Garanti</h2>
          <p className="text-muted-foreground">
            Garanti som gis av selgeren eller produsenten, gir kjøperen rettigheter i tillegg
            til de kjøperen allerede har etter ufravikelig lovgivning. En garanti innebærer
            dermed ingen begrensninger i kjøperens rett til reklamasjon og krav ved forsinkelse
            eller mangler.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">13. Personopplysninger</h2>
          <p className="text-muted-foreground">
            Behandlingsansvarlig for innsamlede personopplysninger er selger. Med mindre kjøperen
            samtykker til noe annet, kan selgeren, i tråd med personopplysningsloven, kun innhente
            og lagre de personopplysninger som er nødvendig for at selgeren skal kunne gjennomføre
            forpliktelsene etter avtalen.
          </p>
          <p className="text-muted-foreground mt-4">
            For mer informasjon, se vår{' '}
            <a href="/privacy" className="text-primary hover:underline">personvernerklæring</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">14. Konfliktløsning</h2>
          <p className="text-muted-foreground">
            Klager rettes til selger innen rimelig tid. Partene skal forsøke å løse eventuelle
            tvister i minnelighet. Dersom dette ikke lykkes, kan kjøperen ta kontakt med
            Forbrukertilsynet for mekling.
          </p>
          <p className="text-muted-foreground mt-4">
            Forbrukertilsynet er tilgjengelig på:{' '}
            <a
              href="https://www.forbrukertilsynet.no"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              www.forbrukertilsynet.no
            </a>
          </p>
          <p className="text-muted-foreground mt-4">
            Europa-Kommisjonens klageportal kan også benyttes hvis du ønsker å inngi en klage:{' '}
            <a
              href="https://ec.europa.eu/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              https://ec.europa.eu/odr
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">15. Bruksvilkår for tjenesten</h2>
          <p className="text-muted-foreground mb-4">
            I tillegg til salgsbetingelsene gjelder følgende bruksvilkår:
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Brukerkonto</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Du må være minst 13 år for å bruke tjenesten</li>
            <li>Du er ansvarlig for å holde påloggingsinformasjonen din konfidensiell</li>
            <li>Du er ansvarlig for all aktivitet på kontoen din</li>
            <li>Vi forbeholder oss retten til å suspendere kontoer som bryter vilkårene</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Opphavsrett og bruksrett</h3>
          <p className="text-muted-foreground mb-2">
            Innhold generert gjennom KI MUSIKK:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Du får en ikke-eksklusiv, verdensomspennende lisens til å bruke sangene du genererer</li>
            <li>Du kan dele, publisere og bruke sangene til personlige og kommersielle formål</li>
            <li>Du kan ikke hevde eksklusiv opphavsrett til AI-generert innhold</li>
            <li>KI MUSIKK og våre teknologipartnere beholder visse rettigheter til det genererte innholdet</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Innholdsbegrensninger</h3>
          <p className="text-muted-foreground mb-2">
            Du godtar å ikke bruke tjenesten til å generere innhold som:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Er ulovlig, støtende, truende eller diskriminerende</li>
            <li>Krenker andres opphavsrett, varemerker eller andre rettigheter</li>
            <li>Inneholder personlige opplysninger om andre uten samtykke</li>
            <li>Promoterer vold, hat eller skadelig atferd</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Lagring og sletting</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Genererte sanger lagres i 14 dager fra opprettelse</li>
            <li>Du er ansvarlig for å laste ned sanger du ønsker å beholde</li>
            <li>Etter 14 dager slettes sanger automatisk og permanent</li>
            <li>Kjøpte kreditter utløper ikke og er knyttet til din konto</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">16. Kontakt</h2>
          <p className="text-muted-foreground">
            Har du spørsmål om disse vilkårene?{' '}
            <a href="/contact" className="text-primary hover:underline">Kontakt oss</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
