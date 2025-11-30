'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useEffect, useState, useRef } from 'react'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const [isConnecting, setIsConnecting] = useState(false)
  const connectingRef = useRef(false)

  useEffect(() => {
    console.log('ConnectButton mounted')
    console.log('Connectors available:', connectors.map(c => ({ id: c.id, name: c.name })))
    console.log('Is connected:', isConnected)
    console.log('Address:', address)
  }, [connectors, isConnected, address])

  useEffect(() => {
    if (error) {
      console.error('Connection error:', error)
      setIsConnecting(false)
      connectingRef.current = false

      // Mensagem mais amigável para o erro de requisição pendente
      if (error.message.includes('wallet_requestPermissions')) {
        alert('⚠️ Já existe uma solicitação de conexão pendente.\n\nPor favor:\n1. Verifique a extensão MetaMask\n2. Aprove ou rejeite a solicitação pendente\n3. Tente novamente')
      } else {
        alert(`Erro ao conectar: ${error.message}`)
      }
    }
  }, [error])

  const handleConnect = async () => {
    // Prevenir múltiplos cliques
    if (isConnecting || connectingRef.current || isPending) {
      console.log('Connection already in progress, ignoring click')
      return
    }

    console.log('Connect button clicked')
    setIsConnecting(true)
    connectingRef.current = true

    try {
      // Verificar se MetaMask está instalado
      if (typeof window.ethereum === 'undefined') {
        alert('❌ MetaMask não detectado!\n\nPor favor, instale o MetaMask no seu navegador.')
        window.open('https://metamask.io/download/', '_blank')
        return
      }

      const metaMaskConnector = connectors.find(c => c.id === 'injected')
      console.log('MetaMask connector found:', metaMaskConnector)

      if (metaMaskConnector) {
        console.log('Attempting to connect...')
        await connect({ connector: metaMaskConnector })
        console.log('Connection successful!')
      } else {
        console.error('No injected connector found')
        alert('❌ Conector do MetaMask não encontrado!')
      }
    } catch (err) {
      console.error('Connection failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'

      if (errorMessage.includes('wallet_requestPermissions')) {
        alert('⚠️ Já existe uma solicitação de conexão pendente.\n\nPor favor:\n1. Verifique a extensão MetaMask\n2. Aprove ou rejeite a solicitação pendente\n3. Tente novamente')
      } else {
        alert(`Erro: ${errorMessage}`)
      }
    } finally {
      setIsConnecting(false)
      connectingRef.current = false
    }
  }

  if (isConnected && address) {
    return (
      <button
        onClick={() => {
          console.log('Disconnecting...')
          disconnect()
        }}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    )
  }

  const isDisabled = isPending || isConnecting || connectingRef.current

  return (
    <button
      onClick={handleConnect}
      disabled={isDisabled}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDisabled ? 'Conectando...' : 'Conectar Carteira'}
    </button>
  )
}

// Componente Custom para compatibilidade com código existente
ConnectButton.Custom = function ConnectButtonCustom({ children }: { children: (props: any) => React.ReactNode }) {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, error } = useConnect()
  const { disconnect } = useDisconnect()
  const [isConnecting, setIsConnecting] = useState(false)
  const connectingRef = useRef(false)

  useEffect(() => {
    if (error) {
      console.error('Connection error (Custom):', error)
      setIsConnecting(false)
      connectingRef.current = false

      if (error.message.includes('wallet_requestPermissions')) {
        alert('⚠️ Já existe uma solicitação de conexão pendente.\n\nPor favor:\n1. Verifique a extensão MetaMask\n2. Aprove ou rejeite a solicitação pendente\n3. Tente novamente')
      }
    }
  }, [error])

  const openConnectModal = async () => {
    // Prevenir múltiplos cliques
    if (isConnecting || connectingRef.current) {
      console.log('Custom - Connection already in progress, ignoring')
      return
    }

    console.log('Custom ConnectButton - openConnectModal called')
    setIsConnecting(true)
    connectingRef.current = true

    try {
      if (typeof window.ethereum === 'undefined') {
        alert('❌ MetaMask não detectado!\n\nPor favor, instale o MetaMask no seu navegador.')
        window.open('https://metamask.io/download/', '_blank')
        return
      }

      const metaMaskConnector = connectors.find(c => c.id === 'injected')
      console.log('Custom - MetaMask connector:', metaMaskConnector)

      if (metaMaskConnector) {
        console.log('Custom - Attempting to connect...')
        await connect({ connector: metaMaskConnector })
        console.log('Custom - Connection successful!')
      } else {
        alert('❌ Conector do MetaMask não encontrado!')
      }
    } catch (err) {
      console.error('Custom - Connection failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'

      if (errorMessage.includes('wallet_requestPermissions')) {
        alert('⚠️ Já existe uma solicitação de conexão pendente.\n\nPor favor:\n1. Verifique a extensão MetaMask\n2. Aprove ou rejeite a solicitação pendente\n3. Tente novamente')
      } else {
        alert(`Erro: ${errorMessage}`)
      }
    } finally {
      setIsConnecting(false)
      connectingRef.current = false
    }
  }

  return (
    <>
      {children({
        account: address,
        chain: chain,
        openConnectModal,
        mounted: true,
        authenticationStatus: undefined,
        openAccountModal: () => {
          console.log('Custom - Disconnect called')
          disconnect()
        },
        openChainModal: () => {
          console.log('Custom - openChainModal not implemented')
        },
      })}
    </>
  )
}
