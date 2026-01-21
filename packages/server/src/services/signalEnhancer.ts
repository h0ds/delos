/**
 * Enhanced Signal Analysis
 * Provides:
 * - Sentiment trend analysis (is sentiment improving or declining?)
 * - Confidence scoring (how reliable is each signal?)
 * - Signal aggregation and quality metrics
 * - Market impact prediction
 *
 * Uses simple-statistics for statistical calculations
 */

import * as ss from 'simple-statistics'
import type { Signal } from '../types.js'

export interface EnhancedSignal extends Signal {
  confidence: number // 0-100, how reliable is this signal
  trustScore: number // 0-100, based on source and age
  sentimentTrend?: 'strengthening' | 'weakening' | 'stable' // direction of sentiment change
  marketImpact: number // 0-100, estimated impact on related markets
  volatilityPrediction: 'low' | 'medium' | 'high' // expected price volatility
  ageHours: number // hours since signal was published
}

export interface SignalAnalytics {
  aggregateSentiment: number // -1 to 1, overall sentiment direction
  sentimentConsensus: 'strong' | 'moderate' | 'weak' // how much agreement is there?
  sentimentTrend:
    | 'bullish_strengthening'
    | 'bullish_stable'
    | 'bullish_weakening'
    | 'bearish_strengthening'
    | 'bearish_stable'
    | 'bearish_weakening'
    | 'neutral'
  averageConfidence: number // 0-100, average confidence across signals
  dominantCategory: 'news' | 'social' // which source type is more prominent
  dominantSource: string // which specific source appears most
  keyThemes: string[] // main topics discussed across signals
  riskIndicators: string[] // potential risks mentioned
  opportunityIndicators: string[] // potential opportunities mentioned
  volatilityExpected: number // 0-100, expected volatility score
  marketReadiness: number // 0-100, how ready are markets for this news
}

/**
 * Calculate confidence score based on multiple factors
 */
function calculateConfidence(signal: Signal, index: number, totalSignals: number): number {
  let confidence = 50 // baseline

  // Source credibility (news more trusted than social)
  if (signal.category === 'news') {
    confidence += 20
    // News agency credibility boost
    if (
      signal.source &&
      ['Reuters', 'Bloomberg', 'AP News', 'CNN'].some(s => signal.source?.includes(s))
    ) {
      confidence += 15
    }
  } else if (signal.category === 'social') {
    confidence += 5
  }

  // Impact-based confidence (high impact = more scrutinized)
  confidence += Math.min(signal.impact * 15, 15)

  // Recency bonus (more recent signals more relevant)
  const ageHours = getSignalAgeHours(signal)
  if (ageHours < 1) confidence += 10
  else if (ageHours < 6) confidence += 5
  else if (ageHours > 24) confidence -= 10
  else if (ageHours > 48) confidence -= 20

  // Sentiment extremity (extreme sentiment harder to confirm)
  const sentimentAbs = Math.abs(signal.sentiment)
  if (sentimentAbs > 0.8) confidence -= 10
  else if (sentimentAbs > 0.5) confidence -= 5

  return Math.max(20, Math.min(100, confidence))
}

/**
 * Calculate trust score based on source and recency
 */
function calculateTrustScore(signal: Signal): number {
  let trust = 50

  // Source-based trust
  const newsSourceTrust: Record<string, number> = {
    Reuters: 95,
    Bloomberg: 94,
    'AP News': 93,
    CNN: 85,
    CNBC: 85,
    News: 60,
    'Google News': 65
  }

  const source = signal.source || ''
  for (const [key, score] of Object.entries(newsSourceTrust)) {
    if (source.includes(key)) {
      trust = score
      break
    }
  }

  // Social source trust (lower by default)
  if (signal.category === 'social') {
    trust = Math.max(40, trust * 0.7)
  }

  // Recency penalty
  const ageHours = getSignalAgeHours(signal)
  if (ageHours > 72) trust *= 0.7
  else if (ageHours > 48) trust *= 0.85
  else if (ageHours > 24) trust *= 0.95

  return Math.round(Math.max(10, Math.min(100, trust)))
}

/**
 * Predict market impact based on signal characteristics
 */
function predictMarketImpact(signal: Signal, aggregateSentiment: number): number {
  // Base impact from signal's intrinsic importance (0-60)
  let impact = signal.impact * 60

  // Sentiment extremity increases impact (0-20)
  const sentimentAbs = Math.abs(signal.sentiment)
  impact += sentimentAbs * 20

  // Consensus amplifies impact (contrarian signals are often noise) (0-20)
  const alignment = 1 - Math.abs(signal.sentiment - aggregateSentiment)
  impact += alignment * 20

  return Math.round(Math.min(100, Math.max(0, impact)))
}

/**
 * Predict volatility from signal patterns using simple-statistics
 */
function predictVolatility(signals: Signal[]): 'low' | 'medium' | 'high' {
  if (signals.length === 0) return 'low'

  // High volatility indicators:
  // 1. High sentiment divergence (disagreement) - use simple-statistics
  const sentiments = signals.map(s => s.sentiment)
  const stdDev = ss.standardDeviation(sentiments)

  // 2. High average impact
  const avgImpact = ss.mean(signals.map(s => s.impact))

  // 3. Sentiment consensus weakness
  const strongOpinions = signals.filter(s => Math.abs(s.sentiment) > 0.5).length
  const consensusRatio = strongOpinions / signals.length

  const volatilityScore =
    stdDev * 30 + // Sentiment divergence
    avgImpact * 40 + // Impact level
    (1 - consensusRatio) * 30 // Low consensus

  if (volatilityScore > 50) return 'high'
  if (volatilityScore > 30) return 'medium'
  return 'low'
}

/**
 * Detect sentiment trend from signal patterns using simple-statistics
 */
function detectSentimentTrend(signals: Signal[]): 'strengthening' | 'weakening' | 'stable' {
  if (signals.length < 2) return 'stable'

  // Sort by date (newest first)
  const sorted = [...signals].sort(
    (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  )

  // Compare recent vs older signals using simple-statistics mean
  const recent = sorted.slice(0, Math.ceil(sorted.length / 2))
  const older = sorted.slice(Math.ceil(sorted.length / 2))

  const recentAvg = ss.mean(recent.map(s => s.sentiment))
  const olderAvg = ss.mean(older.map(s => s.sentiment))

  const diff = recentAvg - olderAvg
  if (diff > 0.2) return 'strengthening'
  if (diff < -0.2) return 'weakening'
  return 'stable'
}

/**
 * Extract key themes from signals
 */
function extractThemes(signals: Signal[]): string[] {
  const themes: Record<string, number> = {}
  const keywords = {
    Financial: ['price', 'stock', 'market', 'trading', 'investment', 'fund'],
    Technology: ['AI', 'tech', 'software', 'data', 'algorithm', 'digital'],
    Regulation: ['regulation', 'law', 'policy', 'sec', 'legal', 'comply'],
    Earnings: ['earnings', 'profit', 'revenue', 'financial', 'quarter', 'results'],
    Merger: ['merger', 'acquisition', 'buyout', 'deal', 'combine'],
    Management: ['ceo', 'executive', 'management', 'leadership', 'appoint'],
    Partnership: ['partnership', 'collaboration', 'joint', 'strategic', 'team'],
    Global: ['global', 'international', 'country', 'trade', 'tariff']
  }

  signals.forEach(signal => {
    const text = (signal.title + ' ' + (signal.summary || '')).toLowerCase()
    Object.entries(keywords).forEach(([theme, words]) => {
      if (words.some(w => text.includes(w.toLowerCase()))) {
        themes[theme] = (themes[theme] || 0) + 1
      }
    })
  })

  return Object.entries(themes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme)
}

/**
 * Extract risk indicators
 */
function extractRiskIndicators(signals: Signal[]): string[] {
  const risks: string[] = []
  const riskKeywords = [
    'crash',
    'decline',
    'drop',
    'fall',
    'loss',
    'risk',
    'fail',
    'bankrupt',
    'warning',
    'concern'
  ]

  signals.forEach(signal => {
    if (signal.sentiment < -0.5 || signal.impact > 0.7) {
      const text = (signal.title + ' ' + (signal.summary || '')).toLowerCase()
      riskKeywords.forEach(keyword => {
        if (text.includes(keyword) && !risks.includes(keyword)) {
          risks.push(keyword)
        }
      })
    }
  })

  return risks.slice(0, 5)
}

/**
 * Extract opportunity indicators
 */
function extractOpportunityIndicators(signals: Signal[]): string[] {
  const opportunities: string[] = []
  const opportunityKeywords = [
    'surge',
    'jump',
    'growth',
    'gain',
    'rise',
    'boost',
    'opportunity',
    'breakthrough',
    'expansion'
  ]

  signals.forEach(signal => {
    if (signal.sentiment > 0.5 || signal.impact > 0.6) {
      const text = (signal.title + ' ' + (signal.summary || '')).toLowerCase()
      opportunityKeywords.forEach(keyword => {
        if (text.includes(keyword) && !opportunities.includes(keyword)) {
          opportunities.push(keyword)
        }
      })
    }
  })

  return opportunities.slice(0, 5)
}

/**
 * Enhance signals with confidence and sentiment trend analysis
 */
export function enhanceSignals(signals: Signal[]): EnhancedSignal[] {
  // Fix: Proper empty array handling with simple-statistics
  const aggregateSentiment = signals.length > 0 ? ss.mean(signals.map(s => s.sentiment)) : 0

  // Calculate these once outside the loop for O(n) instead of O(n²)
  const globalSentimentTrend = signals.length > 0 ? detectSentimentTrend(signals) : 'stable'
  const globalVolatility = signals.length > 0 ? predictVolatility(signals) : 'low'

  return signals.map((signal, idx) => ({
    ...signal,
    confidence: calculateConfidence(signal, idx, signals.length),
    trustScore: calculateTrustScore(signal),
    marketImpact: predictMarketImpact(signal, aggregateSentiment),
    volatilityPrediction: globalVolatility, // Use cached value
    ageHours: getSignalAgeHours(signal)
  }))
}

/**
 * Get signal age in hours (utility function)
 */
function getSignalAgeHours(signal: Signal): number {
  const signalDate = signal.date ? new Date(signal.date) : new Date()
  const ageMs = Date.now() - signalDate.getTime()
  return Math.max(0, Math.round(ageMs / (1000 * 60 * 60)))
}

/**
 * Analyze aggregate signal patterns using simple-statistics
 */
export function analyzeSignalPatterns(signals: Signal[]): SignalAnalytics {
  if (signals.length === 0) {
    return {
      aggregateSentiment: 0,
      sentimentConsensus: 'weak',
      sentimentTrend: 'neutral',
      averageConfidence: 0,
      dominantCategory: 'news',
      dominantSource: 'Unknown',
      keyThemes: [],
      riskIndicators: [],
      opportunityIndicators: [],
      volatilityExpected: 30,
      marketReadiness: 0
    }
  }

  const sentiments = signals.map(s => s.sentiment)
  const aggregateSentiment = ss.mean(sentiments)

  // Sentiment consensus: how many signals align?
  const alignedCount = sentiments.filter(s => Math.sign(s) === Math.sign(aggregateSentiment)).length
  const consensusRatio = alignedCount / signals.length
  const sentimentConsensus: 'strong' | 'moderate' | 'weak' =
    consensusRatio > 0.7 ? 'strong' : consensusRatio > 0.5 ? 'moderate' : 'weak'

  // Overall sentiment trend
  const trend = detectSentimentTrend(signals)
  let sentimentTrend: SignalAnalytics['sentimentTrend']
  if (aggregateSentiment > 0.3) {
    sentimentTrend =
      trend === 'strengthening'
        ? 'bullish_strengthening'
        : trend === 'weakening'
          ? 'bullish_weakening'
          : 'bullish_stable'
  } else if (aggregateSentiment < -0.3) {
    sentimentTrend =
      trend === 'strengthening'
        ? 'bearish_strengthening'
        : trend === 'weakening'
          ? 'bearish_weakening'
          : 'bearish_stable'
  } else {
    sentimentTrend = 'neutral'
  }

  // Confidence & source analysis
  const enhanced = enhanceSignals(signals)
  const avgConfidence = ss.mean(enhanced.map(s => s.confidence))

  const categories = signals.reduce(
    (acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const sources = signals.reduce(
    (acc, s) => {
      acc[s.source] = (acc[s.source] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const dominantCategory =
    (Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] as any) || 'news'
  const dominantSource = Object.entries(sources).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'

  // Volatility prediction
  const volatilityExpected =
    predictVolatility(signals) === 'high' ? 75 : predictVolatility(signals) === 'medium' ? 50 : 25

  // Market readiness: combination of confidence and consensus
  const marketReadiness = Math.round((avgConfidence * consensusRatio + volatilityExpected) / 2)

  return {
    aggregateSentiment,
    sentimentConsensus,
    sentimentTrend,
    averageConfidence: Math.round(avgConfidence),
    dominantCategory,
    dominantSource,
    keyThemes: extractThemes(signals),
    riskIndicators: extractRiskIndicators(signals),
    opportunityIndicators: extractOpportunityIndicators(signals),
    volatilityExpected,
    marketReadiness
  }
}
