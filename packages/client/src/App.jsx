import { lazy, Suspense, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, AlertCircle } from 'lucide-react'
import { OracleHeader } from '@/components/layout/OracleHeader'
import { OracleVisualization } from '@/components/layout/OracleVisualization'
import { PolymarketCard } from '@/components/market/PolymarketCard'
import { KalshiCard } from '@/components/market/KalshiCard'
import { SignalsSidebar } from '@/components/signals/SignalsSidebar'
import { SearchAutocomplete } from '@/components/signals/SearchAutocomplete'
import { MarketCardSkeleton } from '@/components/skeletons/MarketCardSkeleton'
import { SignalListSkeleton } from '@/components/skeletons/SignalListSkeleton'
import { useMarkets, useSignalSearch, usePageNavigation, useSocketConnection } from '@/hooks'

// Lazy-loaded components for route-based code splitting
const MarketDetailPage = lazy(() => import('@/components/pages/MarketDetailPage'))
const MarketComparisonPage = lazy(() => import('@/components/pages/MarketComparisonPage'))
const MarketFilterPanel = lazy(() => import('@/components/market/MarketFilterPanel'))

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
  const [query, setQuery] = useState('')

  // Use custom hooks for state management
  const {
    initialMarkets,
    setInitialMarkets,
    markets,
    setMarkets,
    dataQuality,
    filteredMarkets,
    setFilteredMarkets
  } = useMarkets()
  const {
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
    performSearch
  } = useSignalSearch()
  const {
    currentPage,
    setCurrentPage,
    selectedMarket,
    navigateToMarket,
    navigateToHome,
    comparisonMarket1,
    comparisonMarket2,
    navigateToComparison,
    selectSecondMarketForComparison,
    swapComparisonMarkets,
    resetComparison
  } = usePageNavigation()

  // Socket listeners
  useSocketConnection({
    searchedQuery,
    onConnect: () => {
      setConnected(true)
      setError(null)
    },
    onDisconnect: () => setConnected(false),
    onSignals: data => {
      setSignals(data)
      setLoading(false)
    },
    onScanStart: data => {
      setSearchedQuery(data.query)
      setLoading(true)
      setError(null)
    },
    onScanComplete: () => setLoading(false),
    onError: data => {
      setError(data.message)
      setLoading(false)
    },
    onMarkets: data => {
      setMarkets(data)
      if (!searchedQuery) {
        setInitialMarkets(data)
      }
    }
  })

  const handleSearch = e => {
    e.preventDefault()
    setCurrentPage('research')
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      performSearch('Bitcoin')
      setQuery('')
      return
    }

    performSearch(trimmedQuery)
    setQuery('')
  }

  const handleQuickResearch = queryText => {
    setCurrentPage('research')
    performSearch(queryText)
  }

  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      <div className="grid-bg fixed inset-0 pointer-events-none opacity-10" />

      {/* Header */}
      <OracleHeader
        connected={connected}
        isResearching={loading}
        onHeaderClick={navigateToHome}
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
                  onBack={resetComparison}
                  onSwap={swapComparisonMarkets}
                />
              </div>
            </Suspense>
          ) : currentPage === 'detail' && selectedMarket ? (
            <Suspense fallback={<LazyLoadFallback />}>
              <div key="detail-content" className="animate-flip-in">
                <MarketDetailPage
                  market={selectedMarket}
                  onBack={navigateToHome}
                  onQuickResearch={handleQuickResearch}
                  onCompare={navigateToComparison}
                  allMarkets={initialMarkets}
                  onSelectMarket={navigateToMarket}
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

                  {/* Market Grid - Flexible Bento Layout */}
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 auto-rows-max">
                          {initialMarkets.length === 0 ? (
                            // Show skeleton loaders while loading
                            <>
                              {[1, 2, 3].map(i => (
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
                              .slice(0, 3)
                              .map((market, i) => (
                                <div
                                  key={`poly-${i}`}
                                  className="stagger-item"
                                  style={{ animationDelay: `${i * 100}ms` }}
                                >
                                  <PolymarketCard
                                    market={market}
                                    onQuickResearch={handleQuickResearch}
                                    onSelectMarket={navigateToMarket}
                                    loading={loading}
                                  />
                                </div>
                              ))
                          )}
                        </div>
                      </div>

                      {/* Kalshi Section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <Badge variant="outline">Kalshi</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 auto-rows-max">
                          {initialMarkets.length === 0 ? (
                            // Show skeleton loaders while loading
                            <>
                              {[1, 2, 3].map(i => (
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
                              .slice(0, 3)
                              .map((market, i) => (
                                <div
                                  key={`kalshi-${i}`}
                                  className="stagger-item"
                                  style={{ animationDelay: `${(i + 2) * 100}ms` }}
                                >
                                  <KalshiCard
                                    market={market}
                                    onQuickResearch={handleQuickResearch}
                                    onSelectMarket={navigateToMarket}
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
