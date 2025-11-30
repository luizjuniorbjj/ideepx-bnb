'use client'

import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
}

export function GlassCard({ children, className = '', hover = false, gradient = false }: GlassCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        ${gradient
          ? 'bg-gradient-to-br from-white/10 via-white/5 to-transparent'
          : 'bg-white/5'
        }
        backdrop-blur-xl
        border border-white/10
        shadow-2xl shadow-black/20
        ${hover ? 'transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-blue-500/10 hover:scale-[1.02]' : ''}
        ${className}
      `}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan'
}

export function StatCard({ icon, label, value, subtitle, trend, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    cyan: 'text-cyan-400'
  }

  return (
    <GlassCard hover className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl bg-white/5 ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-500/20 text-green-400' :
            trend === 'down' ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl lg:text-3xl font-bold text-white mb-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </GlassCard>
  )
}
