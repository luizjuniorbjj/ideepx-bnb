'use client'

import { useAccount, useChainId } from 'wagmi'
import { ConnectButton } from '@/components/ConnectButton'
import { useOwner, useSystemStats, useUSDTAddress } from '@/hooks/useContract'
import { CONTRACT_ADDRESS, USDT_ADDRESS } from '@/config/contracts'

export default function DebugPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const { data: ownerAddress, isLoading: ownerLoading, error: ownerError } = useOwner()
  const { data: systemStats, isLoading: statsLoading, error: statsError } = useSystemStats()
  const { data: usdtAddress, isLoading: usdtLoading, error: usdtError } = useUSDTAddress()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">🔍 Debug Page</h1>

        {/* Wallet Connection */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">💼 Wallet Info</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400">Connected: </span>
              <span className={`font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'YES ✅' : 'NO ❌'}
              </span>
            </div>
            {isConnected && (
              <>
                <div>
                  <span className="text-gray-400">Address: </span>
                  <code className="text-blue-400 font-mono text-sm">{address}</code>
                </div>
                <div>
                  <span className="text-gray-400">Chain ID: </span>
                  <span className={`font-bold ${chainId === 56 ? 'text-green-400' : 'text-red-400'}`}>
                    {chainId} {chainId === 56 ? '(BSC Mainnet ✅)' : '(WRONG NETWORK ❌)'}
                  </span>
                </div>
              </>
            )}
            {!isConnected && (
              <div className="mt-4">
                <ConnectButton />
              </div>
            )}
          </div>
        </div>

        {/* Contract Config */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">📄 Contract Config</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400">Contract Address: </span>
              <code className="text-green-400 font-mono text-sm break-all">{CONTRACT_ADDRESS}</code>
            </div>
            <div>
              <span className="text-gray-400">USDT Address (config): </span>
              <code className="text-green-400 font-mono text-sm break-all">{USDT_ADDRESS}</code>
            </div>
          </div>
        </div>

        {/* Owner Check */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">🔑 Owner Check</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400">Loading: </span>
              <span className={`font-bold ${ownerLoading ? 'text-yellow-400' : 'text-gray-400'}`}>
                {ownerLoading ? 'YES (aguardando...)' : 'NO'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Owner Address: </span>
              {ownerLoading ? (
                <span className="text-yellow-400">Carregando...</span>
              ) : ownerAddress ? (
                <code className="text-green-400 font-mono text-sm break-all">{ownerAddress as string}</code>
              ) : (
                <span className="text-red-400">NULL ou undefined ❌</span>
              )}
            </div>
            {ownerError && (
              <div>
                <span className="text-gray-400">Error: </span>
                <code className="text-red-400 text-sm">{String(ownerError)}</code>
              </div>
            )}
          </div>
        </div>

        {/* System Stats */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">📊 System Stats</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400">Loading: </span>
              <span className={`font-bold ${statsLoading ? 'text-yellow-400' : 'text-gray-400'}`}>
                {statsLoading ? 'YES (aguardando...)' : 'NO'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Data: </span>
              {statsLoading ? (
                <span className="text-yellow-400">Carregando...</span>
              ) : systemStats ? (
                <code className="text-green-400 text-sm">
                  Total Users: {String(systemStats[0])}, Active: {String(systemStats[1])}
                </code>
              ) : (
                <span className="text-red-400">NULL ou undefined ❌</span>
              )}
            </div>
            {statsError && (
              <div>
                <span className="text-gray-400">Error: </span>
                <code className="text-red-400 text-sm">{String(statsError)}</code>
              </div>
            )}
          </div>
        </div>

        {/* USDT Address */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">💵 USDT Check</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400">Loading: </span>
              <span className={`font-bold ${usdtLoading ? 'text-yellow-400' : 'text-gray-400'}`}>
                {usdtLoading ? 'YES (aguardando...)' : 'NO'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">USDT Address (from contract): </span>
              {usdtLoading ? (
                <span className="text-yellow-400">Carregando...</span>
              ) : usdtAddress ? (
                <code className="text-green-400 font-mono text-sm break-all">{usdtAddress as string}</code>
              ) : (
                <span className="text-red-400">NULL ou undefined ❌</span>
              )}
            </div>
            {usdtError && (
              <div>
                <span className="text-gray-400">Error: </span>
                <code className="text-red-400 text-sm">{String(usdtError)}</code>
              </div>
            )}
          </div>
        </div>

        {/* Diagnostic */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">⚠️ Diagnóstico</h2>
          <div className="space-y-2 text-sm">
            {!isConnected && (
              <p className="text-yellow-400">❌ Conecte sua wallet primeiro</p>
            )}
            {isConnected && chainId !== 56 && (
              <p className="text-red-400">❌ REDE ERRADA! Troque para BSC Mainnet (Chain ID 56)</p>
            )}
            {isConnected && chainId === 56 && ownerLoading && (
              <p className="text-yellow-400">⏳ Aguardando resposta do contrato... (pode demorar 10-30s)</p>
            )}
            {isConnected && chainId === 56 && !ownerLoading && !ownerAddress && (
              <p className="text-red-400">❌ Contrato não retornou owner. Possíveis causas:<br/>
              - RPC da BSC está lento<br/>
              - Contrato não existe nesse endereço<br/>
              - ABI está incorreto</p>
            )}
            {isConnected && chainId === 56 && ownerAddress && (
              <p className="text-green-400">✅ Tudo funcionando! Owner: {(ownerAddress as string).slice(0, 10)}...</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition"
          >
            🔄 Recarregar Página
          </button>
          <a
            href="https://bscscan.com/address/0xA64bD448aEECed62d02F0deb8305ecd30f79fb54#readContract"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-500 transition"
          >
            🔍 Ver no BSCScan
          </a>
        </div>
      </div>
    </div>
  )
}
