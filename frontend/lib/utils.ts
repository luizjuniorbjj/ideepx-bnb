import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatUSDT(amount: bigint): string {
  return (Number(amount) / 1_000000).toFixed(2)
}

export function parseUSDT(amount: string): bigint {
  return BigInt(Math.floor(parseFloat(amount) * 1_000000))
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function isExpired(timestamp: number): boolean {
  return timestamp * 1000 < Date.now()
}

export function daysUntilExpiration(timestamp: number): number {
  const diff = timestamp * 1000 - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
