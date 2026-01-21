import { useState, useCallback } from 'react'
import { socket } from '@/lib/socket'
import { generateMockSignals } from '@/lib/mockData'

/**
 * Hook for managing signal search and analysis
 * Handles REST API, WebSocket fallback, and mock data
 */
export const useSignalSearch = () => {
  const [signals, setSignals] = useState([])
  const [searchedQuery, setSearchedQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(false)

  const fetchSignalsFromAPI = useCallback(async queryText => {
    try {
      console.log(`[api] fetching signals for: "${queryText}"`)
      const response = await fetch(
        `http://localhost:3333/api/signals/${encodeURIComponent(queryText)}`
      )
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      if (data.success) {
        setSignals(data.signals || [])
        setError(null)
        return true
      }
    } catch (err) {
      console.warn('[api] failed to fetch signals:', err)
      return false
    }
    return false
  }, [])

  const performSearch = useCallback(
    async queryText => {
      setLoading(true)
      setSearchedQuery(queryText)

      // Try REST API first, fallback to WebSocket, then mock data
      const success = await fetchSignalsFromAPI(queryText)
      if (!success && connected) {
        // Fallback to WebSocket
        socket.emit('signal:query', queryText)
      } else if (!success) {
        // Fallback to mock data
        const mockSignals = generateMockSignals(queryText, 25)
        setSignals(mockSignals)
        setLoading(false)
      }
    },
    [fetchSignalsFromAPI, connected]
  )

  return {
    signals,
    setSignals,
    searchedQuery,
    setSearchedQuery,
    loading,
    setLoading,
    error,
    setError,
    connected,
    setConnected,
    performSearch,
    fetchSignalsFromAPI
  }
}
