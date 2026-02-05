import { Mail, MessageCircle, Clock, Building2 } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">Kontakt oss</h1>

      <p className="text-xl text-muted-foreground mb-12">
        Har du spørsmål, tilbakemeldinger eller trenger hjelp? Vi er her for deg!
      </p>

      <div className="grid gap-8 md:grid-cols-2 mb-12">
        <div className="bg-muted/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">E-post</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Send oss en e-post, så svarer vi så fort vi kan.
          </p>
          <a
            href="mailto:groftefyllband@gmail.com"
            className="text-primary hover:underline font-medium"
          >
            groftefyllband@gmail.com
          </a>
        </div>

        <div className="bg-muted/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Svartid</h2>
          </div>
          <p className="text-muted-foreground">
            Vi svarer vanligvis innen 24-48 timer på hverdager. I helger og høytider
            kan det ta litt lengre tid.
          </p>
        </div>
      </div>

      {/* Company Information - Required by Vipps */}
      <div className="bg-muted/30 rounded-xl p-8 mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Firmainformasjon</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Firmanavn</p>
            <p className="font-medium">Moen Studio</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Organisasjonsnummer</p>
            <p className="font-medium">931 659 685</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Adresse</p>
            <p className="font-medium">Heddalsvegen 11<br />3674 Notodden</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">E-post</p>
            <a
              href="mailto:groftefyllband@gmail.com"
              className="font-medium text-primary hover:underline"
            >
              groftefyllband@gmail.com
            </a>
          </div>
        </div>
      </div>

      <div className="bg-muted/30 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Vanlige spørsmål</h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Hvordan fungerer kreditter?</h3>
            <p className="text-muted-foreground">
              Du kjøper kreditter som brukes til å generere sanger. En full sang koster 10 kreditter.
              Du kan forhåndsvise gratis før du bestemmer deg.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Kan jeg få refusjon?</h3>
            <p className="text-muted-foreground">
              Du har 14 dagers angrerett på kjøp av kreditter. Kontakt oss på e-post
              for å benytte angreretten.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Hvem eier sangene jeg lager?</h3>
            <p className="text-muted-foreground">
              Du har full bruksrett til sangene du genererer. Se våre <a href="/vilkaar" className="text-primary hover:underline">vilkår</a> for
              mer informasjon om opphavsrett og bruk.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Hvor lenge lagres sangene mine?</h3>
            <p className="text-muted-foreground">
              Sangene lagres i 14 dager. Husk å laste ned sangene du vil beholde! Vi sender
              en påminnelse før de slettes.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mt-12">
        <p className="text-muted-foreground">
          Fant du ikke svar på spørsmålet ditt? Sjekk vår{' '}
          <a href="/hjelp" className="text-primary hover:underline">hjelpeside</a> for mer informasjon.
        </p>
      </div>
    </div>
  )
}
