'use client'

import { Shield, AlertTriangle, CheckCircle } from 'lucide-react'

interface SecurityGaugeProps {
  solvencyRatio: number // in basis points (10000 = 100%)
  circuitBreakerActive: boolean
  emergencyReserve: bigint
}

export function SecurityGauge({ solvencyRatio, circuitBreakerActive, emergencyReserve }: SecurityGaugeProps) {
  // Convert basis points to percentage
  const percentage = solvencyRatio / 100

  // Determine color and status based on solvency ratio
  const getStatus = () => {
    if (percentage >= 110) return { color: 'green', text: 'Healthy', icon: CheckCircle }
    if (percentage >= 100) return { color: 'yellow', text: 'Warning', icon: AlertTriangle }
    return { color: 'red', text: 'Critical', icon: AlertTriangle }
  }

  const status = getStatus()
  const StatusIcon = status.icon

  // Calculate gauge fill percentage (capped at 150% for visualization)
  const gaugePercentage = Math.min((percentage / 150) * 100, 100)

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Security Status
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${
          status.color === 'green' ? 'bg-green-500/20 text-green-400' :
          status.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          <StatusIcon className="w-4 h-4" />
          {status.text}
        </div>
      </div>

      {/* Solvency Ratio Gauge */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm">Solvency Ratio</span>
          <span className="text-2xl font-bold text-white">{percentage.toFixed(2)}%</span>
        </div>

        {/* Visual gauge */}
        <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              status.color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' :
              status.color === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
              'bg-gradient-to-r from-red-500 to-red-600'
            }`}
            style={{ width: `${gaugePercentage}%` }}
          />

          {/* Threshold marker at 110% */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/50"
            style={{ left: `${(110 / 150) * 100}%` }}
          />
        </div>

        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>0%</span>
          <span className="text-white/50">110% (threshold)</span>
          <span>150%</span>
        </div>
      </div>

      {/* Circuit Breaker Status */}
      <div className={`p-4 rounded-xl mb-4 ${
        circuitBreakerActive
          ? 'bg-red-500/10 border border-red-500/30'
          : 'bg-green-500/10 border border-green-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Circuit Breaker</p>
            <p className={`text-lg font-bold ${
              circuitBreakerActive ? 'text-red-400' : 'text-green-400'
            }`}>
              {circuitBreakerActive ? 'ACTIVE' : 'Inactive'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            circuitBreakerActive ? 'bg-red-500/20' : 'bg-green-500/20'
          }`}>
            {circuitBreakerActive ? (
              <AlertTriangle className="w-6 h-6 text-red-400" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-400" />
            )}
          </div>
        </div>
      </div>

      {/* Emergency Reserve */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-sm text-gray-400 mb-1">Emergency Reserve</p>
        <p className="text-2xl font-bold text-white">
          ${(Number(emergencyReserve) / 1_000_000).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </p>
      </div>

      {/* Info text */}
      <div className="mt-4 text-xs text-gray-500">
        <p>Solvency ratio below 110% triggers circuit breaker, halting withdrawals.</p>
      </div>
    </div>
  )
}
