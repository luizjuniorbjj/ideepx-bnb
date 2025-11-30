'use client'

import { useState } from 'react'
import { X, Rocket, Target, Users, BarChart3, ExternalLink, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { GlassCard } from './GlassCard'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

type ProfileType = 'conservador' | 'moderado' | 'agressivo' | null

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>(null)

  if (!isOpen) return null

  const steps = [
    { number: 1, title: 'Criar Conta GMI', icon: Users },
    { number: 2, title: 'Escolher Perfil', icon: Target },
    { number: 3, title: 'Criar Follower', icon: BarChart3 },
    { number: 4, title: 'Conectar Dashboard', icon: Rocket }
  ]

  const profiles = [
    {
      type: 'conservador' as ProfileType,
      title: 'Conservador',
      risk: 'Baixo',
      return: '+2% a +5%',
      color: 'green',
      features: [
        'Menor risco de perda',
        'Operações mais seguras',
        'Foco em preservação de capital',
        'Retornos consistentes e previsíveis'
      ]
    },
    {
      type: 'moderado' as ProfileType,
      title: 'Moderado',
      risk: 'Médio',
      return: '+5% a +10%',
      color: 'blue',
      features: [
        'Risco controlado',
        'Bom potencial de ganho',
        'Estratégia balanceada',
        'Retornos atrativos com segurança'
      ]
    },
    {
      type: 'agressivo' as ProfileType,
      title: 'Agressivo',
      risk: 'Alto',
      return: '+10% a +20%',
      color: 'red',
      features: [
        'Maior potencial de lucro',
        'Operações mais arriscadas',
        'Requer capital de risco',
        'Para perfis experientes'
      ]
    }
  ]

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Finalizar onboarding
      localStorage.setItem('ONBOARDING_COMPLETED', 'true')
      onClose()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    if (currentStep === 2 && !selectedProfile) return false
    return true
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <GlassCard className="relative p-8">
          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Rocket className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-bold text-white">
                Comece a Copiar Sinais Profissionais
              </h2>
            </div>
            <p className="text-gray-300">
              Siga o passo a passo abaixo para começar a operar e ganhar comissões da sua rede MLM
            </p>
          </div>

          {/* Steps Progress */}
          <div className="flex items-center justify-between mb-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = currentStep > step.number
              const isCurrent = currentStep === step.number
              const isLast = index === steps.length - 1

              return (
                <div key={step.number} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-purple-500 text-white ring-4 ring-purple-500/30'
                          : 'bg-white/10 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <p
                      className={`text-xs mt-2 text-center ${
                        isCurrent ? 'text-purple-300 font-semibold' : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>

                  {/* Line */}
                  {!isLast && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded ${
                        isCompleted ? 'bg-green-500' : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {/* PASSO 1: Criar Conta GMI */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Passo 1: Criar Conta GMI Edge</h3>
                </div>

                <p className="text-gray-300 mb-6">
                  Primeiro, você precisa ter uma conta no GMI Edge. Use nosso link especial abaixo:
                </p>

                {/* Alerta Crítico */}
                <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-red-300 font-bold mb-2">⚠️ ATENÇÃO CRÍTICA!</h4>
                      <p className="text-red-200 text-sm mb-3">
                        Ao criar sua conta, você <strong>DEVE</strong> usar o código: <strong>GMP-52625</strong>. Sem este código, você <strong>NÃO receberá comissões</strong> da rede MLM!
                      </p>
                      <div className="bg-black/30 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Código do Operador:</p>
                          <p className="text-xl font-mono font-bold text-white tracking-wider">GMP-52625</p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('GMP-52625')
                            alert('Código copiado!')
                          }}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-all"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alerta GMI Edge */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-yellow-300 font-semibold mb-1">⚠️ APENAS GMI EDGE!</h4>
                      <p className="text-yellow-200 text-sm">
                        O sistema funciona <strong>APENAS</strong> com contas GMI Edge. Contas MT4 ou MT5 <strong>NÃO funcionarão</strong> e você perderá comissões.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botão Abrir Conta */}
                <a
                  href="https://gmi-edge.com/register?ref=GMP-52625"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl text-center transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
                >
                  Abrir Conta GMI Edge <ExternalLink className="w-5 h-5" />
                </a>

                <p className="text-center text-sm text-gray-400 mt-4">
                  Já tem Conta GMI Edge? Continue para o próximo passo →
                </p>
              </div>
            )}

            {/* PASSO 2: Escolher Perfil */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Target className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Passo 2: Escolha Seu Perfil de Sinais</h3>
                </div>

                <p className="text-gray-300 mb-6">
                  Selecione o perfil que melhor se adequa ao seu estilo e tolerância a risco:
                </p>

                {/* Perfis */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {profiles.map((profile) => {
                    const isSelected = selectedProfile === profile.type
                    const borderColor = {
                      green: 'border-green-500/50',
                      blue: 'border-blue-500/50',
                      red: 'border-red-500/50'
                    }[profile.color]

                    const bgColor = {
                      green: 'bg-green-500/10',
                      blue: 'bg-blue-500/10',
                      red: 'bg-red-500/10'
                    }[profile.color]

                    const textColor = {
                      green: 'text-green-300',
                      blue: 'text-blue-300',
                      red: 'text-red-300'
                    }[profile.color]

                    return (
                      <button
                        key={profile.type}
                        onClick={() => setSelectedProfile(profile.type)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? `${borderColor} ${bgColor} ring-4 ring-${profile.color}-500/20`
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <h4 className={`text-xl font-bold mb-2 ${isSelected ? textColor : 'text-white'}`}>
                          {profile.title}
                        </h4>
                        <p className="text-sm text-gray-400 mb-1">
                          Risco: <strong className={textColor}>{profile.risk}</strong>
                        </p>
                        <p className="text-sm text-gray-400 mb-4">
                          Retorno: <strong className={textColor}>{profile.return}</strong>
                        </p>

                        <div className="space-y-2">
                          {profile.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className={`w-4 h-4 ${textColor} flex-shrink-0 mt-0.5`} />
                              <span className="text-xs text-gray-300">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Dica */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-200 text-sm">
                      <strong>💡 Dica:</strong> Você poderá alterar seu perfil a qualquer momento.
                      Recomendamos começar com o perfil <strong>Conservador</strong> se você é iniciante.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 3: Criar Follower */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Passo 3: Criar Conta Follower</h3>
                </div>

                <p className="text-gray-300 mb-6">
                  Agora você precisa criar uma conta Follower na GMI Edge para copiar os sinais do perfil{' '}
                  <strong className="text-purple-400">{selectedProfile || 'selecionado'}</strong>.
                </p>

                {/* Instruções */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                  <h4 className="text-white font-semibold mb-4">📋 Como criar sua conta Follower:</h4>

                  <div className="space-y-3">
                    {[
                      { num: 1, text: 'Acesse sua conta GMI Edge', subtext: 'Entre no portal da GMI Edge com seu login' },
                      { num: 2, text: 'Vá em "Copy Trading"', subtext: 'Procure a seção de Copy Trading no menu' },
                      { num: 3, text: 'Busque pelo Master Account', subtext: 'Digite o número: 77907' },
                      { num: 4, text: 'Crie sua conta Follower', subtext: 'Clique em "Seguir" e configure sua conta follower' },
                      { num: 5, text: 'Faça depósito inicial', subtext: 'Deposite o valor que deseja operar (mínimo recomendado: $100)' }
                    ].map((step) => (
                      <div key={step.num} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                          {step.num}
                        </div>
                        <div>
                          <p className="text-white font-medium">{step.text}</p>
                          <p className="text-sm text-gray-400">{step.subtext}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Master Account */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">✅ Perfil selecionado: <strong className="text-purple-300">{selectedProfile}</strong></p>
                      <p className="text-lg font-semibold text-white">Master Account: <span className="text-purple-400 font-mono">77907</span></p>
                    </div>
                  </div>
                </div>

                {/* Avisos */}
                <div className="space-y-3">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-200 text-sm">
                      <strong>⚠️ LEMBRE-SE:</strong> Sua conta principal GMI Edge DEVE ter sido criada com o código <strong>IB GMP-52625</strong>!
                    </p>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-yellow-200 text-sm">
                      <strong>⚠️ APENAS GMI EDGE:</strong> O sistema <strong>NÃO</strong> funciona com MT4 ou MT5!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 4: Conectar Dashboard */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Rocket className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Passo 4: Conectar ao Dashboard</h3>
                </div>

                <div className="text-center py-8">
                  <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
                  <h4 className="text-2xl font-bold text-white mb-2">🎉 Parabéns!</h4>
                  <p className="text-gray-300 mb-6">
                    Você completou todos os passos necessários para começar a operar!
                  </p>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                    <h5 className="text-white font-semibold mb-4">O que acontece agora:</h5>
                    <div className="space-y-3 text-left">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-300">
                          Suas operações serão copiadas automaticamente do Master Account 77907
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-300">
                          Você começará a receber comissões da sua rede MLM (até 10 níveis)
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-300">
                          Acompanhe seus resultados em tempo real aqui no dashboard
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-blue-200 text-sm text-left">
                        <strong>💬 Precisa de ajuda?</strong> Entre em contato com nosso suporte no Telegram ou WhatsApp.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botões de Suporte */}
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href="https://wa.me/seu-numero"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-center transition-all flex items-center justify-center gap-2"
                  >
                    WhatsApp Suporte
                  </a>
                  <a
                    href="https://t.me/seu-canal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-center transition-all flex items-center justify-center gap-2"
                  >
                    Telegram Suporte
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                currentStep === 1
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              ← Voltar
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                canProceed()
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30'
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentStep === 4 ? 'Voltar ao Dashboard →' : 'Próximo Passo →'}
            </button>
          </div>

          {/* Footer */}
          {currentStep < 4 && (
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-white transition-all"
              >
                Fechar e continuar depois
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
