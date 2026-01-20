import type { Signal } from '../types'

const SOURCES = ['Reuters', 'Bloomberg', 'CNBC', 'Google News', 'r/cryptocurrency', 'r/stocks', 'r/wallstreetbets']
const MARKETS = ['BTC', 'ETH', 'SPX', 'GOLD', 'OIL', 'FED', 'TECH', 'ELECTION']

const TITLES = {
  BTC: [
    'Bitcoin surges past $50,000 on institutional demand',
    'Federal Reserve signals crypto-friendly regulation ahead',
    'Major bank announces Bitcoin custody services',
    'Bitcoin mining hash rate reaches new ATH',
    'Cryptographic breakthrough bolsters blockchain security'
  ],
  ETH: [
    'Ethereum merge complete, energy usage down 99.95%',
    'DeFi protocols hit $50B TVL milestone',
    'Ethereum layer-2 scaling solutions gain adoption',
    'Smart contract innovation drives ETH demand',
    'Institutional investors enter Ethereum market'
  ],
  SPX: [
    'S&P 500 reaches record high amid tech rally',
    'Market volatility decreases as inflation moderates',
    'Tech giants drive stock market performance',
    'Economic data beats expectations',
    'Earnings season delivers strong results'
  ],
  FED: [
    'Federal Reserve holds interest rates steady',
    'Chair Powell hints at rate cut potential',
    'Inflation data surprises to downside',
    'Bank stress test results exceed expectations',
    'Fed announces new quantitative easing program'
  ],
  TECH: [
    'Nvidia releases new AI accelerator chip',
    'Major AI breakthrough in language models',
    'Tech sector leads market gains',
    'Semiconductor shortage easing',
    'Cloud computing demand surges'
  ]
}

const SUMMARIES = {
  bullish: [
    'Strong technical signals suggest further upside potential.',
    'Market sentiment shows overwhelming optimism for the asset.',
    'Key support levels holding, momentum remains positive.',
    'Institutional buyers accumulating positions ahead of rally.'
  ],
  bearish: [
    'Technical breakdown signals potential further decline.',
    'Selling pressure intensifies as confidence wanes.',
    'Resistance levels failing to hold support.',
    'Large holders preparing to exit positions.'
  ],
  neutral: [
    'Market consolidation phase with no clear direction.',
    'Mixed signals from both bulls and bears.',
    'Awaiting key economic data before next move.',
    'Range-bound trading continues.'
  ]
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(hoursAgo: number): string {
  const now = new Date()
  const date = new Date(now.getTime() - Math.random() * hoursAgo * 60 * 60 * 1000)
  return date.toISOString()
}

function generateSentiment(): number {
  return Math.random() * 2 - 1
}

function generateImpact(sentiment: number): number {
  return Math.max(0.2, Math.random() * (0.8 + Math.abs(sentiment) * 0.3))
}

export function generateMockSignals(query: string, count: number = 15): Signal[] {
  const signals: Signal[] = []
  const relatedMarkets = MARKETS.filter(m => 
    query.toLowerCase().includes(m.toLowerCase()) || Math.random() > 0.7
  ).slice(0, 3)

  for (let i = 0; i < count; i++) {
    const sentiment = generateSentiment()
    const marketKey = relatedMarkets[0] || randomElement(MARKETS)
    const titlePool = TITLES[marketKey as keyof typeof TITLES] || TITLES.BTC
    
    const sentimentType = sentiment > 0.2 ? 'bullish' : sentiment < -0.2 ? 'bearish' : 'neutral'
    const summary = randomElement(SUMMARIES[sentimentType as keyof typeof SUMMARIES])

    signals.push({
      source: randomElement(SOURCES),
      title: randomElement(titlePool),
      summary,
      date: randomDate(48),
      url: `https://example.com/${Math.random().toString(36).substring(7)}`,
      category: Math.random() > 0.5 ? 'news' : 'social',
      impact: generateImpact(sentiment),
      sentiment,
      relatedMarkets: relatedMarkets.length > 0 ? relatedMarkets : [randomElement(MARKETS)]
    })
  }

  return signals.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
}

export function generateChartData(signals: Signal[]) {
  // Color palette (using CSS variable values)
  const colors = {
    bullish: 'oklch(0.65 0.2 145)',      // var(--color-bullish) / #22c55e
    bearish: 'oklch(0.55 0.2 25)',       // var(--color-bearish) / #ef4444
    neutral: 'oklch(0.6 0.01 260)',      // var(--color-neutral) / #94a3b8
    impactHigh: 'oklch(0.55 0.2 25)',    // Red
    impactMed: 'oklch(0.7 0.15 60)',     // Yellow
    impactLow: 'oklch(0.55 0.15 250)'    // Purple
  }

  // Sentiment distribution
  const sentimentCounts = {
    bullish: signals.filter(s => s.sentiment > 0.2).length,
    neutral: signals.filter(s => s.sentiment >= -0.2 && s.sentiment <= 0.2).length,
    bearish: signals.filter(s => s.sentiment < -0.2).length
  }

  // Impact distribution
  const impactCounts = {
    high: signals.filter(s => s.impact >= 0.7).length,
    medium: signals.filter(s => s.impact >= 0.4 && s.impact < 0.7).length,
    low: signals.filter(s => s.impact < 0.4).length
  }

  // Source breakdown
  const sources = {} as Record<string, number>
  signals.forEach(s => {
    sources[s.source] = (sources[s.source] || 0) + 1
  })
  const sourceData = Object.entries(sources)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  // Timeline (hourly buckets)
  const now = new Date()
  const timeline = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
    const hourStr = `${hour.getHours().toString().padStart(2, '0')}:00`
    
    const signalsInHour = signals.filter(s => {
      const signalTime = new Date(s.date || '')
      return signalTime.getHours() === hour.getHours()
    })

    return {
      time: hourStr,
      bullish: signalsInHour.filter(s => s.sentiment > 0.2).length,
      bearish: signalsInHour.filter(s => s.sentiment < -0.2).length,
      neutral: signalsInHour.filter(s => s.sentiment >= -0.2 && s.sentiment <= 0.2).length,
      total: signalsInHour.length
    }
  }).reverse()

  return {
    sentiment: [
      { name: 'bullish', value: sentimentCounts.bullish, fill: colors.bullish },
      { name: 'neutral', value: sentimentCounts.neutral, fill: colors.neutral },
      { name: 'bearish', value: sentimentCounts.bearish, fill: colors.bearish }
    ],
    impact: [
      { name: 'high', value: impactCounts.high, fill: colors.impactHigh },
      { name: 'med', value: impactCounts.medium, fill: colors.impactMed },
      { name: 'low', value: impactCounts.low, fill: colors.impactLow }
    ],
    sources: sourceData,
    timeline: timeline.filter(t => t.total > 0)
  }
}

export function generateMockStats(signals: Signal[]) {
  return {
    total: signals.length,
    avgSentiment: signals.reduce((sum, s) => sum + s.sentiment, 0) / signals.length,
    avgImpact: signals.reduce((sum, s) => sum + s.impact, 0) / signals.length,
    bullishCount: signals.filter(s => s.sentiment > 0.2).length,
    bearishCount: signals.filter(s => s.sentiment < -0.2).length,
    highImpactCount: signals.filter(s => s.impact >= 0.7).length
  }
}
