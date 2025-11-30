import './globals.css'
import '../styles/premium.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'iDeepX Distribution | MLM Platform',
  description: 'Plataforma descentralizada de distribuição MLM na BNB Smart Chain',
  keywords: ['MLM', 'Blockchain', 'BSC', 'DeFi', 'Distribution'],
  authors: [{ name: 'iDeepX Team' }],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
