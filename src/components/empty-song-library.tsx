import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Music } from 'lucide-react'

export function EmptySongLibrary() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-4">🎵</div>
      <h3 className="text-xl font-semibold mb-2">Ingen sanger ennå!</h3>
      <p className="text-gray-600 mb-6">La oss lage ditt første mesterverk</p>
      <Button asChild className="bg-[#E94560] hover:bg-[#D62839]">
        <Link href="/">
          <Music className="mr-2 h-5 w-5" />
          Lag sang
        </Link>
      </Button>
    </div>
  )
}
