export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">Vilkår for bruk</h1>

      <p className="text-muted-foreground mb-8">
        Sist oppdatert: November 2025
      </p>

      <div className="prose prose-lg max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Aksept av vilkår</h2>
          <p className="text-muted-foreground">
            Ved å bruke Musikkfabrikken aksepterer du disse vilkårene. Hvis du ikke godtar
            vilkårene, ber vi deg om ikke å bruke tjenesten. Vi forbeholder oss retten til
            å oppdatere vilkårene, og fortsatt bruk etter endringer anses som aksept.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. Tjenestebeskrivelse</h2>
          <p className="text-muted-foreground">
            Musikkfabrikken er en AI-drevet tjeneste som lar brukere generere sanger med
            norsk tekst og uttale. Tjenesten bruker tredjepartsteknologi (Suno AI) for
            musikkgenerering.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. Brukerkonto</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Du må være minst 13 år for å bruke tjenesten</li>
            <li>Du er ansvarlig for å holde påloggingsinformasjonen din konfidensiell</li>
            <li>Du er ansvarlig for all aktivitet på kontoen din</li>
            <li>Vi forbeholder oss retten til å suspendere kontoer som bryter vilkårene</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Kreditter og betaling</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Kreditter kjøpes på forhånd og brukes til å generere sanger</li>
            <li>Priser oppgis i norske kroner (NOK) inkludert mva</li>
            <li>Kjøpte kreditter utløper ikke, men er knyttet til din konto</li>
            <li>Refusjon av ubrukte kreditter kan gis innen 14 dager etter kjøp</li>
            <li>Ved tekniske feil som hindrer generering, refunderes kredittene automatisk</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. Opphavsrett og bruksrett</h2>
          <p className="text-muted-foreground mb-4">
            Innhold generert gjennom Musikkfabrikken:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Du får en ikke-eksklusiv, verdensomspennende lisens til å bruke sangene du genererer</li>
            <li>Du kan dele, publisere og bruke sangene til personlige og kommersielle formål</li>
            <li>Du kan ikke hevde eksklusiv opphavsrett til AI-generert innhold</li>
            <li>Musikkfabrikken og våre teknologipartnere beholder visse rettigheter til det genererte innholdet</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. Innholdsbegrensninger</h2>
          <p className="text-muted-foreground mb-4">
            Du godtar å ikke bruke tjenesten til å generere innhold som:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Er ulovlig, støtende, truende eller diskriminerende</li>
            <li>Krenker andres opphavsrett, varemerker eller andre rettigheter</li>
            <li>Inneholder personlige opplysninger om andre uten samtykke</li>
            <li>Promoterer vold, hat eller skadelig atferd</li>
            <li>Er villedende eller utgjør svindel</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">7. Lagring og sletting</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Genererte sanger lagres i 14 dager fra opprettelse</li>
            <li>Du er ansvarlig for å laste ned sanger du ønsker å beholde</li>
            <li>Etter 14 dager slettes sanger automatisk og permanent</li>
            <li>Du kan slette sanger manuelt når som helst</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">8. Ansvarsbegrensning</h2>
          <p className="text-muted-foreground">
            Musikkfabrikken leveres &quot;som den er&quot; uten garantier. Vi er ikke ansvarlige for
            indirekte tap, tapt fortjeneste, eller skader som oppstår fra bruk av tjenesten.
            Vårt totale ansvar er begrenset til beløpet du har betalt for kreditter de siste
            12 månedene.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">9. Endringer i tjenesten</h2>
          <p className="text-muted-foreground">
            Vi forbeholder oss retten til å endre, suspendere eller avslutte tjenesten
            helt eller delvis, med eller uten varsel. Ved vesentlige endringer vil vi
            forsøke å gi rimelig varsel.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">10. Lovvalg og tvisteløsning</h2>
          <p className="text-muted-foreground">
            Disse vilkårene er underlagt norsk lov. Eventuelle tvister skal søkes løst
            gjennom forhandlinger. Om dette ikke fører frem, skal tvisten avgjøres av
            norske domstoler med Oslo tingrett som verneting.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">11. Kontakt</h2>
          <p className="text-muted-foreground">
            Har du spørsmål om disse vilkårene? <a href="/contact" className="text-primary hover:underline">Kontakt oss</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
