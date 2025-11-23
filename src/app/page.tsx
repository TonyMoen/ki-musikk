'use client'

import { useState } from 'react'
import { GenreSelection } from '@/components/genre-selection'

export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState<{
    id: string
    name: string
  } | null>(null)

  const handleGenreSelect = (genreId: string, genreName: string) => {
    setSelectedGenre({ id: genreId, name: genreName })
    console.log('Selected genre:', { genreId, genreName })
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24">
      <div className="z-10 w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-2 text-center md:text-left">
          Musikkfabrikken
        </h1>
        <p className="text-lg mb-8 text-center md:text-left text-gray-600">
          Lag morsomme norske sanger med AI - autentisk norsk uttale!
        </p>

        {/* Genre Selection Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-center md:text-left">
            Velg sjanger
          </h2>
          <GenreSelection onGenreSelect={handleGenreSelect} />

          {selectedGenre && (
            <p className="mt-4 text-sm text-gray-600 text-center md:text-left">
              Valgt sjanger: <strong>{selectedGenre.name}</strong>
            </p>
          )}
        </div>

        {/* Placeholder for future steps */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-center">
            Neste steg: Lyrikkinput og AI-generering kommer snart...
          </p>
        </div>
      </div>
    </main>
  );
}
