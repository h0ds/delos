import { TrendingUp, TrendingDown } from 'lucide-react'
import { OracleVisualization } from './OracleVisualization'

export function PolymarketCard({ market, onQuickResearch, loading }) {
  const isDevMode = import.meta.env.DEV
  const isMockData = market.market?.startsWith('poly-') // Mock data has specific ID format

  return (
    <div className="group relative rounded-xl overflow-hidden bg-card/60 border border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      {/* Background Gradient Glow */}
      <div className="absolute inset-0 bg-card from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Source Indicator - Top Left (Subtle) */}
      <div className="absolute top-2 left-2 z-20 text-xs font-mono text-muted-foreground/60 opacity-50 group-hover:opacity-70 transition-opacity">
        polymarket
      </div>

      {/* Dev Data Source Indicator - Top Right (Very Subtle) */}
      {isDevMode && (
        <div className="absolute top-2 right-2 z-20 text-xs font-mono text-muted-foreground/40 opacity-40 group-hover:opacity-60 transition-opacity">
          {isMockData ? 'mock' : 'live'}
        </div>
      )}

      {/* Content Section */}
      <div className="relative p-4 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {market.question}
          </h3>
          {market.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">{market.description}</p>
          )}
        </div>

        {/* Probability Bars */}
        {market.outcomes && market.outcomes.length > 0 && (
          <div className="space-y-3 py-2 border-t border-border/30 border-b border-border/30">
            {market.outcomes.slice(0, 2).map((outcome, idx) => {
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
                      <span className="text-sm font-semibold text-primary font-mono">
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
          {market.volume24h > 0 && (
            <div className="bg-muted/20 rounded-lg p-2.5 border border-border/30 hover:border-primary/30 transition-colors">
              <p className="text-muted-foreground font-mono text-xs mb-1">24h Volume</p>
              <p className="text-sm font-semibold font-mono text-primary">
                ${(market.volume24h / 1000000).toFixed(1)}M
              </p>
            </div>
          )}
          {market.liquidity > 0 && (
            <div className="bg-muted/20 rounded-lg p-2.5 border border-border/30 hover:border-primary/30 transition-colors">
              <p className="text-muted-foreground font-mono text-xs mb-1">Liquidity</p>
              <p className="text-sm font-semibold font-mono text-primary">
                ${(market.liquidity / 1000).toFixed(0)}K
              </p>
            </div>
          )}
        </div>

        {/* Status Badge + Source Indicator + Research Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Status Badge */}
            {market.status && (
              <span
                className={`text-xs font-mono px-2 py-1 rounded-full border ${
                  market.status === 'active'
                    ? 'bg-bullish/10 text-bullish border-bullish/30'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                }`}
              >
                {market.status === 'active' ? 'Open' : 'Closed'}
              </span>
            )}

            {/* Source Badge - Inline */}
            <span className="text-xs font-mono px-2 py-1 rounded-full bg-primary/10 text-primary/80 border border-primary/30">
              polymarket
            </span>
          </div>

          {/* Oracle Visualization - Research Button */}
          <button
            onClick={() => onQuickResearch(market.question)}
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
