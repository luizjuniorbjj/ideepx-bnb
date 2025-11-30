'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Home, Network, DollarSign, Activity, Shield } from 'lucide-react'

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      color: 'text-blue-400'
    },
    {
      name: 'Rede',
      icon: Network,
      path: '/network',
      color: 'text-purple-400'
    },
    {
      name: 'Sacar',
      icon: DollarSign,
      path: '/withdraw',
      color: 'text-green-400'
    },
    {
      name: 'MT5',
      icon: Activity,
      path: '/mt5',
      color: 'text-orange-400'
    },
    {
      name: 'Transparência',
      icon: Shield,
      path: '/transparency',
      color: 'text-cyan-400'
    }
  ]

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-t border-white/10">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-300 ${
                  active
                    ? 'bg-white/10 shadow-lg'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Active indicator */}
                {active && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                )}

                {/* Icon */}
                <Icon
                  className={`w-5 h-5 mb-1 transition-all duration-300 ${
                    active ? item.color : 'text-gray-400'
                  }`}
                />

                {/* Label */}
                <span
                  className={`text-[10px] font-medium transition-all duration-300 ${
                    active ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {item.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
