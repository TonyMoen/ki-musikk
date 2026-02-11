import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AppLogo } from '@/components/app-logo'

export function EmptySongLibrary() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <AppLogo size={40} />
      </div>
      <h3 className="text-xl font-semibold mb-2">Ingen sanger ennå!</h3>
      <p className="text-gray-600 mb-6">La oss lage ditt første mesterverk</p>
      <Button asChild className="bg-[#E94560] hover:bg-[#D62839]">
        <Link href="/">
          <AppLogo size={20} className="mr-2" />
          Lag sang
        </Link>
      </Button>
    </div>
  )
}
