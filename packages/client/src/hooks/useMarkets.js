import { useState, useEffect } from 'react'

/**
 * Hook for managing featured markets fetching
 * Handles both HTTP and socket delivery with fallback logic
 */
export const useMarkets = () => {
  const [initialMarkets, setInitialMarkets] = useState([])
  const [markets, setMarkets] = useState([])
  const [dataQuality, setDataQuality] = useState(null)
  const [filteredMarkets, setFilteredMarkets] = useState([])

  // Fetch featured markets on mount
  useEffect(() => {
    const fetchFeaturedMarkets = async () => {
      try {
        const response = await fetch('http://localhost:3333/api/featured-markets')
        const data = await response.json()
        if (data.success && data.markets && data.markets.length > 0) {
          setInitialMarkets(data.markets)
          setMarkets(data.markets)
          console.log('[markets] fetched via HTTP:', data.markets.length)
        }
      } catch (err) {
        console.error('[markets] HTTP fetch failed:', err)
      }
    }

    const fetchDataQuality = async () => {
      try {
        const response = await fetch('http://localhost:3333/api/data-quality')
        const data = await response.json()
        setDataQuality(data.aggregatedMetrics)
      } catch (err) {
        console.error('[data-quality] fetch failed:', err)
      }
    }

    const timer = setTimeout(() => {
      if (initialMarkets.length === 0) {
        console.log('[markets] socket delivery timeout, fetching via HTTP')
        fetchFeaturedMarkets()
      }
    }, 2000)

    // Fetch data quality on mount
    fetchDataQuality()

    return () => clearTimeout(timer)
  }, [initialMarkets.length])

  return {
    initialMarkets,
    setInitialMarkets,
    markets,
    setMarkets,
    dataQuality,
    setDataQuality,
    filteredMarkets,
    setFilteredMarkets
  }
}
