import {
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PolymarketIcon, KalshiIcon } from './MarketIcons'
import { ProbabilityChart } from './charts/ProbabilityChart'
import { VolumeChart } from './charts/VolumeChart'
import { LiquidityCard } from './charts/LiquidityCard'

export function MarketDetailPage({ market, onBack }) {
  if (!market) return null

  const isPolymarket = market.source === 'polymarket' || !market.source
  const MarketIcon = isPolymarket ? PolymarketIcon : KalshiIcon
  const marketSource = isPolymarket ? 'Polymarket' : 'Kalshi'

  // Calculate derived metrics
  const totalProbability = market.outcomes?.reduce((sum, o) => sum + o.probability, 0) || 1
  const highestOutcome = market.outcomes?.reduce(
    (max, o) => (o.probability > max.probability ? o : max),
    market.outcomes?.[0]
  )
  const lowestOutcome = market.outcomes?.reduce(
    (min, o) => (o.probability < min.probability ? o : min),
    market.outcomes?.[0]
  )

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
            {/* Key Metrics */}
            <div className="space-y-3">
              {/* Highest Probability */}
              {highestOutcome && (
                <div className="bg-card/60 border border-border/40 rounded-lg p-4 hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-bullish" />
                    <span className="text-xs font-mono text-muted-foreground">Bullish Outcome</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{highestOutcome.name}</p>
                    <p className="text-lg font-mono font-bold text-bullish">
                      {(highestOutcome.probability * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Lowest Probability */}
              {lowestOutcome && lowestOutcome !== highestOutcome && (
                <div className="bg-card/60 border border-border/40 rounded-lg p-4 hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-bearish" />
                    <span className="text-xs font-mono text-muted-foreground">Bearish Outcome</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{lowestOutcome.name}</p>
                    <p className="text-lg font-mono font-bold text-bearish">
                      {(lowestOutcome.probability * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}
            </div>

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

        {/* All Outcomes */}
        {market.outcomes && market.outcomes.length > 0 && (
          <Card className="border-border/40 bg-card/40">
            <CardHeader>
              <CardTitle className="text-sm font-mono text-muted-foreground">
                All Outcomes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {market.outcomes.map((outcome, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{outcome.name}</span>
                      <span className="text-sm font-mono font-bold text-primary">
                        {(outcome.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-border/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500"
                        style={{ width: `${outcome.probability * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
