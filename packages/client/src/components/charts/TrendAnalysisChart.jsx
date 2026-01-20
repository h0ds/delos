import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'
import { CandlestickChart } from './CandlestickChart'
import {
  BadgeUnified,
  BadgeList,
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
 * Comprehensive trend analysis visualization with Bento Grid layout
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
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No Price History Available
        </CardContent>
      </Card>
    )
  }

  if (!analytics.predictions || analytics.predictions.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Insufficient Data For Trend Analysis
        </CardContent>
      </Card>
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

  // Market source badge styling
  const sourceColors = {
    polymarket: {
      bg: 'bg-gradient-to-r from-blue-500/10 to-blue-600/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400'
    },
    kalshi: {
      bg: 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400'
    }
  }

  const sourceStyle = sourceColors[source] || sourceColors.polymarket

  /**
   * Metric Cell Component - Only renders if data is valid
   */
  const MetricCell = ({ label, value, badge, highlight = false, colSpan = 1 }) => {
    const displayValue = typeof value === 'function' ? value() : value

    // Don't render if value is null (invalid data)
    if (displayValue === null && !badge) return null

    return (
      <div
        className={`rounded-lg p-3 border transition-all ${
          highlight
            ? 'bg-primary/5 border-primary/30 hover:border-primary/50'
            : 'bg-muted/20 border-border/30 hover:border-border/50'
        }`}
        style={{ gridColumn: `span ${colSpan}` }}
      >
        <p className="text-xs text-muted-foreground font-mono mb-2">{label}</p>
        {displayValue !== null && (
          <p
            className={`text-sm font-semibold font-mono ${highlight ? 'text-primary' : 'text-foreground'}`}
          >
            {displayValue}
          </p>
        )}
        {badge && <div className="mt-2">{badge}</div>}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header with Market Source Badge */}
      <div className={`rounded-lg p-4 border ${sourceStyle.bg} ${sourceStyle.border}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Trend Analysis</h2>
          <div className="flex gap-2 items-center">
            <Badge variant="outline" className={`${sourceStyle.text} text-xs font-mono uppercase`}>
              {source}
            </Badge>
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
      </div>

      {/* Bento Grid Layout - Price & Predictions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricCell
          label="Current Price"
          value={() => validateNumber(priceHistory[priceHistory.length - 1]?.value, 4)}
          highlight
        />
        <MetricCell
          label="Predicted (24h)"
          value={() => validateNumber(prediction24h.predictedValue, 4)}
          highlight
        />
        <MetricCell
          label="Change"
          value={() => {
            const change = prediction24h.changePercent
            return validatePercent(change, 2)
          }}
          highlight={prediction24h.changePercent > 0}
        />
        <MetricCell
          label="Confidence"
          badge={<BadgeUnified type={confidenceBadgeType} label="" showIcon />}
          value={() => validatePercent(prediction24h.confidence, 0)}
        />
      </div>

      {/* Support & Resistance - Only show if both values exist */}
      {prediction24h.supportLevel && prediction24h.resistanceLevel && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg p-3 border bg-bullish/5 border-bullish/30 hover:border-bullish/50">
            <p className="text-xs text-muted-foreground font-mono mb-1">Support</p>
            <p className="text-sm font-semibold font-mono text-bullish">
              {validateNumber(prediction24h.supportLevel, 4)}
            </p>
          </div>
          <div className="rounded-lg p-3 border bg-bearish/5 border-bearish/30 hover:border-bearish/50">
            <p className="text-xs text-muted-foreground font-mono mb-1">Resistance</p>
            <p className="text-sm font-semibold font-mono text-bearish">
              {validateNumber(prediction24h.resistanceLevel, 4)}
            </p>
          </div>
        </div>
      )}

      {/* Candlestick Chart (Professional OHLC) */}
      <CandlestickChart data={candleData} title="Price Action" />

      {/* Sentiment Analysis - Bento Grid */}
      {sentimentDirection !== 'neutral' && (
        <div
          className={`rounded-lg p-4 border ${
            sentimentDirection === 'aligned'
              ? 'bg-bullish/5 border-bullish/30'
              : 'bg-bearish/5 border-bearish/30'
          }`}
        >
          <div className="flex items-start gap-3">
            {sentimentDirection === 'aligned' ? (
              <>
                <CheckCircle className="w-5 h-5 text-bullish mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-bullish">Sentiment & Price Aligned</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Market sentiment aligns with price action. Strong predictive signal.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-bearish mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-bearish">Sentiment & Price Diverging</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Market sentiment diverges from price movement. Potential reversal ahead.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sentiment Metrics - Only show valid values */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <MetricCell
          label="Sentiment Score"
          value={() => validateNumber(sentimentScore, 2)}
          badge={<BadgeUnified type={sentimentBadgeType} label="" showIcon />}
          highlight
        />
        {validateNumber(priceCorrelation, 3) !== null && (
          <MetricCell label="Price Correlation" value={() => validateNumber(priceCorrelation, 3)} />
        )}
        {validatePercent(predictiveValue, 0) !== null && (
          <MetricCell label="Predictive Value" value={() => validatePercent(predictiveValue, 0)} />
        )}
      </div>

      {/* Volatility & Risk - Compact layout */}
      <div className={`rounded-lg p-4 border ${sourceStyle.bg} ${sourceStyle.border}`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Volatility</p>
          <BadgeUnified type={volatilityBadgeType} label="" showIcon />
        </div>
        <div className="w-full h-2 bg-border/40 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all"
            style={{ width: `${Math.min(100, (analytics.volatility || 0) * 2)}%` }}
          />
        </div>
        <p className="text-sm font-semibold font-mono text-primary">
          {validatePercent(analytics.volatility, 2)}
        </p>
      </div>

      {/* Time-based Changes - Only show if values exist */}
      {analytics.changeMetrics && (
        <div className="grid grid-cols-3 gap-2">
          {['1h', '24h', '7d'].map((label, idx) => {
            const key = `change${label}`.replace('change', 'change')
            const keys = ['change1h', 'change24h', 'change7d']
            const value = analytics.changeMetrics?.[keys[idx]] || 0
            const validated = validatePercent(value, 2)

            if (validated === null) return null

            return (
              <div
                key={label}
                className={`rounded-lg p-3 border bg-muted/20 border-border/30 hover:border-border/50 text-center`}
              >
                <p className="text-xs text-muted-foreground font-mono mb-1">{label}</p>
                <p
                  className={`text-sm font-semibold font-mono ${
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
    </div>
  )
}
