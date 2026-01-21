import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'
import { CandlestickChart } from './CandlestickChart'
import { Tooltip } from '@/components/ui/tooltip'
import {
  BadgeUnified,
  BADGE_TYPES,
  getSentimentBadgeType,
  getVolatilityBadgeType,
  getConfidenceBadgeType
} from '@/lib/badgeSystem'
import {
  formatPercent,
  formatPrice,
  formatConfidence,
  formatCorrelation,
  formatSentiment,
  formatVolatility
} from '@/lib/formatters'

/**
 * Data-dense trend analysis visualization (no unnecessary borders/padding)
 * @param {Object} props
 * @param {Array} props.priceHistory - Array of TrendPoint objects
 * @param {Array} props.ohlcCandles - Real OHLC candles from Polymarket API (preferred)
 * @param {Object} props.analytics - MarketAnalytics object
 * @param {String} props.marketName - Optional market name for display
 * @param {String} props.source - Market source ('polymarket' or 'kalshi')
 */
export function TrendAnalysisChart({
  priceHistory,
  ohlcCandles,
  analytics,
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

  // Use real OHLC candles from API if available, otherwise fall back to price history
  let candleData
  if (ohlcCandles && ohlcCandles.length > 0) {
    console.log(`[TrendAnalysis] Using real ${ohlcCandles.length} OHLC candles from Polymarket API`)
    // Convert real candles to display format
    candleData = ohlcCandles.slice(-8).map((candle, idx) => ({
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume || 0,
      time: idx,
      isReal: true // Mark as real data
    }))
  } else {
    console.warn('[TrendAnalysis] No real OHLC candles available')
    // Without real OHLC data, we cannot display candlesticks accurately
    candleData = []
  }

  // Safe sentiment access with fallbacks
  const sentimentScore = typeof sentiment.sentimentScore === 'number' ? sentiment.sentimentScore : 0
  const priceCorrelation =
    typeof sentiment.priceCorrelation === 'number' ? sentiment.priceCorrelation : 0
  const predictiveValue =
    typeof sentiment.predictiveValue === 'number' ? sentiment.predictiveValue : 0
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
    <div className="space-y-6">
      {/* Header - Clean section title with badges */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Trend Analysis</h2>
        <div className="flex gap-2 items-center">
          {/* Source Badge */}
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

      {/* ===== PRICE OVERVIEW (4 KPI Cards) ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Price */}
        <div className="bg-card rounded-lg p-5 border border-border/60">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-2">
            Current Price
          </p>
          <p className="text-3xl font-semibold font-mono text-primary">
            {formatPrice(priceHistory[priceHistory.length - 1]?.value)}
          </p>
        </div>

        {/* Predicted 24h */}
        <div className="bg-card rounded-lg p-5 border border-border/60">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-2">
            Predicted 24h
          </p>
          <p className="text-3xl font-semibold font-mono text-primary">
            {formatPrice(prediction24h.predictedValue)}
          </p>
        </div>

        {/* 24h Change */}
        <div className="bg-card rounded-lg p-5 border border-border/60">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-2">
            24h Change
          </p>
          <p
            className={`text-3xl font-semibold font-mono ${
              prediction24h.changePercent > 0 ? 'text-bullish' : 'text-bearish'
            }`}
          >
            {formatPercent(prediction24h.changePercent, 1)}
          </p>
        </div>

        {/* Confidence */}
        <div className="bg-card rounded-lg p-5 border border-border/60">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
              Confidence
            </p>
            <BadgeUnified type={confidenceBadgeType} label="" showIcon />
          </div>
          <p className="text-3xl font-semibold font-mono text-primary">
            {formatConfidence(prediction24h.confidence)}
          </p>
        </div>
      </div>

      {/* ===== CANDLESTICK CHART ===== */}
      {candleData && candleData.length > 0 ? (
        <div className="bg-card rounded-lg p-5 border border-border/60">
          <CandlestickChart data={candleData} title="Price Action (7 Periods)" />
        </div>
      ) : (
        <div className="bg-card rounded-lg p-5 border border-border/60">
          <p className="text-center text-sm text-muted-foreground">
            OHLC data not available
          </p>
        </div>
      )}

      {/* ===== SUPPORT & RESISTANCE ===== */}
      {prediction24h.supportLevel && prediction24h.resistanceLevel && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card rounded-lg p-5 border border-border/60">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-3">
              Support Level
            </p>
            <p className="text-2xl font-semibold font-mono text-bullish">
              {formatPrice(prediction24h.supportLevel)}
            </p>
          </div>
          <div className="bg-card rounded-lg p-5 border border-border/60">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-3">
              Resistance Level
            </p>
            <p className="text-2xl font-semibold font-mono text-bearish">
              {formatPrice(prediction24h.resistanceLevel)}
            </p>
          </div>
        </div>
      )}

      {/* ===== VOLATILITY ANALYSIS ===== */}
      <div className={`rounded-lg p-5 ${sourceStyle.bg} border border-border/40`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <Tooltip text="Expected price fluctuation: higher % = more volatile market">
            <p className="text-sm font-semibold cursor-help">Volatility Analysis</p>
          </Tooltip>
          <BadgeUnified type={volatilityBadgeType} label="" showIcon />
        </div>
        <div className="space-y-2">
          <div className="w-full h-3 bg-border/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500"
              style={{ width: `${Math.min(100, (analytics.volatility || 0) * 2)}%` }}
            />
          </div>
          <p className="text-sm font-mono text-primary">{formatVolatility(analytics.volatility)}</p>
        </div>
      </div>

      {/* ===== TIME-BASED CHANGES ===== */}
      {analytics.changeMetrics && (
        <div>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-3">
            Price Changes Over Time
          </p>
          <div className="grid grid-cols-3 gap-4">
            {['1h', '24h', '7d'].map((label, idx) => {
              const keys = ['change1h', 'change24h', 'change7d']
              const value = analytics.changeMetrics?.[keys[idx]] || 0

              return (
                <div
                  key={label}
                  className="bg-card rounded-lg p-4 border border-border/60 text-center"
                >
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-2">
                    {label}
                  </p>
                  <p
                    className={`text-xl font-semibold font-mono ${
                      value > 0 ? 'text-bullish' : 'text-bearish'
                    }`}
                  >
                    {formatPercent(value, 1)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ===== SENTIMENT METRICS ===== */}
      <div>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-3">
          Sentiment Analysis
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Tooltip text="Overall sentiment score from market signals: -1 (bearish) to +1 (bullish)">
            <div className="bg-card rounded-lg p-4 border border-border/60 cursor-help">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
                  Sentiment
                </p>
                <BadgeUnified type={sentimentBadgeType} label="" showIcon />
              </div>
              <p className="text-xl font-semibold font-mono text-primary">
                {formatSentiment(sentimentScore)}
              </p>
            </div>
          </Tooltip>

          {priceCorrelation !== 0 && (
            <Tooltip text="Price movement correlated with sentiment: 0 (no correlation) to 1 (perfect)">
              <div className="bg-card rounded-lg p-4 border border-border/60 cursor-help">
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-2">
                  Correlation
                </p>
                <p className="text-xl font-semibold font-mono text-foreground">
                  {formatCorrelation(priceCorrelation)}
                </p>
              </div>
            </Tooltip>
          )}

          {predictiveValue !== 0 && (
            <Tooltip text="Confidence that sentiment correctly predicts price direction: 0-100%">
              <div className="bg-card rounded-lg p-4 border border-border/60 cursor-help">
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide mb-2">
                  Predictive
                </p>
                <p className="text-xl font-semibold font-mono text-foreground">
                  {formatPercent(predictiveValue, 0)}
                </p>
              </div>
            </Tooltip>
          )}
        </div>
      </div>

      {/* ===== SENTIMENT ALIGNMENT STATUS ===== */}
      {sentimentDirection !== 'neutral' && (
        <div className={`rounded-lg p-5 ${sourceStyle.bg} border border-border/40`}>
          <div className="flex items-start gap-3">
            {sentimentDirection === 'aligned' ? (
              <>
                <CheckCircle className="w-5 h-5 text-bullish mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-bullish">Sentiment & Price Aligned</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Market sentiment aligns with price action — bullish signals confirmed by
                    movement.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-bearish mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-bearish">Sentiment & Price Diverging</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Market sentiment diverges from price movement — potential reversal or
                    volatility.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
