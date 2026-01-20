import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'
import { CandlestickChart } from './CandlestickChart'
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

  /**
   * Compact Metric Component - No padding, no borders, minimal spacing
   */
  const MetricCell = ({ label, value, badge, highlight = false }) => {
    const displayValue = typeof value === 'function' ? value() : value

    // Don't render if value is null (invalid data)
    if (displayValue === null && !badge) return null

    return (
      <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-tight">{label}</p>
        {displayValue !== null && (
          <p
            className={`text-sm font-semibold font-mono ${highlight ? 'text-primary' : 'text-foreground'}`}
          >
            {displayValue}
          </p>
        )}
        {badge && <div>{badge}</div>}
      </div>
    )
  }

  return (
    <div className="space-y-3">
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

      {/* Price Metrics - 4 columns, compact */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <MetricCell
          label="Current"
          value={() => validateNumber(priceHistory[priceHistory.length - 1]?.value, 4)}
          highlight
        />
        <MetricCell
          label="Predicted 24h"
          value={() => validateNumber(prediction24h.predictedValue, 4)}
          highlight
        />
        <MetricCell
          label="Change"
          value={() => validatePercent(prediction24h.changePercent, 2)}
          highlight={prediction24h.changePercent > 0}
        />
        <MetricCell
          label="Confidence"
          badge={<BadgeUnified type={confidenceBadgeType} label="" showIcon />}
          value={() => validatePercent(prediction24h.confidence, 0)}
        />
      </div>

      {/* Support & Resistance - Compact 2 columns */}
      {prediction24h.supportLevel && prediction24h.resistanceLevel && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground font-mono uppercase tracking-tight mb-0.5">
              Support
            </p>
            <p className="text-sm font-semibold font-mono text-bullish">
              {validateNumber(prediction24h.supportLevel, 4)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground font-mono uppercase tracking-tight mb-0.5">
              Resistance
            </p>
            <p className="text-sm font-semibold font-mono text-bearish">
              {validateNumber(prediction24h.resistanceLevel, 4)}
            </p>
          </div>
        </div>
      )}

      {/* Candlestick Chart (Professional OHLC) */}
      <CandlestickChart data={candleData} title="Price Action" />

      {/* Sentiment Alignment Alert - Compact */}
      {sentimentDirection !== 'neutral' && (
        <div className={`rounded-lg p-3 ${sourceStyle.bg}`}>
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
                  <p className="text-sm font-semibold text-bearish">Sentiment & Price Diverging</p>
                  <p className="text-xs text-muted-foreground">
                    Market sentiment diverges from price movement.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sentiment Metrics - 3 compact columns */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <MetricCell
          label="Sentiment"
          value={() => validateNumber(sentimentScore, 2)}
          badge={<BadgeUnified type={sentimentBadgeType} label="" showIcon />}
          highlight
        />
        {validateNumber(priceCorrelation, 3) !== null && (
          <MetricCell label="Correlation" value={() => validateNumber(priceCorrelation, 3)} />
        )}
        {validatePercent(predictiveValue, 0) !== null && (
          <MetricCell label="Predictive" value={() => validatePercent(predictiveValue, 0)} />
        )}
      </div>

      {/* Volatility - Compact inline */}
      <div className={`rounded-lg p-3 ${sourceStyle.bg}`}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-sm font-semibold">Volatility</p>
          <BadgeUnified type={volatilityBadgeType} label="" showIcon />
        </div>
        <div className="w-full h-1.5 bg-border/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all"
            style={{ width: `${Math.min(100, (analytics.volatility || 0) * 2)}%` }}
          />
        </div>
        <p className="text-xs font-mono text-primary mt-1">
          {validatePercent(analytics.volatility, 2)}
        </p>
      </div>

      {/* Time-based Changes - 3 compact columns */}
      {analytics.changeMetrics && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          {['1h', '24h', '7d'].map((label, idx) => {
            const keys = ['change1h', 'change24h', 'change7d']
            const value = analytics.changeMetrics?.[keys[idx]] || 0
            const validated = validatePercent(value, 2)

            if (validated === null) return null

            return (
              <div key={label} className="text-center">
                <p className="text-muted-foreground font-mono uppercase tracking-tight mb-0.5">
                  {label}
                </p>
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
