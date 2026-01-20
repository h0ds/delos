import React, { useEffect, useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Zap } from 'lucide-react'
import { OracleVisualization } from './OracleVisualization'
import { useMarketUpdates } from '@/lib/useMarketUpdates'

function PolymarketCardInner({ market, onQuickResearch, onSelectMarket, loading }) {
  const { getMarketUpdate } = useMarketUpdates()
  const [liveMarket, setLiveMarket] = useState(market)
  const [priceFlash, setPriceFlash] = useState(false)
  const [lastUpdateId, setLastUpdateId] = useState(null)

  const marketId = `polymarket:${market.market}`

  useEffect(() => {
    const interval = setInterval(() => {
      const update = getMarketUpdate(marketId)
      if (update) {
        // Only update if data actually changed (deduplicate)
        const updateId = JSON.stringify([update.outcomes, update.volume24h, update.liquidity])
        if (updateId !== lastUpdateId) {
          setLastUpdateId(updateId)
          setLiveMarket(prev => ({
            ...prev,
            outcomes: update.outcomes,
            volume24h: update.volume24h,
            liquidity: update.liquidity
          }))

          // Flash animation when price updates
          if (update.priceChangePercent && Math.abs(update.priceChangePercent) > 0.1) {
            setPriceFlash(true)
            setTimeout(() => setPriceFlash(false), 400)
          }
        }
      }
    }, 2000) // Reduce polling frequency from 1s to 2s

    return () => clearInterval(interval)
  }, [marketId, getMarketUpdate, lastUpdateId])

  const update = getMarketUpdate(marketId)

  return (
    <div
      onClick={() => onSelectMarket && onSelectMarket(liveMarket)}
      className={`group relative rounded-xl overflow-hidden bg-card border border-border/60 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/15 cursor-pointer ${
        priceFlash ? 'animate-pulse' : ''
      }`}
    >
      {/* Hover Background Enhancement */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Live Price Alert Badge */}
      {update?.priceChangePercent && Math.abs(update.priceChangePercent) > 0 && (
        <div
          className={`absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono font-semibold ${
            update.priceChangeDirection === 'up'
              ? 'bg-bullish/20 text-bullish border border-bullish/40'
              : 'bg-bearish/20 text-bearish border border-bearish/40'
          }`}
        >
          {update.priceChangeDirection === 'up' ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {update.priceChangePercent > 0 ? '+' : ''}
          {update.priceChangePercent.toFixed(2)}%
        </div>
      )}

      {/* Content Section */}
      <div className="relative p-4 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {liveMarket.question}
          </h3>
          {liveMarket.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">{liveMarket.description}</p>
          )}
        </div>

        {/* Probability Bars */}
        {liveMarket.outcomes && liveMarket.outcomes.length > 0 && (
          <div className="space-y-3 py-2 border-t border-border/30 border-b border-border/30">
            {liveMarket.outcomes.slice(0, 2).map((outcome, idx) => {
              const probability = outcome.probability * 100
              const isHigh = probability > 50

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground truncate">
                        {outcome.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isHigh ? (
                        <TrendingUp className="w-3 h-3 text-bullish" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-bearish" />
                      )}
                      <span
                        className={`text-sm font-semibold text-primary font-mono transition-all ${
                          priceFlash ? 'animate-pulse' : ''
                        }`}
                      >
                        {probability.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Probability Bar */}
                  <div className="w-full h-2 bg-border/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isHigh
                          ? 'bg-gradient-to-r from-bullish/60 to-bullish'
                          : 'bg-gradient-to-r from-bearish/60 to-bearish'
                      }`}
                      style={{ width: `${probability}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Market Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {liveMarket.volume24h > 0 && (
            <div className="bg-muted/20 rounded-lg p-2.5 border border-border/30 hover:border-primary/30 transition-colors">
              <p className="text-muted-foreground font-mono text-xs mb-1">24h Volume</p>
              <p className="text-sm font-semibold font-mono text-primary">
                ${(liveMarket.volume24h / 1000000).toFixed(1)}M
              </p>
            </div>
          )}
          {liveMarket.liquidity > 0 && (
            <div className="bg-muted/20 rounded-lg p-2.5 border border-border/30 hover:border-primary/30 transition-colors">
              <p className="text-muted-foreground font-mono text-xs mb-1">Liquidity</p>
              <p className="text-sm font-semibold font-mono text-primary">
                ${(liveMarket.liquidity / 1000).toFixed(0)}K
              </p>
            </div>
          )}
        </div>

        {/* Status Badge + Research Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Status Badge - Squircle Style */}
            {liveMarket.status && (
              <span
                className={`text-xs font-mono px-2.5 py-1.5 rounded-squircle transition-all ${
                  liveMarket.status === 'active'
                    ? 'bg-bullish/10 text-bullish hover:bg-bullish/15'
                    : 'bg-warning/10 text-warning hover:bg-warning/15'
                }`}
              >
                {liveMarket.status === 'active' ? 'Active' : 'Closed'}
              </span>
            )}

            {/* Live Indicator - Squircle Style */}
            {update && (
              <span className="text-xs font-mono px-2.5 py-1.5 rounded-squircle bg-primary/10 text-primary flex items-center gap-1 transition-all hover:bg-primary/15">
                <Zap className="w-3 h-3" />
                Live
              </span>
            )}
          </div>

          {/* Oracle Visualization - Research Button */}
          <button
            onClick={e => {
              e.stopPropagation()
              onQuickResearch(liveMarket.question)
            }}
            disabled={loading}
            className="opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer rounded-full p-1 hover:bg-primary/10 hover:border hover:border-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Research this market"
          >
            <OracleVisualization size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}

export const PolymarketCard = React.memo(PolymarketCardInner, (prevProps, nextProps) => {
  // Custom comparison: only re-render if market.market id changed
  return (
    prevProps.market?.market === nextProps.market?.market && prevProps.loading === nextProps.loading
  )
})

PolymarketCard.displayName = 'PolymarketCard'
