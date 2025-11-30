'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useEffect, useState } from 'react'

export function ConnectButtonDebug() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log('🔍 DEBUG - ConnectButton MOUNTED no cliente')
  }, [])

  useEffect(() => {
    console.log('🔍 DEBUG - Estado atualizado:')
    console.log('  isConnected:', isConnected)
    console.log('  address:', address)
    console.log('  connectors:', connectors.map(c => c.id))
    console.log('  isPending:', isPending)
  }, [isConnected, address, connectors, isPending])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('🔵 ========================================')
    console.log('🔵 BOTÃO CLICADO!')
    console.log('🔵 Timestamp:', new Date().toISOString())
    console.log('🔵 Event:', e.type)
    console.log('🔵 window.ethereum existe:', typeof window.ethereum !== 'undefined')
    console.log('🔵 window.ethereum:', window.ethereum)
    console.log('🔵 Connectors disponíveis:', connectors)

    if (typeof window.ethereum === 'undefined') {
      console.error('❌ MetaMask não encontrado!')
      alert('❌ MetaMask não instalado!\n\nInstale o MetaMask e recarregue a página.')
      return
    }

    const connector = connectors[0]
    console.log('🔵 Usando connector:', connector?.id, connector?.name)

    if (!connector) {
      console.error('❌ Nenhum connector disponível!')
      alert('❌ Nenhum connector disponível!')
      return
    }

    try {
      console.log('🔵 Chamando connect()...')
      await connect({ connector })
      console.log('✅ Conectado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao conectar:', error)
      alert(`Erro: ${error}`)
    }

    console.log('🔵 ========================================')
  }

  // Evitar problemas de hidratação
  if (!mounted) {
    return (
      <div className="p-4 bg-gray-700 text-white rounded">
        Carregando...
      </div>
    )
  }

  // Botão de teste simples
  const handleSimpleTest = () => {
    console.log('🧪 TESTE SIMPLES - CLIQUE FUNCIONOU!')
    alert('✅ Eventos de clique estão funcionando!')
  }

  if (isConnected) {
    return (
      <div className="p-4 bg-green-600 text-white rounded shadow-lg border-2 border-green-400">
        <p className="font-bold mb-2">✅ CONECTADO!</p>
        <p className="text-sm mb-3">Endereço: {address?.slice(0, 10)}...{address?.slice(-8)}</p>
        <button
          onClick={() => {
            console.log('🔴 Desconectando...')
            disconnect()
          }}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded font-bold"
        >
          Desconectar
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-r from-blue-900 to-purple-900 text-white rounded-xl shadow-2xl border-2 border-blue-500">
      <p className="mb-3 text-lg font-bold">
        🔍 DEBUG MODE
      </p>

      <p className="mb-4 text-sm">
        Status: <span className="font-bold">{isPending ? '⏳ Conectando...' : '❌ Desconectado'}</span><br />
        Connectors: <span className="font-bold">{connectors.length}</span> disponível(is)<br />
        MetaMask: <span className="font-bold">{typeof window.ethereum !== 'undefined' ? '✅ Detectado' : '❌ Não detectado'}</span>
      </p>

      {/* Botão de teste simples */}
      <button
        onClick={handleSimpleTest}
        className="w-full mb-3 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-bold text-lg shadow-lg transition-all hover:scale-105"
        style={{ zIndex: 9999 }}
      >
        🧪 TESTE DE CLIQUE
      </button>

      {/* Botão principal de conexão */}
      <button
        onClick={handleClick}
        disabled={isPending}
        className="w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
        style={{ zIndex: 9999 }}
      >
        {isPending ? '⏳ CONECTANDO...' : '🔵 CONECTAR METAMASK'}
      </button>

      <p className="mt-3 text-xs text-gray-300">
        ℹ️ Abra o console (F12) para ver logs detalhados
      </p>
    </div>
  )
}
