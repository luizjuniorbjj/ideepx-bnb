'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAccount } from 'wagmi'
import { useRouter, useSearchParams } from 'next/navigation'
import { ConnectButton } from '@/components/ConnectButton'
import { UserPlus, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { isAddress } from 'viem'
import { toast } from 'sonner'
// import { useSelfRegister } from '@/hooks/useContract' // ❌ Hook não existe ainda
import { useUserData } from '@/hooks/useUserData' // ✅ Hook correto
import Logo from '@/components/Logo'
import TermsModal from '@/components/TermsModal'

function RegisterContent() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [sponsorAddress, setSponsorAddress] = useState('')
  const [isValidAddress, setIsValidAddress] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false)

  // ⚠️ DEV MODE: Usar backend data
  const { userData: backendData } = useUserData()
  const userData = backendData

  // ⚠️ TODO: Implementar useSelfRegister hook para registro on-chain
  // Por enquanto, mock para modo dev:
  const register = (sponsor: `0x${string}`) => {
    console.log('🚧 DEV: Register function called with sponsor:', sponsor)
    toast.info('Função de registro em desenvolvimento - apenas visualização')
  }
  const isPending = false
  const isSuccess = false
  const error = null

  // Pre-fill sponsor from URL param (ref=0x...) - OBRIGATÓRIO
  const refParam = searchParams.get('ref')
  const hasValidRef = refParam && isAddress(refParam)

  useEffect(() => {
    if (hasValidRef) {
      setSponsorAddress(refParam)
      setIsValidAddress(true)
    }
  }, [refParam, hasValidRef])

  // Redirect if already registered
  useEffect(() => {
    // Em dev mode: verificar se usuário existe no backend
    if (userData && userData.active) {
      toast.success('Você já está registrado!')
      router.push('/dashboard')
    }
  }, [userData, router])

  // Redirect to dashboard on success
  useEffect(() => {
    if (isSuccess) {
      toast.success('Registro realizado com sucesso!')
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }, [isSuccess, router])

  // Show error
  useEffect(() => {
    if (error) {
      toast.error(`Erro no registro: ${error.message}`)
    }
  }, [error])

  const handleAddressChange = (value: string) => {
    setSponsorAddress(value)
    setIsValidAddress(isAddress(value))
  }

  const handleRegister = () => {
    if (!isValidAddress) {
      toast.error('Endereço de sponsor inválido')
      return
    }

    // Verificar se aceitou os termos
    if (!hasAcceptedTerms) {
      setShowTermsModal(true)
      return
    }

    // Prosseguir com registro
    register(sponsorAddress as `0x${string}`)
  }

  const handleAcceptTerms = () => {
    setHasAcceptedTerms(true)
    setShowTermsModal(false)
    toast.success('Termos aceitos! Agora clique em Registrar novamente.')
  }

  const handleDeclineTerms = () => {
    setShowTermsModal(false)
    toast.error('Você precisa aceitar os termos para se registrar.')
  }

  // Bloquear se não tiver link de indicação
  if (!hasValidRef) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Link de Indicação Necessário</h2>
          <p className="text-gray-300 mb-6">
            Para se registrar no iDeepX, você precisa de um <strong>link de indicação</strong> de quem já está na rede.
          </p>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-left">
            <h3 className="text-white font-semibold mb-2">ℹ️ Como funciona?</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• O iDeepX é um sistema MLM (Marketing Multinível)</li>
              <li>• Todos precisam ser indicados por alguém</li>
              <li>• Peça o link de indicação para quem te convidou</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3 mb-6">
            <p className="text-gray-400 text-sm mb-1">Formato do link:</p>
            <code className="text-blue-400 text-xs break-all">
              https://app.ideepx.com/register?ref=0x1234...
            </code>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md text-center">
          <UserPlus className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Conecte sua Wallet</h2>
          <p className="text-gray-300 mb-4">
            Para se registrar no iDeepX, conecte sua wallet primeiro.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Você será indicado por: <code className="text-blue-400">{refParam?.slice(0, 10)}...</code>
          </p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Terms Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />

      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Registrar-se no iDeepX
            </h1>
            <p className="text-gray-400">
              Entre para a rede de distribuição MLM mais avançada
            </p>
          </div>

          {/* Success State */}
          {isSuccess && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-white">Registro Completo!</h3>
              </div>
              <p className="text-gray-300">
                Você foi registrado com sucesso. Redirecionando para o dashboard...
              </p>
            </div>
          )}

          {/* Registration Form */}
          {!isSuccess && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              {/* Sponsor Info (Readonly) */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Quem está te Indicando
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sponsorAddress}
                    readOnly
                    className="w-full px-4 py-4 bg-gray-800/30 border-2 border-green-500/50 rounded-xl text-white focus:outline-none cursor-not-allowed"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                </div>
                <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Sponsor verificado através do link de indicação
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                <h4 className="text-white font-semibold mb-2">ℹ️ Informações Importantes</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• O registro é <strong>gratuito</strong> e permanente</li>
                  <li>• Você <strong>não pode mudar</strong> o sponsor depois</li>
                  <li>• Certifique-se de que o endereço está correto</li>
                  <li>• Após o registro, você pode ativar sua assinatura ($19/mês)</li>
                </ul>
              </div>

              {/* Register Button */}
              <button
                onClick={handleRegister}
                disabled={!isValidAddress || isPending}
                className={`w-full py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 ${
                  isValidAddress && !isPending
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isPending ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Registrar-se Agora
                  </>
                )}
              </button>

              {/* Transaction Note */}
              {isPending && (
                <p className="text-center text-gray-400 text-sm mt-4">
                  ⏳ Aguardando confirmação da transação...
                </p>
              )}
            </div>
          )}

          {/* Security Note */}
          <div className="mt-8 bg-gray-800/30 border border-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-sm text-center">
              🔒 O registro é <strong className="text-white">permanente</strong> e não pode ser alterado depois.
              Certifique-se de que está usando o link correto de indicação.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
