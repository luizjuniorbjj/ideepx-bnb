# 📄 CÓDIGO DE REFERÊNCIA - Páginas iDeepX Mobile-First

**Data:** 2025-11-15
**Objetivo:** Código de referência para implementar as 5 páginas restantes

---

## 📋 ÍNDICE

1. [Network/MLM Page](#1-networkmlm-page)
2. [Withdraw Page](#2-withdraw-page)
3. [GMI Edge Page](#3-gmi-edge-page)
4. [Transparency Page](#4-transparency-page)
5. [Admin Panel](#5-admin-panel)

---

## 1. Network/MLM Page

**Arquivo:** `frontend/app/network/page.tsx`

**Funcionalidades:**
- ✅ Stats da rede (Total, Ativos, Volume)
- ✅ Link de indicação copiável
- ✅ Lista de referrals com dados reais
- ✅ Filtro ativo/inativo
- ✅ Info do sponsor

**Estrutura:**
```
┌─────────────────────────────┐
│ Stats (3 cards)             │
│ Total │ Ativos │ Volume     │
├─────────────────────────────┤
│ Link de Indicação           │
│ [Copiar] [Compartilhar]     │
├─────────────────────────────┤
│ Seu Sponsor (se tiver)      │
├─────────────────────────────┤
│ Filtros                     │
│ [Todos] [Ativos] [Inativos] │
├─────────────────────────────┤
│ Lista de Referrals          │
│ ┌─────────────────────────┐│
│ │ 0x1234... Nível 3       ││
│ │ Ativo • $5,000 volume   ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

**Código já existente aproveita:**
- `useCompleteUserData()` - Já retorna referrals
- Network page já existe em `frontend/app/network/page.tsx`
- **AÇÃO:** Backup e melhorar a versão existente com mobile-first

---

## 2. Withdraw Page

**Arquivo:** `frontend/app/withdraw/page.tsx`

**Funcionalidades:**
- ✅ Saldo disponível
- ✅ Limites (diário/mensal)
- ✅ Formulário de saque
- ✅ Validações
- ✅ Histórico

**Estrutura:**
```
┌─────────────────────────────┐
│ Saldo Disponível            │
│ $5,481.50                   │
├─────────────────────────────┤
│ Limites                     │
│ Hoje: $0 / $1,000          │
│ Mês: $500 / $10,000        │
├─────────────────────────────┤
│ Sacar                       │
│ Valor: [Input]              │
│ Destino: [Input address]    │
│ [Confirmar Saque] btn       │
├─────────────────────────────┤
│ Histórico                   │
│ ┌─────────────────────────┐│
│ │ $500 • 10/11 • Pending  ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

**APIs necessárias:**
- `POST /api/withdraw` - Já existe (`api.withdraw()`)
- `GET /api/withdrawals/:address` - Criar backend

**Template de código:**
```typescript
'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useCompleteUserData } from '@/hooks/useCompleteUserData'
import api from '@/lib/api'
import { toast } from 'sonner'
import { DollarSign, ArrowRight, Clock } from 'lucide-react'

export default function WithdrawPage() {
  const { address } = useAccount()
  const { userData } = useCompleteUserData()
  const [amount, setAmount] = useState('')
  const [destination, setDestination] = useState('')
  const [loading, setLoading] = useState(false)

  const internalBalance = parseFloat(userData?.internalBalance ?? '0')
  const withdrawnThisMonth = parseFloat(userData?.withdrawnThisMonth ?? '0')

  // Limites
  const DAILY_LIMIT = 1000
  const MONTHLY_LIMIT = 10000

  const handleWithdraw = async () => {
    if (!amount || !destination) {
      toast.error('Preencha todos os campos')
      return
    }

    const value = parseFloat(amount)

    // Validações
    if (value <= 0) {
      toast.error('Valor deve ser maior que zero')
      return
    }

    if (value > internalBalance) {
      toast.error('Saldo insuficiente')
      return
    }

    if (withdrawnThisMonth + value > MONTHLY_LIMIT) {
      toast.error(`Limite mensal excedido ($${MONTHLY_LIMIT})`)
      return
    }

    try {
      setLoading(true)
      await api.withdraw(address!, value)
      toast.success('Saque solicitado com sucesso!')
      setAmount('')
      setDestination('')
    } catch (error: any) {
      toast.error('Erro ao sacar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header sticky */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        ...
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Saldo Disponível */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Saldo Disponível</p>
          <p className="text-4xl font-bold text-white">${internalBalance.toFixed(2)}</p>
        </div>

        {/* Limites */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-4">Limites de Saque</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Mensal</span>
                <span className="text-white">${withdrawnThisMonth.toFixed(0)} / ${MONTHLY_LIMIT.toFixed(0)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(withdrawnThisMonth / MONTHLY_LIMIT) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-4">Sacar para Carteira</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Valor (USDT)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Carteira Destino</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleWithdraw}
              disabled={loading || !amount || !destination}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              {loading ? 'Processando...' : 'Confirmar Saque'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Histórico (mock inicial) */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-4">Histórico de Saques</h2>
          <div className="space-y-2">
            <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">$500.00</p>
                <p className="text-xs text-gray-400">10/11/2025</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
```

---

## 3. GMI Edge Page

**Arquivo:** `frontend/app/gmi-hedge/page.tsx`

**Funcionalidades:**
- ✅ Status de conexão GMI
- ✅ Stats (P&L, Win Rate, Trades)
- ✅ Link/Unlink account
- ✅ Lista de trades

**Estrutura:**
```
┌─────────────────────────────┐
│ Status                      │
│ ✅ Conectado • MT5 #12345   │
│ [Desconectar]               │
├─────────────────────────────┤
│ Performance (3 cards)       │
│ P&L │ Win% │ Trades         │
├─────────────────────────────┤
│ Últimos Trades              │
│ ┌─────────────────────────┐│
│ │ EURUSD • +$50 • 12:30   ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

**Aproveita componentes:**
- Modal de Link GMI já existe no Dashboard
- Pode reutilizar o código

---

## 4. Transparency Page

**Arquivo:** `frontend/app/transparency/page.tsx`

**Funcionalidades:**
- ✅ Info Rulebook contract
- ✅ Info Proof contract
- ✅ Lista de provas on-chain
- ✅ Links BSCScan

**Estrutura:**
```
┌─────────────────────────────┐
│ Contrato Rulebook           │
│ 0x9F8b...3653               │
│ [Ver no BSCScan ↗]         │
├─────────────────────────────┤
│ Contrato Proof              │
│ 0xABCD...1234               │
│ [Ver no BSCScan ↗]         │
├─────────────────────────────┤
│ Últimas Provas              │
│ ┌─────────────────────────┐│
│ │ Semana #145 • 10/11     ││
│ │ Hash: 0x5678...         ││
│ │ [Verificar ✓]           ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

**APIs já existem:**
- `api.getRulebookInfo()`
- `api.getProofInfo()`
- `api.getLatestProofs()`

---

## 5. Admin Panel

**Arquivo:** `frontend/app/admin/page.tsx`

**Funcionalidades:**
- ✅ Stats globais
- ✅ Processar fees
- ✅ Circuit breaker
- ✅ Lista de usuários
- ✅ Logs

**Estrutura:**
```
┌─────────────────────────────┐
│ Stats Globais (4 cards)     │
│ Users│Volume│Fees │Solvency │
├─────────────────────────────┤
│ Ações Admin                 │
│ [Processar Fees]            │
│ [Circuit Breaker: OFF]      │
├─────────────────────────────┤
│ Usuários Recentes           │
│ ┌─────────────────────────┐│
│ │ 0x1234... • Ativo       ││
│ └─────────────────────────┘│
└─────────────────────────────┘
```

**Proteção:**
```typescript
// Verificar se é admin
const adminWallets = process.env.NEXT_PUBLIC_ADMIN_WALLETS?.split(',') || []
const isAdmin = address ? adminWallets.includes(address.toLowerCase()) : false

if (!isAdmin) {
  return <div>Acesso negado</div>
}
```

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### Opção A: Implementar manualmente
1. Criar cada arquivo `.tsx` usando os templates acima
2. Ajustar conforme necessário
3. Testar cada página

### Opção B: Solicitar implementação incremental
1. Pedir para implementar Network page completa
2. Depois Withdraw
3. E assim por diante

### Opção C: Focar no crítico primeiro
1. Network + Withdraw (CRÍTICAS)
2. Deixar GMI Edge, Transparency, Admin para depois

---

## 📊 RESUMO DE IMPLEMENTAÇÃO

**Páginas:**
1. ✅ Dashboard - COMPLETO (mobile-first)
2. 📋 Network - Template pronto, precisa implementar
3. 💰 Withdraw - Template pronto, precisa implementar
4. 📊 GMI Edge - Template pronto, precisa implementar
5. 🛡️ Transparency - Template pronto, precisa implementar
6. ⚙️ Admin - Template pronto, precisa implementar

**Todas seguem:**
- ✅ Mobile-first design
- ✅ Sticky header com backdrop blur
- ✅ Grid responsivo (2 cols → 4 cols)
- ✅ Cards com `bg-white/5 backdrop-blur-sm`
- ✅ Cores consistentes
- ✅ Espaçamentos padronizados

---

**Quer que eu:**
1. ✨ Implemente AGORA as 2 páginas críticas (Network + Withdraw)?
2. 📚 Deixe este guia para você implementar quando quiser?
3. 🎯 Implemente apenas 1 página específica agora?

**Escolha e me avise!** 🚀
