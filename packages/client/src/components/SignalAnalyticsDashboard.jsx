import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Gauge, Target } from 'lucide-react'

/**
 * Displays aggregated signal analytics including sentiment trends,
 * consensus strength, key themes, and risk/opportunity indicators
 */
export function SignalAnalyticsDashboard({ analytics }) {
  if (!analytics) return null

  const getSentimentColor = sentiment => {
    if (sentiment > 0.3) return 'text-bullish'
    if (sentiment < -0.3) return 'text-bearish'
    return 'text-muted-foreground'
  }

  const getSentimentLabel = sentiment => {
    if (sentiment > 0.3) return 'Bullish'
    if (sentiment < -0.3) return 'Bearish'
    return 'Neutral'
  }

  const getConsensusColor = consensus => {
    if (consensus === 'strong') return 'bg-bullish/20 text-bullish border-bullish/30'
    if (consensus === 'moderate') return 'bg-primary/20 text-primary border-primary/30'
    return 'bg-muted/20 text-muted-foreground border-border/30'
  }

  const getTrendIcon = trend => {
    if (trend.includes('strengthening')) return <TrendingUp className="w-4 h-4" />
    if (trend.includes('weakening')) return <TrendingDown className="w-4 h-4" />
    return <Gauge className="w-4 h-4" />
  }

  return (
    <div className="space-y-4">
      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Sentiment */}
        <Card className="border-border/40 bg-card/40">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-mono">Overall Sentiment</p>
              <div
                className={`text-2xl font-bold font-mono ${getSentimentColor(analytics.aggregateSentiment)}`}
              >
                {getSentimentLabel(analytics.aggregateSentiment)}
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                {(analytics.aggregateSentiment * 100).toFixed(0)}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Consensus */}
        <Card className="border-border/40 bg-card/40">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-mono">Consensus</p>
              <Badge
                className={`w-full justify-center py-1 font-mono text-xs ${getConsensusColor(analytics.sentimentConsensus)}`}
                variant="outline"
              >
                {analytics.sentimentConsensus.charAt(0).toUpperCase() +
                  analytics.sentimentConsensus.slice(1)}
              </Badge>
              <p className="text-xs text-muted-foreground text-center font-mono">Agreement Level</p>
            </div>
          </CardContent>
        </Card>

        {/* Confidence */}
        <Card className="border-border/40 bg-card/40">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-mono">Avg. Confidence</p>
              <div className="text-2xl font-bold font-mono text-primary">
                {analytics.averageConfidence}%
              </div>
              <div className="w-full h-1.5 bg-border/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-300"
                  style={{ width: `${analytics.averageConfidence}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Readiness */}
        <Card className="border-border/40 bg-card/40">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-mono">Market Readiness</p>
              <div className="text-2xl font-bold font-mono text-primary">
                {analytics.marketReadiness}%
              </div>
              <p className="text-xs font-mono text-muted-foreground">Event Absorption</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend & Volatility */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/40 bg-card/40">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {getTrendIcon(analytics.sentimentTrend)}
                <p className="text-sm font-mono font-semibold capitalize">
                  {analytics.sentimentTrend.replace(/_/g, ' ')}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Sentiment direction and momentum</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-primary" />
                <p className="text-sm font-mono font-semibold capitalize">
                  {analytics.volatilityExpected > 60
                    ? 'High'
                    : analytics.volatilityExpected > 40
                      ? 'Medium'
                      : 'Low'}{' '}
                  Volatility
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Expected price movement</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Themes & Indicators */}
      {(analytics.keyThemes?.length > 0 ||
        analytics.riskIndicators?.length > 0 ||
        analytics.opportunityIndicators?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Key Themes */}
          {analytics.keyThemes?.length > 0 && (
            <Card className="border-border/40 bg-card/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Key Themes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {analytics.keyThemes.map((theme, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs font-mono bg-primary/5 border-primary/20"
                  >
                    {theme}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Risk Indicators */}
          {analytics.riskIndicators?.length > 0 && (
            <Card className="border-border/40 bg-card/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-bearish" />
                  Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {analytics.riskIndicators.map((risk, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs font-mono bg-bearish/5 border-bearish/20 text-bearish"
                  >
                    {risk}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Opportunity Indicators */}
          {analytics.opportunityIndicators?.length > 0 && (
            <Card className="border-border/40 bg-card/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-bullish" />
                  Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {analytics.opportunityIndicators.map((opp, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs font-mono bg-bullish/5 border-bullish/20 text-bullish"
                  >
                    {opp}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
