'use client'

import { useMemo } from 'react'
import { Address } from 'viem'
import { useUserData } from '@/hooks/useUserData'

interface UplineTreeProps {
  userAddress?: Address
}

interface UplineLevel {
  level: number
  address: Address
  isEmpty: boolean
}

export default function UplineTree({ userAddress }: UplineTreeProps) {
  const { userData, loading: isLoading, error } = useUserData()
  const isError = !!error

  // Em desenvolvimento, criar array de upline baseado no sponsorAddress
  const uplineData = useMemo(() => {
    if (!userData?.sponsorAddress) return []

    // Por enquanto, apenas mostrar o sponsor direto (L1)
    // No futuro, o backend pode retornar a upline completa
    const upline = [userData.sponsorAddress]

    // Preencher o resto com endereços vazios
    for (let i = 1; i < 10; i++) {
      upline.push('0x0000000000000000000000000000000000000000')
    }

    return upline
  }, [userData])

  // Processar dados da upline
  const uplineLevels = useMemo((): UplineLevel[] => {
    if (!uplineData || !Array.isArray(uplineData)) {
      return []
    }

    const levels: UplineLevel[] = []

    for (let i = 0; i < 10; i++) {
      const address = uplineData[i] as Address
      const isEmpty = !address || address === '0x0000000000000000000000000000000000000000'

      levels.push({
        level: i + 1, // L1 to L10
        address: address,
        isEmpty: isEmpty,
      })
    }

    return levels
  }, [uplineData])

  // Contar níveis preenchidos
  const filledLevels = uplineLevels.filter(l => !l.isEmpty).length

  // Encurtar endereço
  const shortenAddress = (address: Address): string => {
    if (!address) return '---'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!userAddress) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-center border border-gray-700">
        <p className="text-gray-400">Conecte sua carteira para ver sua upline</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 border border-gray-700">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-400">Carregando upline...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-center border border-red-900">
        <p className="text-red-400">❌ Erro ao carregar upline</p>
      </div>
    )
  }

  if (uplineLevels.length === 0 || uplineLevels.every(l => l.isEmpty)) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-center border border-gray-700">
        <p className="text-gray-400">🌳 Você ainda não tem upline registrada</p>
        <p className="text-sm text-gray-500 mt-2">Sua upline aparecerá aqui após o registro</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">🌳 Árvore de Upline (10 Níveis)</h2>
        <div className="text-sm text-gray-400">
          <span className="font-semibold text-blue-400">{filledLevels}</span> de 10 níveis preenchidos
        </div>
      </div>

      {/* Visualização em Árvore */}
      <div className="space-y-4">
        {uplineLevels.map((level, index) => {
          const isLast = index === uplineLevels.length - 1
          const indent = index * 20 // Indentação progressiva

          return (
            <div key={level.level} className="relative">
              {/* Linha de conexão vertical */}
              {!isLast && (
                <div
                  className="absolute left-6 top-12 w-0.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500"
                  style={{ marginLeft: `${indent}px` }}
                ></div>
              )}

              {/* Card do Nível */}
              <div
                className={`
                  flex items-center space-x-4 p-4 rounded-lg border transition-all
                  ${level.isEmpty
                    ? 'bg-gray-800/30 border-gray-700'
                    : 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-700/50 hover:border-blue-500'
                  }
                `}
                style={{ marginLeft: `${indent}px` }}
              >
                {/* Badge do Nível */}
                <div className={`
                  flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg border-2
                  ${level.isEmpty
                    ? 'bg-gray-700 border-gray-600 text-gray-500'
                    : 'bg-gradient-to-br from-blue-600 to-purple-600 border-blue-400 text-white'
                  }
                `}>
                  L{level.level}
                </div>

                {/* Informações do Patrocinador */}
                <div className="flex-1">
                  {level.isEmpty ? (
                    <div className="text-gray-500">
                      <div className="font-medium">Nível {level.level} - Vazio</div>
                      <div className="text-sm text-gray-600">Sem patrocinador neste nível</div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Patrocinador L{level.level}:</span>
                        <UplineStatus address={level.address} />
                      </div>
                      <div className="font-mono text-sm text-gray-300 mt-1">
                        {shortenAddress(level.address)}
                      </div>
                      <a
                        href={`https://bscscan.com/address/${level.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Ver no BSCScan →
                      </a>
                    </div>
                  )}
                </div>

                {/* Indicador de Status */}
                <div className="flex-shrink-0">
                  {level.isEmpty ? (
                    <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-400">Ativo</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-600"></div>
            <span className="text-gray-400">Vazio</span>
          </div>
        </div>
      </div>

      {/* Informação adicional */}
      <div className="mt-4 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <span className="text-blue-400">💡</span>
          <div className="text-sm text-gray-300">
            <strong className="text-blue-300">Como funciona:</strong>
            <ul className="mt-2 space-y-1 text-gray-400">
              <li>• <strong>L1</strong> é seu patrocinador direto (quem te indicou)</li>
              <li>• <strong>L2</strong> é o patrocinador do seu L1</li>
              <li>• E assim sucessivamente até <strong>L10</strong></li>
              <li>• Você ganha comissões quando alguém na sua downline (abaixo de você) gera performance fees</li>
              <li>• Sua upline ganha comissões quando <strong>você</strong> ou sua downline geram fees</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente auxiliar para mostrar status de assinatura
function UplineStatus({ address }: { address: Address }) {
  // Em desenvolvimento, assumir que sponsor está ativo
  // No futuro, pode buscar do backend
  const isActive = true

  return (
    <span className={`
      text-xs px-2 py-1 rounded font-medium
      ${isActive
        ? 'bg-green-900/50 text-green-300'
        : 'bg-red-900/50 text-red-300'
      }
    `}>
      {isActive ? '✓ Patrocinador' : '✗ Inativo'}
    </span>
  )
}
