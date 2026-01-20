import { Activity, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LiquidityCard({ liquidity = 0, volume = 0, isPolymarket = true }) {
  // Calculate liquidity ratio (how much of daily volume is tied up in liquidity)
  const liquidityRatio = volume > 0 ? (liquidity / volume) * 100 : 0
  const isHealthy = liquidityRatio > 5 // More than 5% liquidity to volume ratio is good

  // Determine health status
  let healthStatus = 'Low'
  let healthColor = 'text-bearish'
  let healthBg = 'bg-bearish/10'

  if (liquidityRatio >= 10) {
    healthStatus = 'Excellent'
    healthColor = 'text-bullish'
    healthBg = 'bg-bullish/10'
  } else if (liquidityRatio >= 5) {
    healthStatus = 'Good'
    healthColor = 'text-yellow-400'
    healthBg = 'bg-yellow-500/10'
  }

  return (
    <Card className="border-border/40 bg-card/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono text-muted-foreground flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary text-xs" />
          {isPolymarket ? 'Liquidity' : 'Open Interest'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Value */}
        <div className="space-y-1">
          <p className="text-xs font-mono text-muted-foreground uppercase">
            {isPolymarket ? 'Available Liquidity' : 'Total Open Interest'}
          </p>
          <p className="text-2xl font-mono font-bold text-primary">
            ${(liquidity / 1000).toFixed(0)}K
          </p>
        </div>

        {/* Liquidity Ratio */}
        {volume > 0 && (
          <div className="border-t border-border/30 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-muted-foreground uppercase">Liquidity Ratio</p>
              <span className={`text-xs font-mono font-semibold ${healthColor}`}>
                {liquidityRatio.toFixed(1)}% of 24h Vol
              </span>
            </div>
            {/* Health Indicator */}
            <div className={`flex items-center gap-2 p-2 rounded-lg ${healthBg}`}>
              <TrendingUp className={`h-3.5 w-3.5 ${healthColor}`} />
              <span className={`text-xs font-mono font-semibold ${healthColor}`}>
                {healthStatus}
              </span>
            </div>
            {/* Visual Bar */}
            <div className="w-full h-2 bg-border/40 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-500 ${
                  liquidityRatio >= 10
                    ? 'bg-bullish'
                    : liquidityRatio >= 5
                      ? 'bg-yellow-500'
                      : 'bg-bearish'
                }`}
                style={{ width: `${Math.min(liquidityRatio * 2, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Info Text */}
        <div className="text-xs text-muted-foreground/70 pt-2 border-t border-border/30">
          <p>
            {isPolymarket
              ? 'Liquidity indicates capital available for trading. Higher values mean easier entry/exit.'
              : 'Open interest shows total capital at risk. Indicates market activity and depth.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
