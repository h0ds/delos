import { Signal } from '../types.js'

export interface DataQualityMetrics {
  freshness: 'fresh' | 'stale' | 'unknown'
  daysOld: number
  sourceCount: number
  averageAge: number
  healthScore: number // 0-100
  warnings: string[]
}

export interface MarketDataQuality {
  source: string
  available: boolean
  count: number
  freshness: 'fresh' | 'stale' | 'unknown'
  lastFetch?: Date
  errors?: string[]
}

/**
 * Calculate overall data quality score
 * Returns 0-100, where 100 is excellent quality
 */
export function calculateDataQualityScore(metrics: {
  signalCount: number
  sourceCount: number
  averageAgeHours: number
  hasErrors: boolean
  marketDataAvailable: boolean
}): number {
  let score = 100

  // Penalty for low signal count
  if (metrics.signalCount < 5) score -= 30
  else if (metrics.signalCount < 15) score -= 15

  // Penalty for single source
  if (metrics.sourceCount === 1) score -= 20
  else if (metrics.sourceCount === 2) score -= 10

  // Penalty for old data
  if (metrics.averageAgeHours > 48) score -= 25
  else if (metrics.averageAgeHours > 24) score -= 15

  // Penalty for errors
  if (metrics.hasErrors) score -= 15

  // Bonus for market data
  if (metrics.marketDataAvailable) score += 10

  return Math.max(0, Math.min(100, score))
}

/**
 * Check if a date is stale (older than threshold)
 */
export function isStaleData(date: Date | string, thresholdHours: number = 24): boolean {
  const dataDate = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const ageHours = (now.getTime() - dataDate.getTime()) / (1000 * 60 * 60)
  return ageHours > thresholdHours
}

/**
 * Calculate average age of signals
 */
export function getAverageSignalAge(signals: Signal[]): number {
  if (signals.length === 0) return 0

  const now = new Date()
  const totalAge = signals.reduce((sum, signal) => {
    if (!signal.date) return sum
    const ageHours = (now.getTime() - new Date(signal.date).getTime()) / (1000 * 60 * 60)
    return sum + Math.max(0, ageHours)
  }, 0)

  return Math.round(totalAge / signals.length)
}

/**
 * Validate signal freshness and quality
 */
export function validateSignalQuality(signals: Signal[]): {
  valid: boolean
  warnings: string[]
  metrics: DataQualityMetrics
} {
  const warnings: string[] = []

  // Check signal count
  if (signals.length === 0) {
    warnings.push('No signals available - using mock data or API is down')
  } else if (signals.length < 5) {
    warnings.push(`Low signal count (${signals.length}) - limited data available`)
  }

  // Check freshness
  const now = new Date()
  let stalestDate = now
  let freshestDate = now

  signals.forEach(signal => {
    if (signal.date) {
      const date = new Date(signal.date)
      if (date < stalestDate) stalestDate = date
      if (date > freshestDate) freshestDate = date
    }
  })

  const stalestAgeHours = (now.getTime() - stalestDate.getTime()) / (1000 * 60 * 60)
  const averageAge = getAverageSignalAge(signals)

  let freshness: 'fresh' | 'stale' | 'unknown' = 'fresh'
  if (stalestAgeHours > 72) {
    freshness = 'stale'
    warnings.push(`Oldest signal is ${Math.round(stalestAgeHours)} hours old`)
  } else if (stalestAgeHours > 24) {
    freshness = 'stale'
    warnings.push(`Some signals over 24 hours old`)
  }

  // Check source diversity
  const sources = new Set(signals.map(s => s.source))
  if (sources.size === 1) {
    warnings.push(`Single data source only (${Array.from(sources)[0]})`)
  }

  // Build metrics
  const metrics: DataQualityMetrics = {
    freshness,
    daysOld: Math.round(stalestAgeHours / 24),
    sourceCount: sources.size,
    averageAge,
    healthScore: calculateDataQualityScore({
      signalCount: signals.length,
      sourceCount: sources.size,
      averageAgeHours: averageAge,
      hasErrors: warnings.length > 0,
      marketDataAvailable: false
    }),
    warnings
  }

  return {
    valid: signals.length > 0,
    warnings,
    metrics
  }
}

/**
 * Generate data quality status message
 */
export function getDataQualityMessage(metrics: DataQualityMetrics): string {
  if (metrics.healthScore >= 80) {
    return '✅ Data Quality: Excellent'
  } else if (metrics.healthScore >= 60) {
    return '⚠️ Data Quality: Adequate'
  } else if (metrics.healthScore >= 40) {
    return '⚠️ Data Quality: Limited'
  } else {
    return '❌ Data Quality: Poor'
  }
}
