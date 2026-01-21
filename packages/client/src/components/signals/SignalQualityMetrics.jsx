import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Gauge } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Displays signal quality metrics including confidence, trust score, and market impact
 */
export function SignalQualityMetrics({
  confidence = 0,
  trustScore = 0,
  sentimentTrend = 'stable',
  marketImpact = 0,
  volatilityPrediction = 'medium',
  ageHours = 0
}) {
  const getConfidenceColor = score => {
    if (score >= 80) return 'bg-bullish/20 text-bullish'
    if (score >= 60) return 'bg-primary/20 text-primary'
    if (score >= 40) return 'bg-yellow-500/20 text-yellow-400'
    return 'bg-bearish/20 text-bearish'
  }

  const getTrustIcon = score => {
    if (score >= 80) return <CheckCircle className="w-4 h-4" />
    if (score >= 60) return <AlertCircle className="w-4 h-4" />
    return <AlertCircle className="w-4 h-4" />
  }

  const getTrendIcon = trend => {
    if (trend === 'strengthening') return <TrendingUp className="w-3 h-3" />
    if (trend === 'weakening') return <TrendingDown className="w-3 h-3" />
    return <Gauge className="w-3 h-3" />
  }

  const getVolatilityColor = vol => {
    if (vol === 'high') return 'bg-bearish/10 border-bearish/30'
    if (vol === 'medium') return 'bg-yellow-500/10 border-yellow-500/30'
    return 'bg-bullish/10 border-bullish/30'
  }

  const getAgeLabel = () => {
    if (ageHours < 1) return 'Just now'
    if (ageHours < 24) return `${Math.round(ageHours)}h ago`
    return `${Math.round(ageHours / 24)}d ago`
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {/* Confidence Score */}
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${getConfidenceColor(confidence)} border border-current/20`}
        >
          <Gauge className="w-3 h-3" />
          <span className="font-mono">{confidence}% Confidence</span>
        </div>

        {/* Trust Score */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded text-xs bg-card/60 border border-border/30">
          {getTrustIcon(trustScore)}
          <span className="font-mono">{trustScore}% Trust</span>
        </div>

        {/* Market Impact */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded text-xs bg-primary/10 border border-primary/20 text-primary">
          <AlertCircle className="w-3 h-3" />
          <span className="font-mono">{marketImpact}% Impact</span>
        </div>

        {/* Sentiment Trend */}
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${
            sentimentTrend === 'strengthening'
              ? 'text-bullish bg-bullish/10 border-bullish/20'
              : sentimentTrend === 'weakening'
                ? 'text-bearish bg-bearish/10 border-bearish/20'
                : 'text-muted-foreground bg-muted/20 border-border/30'
          } border`}
        >
          {getTrendIcon(sentimentTrend)}
          <span className="font-mono capitalize">{sentimentTrend}</span>
        </div>

        {/* Volatility */}
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs border ${getVolatilityColor(volatilityPrediction)}`}
        >
          <span className="font-mono capitalize">{volatilityPrediction} Volatility</span>
        </div>

        {/* Signal Age */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded text-xs bg-muted/20 border border-border/30 text-muted-foreground">
          <span className="font-mono">{getAgeLabel()}</span>
        </div>
      </div>
    </div>
  )
}
