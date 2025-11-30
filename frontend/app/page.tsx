'use client'

import { ConnectButton } from '@/components/ConnectButton'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { TrendingUp, Shield, Users, Wallet, Zap, Lock, BarChart3, Globe } from 'lucide-react'
import Logo from '@/components/Logo'

export default function Home() {
  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard')
    }
  }, [isConnected, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <Logo size="lg" />
          <ConnectButton />
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="animate-fade-in max-w-4xl mx-auto">
          {/* Badge Topo */}
          <div className="inline-block mb-6 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/50">
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300 text-sm font-bold tracking-wide">
              ⚡ EVOLUCIONANDO O TRADING COM DESCENTRALIZAÇÃO BLOCKCHAIN
            </p>
          </div>

          {/* Título Principal */}
          <h2 className="text-7xl md:text-5xl font-bold mb-4 text-white leading-tight">
            Profit Sharing Social Copy Trading<br />
            <span className="gradient-text">Smart Contracts · 100%</span>
          </h2>

          {/* Badge BNB - Discreto */}
          <div className="inline-flex items-center gap-2 mb-8">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <p className="text-blue-300 text-sm font-medium">Powered by BNB Smart Chain</p>
          </div>

          {/* Descrição Principal */}
          <p className="text-xl text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed">
            <span className="whitespace-nowrap">Automação financeira inteligente que opera <span className="text-green-400 font-bold">diretamente na SUA conta</span>.</span>
          </p>

          {/* Destaque Custódia - Card único e limpo */}
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-2xl mb-8 backdrop-blur-sm">
            <Shield className="w-6 h-6 text-green-400 flex-shrink-0" />
            <div className="text-left">
              <p className="text-white font-semibold text-base">NÃO custodiamos seus fundos</p>
              <p className="text-green-300 text-sm">100% na sua corretora parceira, sob seu controle total</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <ConnectButton />

            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
            >
              Saber Mais
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">$500k+</p>
              <p className="text-gray-400">Distribuído</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">1,000+</p>
              <p className="text-gray-400">Usuários</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">99.4%</p>
              <p className="text-gray-400">Segurança</p>
            </div>
          </div>
        </div>
      </section>

      {/* About iDeepX */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/50 mb-4">
                <p className="text-purple-300 text-sm font-semibold">🌟 Sobre a iDeepX</p>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Tecnologia Financeira de Nova Geração
              </h3>
            </div>

            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p className="text-lg">
                <span className="text-white font-semibold">Fintech de automação financeira para Forex.</span>
                Operamos via integração direta com corretoras parceiras, preservando total custódia dos fundos pelo cliente.
              </p>

              <p className="text-lg">
                Nossa <span className="text-purple-400 font-semibold">infraestrutura blockchain BEP20</span> resolve
                a principal limitação do social trading: <span className="text-white font-semibold">comissionamento multinível
                automatizado</span>. Distribuição descentralizada, auditável e transparente — conectando tecnologia,
                performance e sustentabilidade.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                <div className="text-center p-6 bg-green-500/10 rounded-xl border border-green-500/30">
                  <div className="text-3xl mb-2">🔒</div>
                  <h4 className="text-white font-semibold mb-2">NÃO Custodiamos</h4>
                  <p className="text-sm text-gray-300">100% dos fundos ficam na sua corretora</p>
                </div>
                <div className="text-center p-6 bg-purple-500/10 rounded-xl border border-purple-500/30">
                  <div className="text-3xl mb-2">⚡</div>
                  <h4 className="text-white font-semibold mb-2">Blockchain BEP20</h4>
                  <p className="text-sm text-gray-400">Distribuição automatizada e auditável</p>
                </div>
                <div className="text-center p-6 bg-green-500/10 rounded-xl border border-green-500/30">
                  <div className="text-3xl mb-2">🌐</div>
                  <h4 className="text-white font-semibold mb-2">100% Transparente</h4>
                  <p className="text-sm text-gray-400">Todas as operações on-chain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-white mb-4">Por que escolher iDeepX?</h3>
          <p className="text-gray-400 text-lg">Tecnologia de ponta, segurança máxima</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="10 Níveis MLM"
            description="Receba comissões automáticas de até 10 níveis na sua rede"
            color="blue"
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Ultra Seguro"
            description="Smart contract auditado com 12 patches de segurança aplicados"
            color="purple"
          />
          <FeatureCard
            icon={<Lock className="w-8 h-8" />}
            title="Circuit Breaker"
            description="Proteção automática em caso de anomalias no sistema"
            color="pink"
          />
          <FeatureCard
            icon={<Wallet className="w-8 h-8" />}
            title="Pagamentos Instant"
            description="Comissões creditadas automaticamente em tempo real"
            color="green"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Rede Global"
            description="Conecte-se com parceiros de qualquer lugar do mundo"
            color="yellow"
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Dashboard Pro"
            description="Acompanhe todos os seus ganhos e rede em tempo real"
            color="red"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Gas Otimizado"
            description="Transações otimizadas para menor custo de gas"
            color="cyan"
          />
          <FeatureCard
            icon={<Globe className="w-8 h-8" />}
            title="100% OnChain"
            description="Tudo verificável e transparente na blockchain"
            color="indigo"
          />
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-white mb-4">Como Funciona?</h3>
          <p className="text-gray-400 text-lg">Simples, rápido e transparente</p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard
            number="1"
            title="Conecte sua Carteira"
            description="Use MetaMask ou qualquer carteira Web3 compatível"
          />
          <StepCard
            number="2"
            title="Registre-se"
            description="Cadastre-se usando o link de um patrocinador"
          />
          <StepCard
            number="3"
            title="Ative & Ganhe"
            description="Ative sua assinatura ($19/mês) e comece a ganhar comissões"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
          <h3 className="text-4xl font-bold text-white mb-4">Pronto para começar?</h3>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhares de usuários que já estão ganhando com iDeepX
          </p>
          <ConnectButton />
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-white/10">
        <div className="text-center text-gray-400">
          <p className="mb-2">© 2025 iDeepX Distribution. Todos os direitos reservados.</p>
          <p className="text-sm">Powered by BNB Smart Chain | Auditado & Verificado</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, color }: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/50 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/50 text-purple-400',
    pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/50 text-pink-400',
    green: 'from-green-500/20 to-green-600/20 border-green-500/50 text-green-400',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 text-yellow-400',
    red: 'from-red-500/20 to-red-600/20 border-red-500/50 text-red-400',
    cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/50 text-cyan-400',
    indigo: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/50 text-indigo-400',
  }[color]

  return (
    <div className={`p-6 bg-gradient-to-br ${colorClasses} backdrop-blur-sm rounded-2xl border hover:shadow-xl transition-all duration-300 animate-slide-up hover:-translate-y-2`}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl font-bold text-white">{number}</span>
      </div>
      <h4 className="text-xl font-semibold text-white mb-2">{title}</h4>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}
