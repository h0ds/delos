import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, TrendingUp, TrendingDown, Zap, AlertCircle, Info } from 'lucide-react'

export function SignalsSidebar({ signals }) {
  const getSentimentIndicator = sentiment => {
    if (sentiment > 0.2) return { label: 'Bullish', className: 'text-bullish', icon: TrendingUp }
    if (sentiment < -0.2) return { label: 'Bearish', className: 'text-bearish', icon: TrendingDown }
    return { label: 'Neutral', className: 'text-neutral', icon: null }
  }

  const getImpactIndicator = impact => {
    if (impact > 0.7) return { label: 'High', className: 'text-red-400 bg-red-500/10', icon: Zap }
    if (impact > 0.4)
      return { label: 'Medium', className: 'text-yellow-400 bg-yellow-500/10', icon: AlertCircle }
    return { label: 'Low', className: 'text-blue-400 bg-blue-500/10', icon: Info }
  }

  const formatTime = dateStr => {
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diff = now - date

      if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  if (signals.length === 0) {
    return (
      <div className="w-80 border-l border-border/50 bg-background/50 backdrop-blur-sm p-4 flex items-center justify-center">
        <p className="text-xs text-muted-foreground text-center">No signals to display</p>
      </div>
    )
  }

  return (
    <div className="w-80 border-l border-border/50 bg-background/50 backdrop-blur-sm flex flex-col">
      <div className="px-4 py-3 border-b border-border/30">
        <p className="text-xs font-mono text-muted-foreground">Signal Feed ({signals.length})</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {signals.slice(0, 20).map((signal, index) => {
            const sentiment = getSentimentIndicator(signal.sentiment)
            const impact = getImpactIndicator(signal.impact || 0)
            const SentimentIcon = sentiment.icon
            const ImpactIcon = impact.icon

            return (
              <div
                key={index}
                className="stagger-item group p-2.5 rounded-md border border-border/30 hover:border-border/60 hover:bg-card/40 transition-all duration-200 cursor-pointer"
                style={{ animationDelay: `${index * 20}ms` }}
              >
                {/* Title + Sentiment */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-xs font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors flex-1">
                    {signal.title}
                  </p>
                  {SentimentIcon && (
                    <SentimentIcon
                      className={`h-3 w-3 ${sentiment.className} flex-shrink-0 mt-0.5`}
                    />
                  )}
                </div>

                {/* Source + Sentiment Label + Impact Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground truncate">{signal.source}</span>
                    {signal.category && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0 h-4 font-mono bg-card/50 border-border/50 text-muted-foreground"
                      >
                        {signal.category}
                      </Badge>
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded-full ${impact.className}`}
                  >
                    {ImpactIcon && <ImpactIcon className="h-3 w-3" />}
                    <span>{impact.label}</span>
                  </div>
                </div>

                {/* Related Markets */}
                {signal.relatedMarkets && signal.relatedMarkets.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-2">
                    {signal.relatedMarkets.slice(0, 2).map((market, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-xs py-0 px-1.5 h-5 font-mono bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors"
                      >
                        {market}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Sentiment + Time */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className={`font-mono ${sentiment.className}`}>{sentiment.label}</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTime(signal.date)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
