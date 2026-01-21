/**
 * Advanced Analytics Engine for Market Trend Predictions
 * Provides:
 * - Trend analysis and predictions using linear regression (d3-regression)
 * - Sentiment correlation with market movements (simple-statistics)
 * - Volatility calculations with confidence intervals
 * - Support/Resistance level detection
 * - Technical indicators (Bollinger Bands, RSI, MACD)
 */

import { regressionLinear } from 'd3-regression'
import * as ss from 'simple-statistics'

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
  confidenceInterval?: {
    lower: number
    upper: number
  }
}

export interface SentimentCorrelation {
  sentimentScore: number // -1 to 1
  priceCorrelation: number // -1 to 1
  strength: 'strong' | 'moderate' | 'weak'
  direction: 'aligned' | 'diverging'
  predictiveValue: number // 0-100% confidence
}

export interface BollingerBands {
  upper: number[]
  middle: number[]
  lower: number[]
}

export interface TechnicalIndicators {
  rsi?: number // Relative Strength Index (0-100)
  bollingerBands?: BollingerBands
  macd?: {
    macd: number
    signal: number
    histogram: number
  }
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
  technicalIndicators?: TechnicalIndicators
}

/**
 * Linear regression using d3-regression
 * Returns slope, intercept, R², and confidence intervals
 */
function linearRegression(points: TrendPoint[]): {
  slope: number
  intercept: number
  rSquared: number
  confidenceInterval: { lower: number; upper: number } | null
} {
  if (points.length < 2) {
    return { slope: 0, intercept: 0, rSquared: 0, confidenceInterval: null }
  }

  // Prepare data for d3-regression: [x, y] pairs where x is index
  const data: [number, number][] = points.map((p, i) => [i, p.value])

  // Create regression - d3-regression API is simpler than expected
  const regression = regressionLinear()(data)

  if (!regression) {
    return { slope: 0, intercept: 0, rSquared: 0, confidenceInterval: null }
  }

  // d3-regression returns object with properties: a (slope), b (intercept)
  // Formula: y = a*x + b
  const slope = regression.a
  const intercept = regression.b

  // Calculate R² manually (using residuals)
  const actual = data.map(d => d[1])
  const predicted = data.map(d => intercept + slope * d[0])

  const meanActual = ss.mean(actual)
  const ssTotal = actual.reduce((sum, val) => sum + Math.pow(val - meanActual, 2), 0)
  const ssResidual = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0)
  const rSquared = ssTotal > 0 ? Math.max(0, Math.min(1, 1 - ssResidual / ssTotal)) : 0

  // Calculate confidence interval (95% CI)
  const residuals = actual.map((y, i) => y - predicted[i])
  const stdError = ss.standardDeviation(residuals)

  // Predict next value
  const nextX = points.length
  const nextPredicted = intercept + slope * nextX

  // 95% confidence interval = ±1.96 * standard error
  const confidenceInterval = {
    lower: nextPredicted - 1.96 * stdError,
    upper: nextPredicted + 1.96 * stdError
  }

  return { slope, intercept, rSquared, confidenceInterval }
}

/**
 * Calculate moving averages using simple-statistics
 */
function calculateMovingAverages(
  values: number[],
  periods: number[] = [7, 14, 30]
): Record<string, number> {
  const result: Record<string, number> = {}

  for (const period of periods) {
    if (values.length >= period) {
      const slice = values.slice(-period)
      result[`ma${period}`] = ss.mean(slice)
    }
  }

  return result
}

/**
 * Calculate volatility using simple-statistics standard deviation
 * @returns {number} Volatility as percentage (e.g., 5.2 means 5.2% volatility)
 */
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0

  const returns: number[] = []
  for (let i = 1; i < prices.length; i++) {
    const ret = (prices[i] - prices[i - 1]) / prices[i - 1]
    returns.push(ret)
  }

  // Use simple-statistics for standard deviation
  const stdDev = ss.standardDeviation(returns)
  return stdDev * 100 // Returns percentage (5.2 = 5.2% volatility)
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

  const supportLevel = localMins.length > 0 ? ss.mean(localMins) : Math.min(...recentPrices)

  const resistanceLevel = localMaxs.length > 0 ? ss.mean(localMaxs) : Math.max(...recentPrices)

  return {
    supportLevel,
    resistanceLevel
  }
}

/**
 * Calculate Bollinger Bands (price ± 2σ)
 */
export function calculateBollingerBands(
  prices: number[],
  period = 20,
  stdDevMultiplier = 2
): BollingerBands {
  const upper: number[] = []
  const middle: number[] = []
  const lower: number[] = []

  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1)
    const mean = ss.mean(slice)
    const stdDev = ss.standardDeviation(slice)

    middle.push(mean)
    upper.push(mean + stdDevMultiplier * stdDev)
    lower.push(mean - stdDevMultiplier * stdDev)
  }

  return { upper, middle, lower }
}

/**
 * Calculate RSI (Relative Strength Index)
 * RSI = 100 - (100 / (1 + RS))
 * where RS = Average Gain / Average Loss over period
 */
export function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50 // neutral

  const changes: number[] = []
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1])
  }

  const recentChanges = changes.slice(-period)
  const gains = recentChanges.filter(c => c > 0)
  const losses = recentChanges.filter(c => c < 0).map(c => Math.abs(c))

  const avgGain = gains.length > 0 ? ss.mean(gains) : 0
  const avgLoss = losses.length > 0 ? ss.mean(losses) : 0

  // Handle edge cases
  if (avgLoss === 0 && avgGain === 0) return 50 // no movement
  if (avgLoss === 0) return 100 // all gains

  const rs = avgGain / avgLoss
  const rsi = 100 - 100 / (1 + rs)

  return rsi
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(prices: number[]): {
  macd: number
  signal: number
  histogram: number
} | null {
  if (prices.length < 26) return null

  // Calculate EMAs
  const ema12 = calculateEMA(prices, 12)
  const ema26 = calculateEMA(prices, 26)

  if (ema12.length === 0 || ema26.length === 0) return null

  // MACD line = EMA12 - EMA26
  const macdLine = ema12[ema12.length - 1] - ema26[ema26.length - 1]

  // Signal line = 9-period EMA of MACD
  // Simplified: use last 9 MACD values mean
  const macdValues = ema12.slice(-9).map((v, i) => v - ema26[ema26.length - 9 + i])
  const signal = ss.mean(macdValues)

  // Histogram = MACD - Signal
  const histogram = macdLine - signal

  return { macd: macdLine, signal, histogram }
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period) return []

  const k = 2 / (period + 1)
  const emaValues: number[] = []

  // Start with SMA for first EMA value
  const firstSMA = ss.mean(prices.slice(0, period))
  emaValues.push(firstSMA)

  // Calculate EMA for remaining values
  for (let i = period; i < prices.length; i++) {
    const ema = prices[i] * k + emaValues[emaValues.length - 1] * (1 - k)
    emaValues.push(ema)
  }

  return emaValues
}

/**
 * Predict future price movement using linear regression with confidence intervals
 */
export function predictTrend(
  priceHistory: TrendPoint[],
  timeframe: '1h' | '24h' | '7d' = '24h'
): TrendPrediction {
  const { slope, intercept, rSquared, confidenceInterval } = linearRegression(priceHistory)

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
    timeframe,
    confidenceInterval: confidenceInterval || undefined
  }
}

/**
 * Correlate market sentiment with price movements using Pearson correlation
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

  // Use simple-statistics for Pearson correlation
  let correlation = 0
  try {
    correlation = ss.sampleCorrelation(returns, alignedSentiments)
    // Handle NaN case (can happen if all values are identical)
    if (isNaN(correlation)) correlation = 0
  } catch (e) {
    correlation = 0
  }

  const currentSentiment = alignedSentiments[alignedSentiments.length - 1] || 0
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

  // Calculate technical indicators
  const technicalIndicators: TechnicalIndicators = {}

  // RSI (if we have enough data)
  if (prices.length >= 15) {
    technicalIndicators.rsi = calculateRSI(prices, 14)
  }

  // Bollinger Bands (if we have enough data)
  if (prices.length >= 20) {
    technicalIndicators.bollingerBands = calculateBollingerBands(prices, 20, 2)
  }

  // MACD (if we have enough data)
  if (prices.length >= 26) {
    const macd = calculateMACD(prices)
    if (macd) technicalIndicators.macd = macd
  }

  return {
    predictions,
    volatility,
    sentimentCorrelation,
    priceHistory: prices,
    movingAverages: movingAverages as any,
    changeMetrics,
    technicalIndicators
  }
}
