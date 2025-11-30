'use client'

import { ReactNode } from 'react'
import { ConnectButton } from './ConnectButton'
import { BottomNav } from './BottomNav'
import Logo from './Logo'

interface PageLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  icon?: ReactNode
  showBottomNav?: boolean
}

export function PageLayout({
  children,
  title,
  subtitle,
  icon,
  showBottomNav = true
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950">
      {/* Animated background overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0),rgba(0,0,0,0.8))] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />

      {/* Header - Melhorado */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-3xl shadow-2xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Logo className="h-8" />
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative container mx-auto px-4 py-6 pb-24">
        {/* Page Title - Premium */}
        {title && (
          <div className="text-center mb-8">
            {icon && (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 backdrop-blur-xl mb-4 shadow-xl">
                {icon}
              </div>
            )}
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-100">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm lg:text-base text-gray-400 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNav />}
    </div>
  )
}
