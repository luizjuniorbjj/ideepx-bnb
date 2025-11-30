# ✅ IMPLEMENTAÇÃO COMPLETA - DASHBOARD CLIENTE

## Arquivo: `/frontend/app/mt5/dashboard/page.tsx`

Adicione os seguintes estados após a linha 57:

```typescript
const [showRemovalModal, setShowRemovalModal] = useState(false)
const [accountToRemove, setAccountToRemove] = useState<MT5Account | null>(null)
const [removalReason, setRemovalReason] = useState('')
const [requestingRemoval, setRequestingRemoval] = useState(false)
```

Adicione as seguintes funções após `handleDelete`:

```typescript
// Solicitar remoção
const handleRequestRemoval = (account: MT5Account) => {
  setAccountToRemove(account)
  setShowRemovalModal(true)
}

// Confirmar solicitação de remoção
const confirmRemovalRequest = async () => {
  if (!accountToRemove || !address) return

  setRequestingRemoval(true)

  try {
    const response = await fetch('/api/mt5/request-removal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: accountToRemove.id,
        walletAddress: address,
        reason: removalReason || null
      })
    })

    const data = await response.json()

    if (!response.ok) {
      if (data.error === 'REQUEST_ALREADY_EXISTS') {
        toast.error('Já existe uma solicitação pendente para esta conta')
      } else {
        throw new Error(data.message || 'Erro ao solicitar remoção')
      }
      return
    }

    toast.success('Solicitação enviada! Aguarde aprovação do administrador.')

    setShowRemovalModal(false)
    setAccountToRemove(null)
    setRemovalReason('')
    fetchAccounts()

  } catch (error: any) {
    console.error('Erro ao solicitar remoção:', error)
    toast.error(error.message || 'Erro ao solicitar remoção')
  } finally {
    setRequestingRemoval(false)
  }
}

// Remover conta (quando aprovado ou não conectada)
const handleRemoveAccount = async (accountId: string) => {
  if (!address) return

  if (!confirm('Tem certeza que deseja remover esta conta?')) {
    return
  }

  setDeletingId(accountId)

  try {
    const response = await fetch(`/api/mt5/accounts/${accountId}?walletAddress=${address}`, {
      method: 'DELETE'
    })

    const data = await response.json()

    if (!response.ok) {
      if (data.error === 'REMOVAL_NOT_AUTHORIZED') {
        toast.error('Esta conta requer autorização do administrador. Use "Solicitar Remoção".')
      } else {
        throw new Error(data.message || 'Erro ao remover conta')
      }
      return
    }

    toast.success('Conta removida com sucesso!')
    fetchAccounts()

  } catch (error: any) {
    console.error('Erro ao remover conta:', error)
    toast.error(error.message || 'Erro ao remover conta')
  } finally {
    setDeletingId(null)
  }
}
```

Substitua o botão de delete (linha ~303-313) por este código:

```typescript
<div className="flex items-center gap-2">
  {getStatusBadge(account)}

  {/* Badge de Status de Remoção */}
  {account.removalStatus !== 'ACTIVE' && (
    <span className={`
      text-xs font-semibold px-3 py-1 rounded-full
      ${account.removalStatus === 'PENDING_REMOVAL' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : ''}
      ${account.removalStatus === 'APPROVED_FOR_REMOVAL' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : ''}
    `}>
      {account.removalStatus === 'PENDING_REMOVAL' && '⏳ Aguardando'}
      {account.removalStatus === 'APPROVED_FOR_REMOVAL' && '✅ Aprovado'}
    </span>
  )}

  {/* Botões de Ação */}
  {account.status === 'CONNECTED' && account.removalStatus === 'ACTIVE' && (
    <button
      onClick={() => handleRequestRemoval(account)}
      className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors text-xs font-medium border border-yellow-500/50"
    >
      Solicitar Remoção
    </button>
  )}

  {(account.removalStatus === 'APPROVED_FOR_REMOVAL' || account.status !== 'CONNECTED') && (
    <button
      onClick={() => handleRemoveAccount(account.id)}
      disabled={deletingId === account.id}
      className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-xs font-medium border border-red-500/50 disabled:opacity-50"
    >
      {deletingId === account.id ? 'Removendo...' : 'Remover'}
    </button>
  )}
</div>
```

Adicione este modal ANTES do fechamento do `</div>` final (após linha ~433):

```typescript
{/* Modal de Solicitação de Remoção */}
{showRemovalModal && accountToRemove && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-md w-full">
      <h3 className="text-xl font-bold text-white mb-4">Solicitar Remoção de Conta</h3>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
        <p className="text-yellow-300 text-sm">
          ⚠️ Esta solicitação será enviada ao administrador para análise.
        </p>
      </div>

      <div className="mb-4">
        <p className="text-gray-300 text-sm mb-2">
          <strong>Conta:</strong> {accountToRemove.accountAlias}
        </p>
        <p className="text-gray-400 text-xs">
          {accountToRemove.login} @ {accountToRemove.server}
        </p>
      </div>

      <div className="mb-4">
        <label className="text-gray-300 text-sm font-semibold mb-2 block">
          Motivo da remoção (opcional)
        </label>
        <textarea
          value={removalReason}
          onChange={(e) => setRemovalReason(e.target.value)}
          placeholder="Ex: Quero trocar de corretora, conta encerrada, etc."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none"
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={confirmRemovalRequest}
          disabled={requestingRemoval}
          className="flex-1 bg-yellow-500 text-gray-900 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50"
        >
          {requestingRemoval ? 'Enviando...' : 'Enviar Solicitação'}
        </button>
        <button
          onClick={() => {
            setShowRemovalModal(false)
            setAccountToRemove(null)
            setRemovalReason('')
          }}
          className="flex-1 bg-white/5 text-white py-2 rounded-lg font-semibold hover:bg-white/10 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}
```

---

## ✅ IMPLEMENTAÇÃO DO PAINEL ADMIN

Crie novo arquivo: `/frontend/app/admin/mt5-requests/page.tsx`

(Código completo no próximo passo devido a limite de espaço)

---

## 🎯 RESUMO DAS MUDANÇAS

### Dashboard Cliente:
1. ✅ Adicionado campo `removalStatus` à interface
2. ✅ Criados 4 novos estados (modal, account, reason, loading)
3. ✅ Criadas 3 novas funções (request, confirm, remove)
4. ✅ Substituído botão delete por lógica condicional
5. ✅ Adicionado badge de status de remoção
6. ✅ Adicionado modal completo

### Próximo Passo:
Criar painel admin para revisar solicitações
