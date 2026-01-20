import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function KalshiCard({ market, onQuickResearch, loading }) {
  return (
    <div className="group relative rounded-xl overflow-hidden bg-card/60 border border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      {/* Background Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Image Section */}
      {market.image && (
        <div className="relative w-full h-40 bg-gradient-to-br from-primary/10 to-muted/10 overflow-hidden">
          <img
            src={market.image}
            alt={market.question}
            className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
            onError={e => {
              e.target.style.display = 'none'
            }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

          {/* Kalshi Badge */}
          <div className="absolute top-3 left-3 text-xs font-mono font-semibold text-primary bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
            Kalshi
          </div>

          {/* Category Badge */}
          {market.category && (
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-primary/80 backdrop-blur-sm rounded-md text-xs font-mono text-primary-foreground border border-primary/50">
              {market.category.toUpperCase()}
            </div>
          )}
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

        {/* Probability Bars - Kalshi uses Yes/No format */}
        {market.outcomes && market.outcomes.length > 0 && (
          <div className="space-y-3 py-2 border-t border-border/30 border-b border-border/30">
            {market.outcomes.map((outcome, idx) => {
              const probability = outcome.probability * 100
              const isYes = outcome.name === 'Yes'

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        className={`text-xs font-mono font-semibold ${
                          isYes ? 'text-bullish' : 'text-bearish'
                        }`}
                      >
                        {outcome.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isYes ? (
                        <TrendingUp className="w-3 h-3 text-bullish" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-bearish" />
                      )}
                      <span className="text-sm font-semibold text-primary font-mono">
                        ${outcome.probability.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Probability Bar */}
                  <div className="w-full h-2 bg-border/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isYes
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
              <p className="text-muted-foreground font-mono text-xs mb-1">Open Interest</p>
              <p className="text-sm font-semibold font-mono text-primary">
                ${(market.liquidity / 1000).toFixed(0)}K
              </p>
            </div>
          )}
        </div>

        {/* Status Badge */}
        {market.status && (
          <div className="flex items-center justify-center py-2">
            <span
              className={`text-xs font-mono px-3 py-1 rounded-full border ${
                market.status === 'active'
                  ? 'bg-bullish/10 text-bullish border-bullish/30'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
              }`}
            >
              {market.status === 'active' ? 'Open' : 'Closed'}
            </span>
          </div>
        )}

        {/* Quick Research Button */}
        <Button
          onClick={() => onQuickResearch(market.question)}
          disabled={loading}
          className="w-full font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed h-8 rounded-lg"
        >
          Research 
        </Button>
      </div>
    </div>
  )
}
