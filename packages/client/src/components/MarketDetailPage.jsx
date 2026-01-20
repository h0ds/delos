import { ArrowLeft, ExternalLink, Users, DollarSign, Target, Calendar, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PolymarketIcon, KalshiIcon } from './MarketIcons'
import { ProbabilityChart } from './charts/ProbabilityChart'
import { VolumeChart } from './charts/VolumeChart'
import { LiquidityCard } from './charts/LiquidityCard'

export function MarketDetailPage({
  market,
  onBack,
  onQuickResearch,
  onCompare,
  allMarkets,
  onSelectMarket
}) {
  if (!market) return null

  const isPolymarket = market.source === 'polymarket' || !market.source
  const MarketIcon = isPolymarket ? PolymarketIcon : KalshiIcon
  const marketSource = isPolymarket ? 'Polymarket' : 'Kalshi'

  // Calculate derived metrics - only needed if showing extra metrics
  // For binary markets, BinaryOutcomeBar handles all visualization

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <MarketIcon size={20} className="text-primary" />
              <div className="text-xs font-mono text-muted-foreground">{marketSource}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onQuickResearch && (
              <Button
                onClick={() => onQuickResearch(market.question)}
                variant="ghost"
                size="sm"
                className="text-xs font-mono gap-1.5 h-8 px-2"
                title="Quick research"
              >
                <Zap className="h-3 w-3" />
                Research
              </Button>
            )}
            {onCompare && (
              <Button
                onClick={() => onCompare(market)}
                variant="ghost"
                size="sm"
                className="text-xs font-mono gap-1.5 h-8 px-2"
                title="Compare with another market"
              >
                <Users className="h-3 w-3" />
                Compare
              </Button>
            )}
            {market.slug && (
              <a
                href={`https://${isPolymarket ? 'polymarket' : 'kalshi'}.com/markets/${market.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:text-primary/80 transition-colors"
                title="View on market website"
              >
                View on {marketSource}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Title Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground leading-tight">
              {market.question}
            </h1>
            {market.description && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {market.description}
              </p>
            )}
          </div>

          {/* Status & Metadata Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {market.status && (
              <Badge
                className={`text-xs font-mono px-3 py-1 ${
                  market.status === 'active'
                    ? 'bg-bullish/10 text-bullish border-bullish/30'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                }`}
                variant="outline"
              >
                {market.status === 'active' ? 'Live' : 'Closed'}
              </Badge>
            )}
            {market.category && (
              <Badge
                variant="outline"
                className="text-xs font-mono px-2 py-1 bg-primary/5 text-primary border-primary/30"
              >
                {market.category}
              </Badge>
            )}
            {market.dataFreshness && (
              <Badge
                variant="outline"
                className="text-xs font-mono px-2 py-1 bg-muted/50 text-muted-foreground border-border/50"
              >
                <Calendar className="h-3 w-3 mr-1 inline" />
                {market.dataFreshness.daysOld} days old
              </Badge>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Probability Distribution */}
            <Card className="border-border/40 bg-card/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Probability Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProbabilityChart outcomes={market.outcomes} />
              </CardContent>
            </Card>

            {/* Volume Chart */}
            {market.volume24h > 0 && (
              <Card className="border-border/40 bg-card/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    24h Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VolumeChart volume={market.volume24h} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            {/* Market Stats */}
            <Card className="border-border/40 bg-card/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-muted-foreground">
                  Market Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {market.volume24h > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-muted-foreground">24h Volume</p>
                    <p className="text-lg font-mono font-semibold text-primary">
                      ${(market.volume24h / 1000000).toFixed(2)}M
                    </p>
                  </div>
                )}

                {market.liquidity > 0 && (
                  <div className="space-y-1 border-t border-border/30 pt-3">
                    <p className="text-xs font-mono text-muted-foreground">
                      {isPolymarket ? 'Liquidity' : 'Open Interest'}
                    </p>
                    <p className="text-lg font-mono font-semibold text-primary">
                      ${(market.liquidity / 1000).toFixed(0)}K
                    </p>
                  </div>
                )}

                {market.volumeNum && (
                  <div className="space-y-1 border-t border-border/30 pt-3">
                    <p className="text-xs font-mono text-muted-foreground">Total Volume</p>
                    <p className="text-lg font-mono font-semibold text-primary">
                      ${(market.volumeNum / 1000000).toFixed(2)}M
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Liquidity Visualization */}
            {market.liquidity > 0 && (
              <LiquidityCard
                liquidity={market.liquidity}
                volume={market.volume24h}
                isPolymarket={isPolymarket}
              />
            )}
          </div>
        </div>
      </div>

      {/* Related Markets Section */}
      {allMarkets && (
        <RelatedMarketsSection
          market={market}
          allMarkets={allMarkets}
          onSelectMarket={onSelectMarket}
          onCompare={onCompare}
        />
      )}
    </div>
  )
}

export function RelatedMarketsSection({ market, allMarkets, onSelectMarket, onCompare }) {
  if (!allMarkets || allMarkets.length === 0) return null

  // Find related markets (same category, different market)
  const relatedMarkets = allMarkets
    .filter(
      m =>
        m.category === market.category && m.market !== market.market && m.source === market.source
    )
    .slice(0, 4)

  if (relatedMarkets.length === 0) return null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 border-t border-border/40">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold font-mono">Related Markets in {market.category}</h3>
          <Badge variant="outline" className="text-xs">
            {relatedMarkets.length} similar
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {relatedMarkets.map((m, idx) => (
            <Card
              key={`related-${idx}`}
              className="border-border/50 hover:border-border/80 hover:bg-card/80 transition-all duration-300 cursor-pointer group"
              onClick={() => onSelectMarket(m)}
            >
              <CardContent className="p-3 space-y-2">
                <h4 className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {m.question}
                </h4>

                {/* Binary Outcome */}
                {m.outcomes && m.outcomes.length === 2 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span>{m.outcomes[0].name}</span>
                      <span className="text-primary font-semibold">
                        {(m.outcomes[0].probability * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span>{m.outcomes[1].name}</span>
                      <span className="text-destructive font-semibold">
                        {(m.outcomes[1].probability * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Volume */}
                <div className="text-xs text-muted-foreground font-mono border-t border-border/30 pt-2">
                  Vol: $
                  {m.volume24h >= 1000000
                    ? `${(m.volume24h / 1000000).toFixed(1)}M`
                    : `${(m.volume24h / 1000).toFixed(0)}K`}
                </div>

                {/* Quick Compare Button */}
                {onCompare && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-xs mt-1"
                    onClick={e => {
                      e.stopPropagation()
                      onCompare(m)
                    }}
                  >
                    Compare
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
