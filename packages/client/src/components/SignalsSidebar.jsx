import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, TrendingUp, TrendingDown } from 'lucide-react'

export function SignalsSidebar({ signals }) {
  const getSentimentIndicator = sentiment => {
    if (sentiment > 0.2) return { label: 'Bullish', className: 'text-bullish', icon: TrendingUp }
    if (sentiment < -0.2) return { label: 'Bearish', className: 'text-bearish', icon: TrendingDown }
    return { label: 'Neutral', className: 'text-neutral', icon: null }
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
            const Icon = sentiment.icon

            return (
              <div
                key={index}
                className="stagger-item group p-2.5 rounded-md border border-border/30 hover:border-border/60 hover:bg-card/40 transition-all duration-200 cursor-pointer"
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors flex-1">
                    {signal.title}
                  </p>
                  {Icon && (
                    <Icon className={`h-3 w-3 ${sentiment.className} flex-shrink-0 mt-0.5`} />
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs text-muted-foreground truncate">{signal.source}</span>
                  <span className={`text-xs font-mono ${sentiment.className}`}>
                    {sentiment.label}
                  </span>
                </div>

                {signal.relatedMarkets && signal.relatedMarkets.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {signal.relatedMarkets.slice(0, 2).map((market, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-xs py-0 px-1.5 h-5 font-mono bg-primary/5 text-primary border-primary/20"
                      >
                        {market}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTime(signal.date)}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
