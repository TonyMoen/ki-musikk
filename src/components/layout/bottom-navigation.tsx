'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Music, Settings } from 'lucide-react'
import { useCreditsStore } from '@/stores/credits-store'
import { useEffect } from 'react'

export function BottomNavigation() {
  const pathname = usePathname()
  const { balance, refreshBalance } = useCreditsStore()

  useEffect(() => {
    refreshBalance()
  }, [refreshBalance])

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/songs', icon: Music, label: 'Songs' },
    { href: '/settings', icon: Settings, label: 'Settings', badge: balance }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
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
                  ? 'text-amber-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge !== undefined && item.badge !== null && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
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
