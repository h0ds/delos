import { useState, useEffect, lazy, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Terminal, Activity, AlertCircle } from 'lucide-react'
import { socket } from '@/lib/socket'
import { generateMockSignals } from '@/lib/mockData'
import { perfMonitor } from '@/lib/performanceMonitor'
import { OracleHeader } from '@/components/OracleHeader'
import { OracleVisualization } from '@/components/OracleVisualization'
import { PolymarketCard } from '@/components/PolymarketCard'
import { KalshiCard } from '@/components/KalshiCard'
import { PolymarketIcon, KalshiIcon } from '@/components/MarketIcons'
import { SignalsSidebar } from '@/components/SignalsSidebar'
import { SearchAutocomplete } from '@/components/SearchAutocomplete'
import { useDebounce } from '@/lib/useDebounce'
import { MarketCardSkeleton } from '@/components/skeletons/MarketCardSkeleton'
import { SignalListSkeleton } from '@/components/skeletons/SignalListSkeleton'

// Lazy-loaded components for route-based code splitting
const MarketDetailPage = lazy(() => import('@/components/MarketDetailPage'))
const MarketComparisonPage = lazy(() => import('@/components/MarketComparisonPage'))
const MarketFilterPanel = lazy(() => import('@/components/MarketFilterPanel'))

// Fallback component for lazy loading
const LazyLoadFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <OracleVisualization size={32} />
      <span className="text-sm text-muted-foreground font-mono">Loading...</span>
    </div>
  </div>
)

function App() {
  const [currentPage, setCurrentPage] = useState('home') // 'home', 'research', 'detail', or 'compare'
  const [selectedMarket, setSelectedMarket] = useState(null)
  const [comparisonMarket1, setComparisonMarket1] = useState(null)
  const [comparisonMarket2, setComparisonMarket2] = useState(null)
  const [query, setQuery] = useState('')
  const [signals, setSignals] = useState([])
  const [markets, setMarkets] = useState([])
  const [initialMarkets, setInitialMarkets] = useState([])
  const [filteredMarkets, setFilteredMarkets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchedQuery, setSearchedQuery] = useState('')
  const [connected, setConnected] = useState(false)
  const [dataQuality, setDataQuality] = useState(null)

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

  // Socket listeners
  useEffect(() => {
    const onConnect = () => {
      setConnected(true)
      setError(null)
    }

    const onDisconnect = () => {
      setConnected(false)
    }

    const onSignals = data => {
      setSignals(data)
      setLoading(false)
    }

    const onScanStart = data => {
      setSearchedQuery(data.query)
      setLoading(true)
      setError(null)
    }

    const onScanComplete = () => {
      setLoading(false)
    }

    const onError = data => {
      setError(data.message)
      setLoading(false)
    }

    const onMarkets = data => {
      console.log('[markets] received', data.length, 'markets from server')
      setMarkets(data)
      if (!searchedQuery) {
        setInitialMarkets(data)
      }
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('signals', onSignals)
    socket.on('scan:start', onScanStart)
    socket.on('scan:complete', onScanComplete)
    socket.on('error', onError)
    socket.on('oracle:markets', onMarkets)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('signals', onSignals)
      socket.off('scan:start', onScanStart)
      socket.off('scan:complete', onScanComplete)
      socket.off('error', onError)
      socket.off('oracle:markets', onMarkets)
    }
  }, [searchedQuery])

  const fetchSignalsFromAPI = async queryText => {
    try {
      console.log(`[api] fetching signals for: "${queryText}"`)
      const response = await fetch(
        `http://localhost:3333/api/signals/${encodeURIComponent(queryText)}`
      )
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      if (data.success) {
        setSignals(data.signals || [])
        setMarkets(data.relatedMarkets || [])
        setError(null)
        return true
      }
    } catch (err) {
      console.warn('[api] failed to fetch signals:', err)
      return false
    }
    return false
  }

  const handleSearch = e => {
    e.preventDefault()
    setCurrentPage('research') // Navigate to research page
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      const mockSignals = generateMockSignals('Bitcoin', 25)
      setSignals(mockSignals)
      setSearchedQuery('Bitcoin')
      setLoading(false)
      setQuery('')
      return
    }

    setLoading(true)
    setSearchedQuery(trimmedQuery)

    // Try REST API first, fallback to WebSocket, then mock data
    fetchSignalsFromAPI(trimmedQuery).then(success => {
      if (!success && connected) {
        // Fallback to WebSocket
        socket.emit('signal:query', trimmedQuery)
      } else if (!success) {
        // Fallback to mock data
        const mockSignals = generateMockSignals(trimmedQuery, 25)
        setSignals(mockSignals)
        setLoading(false)
      }
    })

    setQuery('')
  }

  const handleQuickResearch = queryText => {
    setLoading(true)
    setSearchedQuery(queryText)
    setCurrentPage('research')

    // Try REST API first, fallback to WebSocket, then mock data
    fetchSignalsFromAPI(queryText).then(success => {
      if (!success && connected) {
        // Fallback to WebSocket
        socket.emit('signal:query', queryText)
      } else if (!success) {
        // Fallback to mock data
        const mockSignals = generateMockSignals(queryText, 25)
        setSignals(mockSignals)
        setLoading(false)
      }
    })
  }

  const handleMarketSelect = market => {
    perfMonitor.trackNavigation(currentPage, 'detail')()
    setSelectedMarket(market)
    setCurrentPage('detail')
  }

  const handleBackFromDetail = () => {
    perfMonitor.trackNavigation('detail', 'home')()
    setSelectedMarket(null)
    setCurrentPage('home')
  }

  const handleStartComparison = market => {
    perfMonitor.trackNavigation(currentPage, 'compare')()
    setComparisonMarket1(market)
    setComparisonMarket2(null)
    setCurrentPage('compare')
  }

  const handleSelectSecondMarket = market => {
    if (comparisonMarket1?.market !== market.market) {
      setComparisonMarket2(market)
    }
  }

  const handleBackFromComparison = () => {
    setComparisonMarket1(null)
    setComparisonMarket2(null)
    setCurrentPage('home')
  }

  const handleSwapComparisonMarkets = () => {
    const temp = comparisonMarket1
    setComparisonMarket1(comparisonMarket2)
    setComparisonMarket2(temp)
  }

  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      <div className="grid-bg fixed inset-0 pointer-events-none opacity-10" />

      {/* Header */}
      <OracleHeader
        connected={connected}
        isResearching={loading}
        onHeaderClick={() => setCurrentPage('home')}
        currentPage={currentPage}
      />

      {/* Main Layout - Condensed */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Main Content Area with Flip Animation */}
        <main className="flex-1 overflow-y-auto will-change-opacity">
          {currentPage === 'compare' && comparisonMarket1 ? (
            <Suspense fallback={<LazyLoadFallback />}>
              <div key="compare-content" className="animate-flip-in">
                <MarketComparisonPage
                  market1={comparisonMarket1}
                  market2={comparisonMarket2}
                  onBack={handleBackFromComparison}
                  onSwap={handleSwapComparisonMarkets}
                />
              </div>
            </Suspense>
          ) : currentPage === 'detail' && selectedMarket ? (
            <Suspense fallback={<LazyLoadFallback />}>
              <div key="detail-content" className="animate-flip-in">
                <MarketDetailPage
                  market={selectedMarket}
                  onBack={handleBackFromDetail}
                  onQuickResearch={handleQuickResearch}
                  onCompare={handleStartComparison}
                  allMarkets={initialMarkets}
                  onSelectMarket={handleMarketSelect}
                  relatedSignals={signals}
                />
              </div>
            </Suspense>
          ) : (
            <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
              {currentPage === 'home' ? (
                <div key="home-content" className="animate-flip-in space-y-6">
                  {/* Search Section - Minimal & Compact */}
                  <div className="animate-in-subtle flex justify-center">
                    <form onSubmit={handleSearch} className="flex gap-2 items-center relative">
                      <div className="relative w-64">
                        <Input
                          type="text"
                          value={query}
                          onChange={e => setQuery(e.target.value)}
                          placeholder="What are you looking for?"
                          className="h-10 rounded-3xl pr-10 pl-2 pt-1"
                          disabled={loading}
                          nativeInput
                          autoComplete="off"
                        />
                        <SearchAutocomplete
                          value={query}
                          onChange={e => setQuery(e.target.value)}
                          onSelect={selected => {
                            setQuery(selected)
                            // Trigger search after selection
                            setTimeout(() => {
                              const event = new Event('submit', { bubbles: true })
                              event.target = { value: selected }
                              handleSearch(event)
                            }, 0)
                          }}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="btn-modern h-10 rounded-3xl flex items-center justify-center"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>

                  {/* Markets Grid - Split by Source */}
                  {initialMarkets && initialMarkets.length > 0 && (
                    <div className="space-y-6 animate-fade-in-slow">
                      {/* Header with Data Quality */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-mono text-muted-foreground">
                          Featured Markets
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Data Quality Score */}
                          {dataQuality && (
                            <Badge
                              variant="outline"
                              className={`text-xs py-0 px-2 h-6 font-mono ${
                                dataQuality.qualityScore >= 70
                                  ? 'border-bullish/30 bg-bullish/5 text-bullish'
                                  : dataQuality.qualityScore >= 50
                                    ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400'
                                    : 'border-red-500/30 bg-red-500/5 text-red-400'
                              }`}
                              title={`Data Quality Score: ${dataQuality.qualityScore}/100, Avg Age: ${dataQuality.averageAge} days`}
                            >
                              {dataQuality.qualityScore}%
                            </Badge>
                          )}

                          {/* Data Freshness Warning */}
                          <Badge
                            variant="outline"
                            className="text-xs py-0 px-2 h-6 border-yellow-500/30 bg-yellow-500/5 text-yellow-400 font-mono cursor-help"
                            title="Polymarket API contains primarily 2020-2021 markets. Kalshi integration pending."
                          >
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Limited Data
                          </Badge>
                        </div>
                      </div>

                      {/* Market Filter Panel */}
                      <MarketFilterPanel
                        markets={initialMarkets}
                        onFilter={setFilteredMarkets}
                        onReset={() => setFilteredMarkets([])}
                      />

                      {/* Polymarket Section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <Badge variant="outline">Polymarket</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {initialMarkets.length === 0 ? (
                            // Show skeleton loaders while loading
                            <>
                              {[1, 2, 3, 4].map(i => (
                                <div
                                  key={`poly-skeleton-${i}`}
                                  className="stagger-item"
                                  style={{ animationDelay: `${(i - 1) * 100}ms` }}
                                >
                                  <MarketCardSkeleton />
                                </div>
                              ))}
                            </>
                          ) : (
                            // Show actual market cards
                            (filteredMarkets.length > 0 ? filteredMarkets : initialMarkets)
                              .filter(m => m.source === 'polymarket' || !m.source)
                              .slice(0, 4)
                              .map((market, i) => (
                                <div
                                  key={`poly-${i}`}
                                  className="stagger-item"
                                  style={{ animationDelay: `${i * 100}ms` }}
                                >
                                  <PolymarketCard
                                    market={market}
                                    onQuickResearch={handleQuickResearch}
                                    onSelectMarket={handleMarketSelect}
                                    loading={loading}
                                  />
                                </div>
                              ))
                          )}
                        </div>
                      </div>

                      {/* Kalshi Section */}
                      <div className="space-y-3">
                        <Badge variant="outline">Kalshi</Badge>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {initialMarkets.length === 0 ? (
                            // Show skeleton loaders while loading
                            <>
                              {[1, 2, 3, 4].map(i => (
                                <div
                                  key={`kalshi-skeleton-${i}`}
                                  className="stagger-item"
                                  style={{ animationDelay: `${(i + 3) * 100}ms` }}
                                >
                                  <MarketCardSkeleton />
                                </div>
                              ))}
                            </>
                          ) : (
                            // Show actual market cards
                            (filteredMarkets.length > 0 ? filteredMarkets : initialMarkets)
                              .filter(m => m.source === 'kalshi')
                              .slice(0, 4)
                              .map((market, i) => (
                                <div
                                  key={`kalshi-${i}`}
                                  className="stagger-item"
                                  style={{ animationDelay: `${(i + 2) * 100}ms` }}
                                >
                                  <KalshiCard
                                    market={market}
                                    onQuickResearch={handleQuickResearch}
                                    onSelectMarket={handleMarketSelect}
                                    loading={loading}
                                  />
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div key="research-content" className="animate-flip-in space-y-6">
                  {/* Error Display */}
                  {error && (
                    <Card className="border-destructive/50 bg-destructive/5 animate-in slide-in-from-top-2 fade-in duration-500 hover:bg-destructive/10 hover:border-destructive/70 transition-all group">
                      <CardContent className="py-3 font-mono text-sm text-destructive transition-colors group-hover:text-destructive/90">
                        Error: {error}
                      </CardContent>
                    </Card>
                  )}

                  {/* Loading State */}
                  {loading && (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="inline-flex items-center justify-center">
                          <OracleVisualization size={32} />
                        </div>
                        <p className="text-xs font-mono text-muted-foreground mt-4">
                          Analyzing markets and signals...
                        </p>
                      </div>
                      {/* Show signal skeleton loaders */}
                      <SignalListSkeleton count={8} />
                    </div>
                  )}

                  {/* Results Display */}
                  {!loading && signals.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-xs font-mono text-muted-foreground">
                        {signals.length} signals for "{searchedQuery}"
                      </div>
                    </div>
                  )}

                  {/* No Results */}
                  {!loading && searchedQuery && signals.length === 0 && (
                    <Card className="border-border/50">
                      <CardContent className="text-center py-12 font-mono text-sm text-muted-foreground">
                        No signals found for this query
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Signals Sidebar - Only show when there are signals on research page */}
        {signals.length > 0 && currentPage === 'research' && <SignalsSidebar signals={signals} />}
      </div>

      {/* Footer */}
      <footer className="relative border-t border-border/50 mt-auto bg-background/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>MIT License</span>
            <span>Delos: Make Better Decisions.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
