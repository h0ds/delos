import { useEffect, useCallback } from 'react'
import { socket } from '@/lib/socket'

/**
 * Hook for managing WebSocket connection and listeners
 * Handles real-time signal delivery, market updates, and connection state
 */
export const useSocketConnection = ({
  onConnect,
  onDisconnect,
  onSignals,
  onScanStart,
  onScanComplete,
  onError,
  onMarkets,
  searchedQuery
}) => {
  useEffect(() => {
    const handleConnect = () => {
      console.log('[socket] connected')
      if (onConnect) onConnect()
    }

    const handleDisconnect = () => {
      console.log('[socket] disconnected')
      if (onDisconnect) onDisconnect()
    }

    const handleSignals = data => {
      console.log('[socket] received signals:', data.length)
      if (onSignals) onSignals(data)
    }

    const handleScanStart = data => {
      console.log('[socket] scan start:', data.query)
      if (onScanStart) onScanStart(data)
    }

    const handleScanComplete = () => {
      console.log('[socket] scan complete')
      if (onScanComplete) onScanComplete()
    }

    const handleError = data => {
      console.error('[socket] error:', data)
      if (onError) onError(data)
    }

    const handleMarkets = data => {
      console.log('[markets] received', data.length, 'markets from server')
      if (onMarkets) onMarkets(data)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('signals', handleSignals)
    socket.on('scan:start', handleScanStart)
    socket.on('scan:complete', handleScanComplete)
    socket.on('error', handleError)
    socket.on('oracle:markets', handleMarkets)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('signals', handleSignals)
      socket.off('scan:start', handleScanStart)
      socket.off('scan:complete', handleScanComplete)
      socket.off('error', handleError)
      socket.off('oracle:markets', handleMarkets)
    }
  }, [
    searchedQuery,
    onConnect,
    onDisconnect,
    onSignals,
    onScanStart,
    onScanComplete,
    onError,
    onMarkets
  ])
}
