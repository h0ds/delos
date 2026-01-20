import { io, type Socket } from 'socket.io-client'
import type { Signal } from '../types'

export interface PolymarketData {
  market?: string
  question: string
  description?: string
  image?: string
  icon?: string
  category?: string
  slug?: string
  outcomes: Array<{ name: string; probability: number }>
  volume24h: number
  liquidity?: number
  relevance?: number
  status?: string
}

export interface MarketUpdate {
  source: 'polymarket' | 'kalshi'
  marketId: string
  question: string
  outcomes: Array<{ name: string; probability: number }>
  volume24h: number
  liquidity?: number
  timestamp: number
  priceChangePercent?: number
  priceChangeDirection?: 'up' | 'down' | 'stable'
}

export interface ServerToClientEvents {
  signal: (data: Signal) => void
  signals: (data: Signal[]) => void
  'scan:start': (data: { query: string }) => void
  'scan:complete': (data: { query: string; count: number }) => void
  'oracle:analysis': (data: any) => void
  'oracle:markets': (data: PolymarketData[]) => void
  'market:update': (data: MarketUpdate[]) => void
  error: (data: { message: string }) => void
  status: (data: { status: string }) => void
}

export interface ClientToServerEvents {
  'signal:query': (query: string) => void
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3333'

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
})

socket.on('connect', () => {
  console.log('[socket] connected')
})

socket.on('disconnect', () => {
  console.log('[socket] disconnected')
})

socket.on('error', error => {
  console.error('[socket] error:', error)
})
