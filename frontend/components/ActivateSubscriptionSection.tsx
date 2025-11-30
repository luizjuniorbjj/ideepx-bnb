'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import api from '@/lib/api'
import { toast } from 'sonner'
import {
  CheckCircle, Loader, Users, DollarSign, Calendar,
  UserCheck, AlertCircle
} from 'lucide-react'

interface InactiveUser {
  walletAddress: string
  level: number
  active: boolean
  subscriptionExpiry: number
  expiresAt: string | null
}

interface Props {
  internalBalance: number
  isSubscriptionActive: boolean
  onActivateSuccess: () => void
}

export default function ActivateSubscriptionSection({
  internalBalance,
  isSubscriptionActive,
  onActivateSuccess
}: Props) {
  const { address } = useAccount()
  const [inactiveUsers, setInactiveUsers] = useState<InactiveUser[]>([])
  const [loadingInactive, setLoadingInactive] = useState(false)
  const [showActivateNetwork, setShowActivateNetwork] = useState(false)
  const [activatingUser, setActivatingUser] = useState<string | null>(null)
  const [activatingSelf, setActivatingSelf] = useState(false)

  const SUBSCRIPTION_PRICE = 19

  // Buscar usuários inativos
  const loadInactiveUsers = async () => {
    if (!address) return

    try {
      setLoadingInactive(true)
      const data = await api.getNetworkInactive(address)
      setInactiveUsers(data.inactiveUsers || [])
    } catch (error: any) {
      toast.error('Erro ao carregar usuários inativos: ' + error.message)
    } finally {
      setLoadingInactive(false)
    }
  }

  useEffect(() => {
    if (showActivateNetwork && address) {
      loadInactiveUsers()
    }
  }, [showActivateNetwork, address])

  // Ativar própria assinatura
  const handleActivateSelf = async () => {
    if (!address) return

    if (internalBalance < SUBSCRIPTION_PRICE) {
      toast.error(`Saldo insuficiente. Necessário: $${SUBSCRIPTION_PRICE}`)
      return
    }

    try {
      setActivatingSelf(true)
      const result = await api.activateWithBalance(address)
      toast.success('Assinatura ativada com sucesso! Válida por 30 dias.')
      onActivateSuccess()
    } catch (error: any) {
      toast.error('Erro ao ativar: ' + error.message)
    } finally {
      setActivatingSelf(false)
    }
  }

  // Ativar usuário da rede
  const handleActivateNetworkUser = async (targetAddress: string) => {
    if (!address) return

    if (internalBalance < SUBSCRIPTION_PRICE) {
      toast.error(`Saldo insuficiente. Necessário: $${SUBSCRIPTION_PRICE}`)
      return
    }

    try {
      setActivatingUser(targetAddress)
      const result = await api.activateNetworkUser(address, targetAddress)
      toast.success(`Assinatura ativada para ${targetAddress.slice(0, 10)}... (Nível ${result.networkLevel})`)
      onActivateSuccess()
      // Recarregar lista
      await loadInactiveUsers()
    } catch (error: any) {
      toast.error('Erro ao ativar: ' + error.message)
    } finally {
      setActivatingUser(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Ativar Própria Assinatura */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Minha Assinatura</h3>
            <p className="text-sm text-gray-400">Ative ou renove usando seu saldo interno</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Status</p>
            <div className="flex items-center gap-2">
              {isSubscriptionActive ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-semibold">Ativa</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">Inativa</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Custo</p>
            <p className="text-white font-semibold">${SUBSCRIPTION_PRICE} / mês</p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Seu Saldo</p>
            <p className={`font-semibold ${internalBalance >= SUBSCRIPTION_PRICE ? 'text-green-400' : 'text-red-400'}`}>
              ${internalBalance.toFixed(2)}
            </p>
          </div>
        </div>

        <button
          onClick={handleActivateSelf}
          disabled={activatingSelf || internalBalance < SUBSCRIPTION_PRICE}
          className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
            internalBalance >= SUBSCRIPTION_PRICE && !activatingSelf
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:shadow-green-500/50'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {activatingSelf ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Ativando...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              {isSubscriptionActive ? 'Renovar Assinatura' : 'Ativar Assinatura'}
            </>
          )}
        </button>
      </div>

      {/* Ativar Usuários da Rede */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Ativar Membros da Rede</h3>
              <p className="text-sm text-gray-400">Ative assinaturas para sua rede (até 10 níveis)</p>
            </div>
          </div>
          <button
            onClick={() => setShowActivateNetwork(!showActivateNetwork)}
            className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition"
          >
            {showActivateNetwork ? 'Ocultar' : 'Ver Inativos'}
          </button>
        </div>

        {showActivateNetwork && (
          <div className="mt-4">
            {loadingInactive ? (
              <div className="text-center py-8">
                <Loader className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-2" />
                <p className="text-gray-400">Carregando usuários inativos...</p>
              </div>
            ) : inactiveUsers.length === 0 ? (
              <div className="text-center py-8 bg-gray-800/30 rounded-xl">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">Todos ativos!</p>
                <p className="text-gray-400 text-sm">Todos os membros da sua rede estão com assinaturas ativas</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-3">
                  <p className="text-blue-400 text-sm">
                    {inactiveUsers.length} {inactiveUsers.length === 1 ? 'usuário inativo' : 'usuários inativos'} na sua rede
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {inactiveUsers.map((user) => (
                    <div
                      key={user.walletAddress}
                      className="bg-gray-800/50 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm text-white font-mono">
                            {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
                          </code>
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                            Nível {user.level}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">Assinatura inativa</p>
                      </div>

                      <button
                        onClick={() => handleActivateNetworkUser(user.walletAddress)}
                        disabled={activatingUser === user.walletAddress || internalBalance < SUBSCRIPTION_PRICE}
                        className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                          internalBalance >= SUBSCRIPTION_PRICE && activatingUser !== user.walletAddress
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {activatingUser === user.walletAddress ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Ativando...
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4" />
                            Ativar ($19)
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
