import { useEffect, useState, useCallback } from 'react'
import { socket } from '@/lib/socket'

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

interface PriceAlert {
  marketId: string
  changePercent: number
  direction: 'up' | 'down'
  triggered: boolean
}

/**
 * Hook for tracking real-time market updates via WebSocket
 * @param marketIds - Optional array of specific market IDs to track
 * @param alertThreshold - Price change threshold (%) to trigger alerts
 */
export function useMarketUpdates(marketIds?: string[], alertThreshold: number = 2) {
  const [updates, setUpdates] = useState<Map<string, MarketUpdate>>(new Map())
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const onConnect = () => {
      console.log('[market-updates] connected to live stream')
      setConnected(true)
    }

    const onDisconnect = () => {
      console.log('[market-updates] disconnected from live stream')
      setConnected(false)
    }

    const onMarketUpdate = (marketUpdates: MarketUpdate[]) => {
      setUpdates(prevUpdates => {
        const newUpdates = new Map(prevUpdates)

        for (const update of marketUpdates) {
          const fullMarketId = `${update.source}:${update.marketId}`

          // Filter by specific market IDs if provided
          if (marketIds && !marketIds.includes(fullMarketId)) {
            continue
          }

          // Check for price alerts
          if (update.priceChangePercent && Math.abs(update.priceChangePercent) >= alertThreshold) {
            setPriceAlerts(prevAlerts => [
              ...prevAlerts.filter(a => a.marketId !== fullMarketId),
              {
                marketId: fullMarketId,
                changePercent: update.priceChangePercent,
                direction: update.priceChangeDirection === 'up' ? 'up' : 'down',
                triggered: true
              }
            ])
          }

          newUpdates.set(fullMarketId, update)
        }

        return newUpdates
      })
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('market:update', onMarketUpdate)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('market:update', onMarketUpdate)
    }
  }, [marketIds, alertThreshold])

  // Dismiss alert
  const dismissAlert = useCallback((marketId: string) => {
    setPriceAlerts(prev => prev.filter(a => a.marketId !== marketId))
  }, [])

  // Get latest update for a specific market
  const getMarketUpdate = useCallback(
    (marketId: string): MarketUpdate | undefined => {
      return updates.get(marketId)
    },
    [updates]
  )

  return {
    updates,
    priceAlerts,
    connected,
    dismissAlert,
    getMarketUpdate,
    updateCount: updates.size
  }
}
