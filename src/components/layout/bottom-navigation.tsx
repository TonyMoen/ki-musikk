'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Settings } from 'lucide-react'
import { AppLogo } from '@/components/app-logo'
import { useCreditsStore } from '@/stores/credits-store'
import { useEffect } from 'react'

export function BottomNavigation() {
  const pathname = usePathname()
  const { balance, refreshBalance } = useCreditsStore()

  useEffect(() => {
    refreshBalance()
  }, [refreshBalance])

  const navItems = [
    { href: '/', icon: Home, label: 'Hjem' },
    { href: '/sanger', icon: ({ className }: { className?: string }) => <AppLogo size={24} className={className} />, label: 'Sanger' },
    { href: '/innstillinger', icon: Settings, label: 'Innstillinger' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#06090F] border-t border-[rgba(90,140,255,0.1)] md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full relative ${
                isActive
                  ? 'text-[#F26522]'
                  : 'text-[rgba(180,200,240,0.5)] hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
