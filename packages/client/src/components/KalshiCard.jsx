import { TrendingUp, TrendingDown, Zap } from 'lucide-react'
import { OracleVisualization } from './OracleVisualization'
import { useMarketUpdates } from '@/lib/useMarketUpdates'
import { useEffect, useState } from 'react'

export function KalshiCard({ market, onQuickResearch, onSelectMarket, loading }) {
  const { getMarketUpdate } = useMarketUpdates()
  const [liveMarket, setLiveMarket] = useState(market)
  const [priceFlash, setPriceFlash] = useState(false)

  const marketId = `kalshi:${market.market}`

  useEffect(() => {
    const interval = setInterval(() => {
      const update = getMarketUpdate(marketId)
      if (update) {
        setLiveMarket(prev => ({
          ...prev,
          outcomes: update.outcomes,
          volume24h: update.volume24h,
          liquidity: update.liquidity
        }))

        // Flash animation when price updates
        if (update.priceChangePercent && update.priceChangePercent !== 0) {
          setPriceFlash(true)
          setTimeout(() => setPriceFlash(false), 300)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [marketId, getMarketUpdate])

  const update = getMarketUpdate(marketId)

  return (
    <div
      onClick={() => onSelectMarket && onSelectMarket(liveMarket)}
      className={`group relative rounded-xl overflow-hidden bg-card/60 border border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer ${
        priceFlash ? 'animate-pulse' : ''
      }`}
    >
      {/* Background Gradient Glow */}
      <div className="absolute inset-0 bg-card from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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

        {/* Probability Bars - Match Polymarket format */}
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
              <p className="text-muted-foreground font-mono text-xs mb-1">Open Interest</p>
              <p className="text-sm font-semibold font-mono text-primary">
                ${(liveMarket.liquidity / 1000).toFixed(0)}K
              </p>
            </div>
          )}
        </div>

        {/* Status Badge + Research Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {liveMarket.status && (
              <span
                className={`text-xs font-mono px-2 py-1 rounded-full border ${
                  liveMarket.status === 'active'
                    ? 'bg-bullish/10 text-bullish border-bullish/30'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                }`}
              >
                {liveMarket.status === 'active' ? 'Open' : 'Closed'}
              </span>
            )}

            {/* Live Indicator */}
            {update && (
              <span className="text-xs font-mono px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 flex items-center gap-1">
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
