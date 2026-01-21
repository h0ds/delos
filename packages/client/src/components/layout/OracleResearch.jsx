import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Search, TrendingUp, AlertCircle } from 'lucide-react'
import { OracleVisualization } from '@/components/OracleVisualization'

export function OracleResearch({ query, isResearching, signalCount, stats }) {
  if (!query && !isResearching) return null

  return (
    <div className="space-y-4">
      {/* Research Status */}
      {isResearching && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-6 px-4">
            <div className="flex items-center justify-center gap-6">
              <OracleVisualization isActive={true} size={100} />
              <div className="flex-1">
                <p className="text-sm font-mono text-primary">Delos Analyzing Market Data</p>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  Scanning Markets • Analyzing Sentiment • Scoring Impact • Identifying Signals
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Query Results Header */}
      {query && !isResearching && (
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-mono">Delos Findings</CardTitle>
                <p className="text-xs text-muted-foreground font-mono mt-1">For "{query}"</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono text-xs">
                  {signalCount} Signals Discovered
                </Badge>
                {stats && stats.highImpactCount > 0 && (
                  <Badge className="bg-impact-high-subtle text-impact-high border-impact-high/30 font-mono text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {stats.highImpactCount} High Impact
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          {stats && (
            <CardContent className="space-y-3">
              {/* Delos' Assessment */}
              <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                <div className="bg-muted/20 rounded p-3 border border-border/30">
                  <span className="text-muted-foreground block mb-1">Market Sentiment</span>
                  <span
                    className={
                      stats.avgSentiment > 0.2
                        ? 'text-bullish'
                        : stats.avgSentiment < -0.2
                          ? 'text-bearish'
                          : 'text-neutral'
                    }
                  >
                    {stats.avgSentiment > 0.2
                      ? 'Bullish'
                      : stats.avgSentiment < -0.2
                        ? 'Bearish'
                        : 'Neutral'}
                  </span>
                  <span className="text-muted-foreground text-xs block mt-1">
                    {Math.abs(stats.avgSentiment).toFixed(2)} Confidence
                  </span>
                </div>

                <div className="bg-muted/20 rounded p-3 border border-border/30">
                  <span className="text-muted-foreground block mb-1">Market Impact</span>
                  <span className="text-primary">{(stats.avgImpact * 100).toFixed(0)}%</span>
                  <span className="text-muted-foreground text-xs block mt-1">Average Score</span>
                </div>

                <div className="bg-muted/20 rounded p-3 border border-border/30">
                  <span className="text-muted-foreground block mb-1">Signal Quality</span>
                  <span className="text-primary">
                    {((stats.highImpactCount / stats.total) * 100).toFixed(0)}%
                  </span>
                  <span className="text-muted-foreground text-xs block mt-1">
                    High Impact Signals
                  </span>
                </div>
              </div>

              {/* Delos Recommendation */}
              <div className="bg-primary/5 border border-primary/20 rounded p-3">
                <p className="text-xs font-mono text-muted-foreground">Delos Assessment:</p>
                <p className="text-xs font-mono text-foreground mt-2">
                  {stats.total} Signals Analyzed Across Multiple Sources. Market Sentiment Is{' '}
                  <span
                    className={
                      stats.avgSentiment > 0.2
                        ? 'text-bullish'
                        : stats.avgSentiment < -0.2
                          ? 'text-bearish'
                          : 'text-neutral'
                    }
                  >
                    {stats.avgSentiment > 0.2
                      ? 'Bullish'
                      : stats.avgSentiment < -0.2
                        ? 'Bearish'
                        : 'Neutral'}
                  </span>
                  . {stats.highImpactCount} Signals Warrant Immediate Attention.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
