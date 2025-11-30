'use client'

import { useState } from 'react'
import { X, FileText, Shield, Check } from 'lucide-react'

interface TermsModalProps {
  isOpen: boolean
  onAccept: () => void
  onDecline: () => void
}

type TabType = 'terms' | 'privacy'

export default function TermsModal({ isOpen, onAccept, onDecline }: TermsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('terms')
  const [termsScrolled, setTermsScrolled] = useState(false)
  const [privacyScrolled, setPrivacyScrolled] = useState(false)
  const [acceptedCheckbox, setAcceptedCheckbox] = useState(false)

  // Ambos precisam ser scrollados E checkbox marcado
  const canAccept = termsScrolled && privacyScrolled && acceptedCheckbox

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const bottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 10

    if (bottom) {
      if (activeTab === 'terms') {
        setTermsScrolled(true)
      } else {
        setPrivacyScrolled(true)
      }
    }
  }

  const handleAccept = () => {
    if (canAccept) {
      // Salvar aceite no localStorage (opcional, para UX)
      const acceptanceData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        accepted: true
      }
      localStorage.setItem('ideepx_terms_accepted', JSON.stringify(acceptanceData))
      onAccept()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-7 h-7 text-blue-400" />
              Termos de Uso e Política de Privacidade
            </h2>
            <button
              onClick={onDecline}
              className="text-gray-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                activeTab === 'terms'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <FileText className="w-5 h-5" />
              Termos de Uso
              {termsScrolled && <Check className="w-5 h-5 text-green-400" />}
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                activeTab === 'privacy'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Shield className="w-5 h-5" />
              Política de Privacidade
              {privacyScrolled && <Check className="w-5 h-5 text-green-400" />}
            </button>
          </div>
        </div>

        {/* Conteúdo - ROLÁVEL */}
        <div
          className="p-6 overflow-y-auto flex-1 bg-gray-900/50"
          onScroll={handleScroll}
        >
          {activeTab === 'terms' ? (
            <div className="text-gray-300 space-y-4 prose prose-invert max-w-none">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <p className="text-yellow-400 font-bold">⚠️ IMPORTANTE: Leia atentamente antes de prosseguir.</p>
                <p className="text-sm text-gray-400 mt-2">Role até o final deste documento e depois leia a Política de Privacidade.</p>
              </div>

              <h1 className="text-3xl font-bold text-white">TERMOS DE USO DA PLATAFORMA</h1>
              <p className="text-sm text-gray-500">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

              <h2 className="text-xl font-bold text-white mt-6">1. ACEITAÇÃO DOS TERMOS DE USO</h2>
              <p>1.1. Bem-vindo à Plataforma iDeepX Technologies Group. Ao acessar e utilizar nossos serviços, você concorda em cumprir e estar vinculado a estes Termos de Uso.</p>
              <p>1.2. Se você não concordar com qualquer parte destes Termos, não deverá usar a Plataforma.</p>
              <p>1.3. O uso da Plataforma está condicionado à aceitação integral destes Termos, bem como da Política de Privacidade.</p>
              <p>1.4. Recomendamos a leitura atenta deste documento antes de criar uma conta ou utilizar nossos serviços.</p>

              <h2 className="text-xl font-bold text-white mt-6">2. DEFINIÇÕES</h2>
              <p>Para fins destes Termos de Uso, aplicam-se as seguintes definições:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Plataforma</strong>: website, aplicativos móveis e demais canais digitais da iDeepX.</li>
                <li><strong>Usuário</strong> ou <strong>Você</strong>: qualquer pessoa que acesse ou utilize a Plataforma.</li>
                <li><strong>Conta</strong>: cadastro pessoal criado pelo Usuário para acessar os serviços.</li>
                <li><strong>Conteúdo</strong>: textos, imagens, vídeos, análises e demais materiais disponibilizados na Plataforma.</li>
                <li><strong>Serviços</strong>: todas as funcionalidades, produtos e ferramentas oferecidas pela iDeepX.</li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-6">3. ELEGIBILIDADE E CRIAÇÃO DE CONTA</h2>
              <p>3.1. <strong>Idade mínima</strong>: Para utilizar a Plataforma, você deve ter pelo menos <strong>18 (dezoito) anos</strong> de idade ou a maioridade legal em sua jurisdição.</p>
              <p>3.2. <strong>Capacidade legal</strong>: Você declara possuir plena capacidade jurídica para aceitar estes Termos e cumprir suas obrigações.</p>
              <p>3.3. <strong>Informações verdadeiras</strong>: Ao criar uma conta, você concorda em fornecer informações precisas, completas e atualizadas.</p>
              <p>3.4. <strong>Proibição de múltiplas contas</strong>: Cada Usuário pode criar e manter apenas uma conta.</p>

              <h2 className="text-xl font-bold text-white mt-6">4. SEGURANÇA DA CONTA</h2>
              <p>4.1. Você é responsável por manter a confidencialidade de suas credenciais de acesso.</p>
              <p>4.2. Recomendamos utilizar senhas fortes e únicas.</p>
              <p>4.3. Notifique imediatamente a iDeepX caso suspeite de acesso não autorizado.</p>
              <p>4.4. Você é responsável por todas as atividades realizadas através de sua conta.</p>

              <h2 className="text-xl font-bold text-white mt-6">5. USO PERMITIDO DA PLATAFORMA</h2>
              <p>5.1. Você pode utilizar a Plataforma para:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Participar do sistema MLM de distribuição de comissões</li>
                <li>Gerenciar sua rede de indicados</li>
                <li>Realizar saques de ganhos</li>
                <li>Gerenciar sua conta e configurações pessoais</li>
                <li>Entrar em contato com o suporte técnico</li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-6">6. AVISOS IMPORTANTES SOBRE RISCOS</h2>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 my-4">
                <p className="text-red-400 font-bold">⚠️ AVISO DE RISCO IMPORTANTE</p>
                <ul className="list-disc pl-6 space-y-2 mt-2 text-sm">
                  <li>Sistemas MLM envolvem riscos de perda financeira</li>
                  <li>Não há garantia de lucros ou ganhos</li>
                  <li>Você pode perder todo o capital investido</li>
                  <li>Esta plataforma utiliza blockchain e criptomoedas (USDT)</li>
                  <li>Transações blockchain são irreversíveis</li>
                </ul>
              </div>

              <h2 className="text-xl font-bold text-white mt-6">7. PROPRIEDADE INTELECTUAL</h2>
              <p>7.1. Todo o Conteúdo disponibilizado na Plataforma é de propriedade exclusiva da iDeepX Technologies Group.</p>
              <p>7.2. O smart contract e código-fonte são protegidos por direitos autorais.</p>
              <p>7.3. É proibido copiar, reproduzir ou fazer engenharia reversa do código.</p>

              <h2 className="text-xl font-bold text-white mt-6">8. ISENÇÃO DE GARANTIAS</h2>
              <p>8.1. A Plataforma é fornecida <strong>"COMO ESTÁ"</strong> e <strong>"CONFORME DISPONÍVEL"</strong>.</p>
              <p>8.2. A iDeepX não garante lucros, resultados específicos ou operação ininterrupta.</p>
              <p>8.3. Você reconhece que o uso da Plataforma é por sua conta e risco exclusivo.</p>

              <h2 className="text-xl font-bold text-white mt-6">9. LIMITAÇÃO DE RESPONSABILIDADE</h2>
              <p>9.1. A iDeepX não será responsável por:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Perdas financeiras decorrentes do uso da plataforma</li>
                <li>Problemas técnicos ou falhas de blockchain</li>
                <li>Ações de terceiros, hackers ou ataques cibernéticos</li>
                <li>Flutuações de preço de criptomoedas</li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-6">10. SUSPENSÃO E CANCELAMENTO</h2>
              <p>10.1. A iDeepX pode suspender ou cancelar sua conta caso você viole estes Termos.</p>
              <p>10.2. Em caso de suspeita de fraude, sua conta pode ser bloqueada imediatamente.</p>
              <p>10.3. Nenhum reembolso será concedido em casos de violação.</p>

              <h2 className="text-xl font-bold text-white mt-6">11. MODIFICAÇÕES DOS TERMOS</h2>
              <p>11.1. A iDeepX reserva-se o direito de modificar estes Termos a qualquer momento.</p>
              <p>11.2. Alterações significativas serão notificadas por email.</p>
              <p>11.3. O uso continuado da Plataforma constitui aceitação dos novos Termos.</p>

              <h2 className="text-xl font-bold text-white mt-6">12. LEI APLICÁVEL</h2>
              <p>12.1. Estes Termos são regidos pelas leis internacionais aplicáveis.</p>
              <p>12.2. Disputas serão resolvidas por arbitragem internacional.</p>

              <h2 className="text-xl font-bold text-white mt-6">13. CONTATO</h2>
              <p>Para questões relacionadas a estes Termos:</p>
              <p className="font-mono text-blue-400">Email: legal@ideepx.ai</p>
              <p className="font-mono text-blue-400">Website: www.ideepx.ai</p>

              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mt-8">
                <p className="text-green-400 font-bold">✅ Você chegou ao final dos Termos de Uso</p>
                <p className="text-sm text-gray-400 mt-2">Agora leia a Política de Privacidade clicando na aba acima.</p>
              </div>
            </div>
          ) : (
            <div className="text-gray-300 space-y-4 prose prose-invert max-w-none">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
                <p className="text-purple-400 font-bold">🔒 PRIVACIDADE E PROTEÇÃO DE DADOS</p>
                <p className="text-sm text-gray-400 mt-2">Entenda como coletamos, usamos e protegemos seus dados pessoais.</p>
              </div>

              <h1 className="text-3xl font-bold text-white">POLÍTICA DE PRIVACIDADE</h1>
              <p className="text-sm text-gray-500">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

              <h2 className="text-xl font-bold text-white mt-6">1. INTRODUÇÃO E COMPROMISSO COM A PRIVACIDADE</h2>
              <p>1.1. A iDeepX Technologies Group está comprometida em proteger a privacidade e os dados pessoais de todos os usuários.</p>
              <p>1.2. Esta Política descreve como coletamos, usamos, armazenamos e protegemos suas informações em conformidade com:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Regulamento Geral de Proteção de Dados (GDPR)</li>
                <li>Lei Geral de Proteção de Dados (LGPD)</li>
                <li>Padrões internacionais de proteção de dados</li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-6">2. DADOS QUE COLETAMOS (Blockchain)</h2>
              <p>Como esta é uma plataforma blockchain, coletamos:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Endereço da carteira</strong>: Seu endereço de carteira Ethereum/BSC</li>
                <li><strong>Histórico de transações</strong>: Todas as transações são públicas na blockchain</li>
                <li><strong>Dados de uso</strong>: Páginas visitadas, funcionalidades utilizadas</li>
                <li><strong>Dados técnicos</strong>: Endereço IP, tipo de navegador, dispositivo</li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-6">3. COMO USAMOS SEUS DADOS</h2>
              <p>Utilizamos seus dados para:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Gerenciar sua conta e processar transações</li>
                <li>Calcular e distribuir comissões MLM</li>
                <li>Melhorar a segurança da plataforma</li>
                <li>Cumprir obrigações legais</li>
                <li>Enviar notificações importantes sobre sua conta</li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-6">4. COMPARTILHAMENTO DE DADOS</h2>
              <p>4.1. <strong>Blockchain Pública</strong>: Dados na blockchain são públicos e imutáveis (endereço, transações, saldos).</p>
              <p>4.2. <strong>Nunca vendemos seus dados</strong> para terceiros.</p>
              <p>4.3. Compartilhamos apenas quando:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Exigido por lei ou ordem judicial</li>
                <li>Necessário para operação da plataforma (IPFS, provedores de infraestrutura)</li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-6">5. SEGURANÇA DOS DADOS</h2>
              <p>5.1. Implementamos medidas robustas de segurança:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Criptografia</strong>: Dados sensíveis são criptografados (SSL/TLS)</li>
                <li><strong>Smart Contracts auditados</strong>: Código verificado no BSCScan</li>
                <li><strong>Sem armazenamento de senhas</strong>: Autenticação via MetaMask/WalletConnect</li>
                <li><strong>Descentralização</strong>: Frontend hospedado em IPFS</li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-6">6. SEUS DIREITOS (GDPR/LGPD)</h2>
              <p>Você tem direito a:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Acesso</strong>: Saber quais dados temos sobre você</li>
                <li><strong>Retificação</strong>: Corrigir dados incorretos</li>
                <li><strong>Exclusão</strong>: Solicitar remoção de dados (exceto dados na blockchain, que são imutáveis)</li>
                <li><strong>Portabilidade</strong>: Receber seus dados em formato legível</li>
                <li><strong>Oposição</strong>: Se opor ao processamento para marketing</li>
              </ul>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 my-4">
                <p className="text-yellow-400 font-bold">⚠️ IMPORTANTE: Dados na Blockchain</p>
                <p className="text-sm text-gray-400 mt-2">Dados gravados na blockchain BSC são <strong>públicos e permanentes</strong>. Não podemos apagar transações ou saldos registrados em smart contracts. Isso é uma limitação técnica da tecnologia blockchain.</p>
              </div>

              <h2 className="text-xl font-bold text-white mt-6">7. COOKIES E TECNOLOGIAS DE RASTREAMENTO</h2>
              <p>7.1. Usamos cookies essenciais para:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Manter você conectado</li>
                <li>Lembrar suas preferências</li>
                <li>Melhorar a segurança</li>
              </ul>
              <p className="mt-2">7.2. Você pode desabilitar cookies, mas isso pode afetar funcionalidades.</p>

              <h2 className="text-xl font-bold text-white mt-6">8. RETENÇÃO DE DADOS</h2>
              <p>8.1. Mantemos seus dados enquanto sua conta estiver ativa.</p>
              <p>8.2. Após cancelamento da conta:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Dados off-chain: Excluídos em até 90 dias</li>
                <li>Dados on-chain: Permanecem na blockchain permanentemente</li>
                <li>Dados fiscais: Retidos por 5 anos (obrigação legal)</li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-6">9. TRANSFERÊNCIAS INTERNACIONAIS</h2>
              <p>9.1. Como operamos globalmente, seus dados podem ser transferidos para outros países.</p>
              <p>9.2. Garantimos proteção adequada através de cláusulas contratuais padrão.</p>

              <h2 className="text-xl font-bold text-white mt-6">10. MENORES DE IDADE</h2>
              <p>10.1. Nossa plataforma não é direcionada a menores de 18 anos.</p>
              <p>10.2. Não coletamos intencionalmente dados de menores.</p>

              <h2 className="text-xl font-bold text-white mt-6">11. ALTERAÇÕES NESTA POLÍTICA</h2>
              <p>11.1. Podemos atualizar esta Política periodicamente.</p>
              <p>11.2. Alterações significativas serão notificadas por email.</p>

              <h2 className="text-xl font-bold text-white mt-6">12. CONTATO - PRIVACIDADE</h2>
              <p>Para exercer seus direitos ou questões sobre privacidade:</p>
              <p className="font-mono text-purple-400">Email: privacy@ideepx.ai</p>
              <p className="font-mono text-purple-400">Website: www.ideepx.com/privacy</p>
              <p className="text-sm text-gray-400 mt-2">Responderemos em até 30 dias.</p>

              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mt-8">
                <p className="text-green-400 font-bold">✅ Você chegou ao final da Política de Privacidade</p>
                <p className="text-sm text-gray-400 mt-2">Agora você pode marcar o checkbox abaixo e aceitar ambos os documentos.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Avisos e Botões */}
        <div className="p-6 border-t border-white/10 bg-gray-900/80 space-y-4">

          {/* Status de leitura */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className={`p-3 rounded-xl border ${termsScrolled ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
              {termsScrolled ? (
                <p className="text-green-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Termos de Uso lidos ✅
                </p>
              ) : (
                <p className="text-yellow-400">⬇️ Leia os Termos até o final</p>
              )}
            </div>
            <div className={`p-3 rounded-xl border ${privacyScrolled ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
              {privacyScrolled ? (
                <p className="text-green-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Política de Privacidade lida ✅
                </p>
              ) : (
                <p className="text-yellow-400">⬇️ Leia a Política até o final</p>
              )}
            </div>
          </div>

          {/* Checkbox obrigatório */}
          <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-white/10 hover:bg-white/5 transition">
            <input
              type="checkbox"
              checked={acceptedCheckbox}
              onChange={(e) => setAcceptedCheckbox(e.target.checked)}
              disabled={!termsScrolled || !privacyScrolled}
              className="mt-1 w-5 h-5"
            />
            <span className="text-sm text-gray-300">
              Declaro que <strong className="text-white">tenho pelo menos 18 anos</strong>, li e compreendi completamente os <strong className="text-white">Termos de Uso</strong> e a <strong className="text-white">Política de Privacidade</strong>, e concordo em cumprir todas as condições estabelecidas.
            </span>
          </label>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={onDecline}
              className="flex-1 px-6 py-3 bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-600/30 transition font-semibold"
            >
              ❌ Recusar e Sair
            </button>
            <button
              onClick={handleAccept}
              disabled={!canAccept}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${
                canAccept
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canAccept ? '✅ Aceitar e Continuar' : '🔒 Leia tudo primeiro'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
