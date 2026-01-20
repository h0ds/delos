import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ExternalLink, X, Settings2 } from 'lucide-react'
import { BinaryOutcomeBar } from '@/components/charts/BinaryOutcomeBar'
import { VolumeChart } from '@/components/charts/VolumeChart'
import { LiquidityCard } from '@/components/charts/LiquidityCard'
import { ProbabilityChart } from '@/components/charts/ProbabilityChart'

export function MarketComparisonPage({ market1, market2, onBack, onSwap }) {
  const [showSettings, setShowSettings] = useState(false)

  const formatCurrency = num => {
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`
    if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`
    return `$${num.toFixed(0)}`
  }

  const formatDate = date => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getSourceIcon = source => {
    return source === 'polymarket' ? '◆' : '■'
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 animate-fade-in">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="hover:bg-card/80 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="h-6 w-px bg-border/50" />
          <h1 className="text-lg font-semibold font-mono">Market Comparison</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="hover:bg-card/80 transition-all"
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Two-Column Market Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market 1 */}
        {market1 && (
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="relative">
              {/* Market Header */}
              <Card className="border-border/50 hover:border-border/80 transition-all duration-300">
                <CardContent className="p-4 space-y-3">
                  {/* Title & Source */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{getSourceIcon(market1.source)}</span>
                        <Badge variant="outline" className="text-xs h-6">
                          {market1.source === 'polymarket' ? 'Polymarket' : 'Kalshi'}
                        </Badge>
                        <Badge
                          variant={market1.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs h-6"
                        >
                          {market1.status === 'active' ? '◉ Live' : '◯ Closed'}
                        </Badge>
                      </div>
                      <h2 className="text-sm font-semibold line-clamp-2 text-foreground">
                        {market1.question}
                      </h2>
                    </div>
                    <a
                      href={`https://${market1.source === 'polymarket' ? 'polymarket.com' : 'kalshi.com'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors flex-shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Description */}
                  {market1.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {market1.description}
                    </p>
                  )}

                  {/* Category */}
                  {market1.category && (
                    <Badge variant="outline" className="text-xs w-fit">
                      {market1.category}
                    </Badge>
                  )}

                  {/* Probability Display */}
                  <div className="pt-2 border-t border-border/50">
                    {market1.outcomes && market1.outcomes.length === 2 ? (
                      <BinaryOutcomeBar outcomes={market1.outcomes} />
                    ) : (
                      <ProbabilityChart outcomes={market1.outcomes || []} />
                    )}
                  </div>

                  {/* Volume & Liquidity */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-card/50 p-2 rounded border border-border/30">
                      <div className="text-muted-foreground text-xs mb-0.5">Volume 24h</div>
                      <div className="font-mono font-semibold text-foreground">
                        {formatCurrency(market1.volume24h)}
                      </div>
                    </div>
                    {market1.liquidity !== undefined && (
                      <div className="bg-card/50 p-2 rounded border border-border/30">
                        <div className="text-muted-foreground text-xs mb-0.5">
                          {market1.source === 'polymarket' ? 'Liquidity' : 'Open Interest'}
                        </div>
                        <div className="font-mono font-semibold text-foreground">
                          {formatCurrency(market1.liquidity)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Data Freshness */}
                  {market1.dataFreshness && (
                    <div className="text-xs text-muted-foreground font-mono">
                      Updated:{' '}
                      {market1.dataFreshness.daysOld === 0
                        ? 'Today'
                        : `${market1.dataFreshness.daysOld}d ago`}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Market 2 */}
        {market2 && (
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="relative">
              {/* Market Header */}
              <Card className="border-border/50 hover:border-border/80 transition-all duration-300">
                <CardContent className="p-4 space-y-3">
                  {/* Title & Source */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{getSourceIcon(market2.source)}</span>
                        <Badge variant="outline" className="text-xs h-6">
                          {market2.source === 'polymarket' ? 'Polymarket' : 'Kalshi'}
                        </Badge>
                        <Badge
                          variant={market2.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs h-6"
                        >
                          {market2.status === 'active' ? '◉ Live' : '◯ Closed'}
                        </Badge>
                      </div>
                      <h2 className="text-sm font-semibold line-clamp-2 text-foreground">
                        {market2.question}
                      </h2>
                    </div>
                    <a
                      href={`https://${market2.source === 'polymarket' ? 'polymarket.com' : 'kalshi.com'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors flex-shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Description */}
                  {market2.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {market2.description}
                    </p>
                  )}

                  {/* Category */}
                  {market2.category && (
                    <Badge variant="outline" className="text-xs w-fit">
                      {market2.category}
                    </Badge>
                  )}

                  {/* Probability Display */}
                  <div className="pt-2 border-t border-border/50">
                    {market2.outcomes && market2.outcomes.length === 2 ? (
                      <BinaryOutcomeBar outcomes={market2.outcomes} />
                    ) : (
                      <ProbabilityChart outcomes={market2.outcomes || []} />
                    )}
                  </div>

                  {/* Volume & Liquidity */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-card/50 p-2 rounded border border-border/30">
                      <div className="text-muted-foreground text-xs mb-0.5">Volume 24h</div>
                      <div className="font-mono font-semibold text-foreground">
                        {formatCurrency(market2.volume24h)}
                      </div>
                    </div>
                    {market2.liquidity !== undefined && (
                      <div className="bg-card/50 p-2 rounded border border-border/30">
                        <div className="text-muted-foreground text-xs mb-0.5">
                          {market2.source === 'polymarket' ? 'Liquidity' : 'Open Interest'}
                        </div>
                        <div className="font-mono font-semibold text-foreground">
                          {formatCurrency(market2.liquidity)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Data Freshness */}
                  {market2.dataFreshness && (
                    <div className="text-xs text-muted-foreground font-mono">
                      Updated:{' '}
                      {market2.dataFreshness.daysOld === 0
                        ? 'Today'
                        : `${market2.dataFreshness.daysOld}d ago`}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Metrics */}
      <div
        className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in"
        style={{ animationDelay: '300ms' }}
      >
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1 font-mono">Volume Difference</div>
            <div className="font-mono font-semibold text-foreground">
              {market1 && market2
                ? formatCurrency(Math.abs(market1.volume24h - market2.volume24h))
                : '—'}
            </div>
            {market1 && market2 && (
              <div className="text-xs text-muted-foreground mt-1">
                {market1.volume24h > market2.volume24h
                  ? `${((market1.volume24h / market2.volume24h - 1) * 100).toFixed(0)}% higher`
                  : `${((market2.volume24h / market1.volume24h - 1) * 100).toFixed(0)}% lower`}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1 font-mono">Liquidity Difference</div>
            <div className="font-mono font-semibold text-foreground">
              {market1 &&
              market2 &&
              market1.liquidity !== undefined &&
              market2.liquidity !== undefined
                ? formatCurrency(Math.abs(market1.liquidity - market2.liquidity))
                : '—'}
            </div>
            {market1 &&
              market2 &&
              market1.liquidity !== undefined &&
              market2.liquidity !== undefined && (
                <div className="text-xs text-muted-foreground mt-1">
                  {market1.liquidity > market2.liquidity
                    ? `${((market1.liquidity / market2.liquidity - 1) * 100).toFixed(0)}% higher`
                    : `${((market2.liquidity / market1.liquidity - 1) * 100).toFixed(0)}% lower`}
                </div>
              )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1 font-mono">Market Status</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    market1?.status === 'active' ? 'bg-bullish' : 'bg-red-500'
                  }`}
                />
                {market1?.status === 'active' ? 'Active' : 'Closed'}
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    market2?.status === 'active' ? 'bg-bullish' : 'bg-red-500'
                  }`}
                />
                {market2?.status === 'active' ? 'Active' : 'Closed'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
