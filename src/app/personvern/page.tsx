export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">Personvernerklæring</h1>

      <p className="text-muted-foreground mb-8">
        Sist oppdatert: Januar 2026
      </p>

      <div className="prose prose-lg max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Introduksjon</h2>
          <p className="text-muted-foreground">
            KI MUSIKK tar ditt personvern på alvor. Denne personvernerklæringen
            forklarer hvordan vi samler inn, bruker, lagrer og beskytter dine personopplysninger
            når du bruker vår tjeneste.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. Behandlingsansvarlig</h2>
          <p className="text-muted-foreground mb-4">
            Behandlingsansvarlig for personopplysningene som samles inn gjennom tjenesten er:
          </p>
          <ul className="list-none space-y-1 text-muted-foreground mb-4">
            <li>Moen Studio</li>
            <li>Organisasjonsnummer: 931 659 685</li>
            <li>Heddalsvegen 11, 3674 Notodden</li>
            <li>E-post: <a href="mailto:hei@kimusikk.no" className="text-primary hover:underline">hei@kimusikk.no</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. Hvilke opplysninger vi samler inn</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">Kontoinformasjon</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>E-postadresse (via Vipps eller Google-innlogging)</li>
            <li>Navn (hvis tilgjengelig fra Vipps eller Google-profil)</li>
            <li>Telefonnummer (hvis du logger inn via Vipps)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Bruksdata</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Sanger du genererer (tekst, sjanger, innstillinger)</li>
            <li>Kjøpshistorikk og kredittbalanse</li>
            <li>Tidspunkt for innlogging og aktivitet</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Teknisk informasjon</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>IP-adresse</li>
            <li>Nettlesertype og versjon</li>
            <li>Enhetstype</li>
            <li>Informasjonskapsler (cookies)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Hvordan vi bruker opplysningene</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Levere tjenesten:</strong> Autentisere deg, generere sanger, behandle betalinger</li>
            <li><strong>Forbedre tjenesten:</strong> Analysere bruksmønstre for å gjøre tjenesten bedre</li>
            <li><strong>Kommunikasjon:</strong> Sende viktige oppdateringer om tjenesten eller din konto</li>
            <li><strong>Support:</strong> Hjelpe deg med spørsmål og problemer</li>
            <li><strong>Sikkerhet:</strong> Oppdage og forhindre misbruk</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. Rettslig grunnlag</h2>
          <p className="text-muted-foreground mb-4">
            Vi behandler personopplysninger basert på følgende rettslige grunnlag:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Avtale:</strong> Nødvendig for å levere tjenesten du har bestilt</li>
            <li><strong>Samtykke:</strong> For markedsføring og ikke-essensielle cookies</li>
            <li><strong>Berettiget interesse:</strong> For å forbedre og sikre tjenesten</li>
            <li><strong>Juridisk forpliktelse:</strong> For å oppfylle regnskaps- og skattelover</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. Deling av opplysninger</h2>
          <p className="text-muted-foreground mb-4">
            Vi deler personopplysninger med følgende tredjeparter:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Supabase:</strong> Database og autentisering (USA, EU Standard Contractual Clauses)</li>
            <li><strong>Vipps:</strong> Betalingsbehandling og innlogging (Norge)</li>
            <li><strong>KI-tjenester:</strong> Musikkgenerering (USA)</li>
            <li><strong>Vercel:</strong> Hosting (USA, EU Standard Contractual Clauses)</li>
            <li><strong>OpenAI:</strong> Tekstgenerering og optimalisering (USA)</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            Vi selger aldri personopplysningene dine til tredjeparter.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">7. Lagring og sletting</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Kontoinformasjon:</strong> Lagres så lenge du har en aktiv konto</li>
            <li><strong>Sanger:</strong> Slettes automatisk 14 dager etter opprettelse</li>
            <li><strong>Transaksjonshistorikk:</strong> Lagres i 5 år iht. regnskapsloven</li>
            <li><strong>Logger:</strong> Slettes etter 90 dager</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            Du kan når som helst be om sletting av kontoen din ved å kontakte oss.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">8. Dine rettigheter</h2>
          <p className="text-muted-foreground mb-4">
            I henhold til GDPR har du følgende rettigheter:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Innsyn:</strong> Be om kopi av opplysningene vi har om deg</li>
            <li><strong>Retting:</strong> Be om å korrigere feilaktige opplysninger</li>
            <li><strong>Sletting:</strong> Be om sletting av dine opplysninger</li>
            <li><strong>Begrensning:</strong> Be om begrenset behandling i visse tilfeller</li>
            <li><strong>Dataportabilitet:</strong> Motta dine data i et maskinlesbart format</li>
            <li><strong>Innsigelse:</strong> Protestere mot behandling basert på berettiget interesse</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            For å utøve dine rettigheter, kontakt oss på{' '}
            <a href="mailto:hei@kimusikk.no" className="text-primary hover:underline">
              hei@kimusikk.no
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">9. Informasjonskapsler (Cookies)</h2>
          <p className="text-muted-foreground mb-4">
            Vi bruker følgende typer informasjonskapsler:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Nødvendige:</strong> For innlogging og grunnleggende funksjonalitet</li>
            <li><strong>Funksjonelle:</strong> For å huske dine preferanser</li>
            <li><strong>Analytiske:</strong> For å forstå hvordan tjenesten brukes</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            Du kan administrere cookies i nettleserinnstillingene dine.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">10. Sikkerhet</h2>
          <p className="text-muted-foreground">
            Vi bruker bransjestandarder for å beskytte dine data, inkludert kryptering
            i transit (HTTPS) og i hvile, sikker autentisering via OAuth 2.0, og
            regelmessige sikkerhetsgjennomganger. Ingen metode for dataoverføring eller
            lagring er 100% sikker, men vi gjør vårt beste for å beskytte dine opplysninger.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">11. Barn</h2>
          <p className="text-muted-foreground">
            KI MUSIKK er ikke rettet mot barn under 13 år. Vi samler ikke bevisst
            inn personopplysninger fra barn. Hvis du blir oppmerksom på at et barn har
            gitt oss personopplysninger, kontakt oss så vi kan slette informasjonen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">12. Endringer</h2>
          <p className="text-muted-foreground">
            Vi kan oppdatere denne personvernerklæringen fra tid til annen. Ved vesentlige
            endringer vil vi varsle deg via e-post eller gjennom tjenesten. Fortsatt bruk
            etter endringer anses som aksept av den oppdaterte erklæringen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">13. Klage</h2>
          <p className="text-muted-foreground">
            Hvis du mener vi ikke behandler dine personopplysninger i samsvar med loven,
            har du rett til å klage til Datatilsynet:{' '}
            <a
              href="https://www.datatilsynet.no"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              www.datatilsynet.no
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">14. Kontakt</h2>
          <p className="text-muted-foreground">
            Har du spørsmål om personvern? <a href="/kontakt" className="text-primary hover:underline">Kontakt oss</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
