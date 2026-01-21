import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react'
import { CandlestickChart } from './CandlestickChart'
import { Tooltip } from '@/components/ui/tooltip'
import {
  BadgeUnified,
  BADGE_TYPES,
  getSentimentBadgeType,
  getVolatilityBadgeType,
  getConfidenceBadgeType
} from '@/lib/badgeSystem'

/**
 * Utility function to validate numeric data
 * Returns null if value is NaN, undefined, or invalid
 */
const validateNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return null
  return Number(value).toFixed(decimals)
}

/**
 * Utility function to validate percentage
 * Returns null if value is NaN, undefined, or invalid
 */
const validatePercent = (value, decimals = 2) => {
  const validated = validateNumber(value, decimals)
  return validated ? `${validated}%` : null
}

/**
 * Data-dense trend analysis visualization (no unnecessary borders/padding)
 * @param {Object} props
 * @param {Array} props.priceHistory - Array of TrendPoint objects
 * @param {Object} props.analytics - MarketAnalytics object
 * @param {String} props.marketName - Optional market name for display
 * @param {String} props.source - Market source ('polymarket' or 'kalshi')
 */
export function TrendAnalysisChart({
  priceHistory,
  analytics,
  marketName = 'Market',
  source = 'polymarket'
}) {
  if (!priceHistory || priceHistory.length === 0 || !analytics) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No Price History Available
      </div>
    )
  }

  if (!analytics.predictions || analytics.predictions.length < 2) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Insufficient Data For Trend Analysis
      </div>
    )
  }

  const prediction24h = analytics.predictions[1]
  const sentiment = analytics.sentimentCorrelation || {}

  // Generate OHLC data from price history for candlestick
  const candleData = priceHistory.slice(-8).map((point, idx) => ({
    open: point.value * (0.98 + Math.random() * 0.04),
    high: point.value * (1.01 + Math.random() * 0.04),
    low: point.value * (0.95 + Math.random() * 0.03),
    close: point.value,
    volume: 1000000 + Math.random() * 2000000,
    time: idx
  }))

  // Safe sentiment access with fallbacks
  const sentimentScore = typeof sentiment.sentimentScore === 'number' ? sentiment.sentimentScore : 0
  const priceCorrelation =
    typeof sentiment.priceCorrelation === 'number' ? sentiment.priceCorrelation : 0
  const predictiveValue =
    typeof sentiment.predictiveValue === 'number' ? sentiment.predictiveValue : 0
  const sentimentStrength = sentiment.strength || 'unknown'
  const sentimentDirection = sentiment.direction || 'neutral'

  // Get badge types for consistency
  const sentimentBadgeType = getSentimentBadgeType(sentimentScore)
  const volatilityBadgeType = getVolatilityBadgeType(analytics.volatility || 0)
  const confidenceBadgeType = getConfidenceBadgeType(prediction24h.confidence)

  // Source colors for buttons
  const sourceColors = {
    polymarket: {
      bg: 'bg-blue-500/15',
      text: 'text-blue-300',
      button: 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
    },
    kalshi: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-300',
      button: 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
    }
  }

  const sourceStyle = sourceColors[source] || sourceColors.polymarket

  return (
    <div className="space-y-4">
      {/* Header with Source Badge Button */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Trend Analysis</h2>
        <div className="flex gap-2 items-center">
          {/* Source Badge - Prominent Button Style */}
          <button
            disabled
            className={`text-xs font-mono px-3 py-1.5 rounded-squircle font-semibold uppercase tracking-wide ${sourceStyle.button} transition-colors cursor-default`}
          >
            {source}
          </button>
          {/* Trend Direction */}
          <BadgeUnified
            type={
              prediction24h.direction === 'up'
                ? BADGE_TYPES.TRENDING_UP
                : prediction24h.direction === 'down'
                  ? BADGE_TYPES.TRENDING_DOWN
                  : BADGE_TYPES.NEUTRAL
            }
            label={prediction24h.direction.toUpperCase()}
          />
        </div>
      </div>

      {/* ===== BENTO GRID LAYOUT ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-max">
        {/* CURRENT PRICE - Large */}
        <div className="lg:col-span-1 bg-card/50 rounded-lg p-4 border border-border/40 hover:border-primary/30 transition-colors">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-tight mb-2">
            Current Price
          </p>
          <p className="text-2xl font-semibold font-mono text-primary">
            {validateNumber(priceHistory[priceHistory.length - 1]?.value, 4)}
          </p>
        </div>

        {/* PREDICTED 24H - Large */}
        <div className="lg:col-span-1 bg-card/50 rounded-lg p-4 border border-border/40 hover:border-primary/30 transition-colors">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-tight mb-2">
            Predicted 24h
          </p>
          <p className="text-2xl font-semibold font-mono text-primary">
            {validateNumber(prediction24h.predictedValue, 4)}
          </p>
        </div>

        {/* CHANGE % - Medium */}
        <div className="lg:col-span-1 bg-card/50 rounded-lg p-4 border border-border/40 hover:border-primary/30 transition-colors">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-tight mb-2">
            24h Change
          </p>
          <p
            className={`text-xl font-semibold font-mono ${
              prediction24h.changePercent > 0 ? 'text-bullish' : 'text-bearish'
            }`}
          >
            {prediction24h.changePercent > 0 ? '+' : ''}
            {validatePercent(prediction24h.changePercent, 2)}
          </p>
        </div>

        {/* CONFIDENCE - Medium */}
        <div className="lg:col-span-1 bg-card/50 rounded-lg p-4 border border-border/40 hover:border-primary/30 transition-colors">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-tight mb-2 flex items-center gap-2">
            Confidence
            <BadgeUnified type={confidenceBadgeType} label="" showIcon />
          </p>
          <p className="text-xl font-semibold font-mono text-primary">
            {validatePercent(prediction24h.confidence, 0)}
          </p>
        </div>

        {/* CANDLESTICK CHART - Takes up 2-3 cols */}
        <div className="md:col-span-2 lg:col-span-2 bg-card/50 rounded-lg p-4 border border-border/40">
          <CandlestickChart data={candleData} title="Price Action (7 Periods)" />
        </div>

        {/* SUPPORT & RESISTANCE - Right side, stacked */}
        {prediction24h.supportLevel && prediction24h.resistanceLevel && (
          <>
            <div className="bg-card/50 rounded-lg p-4 border border-border/40 hover:border-primary/30 transition-colors">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-tight mb-2">
                Support
              </p>
              <p className="text-xl font-semibold font-mono text-bullish">
                {validateNumber(prediction24h.supportLevel, 4)}
              </p>
            </div>
            <div className="bg-card/50 rounded-lg p-4 border border-border/40 hover:border-primary/30 transition-colors">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-tight mb-2">
                Resistance
              </p>
              <p className="text-xl font-semibold font-mono text-bearish">
                {validateNumber(prediction24h.resistanceLevel, 4)}
              </p>
            </div>
          </>
        )}

        {/* VOLATILITY - Full width badge style */}
        <div
          className={`md:col-span-2 lg:col-span-4 rounded-lg p-4 ${sourceStyle.bg} border border-border/40`}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <Tooltip text="Expected price fluctuation: higher % = more volatile market">
              <p className="text-sm font-semibold cursor-help">Volatility Analysis</p>
            </Tooltip>
            <BadgeUnified type={volatilityBadgeType} label="" showIcon />
          </div>
          <div className="w-full h-2 bg-border/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500"
              style={{ width: `${Math.min(100, (analytics.volatility || 0) * 2)}%` }}
            />
          </div>
          <p className="text-xs font-mono text-primary mt-2">
            {validatePercent(analytics.volatility, 2)}
          </p>
        </div>

        {/* TIME CHANGES - Compact 3-column grid */}
        {analytics.changeMetrics && (
          <div className="md:col-span-2 lg:col-span-2 grid grid-cols-3 gap-2">
            {['1h', '24h', '7d'].map((label, idx) => {
              const keys = ['change1h', 'change24h', 'change7d']
              const value = analytics.changeMetrics?.[keys[idx]] || 0
              const validated = validatePercent(value, 2)

              if (validated === null) return null

              return (
                <div
                  key={label}
                  className="bg-card/50 rounded-lg p-3 border border-border/40 text-center hover:border-primary/30 transition-colors"
                >
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-tight mb-1">
                    {label}
                  </p>
                  <p
                    className={`text-lg font-semibold font-mono ${
                      value > 0 ? 'text-bullish' : 'text-bearish'
                    }`}
                  >
                    {value > 0 ? '+' : ''}
                    {validated}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* SENTIMENT METRICS - 3-column grid */}
        <div className="md:col-span-2 lg:col-span-2 grid grid-cols-3 gap-2">
          <Tooltip text="Overall sentiment score from market signals: -1 (bearish) to +1 (bullish)">
            <div className="bg-card/50 rounded-lg p-3 border border-border/40 hover:border-primary/30 transition-colors cursor-help">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-tight mb-2">
                Sentiment
              </p>
              <p className="text-lg font-semibold font-mono text-primary mb-1">
                {validateNumber(sentimentScore, 2)}
              </p>
              <BadgeUnified type={sentimentBadgeType} label="" showIcon />
            </div>
          </Tooltip>
          {validateNumber(priceCorrelation, 3) !== null && (
            <Tooltip text="Price movement correlated with sentiment: 0 (no correlation) to 1 (perfect)">
              <div className="bg-card/50 rounded-lg p-3 border border-border/40 hover:border-primary/30 transition-colors cursor-help">
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-tight mb-1">
                  Correlation
                </p>
                <p className="text-lg font-semibold font-mono text-foreground">
                  {validateNumber(priceCorrelation, 3)}
                </p>
              </div>
            </Tooltip>
          )}
          {validatePercent(predictiveValue, 0) !== null && (
            <Tooltip text="Confidence that sentiment correctly predicts price direction: 0-100%">
              <div className="bg-card/50 rounded-lg p-3 border border-border/40 hover:border-primary/30 transition-colors cursor-help">
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-tight mb-1">
                  Predictive
                </p>
                <p className="text-lg font-semibold font-mono text-foreground">
                  {validatePercent(predictiveValue, 0)}
                </p>
              </div>
            </Tooltip>
          )}
        </div>

        {/* SENTIMENT ALIGNMENT - Full width */}
        {sentimentDirection !== 'neutral' && (
          <div
            className={`md:col-span-2 lg:col-span-4 rounded-lg p-4 ${sourceStyle.bg} border border-border/40`}
          >
            <div className="flex items-start gap-2.5">
              {sentimentDirection === 'aligned' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-bullish mt-0.5 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-bullish">Sentiment & Price Aligned</p>
                    <p className="text-xs text-muted-foreground">
                      Market sentiment aligns with price action.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-bearish mt-0.5 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-bearish">
                      Sentiment & Price Diverging
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Market sentiment diverges from price movement.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
