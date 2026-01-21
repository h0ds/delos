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

  // Fix: Handle zero ssTotal (flat price line) and ensure R² is in [0, 1]
  const rSquared = ssTotal > 0 ? Math.max(0, Math.min(1, 1 - ssResidual / ssTotal)) : 0

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
 * @returns {number} Volatility as percentage (e.g., 5.2 means 5.2% volatility)
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
  return Math.sqrt(variance) * 100 // Returns percentage (5.2 = 5.2% volatility)
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

  // Find actual local minima and maxima
  const localMins: number[] = []
  const localMaxs: number[] = []

  for (let i = 1; i < recentPrices.length - 1; i++) {
    if (recentPrices[i] < recentPrices[i - 1] && recentPrices[i] < recentPrices[i + 1]) {
      localMins.push(recentPrices[i])
    }
    if (recentPrices[i] > recentPrices[i - 1] && recentPrices[i] > recentPrices[i + 1]) {
      localMaxs.push(recentPrices[i])
    }
  }

  const supportLevel =
    localMins.length > 0
      ? localMins.reduce((a, b) => a + b) / localMins.length
      : Math.min(...recentPrices)

  const resistanceLevel =
    localMaxs.length > 0
      ? localMaxs.reduce((a, b) => a + b) / localMaxs.length
      : Math.max(...recentPrices)

  return {
    supportLevel,
    resistanceLevel
  }
}

/**
 * Predict future price movement using linear regression with proper time-based extrapolation
 */
export function predictTrend(
  priceHistory: TrendPoint[],
  timeframe: '1h' | '24h' | '7d' = '24h'
): TrendPrediction {
  const { slope, intercept, rSquared } = linearRegression(priceHistory)

  const currentValue = priceHistory[priceHistory.length - 1].value

  // Calculate actual time step from data (instead of assuming 1 hour)
  const firstTime = priceHistory[0].timestamp
  const lastTime = priceHistory[priceHistory.length - 1].timestamp
  const avgTimeStep = (lastTime - firstTime) / (priceHistory.length - 1)

  // Convert timeframe to milliseconds
  const lookAheadMs = timeframe === '1h' ? 3600000 : timeframe === '24h' ? 86400000 : 604800000
  const futureSteps = avgTimeStep > 0 ? lookAheadMs / avgTimeStep : 0

  const predictedValue = intercept + slope * (priceHistory.length - 1 + futureSteps)

  const changePercent = ((predictedValue - currentValue) / currentValue) * 100
  const direction: 'up' | 'down' | 'stable' =
    Math.abs(changePercent) < 1 ? 'stable' : changePercent > 0 ? 'up' : 'down'

  // Improved confidence calculation based on R² and volatility penalty
  const volatilityPenalty = Math.min(30, Math.abs(changePercent) / 10)
  let confidence = Math.max(0, rSquared * 100 - volatilityPenalty)
  confidence = Math.max(20, Math.min(95, confidence)) // Realistic bounds [20%, 95%]

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

  // Fix: Prevent division by zero in Pearson correlation
  const denomProduct = denomX * denomY
  const correlation = denomProduct > 0 ? numerator / Math.sqrt(denomProduct) : 0

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
  // Guard: Require at least 2 data points for meaningful analysis
  if (!priceHistory || priceHistory.length < 2) {
    return {
      predictions: [],
      volatility: 0,
      sentimentCorrelation: {
        sentimentScore: 0,
        priceCorrelation: 0,
        strength: 'weak',
        direction: 'aligned',
        predictiveValue: 0
      },
      priceHistory: [],
      movingAverages: { ma7: 0, ma14: 0, ma30: 0 },
      changeMetrics: { change1h: 0, change24h: 0, change7d: 0 }
    }
  }

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
