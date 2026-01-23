import axios from 'axios'
import NodeCache from 'node-cache'
import type { Signal } from '../types.js'
import { config } from '../config.js'

const cache = new NodeCache({ stdTTL: 300 })

// Rate Limiting With Exponential Backoff
interface RetryConfig {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2
}

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  source: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: any
  let delayMs = config.initialDelayMs

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      const statusCode = error.response?.status

      // 429 = Rate Limited, 503 = Service Unavailable - retry with backoff
      if ((statusCode === 429 || statusCode === 503) && attempt < config.maxRetries) {
        console.warn(
          `[${source}] ⏳ Rate Limited (HTTP ${statusCode}), Retrying In ${delayMs}ms (Attempt ${attempt + 1}/${config.maxRetries})`
        )
        await new Promise(resolve => setTimeout(resolve, delayMs))
        delayMs = Math.min(delayMs * config.backoffMultiplier, config.maxDelayMs)
        continue
      }

      // Other errors - don't retry
      throw error
    }
  }

  throw lastError
}

async function fetchNewsAPI(query: string): Promise<Signal[]> {
  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) {
    console.warn('[newsapi] ⚠️  NEWS_API_KEY not set, skipping')
    return []
  }

  try {
    console.log(`[newsapi] 🔍 fetching for query: "${query}"`)
    const articles = await fetchWithRetry(async () => {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          apiKey,
          q: query,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 2
        },
        timeout: 8000
      })
      return response.data.articles || []
    }, 'newsapi')

    console.log(`[newsapi] ✅ fetched ${articles.length} articles`)

    return articles.map((article: any) => ({
      source: article.source?.name || 'News',
      title: article.title,
      summary: article.description,
      date: article.publishedAt,
      url: article.url,
      category: 'news' as const,
      impact: calculateImpact(article.title),
      sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
      relatedMarkets: extractMarkets(query, article.title)
    }))
  } catch (error) {
    console.error('[newsapi] ❌ ERROR:', error instanceof Error ? error.message : error)
    return []
  }
}

async function fetchGoogleNews(query: string): Promise<Signal[]> {
  if (!config.enableGoogleNews) {
    console.log('[google-news] ⏭️  disabled (ENABLE_GOOGLE_NEWS=false)')
    return []
  }

  try {
    console.log(`[google-news] 🔍 fetching for query: "${query}"`)
    const items = await fetchWithRetry(async () => {
      const response = await axios.get('https://news.google.com/rss/search', {
        params: { q: query, hl: 'en-US', gl: 'US', ceid: 'US:en' },
        headers: { Accept: 'application/rss+xml' },
        timeout: 8000
      })
      return parseRSS(response.data)
    }, 'google-news')

    console.log(`[google-news] ✅ fetched ${items.length} articles`)

    return items.slice(0, 15).map(item => ({
      source: 'Google News',
      title: cleanTitle(item.title),
      summary: item.description,
      date: item.pubDate,
      url: item.link,
      category: 'news' as const,
      impact: calculateImpact(item.title),
      sentiment: analyzeSentiment(item.title),
      relatedMarkets: extractMarkets(query, item.title)
    }))
  } catch (error) {
    console.error('[google-news] ❌ ERROR:', error instanceof Error ? error.message : error)
    return []
  }
}

async function fetchReddit(query: string): Promise<Signal[]> {
  if (!config.enableReddit) {
    console.log('[reddit] ⏭️  disabled (ENABLE_REDDIT=false)')
    return []
  }

  try {
    console.log(`[reddit] 🔍 fetching for query: "${query}"`)
    const posts = await fetchWithRetry(async () => {
      const response = await axios.get('https://www.reddit.com/search.json', {
        params: { q: query, sort: 'new', limit: 15 },
        headers: { 'User-Agent': 'sigint/1.0' },
        timeout: 8000
      })
      return response.data.data.children || []
    }, 'reddit')

    console.log(`[reddit] ✅ fetched ${posts.length} posts`)

    return posts.map((post: any) => ({
      source: `r/${post.data.subreddit}`,
      title: post.data.title,
      summary: post.data.selftext?.substring(0, 200) || undefined,
      date: new Date(post.data.created_utc * 1000).toISOString(),
      url: `https://reddit.com${post.data.permalink}`,
      category: 'social' as const,
      impact: Math.min(post.data.score / 500, 1),
      sentiment: analyzeSentiment(post.data.title),
      relatedMarkets: extractMarkets(query, post.data.title)
    }))
  } catch (error) {
    console.error('[reddit] ❌ ERROR:', error instanceof Error ? error.message : error)
    return []
  }
}

interface RSSItem {
  title: string
  link: string
  description: string
  pubDate: string
}

function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    items.push({
      title: extractTag(match[1], 'title'),
      link: extractTag(match[1], 'link'),
      description: extractTag(match[1], 'description'),
      pubDate: extractTag(match[1], 'pubDate')
    })
  }
  return items
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(
    `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`
  )
  const match = regex.exec(xml)
  return match ? (match[1] || match[2] || '').trim() : ''
}

function cleanTitle(title: string): string {
  return title?.replace(/ - [^-]+$/, '').trim() || title
}

function calculateImpact(text: string): number {
  if (!text) return 0.3
  const lower = text.toLowerCase()

  const high = [
    'breaking',
    'urgent',
    'crash',
    'surge',
    'plunge',
    'record',
    'historic',
    'halt',
    'emergency'
  ]
  const med = ['rise', 'fall', 'gain', 'drop', 'announce', 'report', 'reveal', 'confirm']

  let score = 0.2
  high.forEach(w => {
    if (lower.includes(w)) score += 0.25
  })
  med.forEach(w => {
    if (lower.includes(w)) score += 0.1
  })

  return Math.min(score, 1)
}

function analyzeSentiment(text: string): number {
  if (!text) return 0
  const lower = text.toLowerCase()

  const positive = [
    'surge',
    'gain',
    'rise',
    'win',
    'success',
    'growth',
    'boost',
    'rally',
    'bullish',
    'soar',
    'jump'
  ]
  const negative = [
    'crash',
    'fall',
    'drop',
    'lose',
    'fail',
    'decline',
    'plunge',
    'bearish',
    'sink',
    'tank',
    'risk',
    'fear'
  ]

  let score = 0
  positive.forEach(w => {
    if (lower.includes(w)) score += 0.2
  })
  negative.forEach(w => {
    if (lower.includes(w)) score -= 0.2
  })

  return Math.max(-1, Math.min(1, score))
}

function extractMarkets(query: string, title: string): string[] {
  const markets: string[] = []
  const text = (query + ' ' + (title || '')).toLowerCase()

  const keywords: Record<string, string[]> = {
    BTC: ['bitcoin', 'btc'],
    ETH: ['ethereum', 'eth'],
    SPX: ['s&p', 'sp500', 'stock market'],
    ELECTION: ['election', 'trump', 'biden', 'democrat', 'republican'],
    FED: ['federal reserve', 'fed', 'interest rate', 'fomc'],
    OIL: ['oil', 'crude', 'opec'],
    GOLD: ['gold', 'precious metal'],
    TECH: ['nvidia', 'apple', 'google', 'microsoft', 'ai']
  }

  Object.entries(keywords).forEach(([market, kws]) => {
    if (kws.some(kw => text.includes(kw))) markets.push(market)
  })

  return markets.slice(0, 3)
}

export async function acquireSignals(query: string): Promise<Signal[]> {
  // Check cache first
   const cacheKey = `sig_${query.toLowerCase().replace(/\s+/g, '_')}`
   const cached = cache.get<Signal[]>(cacheKey)
   if (cached) {
     console.log(`[cache] ✅ cache hit for "${query}" (${cached.length} signals)`)
     return cached
   }

   console.log(`[aggregator] 📡 acquiring signals for "${query}"`)
  const [news, google, reddit] = await Promise.all([
    fetchNewsAPI(query),
    fetchGoogleNews(query),
    fetchReddit(query)
  ])

  let signals: Signal[] = [...news, ...google, ...reddit]
  console.log(`[aggregator] 📊 aggregated ${signals.length} total signals`)

  signals.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())

  const seen = new Set<string>()
  signals = signals.filter(s => {
    const key = s.title?.toLowerCase().substring(0, 40)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })

  console.log(`[aggregator] ✅ deduped to ${signals.length} signals`)
  cache.set(cacheKey, signals)
  return signals
}

/**
 * Acquire signals with AI analysis and market data
 * Used by socket.io handler for enhanced response
 */
export async function acquireSignalsWithAnalysis(query: string) {
  const signals = await acquireSignals(query)

  // Import here to avoid circular dependencies
  const { analyzeSignalsWithAI } = await import('./aiIntelligence.js')
  const { getPolymarketMarkets } = await import('./polymarketService.js')
  const { enhanceSignals, analyzeSignalPatterns } = await import('./signalEnhancer.js')

  // Enhance signals with confidence and trend analysis
  const enhancedSignals = enhanceSignals(signals)
  const signalAnalytics = analyzeSignalPatterns(signals)

  const [analysis, markets] = await Promise.all([
    analyzeSignalsWithAI(signals, query),
    getPolymarketMarkets(query)
  ])

  return {
    signals: enhancedSignals,
    signalAnalytics,
    analysis: {
      sentiment: analysis.overallSentiment,
      sentimentScore: analysis.sentimentScore,
      keyFindings: analysis.keyFindings,
      recommendation: analysis.recommendation,
      riskLevel: analysis.riskLevel,
      confidenceLevel: analysis.confidenceLevel
    },
    relatedMarkets: markets.map(m => ({
      marketId: m.market,
      question: m.question,
      description: m.description,
      image: m.image,
      icon: m.icon,
      category: m.category,
      slug: m.slug,
      outcomes: m.outcomes,
      volume24h: m.volume24h,
      liquidity: m.liquidity,
      relevance: m.relevance,
      confidence: m.confidence,
      status: m.status
    }))
  }
}
