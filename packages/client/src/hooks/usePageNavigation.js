import { useState, useCallback } from 'react'
import { perfMonitor } from '@/lib/performanceMonitor'

/**
 * Hook for managing page navigation and state
 * Handles 'home', 'research', 'detail', and 'compare' pages
 */
export const usePageNavigation = () => {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedMarket, setSelectedMarket] = useState(null)
  const [comparisonMarket1, setComparisonMarket1] = useState(null)
  const [comparisonMarket2, setComparisonMarket2] = useState(null)

  const navigateToMarket = useCallback(
    market => {
      perfMonitor.trackNavigation(currentPage, 'detail')()
      setSelectedMarket(market)
      setCurrentPage('detail')
    },
    [currentPage]
  )

  const navigateToResearch = useCallback(() => {
    setCurrentPage('research')
  }, [])

  const navigateToHome = useCallback(() => {
    setCurrentPage('home')
    setSelectedMarket(null)
  }, [])

  const navigateToComparison = useCallback(
    market => {
      perfMonitor.trackNavigation(currentPage, 'compare')()
      setComparisonMarket1(market)
      setComparisonMarket2(null)
      setCurrentPage('compare')
    },
    [currentPage]
  )

  const selectSecondMarketForComparison = useCallback(
    market => {
      if (comparisonMarket1?.market !== market.market) {
        setComparisonMarket2(market)
      }
    },
    [comparisonMarket1]
  )

  const swapComparisonMarkets = useCallback(() => {
    const temp = comparisonMarket1
    setComparisonMarket1(comparisonMarket2)
    setComparisonMarket2(temp)
  }, [comparisonMarket1, comparisonMarket2])

  const resetComparison = useCallback(() => {
    setComparisonMarket1(null)
    setComparisonMarket2(null)
    setCurrentPage('home')
  }, [])

  return {
    currentPage,
    setCurrentPage,
    selectedMarket,
    setSelectedMarket,
    comparisonMarket1,
    comparisonMarket2,
    navigateToMarket,
    navigateToResearch,
    navigateToHome,
    navigateToComparison,
    selectSecondMarketForComparison,
    swapComparisonMarkets,
    resetComparison
  }
}
