/**
 * Advanced Analytics Engine for Market Trend Predictions
 * Provides:
 * - Trend analysis and predictions using linear regression
 * - Sentiment correlation with market movements
 * - Volatility calculations
 * - Support/Resistance level detection
 */

export interface TrendPoint {
  timestamp: number
  value: number
  sentiment?: number
}

export interface TrendPrediction {
  currentValue: number
  predictedValue: number
  direction: 'up' | 'down' | 'stable'
  confidence: number // 0-100%
  slope: number // rate of change
  changePercent: number
  trendStrength: 'strong' | 'moderate' | 'weak' // based on R² value
  supportLevel?: number
  resistanceLevel?: number
  timeframe: '1h' | '24h' | '7d'
}

export interface SentimentCorrelation {
  sentimentScore: number // -1 to 1
  priceCorrelation: number // -1 to 1
  strength: 'strong' | 'moderate' | 'weak'
  direction: 'aligned' | 'diverging'
  predictiveValue: number // 0-100% confidence
}

export interface MarketAnalytics {
  predictions: TrendPrediction[]
  volatility: number // percentage
  sentimentCorrelation: SentimentCorrelation
  priceHistory: number[]
  movingAverages: {
    ma7: number
    ma14: number
    ma30: number
  }
  changeMetrics: {
    change1h: number
    change24h: number
    change7d: number
  }
}

/**
 * Linear regression using least squares method
 * Returns slope and intercept for predicting future values
 */
function linearRegression(points: TrendPoint[]): {
  slope: number
  intercept: number
  rSquared: number
} {
  if (points.length < 2) {
    return { slope: 0, intercept: 0, rSquared: 0 }
  }

  const n = points.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0
  let sumY2 = 0

  for (let i = 0; i < n; i++) {
    const x = i // x represents position in sequence
    const y = points[i].value

    sumX += x
    sumY += y
    sumXY += x * y
    sumX2 += x * x
    sumY2 += y * y
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Calculate R² (coefficient of determination)
  const meanY = sumY / n
  let ssTotal = 0
  let ssResidual = 0

  for (let i = 0; i < n; i++) {
    const predicted = intercept + slope * i
    const actual = points[i].value
    ssTotal += (actual - meanY) * (actual - meanY)
    ssResidual += (actual - predicted) * (actual - predicted)
  }

  const rSquared = 1 - ssResidual / ssTotal

  return { slope, intercept, rSquared }
}

/**
 * Calculate moving averages
 */
function calculateMovingAverages(
  values: number[],
  periods: number[] = [7, 14, 30]
): Record<string, number> {
  const result: Record<string, number> = {}

  for (const period of periods) {
    if (values.length >= period) {
      const sum = values.slice(-period).reduce((a, b) => a + b, 0)
      result[`ma${period}`] = sum / period
    }
  }

  return result
}

/**
 * Calculate volatility (standard deviation of returns)
 */
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0

  const returns: number[] = []
  for (let i = 1; i < prices.length; i++) {
    const ret = (prices[i] - prices[i - 1]) / prices[i - 1]
    returns.push(ret)
  }

  const mean = returns.reduce((a, b) => a + b) / returns.length
  const variance = returns.reduce((sum, ret) => sum + (ret - mean) ** 2, 0) / returns.length
  return Math.sqrt(variance) * 100 // Convert to percentage
}

/**
 * Detect support and resistance levels
 * Uses local minima and maxima from price history
 */
function detectSupportResistance(prices: number[]): {
  supportLevel: number
  resistanceLevel: number
} {
  if (prices.length < 5) {
    return {
      supportLevel: Math.min(...prices),
      resistanceLevel: Math.max(...prices)
    }
  }

  // Find local minima (support) and maxima (resistance) in last 20 points
  const recentPrices = prices.slice(-20)
  let supportLevel = Math.min(...recentPrices)
  let resistanceLevel = Math.max(...recentPrices)

  // Weight recent prices more heavily
  const weights = recentPrices.map((_, i) => (i + 1) / recentPrices.length)
  const weightedLow =
    recentPrices.reduce((sum, price, i) => {
      if (price === supportLevel) return sum + price * weights[i]
      return sum
    }, 0) / weights.reduce((a, b) => a + b)

  const weightedHigh =
    recentPrices.reduce((sum, price, i) => {
      if (price === resistanceLevel) return sum + price * weights[i]
      return sum
    }, 0) / weights.reduce((a, b) => a + b)

  return {
    supportLevel: weightedLow || supportLevel,
    resistanceLevel: weightedHigh || resistanceLevel
  }
}

/**
 * Predict future price movement
 */
export function predictTrend(
  priceHistory: TrendPoint[],
  timeframe: '1h' | '24h' | '7d' = '24h'
): TrendPrediction {
  const { slope, intercept, rSquared } = linearRegression(priceHistory)

  const currentValue = priceHistory[priceHistory.length - 1].value
  const lookAhead = timeframe === '1h' ? 12 : timeframe === '24h' ? 24 : 168 // hours ahead
  const predictedValue = intercept + slope * (priceHistory.length - 1 + lookAhead)

  const changePercent = ((predictedValue - currentValue) / currentValue) * 100
  const direction: 'up' | 'down' | 'stable' =
    Math.abs(changePercent) < 1 ? 'stable' : changePercent > 0 ? 'up' : 'down'

  // Confidence based on trend strength (R²) and changePercent magnitude
  let confidence = Math.min(100, Math.abs(changePercent) * 2 + rSquared * 30)
  confidence = Math.max(40, confidence) // Minimum 40% confidence

  const trendStrength: 'strong' | 'moderate' | 'weak' =
    rSquared > 0.7 ? 'strong' : rSquared > 0.4 ? 'moderate' : 'weak'

  const prices = priceHistory.map(p => p.value)
  const { supportLevel, resistanceLevel } = detectSupportResistance(prices)

  return {
    currentValue,
    predictedValue,
    direction,
    confidence,
    slope,
    changePercent,
    trendStrength,
    supportLevel,
    resistanceLevel,
    timeframe
  }
}

/**
 * Correlate market sentiment with price movements
 */
export function analyzeSentimentCorrelation(
  priceHistory: TrendPoint[],
  sentimentScores: number[]
): SentimentCorrelation {
  if (priceHistory.length < 2 || sentimentScores.length < 2) {
    return {
      sentimentScore: 0,
      priceCorrelation: 0,
      strength: 'weak',
      direction: 'aligned',
      predictiveValue: 0
    }
  }

  // Normalize data for correlation calculation
  const prices = priceHistory.map(p => p.value)
  const returns = []
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
  }

  const alignedSentiments = sentimentScores.slice(0, returns.length)

  // Calculate Pearson correlation
  const meanReturns = returns.reduce((a, b) => a + b) / returns.length
  const meanSentiment = alignedSentiments.reduce((a, b) => a + b) / alignedSentiments.length

  let numerator = 0
  let denomX = 0
  let denomY = 0

  for (let i = 0; i < returns.length; i++) {
    const dx = returns[i] - meanReturns
    const dy = alignedSentiments[i] - meanSentiment
    numerator += dx * dy
    denomX += dx * dx
    denomY += dy * dy
  }

  const correlation = numerator / Math.sqrt(denomX * denomY)
  const currentSentiment = alignedSentiments[alignedSentiments.length - 1]
  const direction = correlation > 0.3 ? 'aligned' : correlation < -0.3 ? 'diverging' : 'aligned'

  // Determine correlation strength
  const absCorr = Math.abs(correlation)
  const strength: 'strong' | 'moderate' | 'weak' =
    absCorr > 0.6 ? 'strong' : absCorr > 0.3 ? 'moderate' : 'weak'

  // Predictive value = how reliably sentiment predicts price movement
  const predictiveValue = Math.min(100, (absCorr + 1) * 50) // 0-100%

  return {
    sentimentScore: currentSentiment,
    priceCorrelation: correlation,
    strength,
    direction,
    predictiveValue
  }
}

/**
 * Complete market analysis combining all metrics
 */
export function analyzeMarket(
  priceHistory: TrendPoint[],
  sentimentScores: number[] = []
): MarketAnalytics {
  const prices = priceHistory.map(p => p.value)

  // Calculate all metrics
  const predictions = [
    predictTrend(priceHistory, '1h'),
    predictTrend(priceHistory, '24h'),
    predictTrend(priceHistory, '7d')
  ]

  const volatility = calculateVolatility(prices)
  const movingAverages = calculateMovingAverages(prices)

  // Calculate change metrics
  const getChangePercent = (length: number) =>
    prices.length > length
      ? ((prices[prices.length - 1] - prices[prices.length - length]) /
          prices[prices.length - length]) *
        100
      : 0

  const changeMetrics = {
    change1h: getChangePercent(12),
    change24h: getChangePercent(24),
    change7d: getChangePercent(168)
  }

  const sentimentCorrelation = analyzeSentimentCorrelation(priceHistory, sentimentScores)

  return {
    predictions,
    volatility,
    sentimentCorrelation,
    priceHistory: prices,
    movingAverages: movingAverages as any,
    changeMetrics
  }
}
