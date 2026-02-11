import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AppLogoProps {
  className?: string
  size?: number
}

export function AppLogo({ className, size = 24 }: AppLogoProps) {
  return (
    <Image
      src="/ki-musikk.png"
      alt="KI MUSIKK"
      width={size}
      height={size}
      className={cn('inline-block', className)}
    />
  )
}
