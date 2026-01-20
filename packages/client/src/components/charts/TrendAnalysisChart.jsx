import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ReferenceLine
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'

/**
 * Comprehensive trend analysis visualization
 * @param {Object} props
 * @param {Array} props.priceHistory - Array of TrendPoint objects
 * @param {Object} props.analytics - MarketAnalytics object from analyzeMarket()
 * @param {String} props.marketName - Optional market name for display
 */
export function TrendAnalysisChart({ priceHistory, analytics, marketName = 'Market' }) {
  if (!priceHistory || priceHistory.length === 0 || !analytics) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No price history available for trend analysis
        </CardContent>
      </Card>
    )
  }

  // Safety checks for analytics structure
  if (!analytics.predictions || analytics.predictions.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Insufficient data for trend analysis
        </CardContent>
      </Card>
    )
  }

  const prediction24h = analytics.predictions[1] // 24h prediction
  const sentiment = analytics.sentimentCorrelation

  // Prepare chart data
  const chartData = priceHistory.map((point, idx) => ({
    timestamp: idx,
    price: point.value,
    sentiment: point.sentiment || 0,
    ma7: analytics.movingAverages.ma7 || 0,
    ma14: analytics.movingAverages.ma14 || 0,
    ma30: analytics.movingAverages.ma30 || 0
  }))

  // Add predicted data point
  const lastPrice = priceHistory[priceHistory.length - 1].value
  chartData.push({
    timestamp: chartData.length,
    price: prediction24h.predictedValue,
    sentiment: 0,
    ma7: 0,
    ma14: 0,
    ma30: 0
  })

  return (
    <div className="space-y-4">
      {/* Trend Prediction Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">24h Trend Analysis</CardTitle>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono ${
                prediction24h.direction === 'up'
                  ? 'bg-bullish/20 text-bullish'
                  : prediction24h.direction === 'down'
                    ? 'bg-bearish/20 text-bearish'
                    : 'bg-muted/20 text-muted-foreground'
              }`}
            >
              {prediction24h.direction === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : prediction24h.direction === 'down' ? (
                <TrendingDown className="w-4 h-4" />
              ) : null}
              {prediction24h.direction.toUpperCase()}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Current Price */}
            <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
              <p className="text-xs text-muted-foreground font-mono mb-1">Current</p>
              <p className="text-lg font-semibold font-mono text-primary">{lastPrice.toFixed(4)}</p>
            </div>

            {/* Predicted Price */}
            <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
              <p className="text-xs text-muted-foreground font-mono mb-1">Predicted (24h)</p>
              <p className="text-lg font-semibold font-mono text-primary">
                {prediction24h.predictedValue.toFixed(4)}
              </p>
              <p
                className={`text-xs font-mono mt-1 ${
                  prediction24h.changePercent > 0 ? 'text-bullish' : 'text-bearish'
                }`}
              >
                {prediction24h.changePercent > 0 ? '+' : ''}
                {prediction24h.changePercent.toFixed(2)}%
              </p>
            </div>

            {/* Confidence */}
            <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
              <p className="text-xs text-muted-foreground font-mono mb-1">Confidence</p>
              <p className="text-lg font-semibold font-mono text-primary">
                {prediction24h.confidence.toFixed(0)}%
              </p>
              <Badge variant="outline" className="mt-1 text-xs px-1.5">
                {prediction24h.trendStrength}
              </Badge>
            </div>
          </div>

          {/* Support & Resistance */}
          {prediction24h.supportLevel && prediction24h.resistanceLevel && (
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/30">
              <div>
                <p className="text-xs text-muted-foreground font-mono mb-1">Support</p>
                <p className="text-sm font-semibold font-mono text-bullish">
                  {prediction24h.supportLevel.toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-mono mb-1">Resistance</p>
                <p className="text-sm font-semibold font-mono text-bearish">
                  {prediction24h.resistanceLevel.toFixed(4)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Chart with Moving Averages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Price Trend & Moving Averages</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 260)" />
                <XAxis
                  dataKey="timestamp"
                  stroke="oklch(0.6 0.01 260)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="oklch(0.6 0.01 260)" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(0.1 0.01 260)',
                    border: '1px solid oklch(0.22 0.01 260)',
                    borderRadius: '6px'
                  }}
                  formatter={value => (typeof value === 'number' ? value.toFixed(4) : value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="oklch(0.65 0.2 145)"
                  dot={false}
                  strokeWidth={2}
                  name="Price"
                  isAnimationActive={true}
                />
                <Line
                  type="monotone"
                  dataKey="ma7"
                  stroke="oklch(0.65 0.2 145)"
                  strokeOpacity={0.6}
                  dot={false}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="MA7"
                />
                <Line
                  type="monotone"
                  dataKey="ma14"
                  stroke="oklch(0.65 0.2 145)"
                  strokeOpacity={0.4}
                  dot={false}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="MA14"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Correlation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sentiment Correlation Analysis</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Sentiment Score */}
            <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
              <p className="text-xs text-muted-foreground font-mono mb-1">Sentiment Score</p>
              <p className="text-lg font-semibold font-mono text-primary">
                {sentiment.sentimentScore.toFixed(2)}
              </p>
            </div>

            {/* Price Correlation */}
            <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
              <p className="text-xs text-muted-foreground font-mono mb-1">Price Correlation</p>
              <p className="text-lg font-semibold font-mono text-primary">
                {sentiment.priceCorrelation.toFixed(3)}
              </p>
            </div>

            {/* Correlation Strength */}
            <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
              <p className="text-xs text-muted-foreground font-mono mb-1">Strength</p>
              <Badge variant="outline" className="text-xs">
                {sentiment.strength}
              </Badge>
            </div>

            {/* Predictive Value */}
            <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
              <p className="text-xs text-muted-foreground font-mono mb-1">Predictive Value</p>
              <p className="text-lg font-semibold font-mono text-primary">
                {sentiment.predictiveValue.toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Direction Indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              sentiment.direction === 'aligned'
                ? 'bg-bullish/10 border-bullish/20'
                : 'bg-bearish/10 border-bearish/20'
            }`}
          >
            {sentiment.direction === 'aligned' ? (
              <>
                <CheckCircle className="w-4 h-4 text-bullish" />
                <span className="text-sm text-bullish font-mono">Sentiment & Price: Aligned</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-bearish" />
                <span className="text-sm text-bearish font-mono">Sentiment & Price: Diverging</span>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {sentiment.direction === 'aligned'
              ? 'Market sentiment is moving in line with price action. Strong predictive signal.'
              : 'Market sentiment diverges from price movement. Potential reversal or weakness ahead.'}
          </p>
        </CardContent>
      </Card>

      {/* Volatility & Risk */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Risk Metrics</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Volatility */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-mono">24h Volatility</p>
                <p className="text-sm font-semibold font-mono text-primary">
                  {analytics.volatility.toFixed(2)}%
                </p>
              </div>
              <div className="w-full h-2 bg-border/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all"
                  style={{ width: `${Math.min(100, analytics.volatility * 2)}%` }}
                />
              </div>
            </div>

            {/* Change Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/30">
              {['change1h', 'change24h', 'change7d'].map((key, idx) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground font-mono mb-1">
                    {['1h', '24h', '7d'][idx]}
                  </p>
                  <p
                    className={`text-sm font-semibold font-mono ${
                      analytics.changeMetrics[key] > 0 ? 'text-bullish' : 'text-bearish'
                    }`}
                  >
                    {analytics.changeMetrics[key] > 0 ? '+' : ''}
                    {analytics.changeMetrics[key].toFixed(2)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
