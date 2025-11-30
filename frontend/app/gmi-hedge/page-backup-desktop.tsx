'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogOut, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import Logo from '@/components/Logo'
import { MT5ConnectionForm } from '@/components/MT5ConnectionForm'
import { MT5DetailedStats } from '@/components/MT5DetailedStats'
import { WeeklyProfitCard } from '@/components/WeeklyProfitCard'
import { useGMIData } from '@/hooks/useGMIData'
import { useWeeklyProfit } from '@/hooks/useWeeklyProfit'
import api from '@/lib/api'

export default function GMIHedgePage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { refetch: refetchGMI, data: gmiData, loading: gmiLoading, connected, isReal, isMock, retryCount: gmiRetryCount, lastUpdate: gmiLastUpdate } = useGMIData()
  const { refetch: refetchWeekly, data: weeklyData, loading: weeklyLoading, retryCount: weeklyRetryCount, lastUpdate: weeklyLastUpdate } = useWeeklyProfit()
  const [disconnecting, setDisconnecting] = useState(false)
  const [connecting, setConnecting] = useState(false)

  /**
   * Handle connect account - COM REFETCH CORRETO
   */
  const handleConnectAccount = async (accountNumber: string, investorPassword: string, server: string, platform: string) => {
    console.log('🚀 [GMI] Conectando conta...', { accountNumber, server, address })

    setConnecting(true)

    try {
      // 1. Conectar conta via API
      console.log('📡 [GMI] Chamando api.linkGmiAccount...');
      const result = await api.linkGmiAccount(accountNumber, investorPassword, server, platform, address);
      console.log('✅ [GMI] Resposta da API:', result);
      console.log('   - Balance:', result.data?.balance);
      console.log('   - Equity:', result.data?.equity);
      console.log('   - Source:', result.data?.source);

      // 2. Aguardar 2 segundos para garantir que dados foram salvos no banco
      console.log('⏳ [GMI] Aguardando 2s para banco salvar...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Refetch de AMBOS os hooks
      console.log('🔃 [GMI] Fazendo refetch de GMI Data...');
      await refetchGMI();
      console.log('✅ [GMI] GMI Data atualizado!');

      console.log('🔃 [GMI] Fazendo refetch de Weekly Profit...');
      await refetchWeekly();
      console.log('✅ [GMI] Weekly Profit atualizado!');

      console.log('🎉 [GMI] Conexão completa! Dados disponíveis.');
    } catch (error) {
      console.error('❌ [GMI] Erro ao conectar:', error);
      console.error('   - Mensagem:', error.message);
      throw error;
    } finally {
      console.log('🔚 [GMI] Finalizando conexão...');
      setConnecting(false)
    }
  };

  /**
   * Handle disconnect account - COM REFETCH CORRETO
   */
  const handleDisconnectAccount = async () => {
    console.log('🔌 [GMI] Desconectando conta...', { address })

    try {
      setDisconnecting(true)

      // 1. Desconectar via API
      const result = await api.disconnectGmiAccount(address);
      console.log('✅ [GMI] Conta desconectada com sucesso!', result);

      // 2. Aguardar 500ms para garantir que dados foram atualizados
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. Refetch de AMBOS os hooks
      console.log('🔃 [GMI] Atualizando dados (GMI + Weekly)...');
      await Promise.all([
        refetchGMI(),
        refetchWeekly()
      ]);

      console.log('🎉 [GMI] Desconexão completa!');
    } catch (error) {
      console.error('❌ [GMI] Erro ao desconectar:', error.message);
      alert('Erro ao desconectar conta GMI. Tente novamente.');
    } finally {
      setDisconnecting(false)
    }
  };

  /**
   * Componente de Badge de Status
   */
  const StatusBadge = () => {
    if (!connected) return null

    if (isReal) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/50 rounded-lg">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium text-green-400">DADOS REAIS</span>
        </div>
      )
    }

    if (isMock) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-medium text-yellow-400">MODO DEMO</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-500/20 border border-gray-500/50 rounded-lg">
        <Clock className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-400">CARREGANDO...</span>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <Logo size="lg" />
          <p className="text-xl text-gray-400 mt-4">Conecte sua carteira para acessar esta página</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold hover:shadow-lg transition"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    )
  }

  // Loading state global durante conexão
  if (connecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xl text-white mt-6">Conectando conta GMI Edge...</p>
          <p className="text-sm text-gray-400 mt-2">Validando credenciais e sincronizando dados</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">GMI Edge - The Edge Platform</h1>
                <p className="text-sm text-gray-400">Conecte e gerencie sua conta GMI Markets</p>
              </div>
            </div>
            <Logo size="sm" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {!connected ? (
          /* Não conectado - Mostrar formulário de conexão */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Connection Form */}
            <div className="lg:col-span-1">
              <MT5ConnectionForm onConnect={handleConnectAccount} disabled={connecting} />
            </div>

            {/* Right Column - Info */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Conecte sua conta GMI Edge</h3>
                <p className="text-gray-400 mb-6">
                  Após conectar sua conta The Edge (GMI Markets), você terá acesso a:
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-1">✓</span>
                    <span>Estatísticas detalhadas de desempenho em tempo real</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-1">✓</span>
                    <span>Lucro semanal e distribuição MLM automática</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-1">✓</span>
                    <span>Histórico mensal de lucros e % de retorno</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-1">✓</span>
                    <span>Volume mensal e taxa de acerto</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-1">✓</span>
                    <span>Sincronização automática a cada 5 minutos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-1">✓</span>
                    <span>Sistema de retry automático em caso de falha</span>
                  </li>
                </ul>

                <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400">
                    <strong>🔒 Seguro:</strong> Sua senha é usada apenas para autenticação via API oficial GMI Edge.
                    Não armazenamos credenciais sensíveis.
                  </p>
                </div>

                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400">
                    <strong>✅ Dados 100% Reais:</strong> Todas as informações exibidas são sincronizadas diretamente
                    da API GMI Edge em tempo real. Nenhum dado simulado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Conectado - Mostrar estatísticas completas */
          <div className="space-y-6">
            {/* Account Info Card */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-400 mb-1">Conta GMI Edge Conectada</p>
                  <p className="text-2xl font-bold text-white truncate">
                    {gmiData?.account?.accountId || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Servidor: {gmiData?.account?.server || 'N/A'}
                  </p>
                  {gmiLastUpdate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Última atualização: {gmiLastUpdate.toLocaleTimeString('pt-BR')}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Status Badge */}
                  <StatusBadge />

                  {/* Connection Indicator */}
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">Conectado</span>
                  </div>

                  {/* Disconnect Button */}
                  <button
                    onClick={handleDisconnectAccount}
                    disabled={disconnecting}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {disconnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Desconectando...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" />
                        <span>Desconectar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Retry Info (if retrying) */}
              {(gmiRetryCount > 0 || weeklyRetryCount > 0) && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-xs text-yellow-400 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Reconectando... Tentativa {Math.max(gmiRetryCount, weeklyRetryCount)}/3
                  </p>
                </div>
              )}
            </div>

            {/* Weekly Profit Card */}
            <WeeklyProfitCard />

            {/* Detailed Stats */}
            <MT5DetailedStats />
          </div>
        )}
      </div>
    </div>
  )
}
