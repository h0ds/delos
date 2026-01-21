import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, TrendingUp, TrendingDown, Zap } from 'lucide-react'

export function RelatedSignalsSection({ market, signals }) {
  const [relatedSignals, setRelatedSignals] = useState([])

  useEffect(() => {
    if (!signals || !market) return

    // Filter signals related to this market by keywords
    const keywords = extractMarketKeywords(market)
    const related = signals.filter(signal => {
      const text = (signal.title + ' ' + (signal.summary || '')).toLowerCase()
      return keywords.some(kw => text.includes(kw.toLowerCase()))
    })

    setRelatedSignals(related.slice(0, 6))
  }, [signals, market])

  const extractMarketKeywords = market => {
    const keywords = []
    if (market.question) keywords.push(...market.question.split(/[\s,]+/).slice(0, 5))
    if (market.category) keywords.push(market.category)
    if (market.relatedMarkets) keywords.push(...market.relatedMarkets)
    return keywords.filter(k => k && k.length > 2)
  }

  if (!relatedSignals.length) return null

  const getSentimentColor = sentiment => {
    if (sentiment > 0.3) return 'text-bullish'
    if (sentiment < -0.3) return 'text-destructive'
    return 'text-yellow-400'
  }

  const getSentimentLabel = sentiment => {
    if (sentiment > 0.3) return 'Bullish'
    if (sentiment < -0.3) return 'Bearish'
    return 'Neutral'
  }

  const getImpactColor = impact => {
    if (impact > 0.7) return 'bg-red-500/10 border-red-500/30 text-red-400'
    if (impact > 0.4) return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
    return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 border-t border-border/40">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold font-mono">Related Signals</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            {relatedSignals.length} relevant
          </Badge>
        </div>

        <div className="space-y-2">
          {relatedSignals.map((signal, idx) => (
            <Card
              key={`signal-${idx}`}
              className="border-border/40 hover:border-border/80 hover:bg-card/50 transition-all duration-200"
            >
              <CardContent className="p-3">
                <div className="space-y-2">
                  {/* Header: Title + Sentiment */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <h4 className="text-xs font-semibold text-foreground line-clamp-2 group-hover:text-primary">
                        {signal.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {signal.source} • {formatDate(signal.date)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      {/* Sentiment Badge */}
                      <Badge
                        variant="outline"
                        className={`text-xs h-5 ${getSentimentColor(signal.sentiment)}`}
                      >
                        {signal.sentiment > 0 && <TrendingUp className="w-3 h-3 mr-1" />}
                        {signal.sentiment < 0 && <TrendingDown className="w-3 h-3 mr-1" />}
                        {getSentimentLabel(signal.sentiment)}
                      </Badge>
                      {/* Impact Badge */}
                      <Badge
                        variant="outline"
                        className={`text-xs h-5 ${getImpactColor(signal.impact)}`}
                      >
                        {(signal.impact * 100).toFixed(0)}% impact
                      </Badge>
                    </div>
                  </div>

                  {/* Summary */}
                  {signal.summary && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{signal.summary}</p>
                  )}

                  {/* Category + URL */}
                  <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-border/30">
                    <Badge variant="outline" className="text-xs h-5">
                      {signal.category}
                    </Badge>
                    {signal.url && (
                      <a
                        href={signal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                      >
                        Read <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return 'Recently'
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return 'Recently'
  }
}
