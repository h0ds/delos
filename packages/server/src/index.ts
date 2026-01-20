import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { acquireSignals, acquireSignalsWithAnalysis } from './services/signalAggregator.js'
import { getFeaturedMarkets as getPolymarketFeatured } from './services/polymarketService.js'
import { getFeaturedMarkets as getKalshiFeatured } from './services/kalshiService.js'
import { validateSignalQuality, getDataQualityMessage } from './services/dataQuality.js'
import { config } from './config.js'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData
} from './types.js'

const app = express()
const httpServer = createServer(app)
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
  httpServer,
  {
    cors: config.cors
  }
)

// Request Deduplication: Cache for In-Flight Queries
// Maps Query String -> Promise Of Results
const inFlightQueries = new Map<string, Promise<any>>()

// Featured Markets Cache: Refresh every 5 minutes
interface CachedMarkets {
  markets: any[]
  timestamp: number
}
const featuredMarketsCache: { data: CachedMarkets | null } = { data: null }
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function getFeaturedMarketsWithCache() {
  const now = Date.now()

  // Return cached data if still valid
  if (featuredMarketsCache.data && now - featuredMarketsCache.data.timestamp < CACHE_DURATION) {
    console.log('[cache] ✅ returning cached featured markets')
    return featuredMarketsCache.data.markets
  }

  console.log('[cache] 🔄 refreshing featured markets cache')

  const [polymarkets, kalshiMarkets] = await Promise.all([
    getPolymarketFeatured(),
    getKalshiFeatured()
  ])

  const formatMarket = (m: any, source: string) => ({
    source,
    market: m.market,
    question: m.question,
    description: m.description,
    image: m.image,
    icon: m.icon,
    category: m.category,
    slug: m.slug,
    outcomes: m.outcomes,
    volume24h: m.volume24h,
    liquidity: m.liquidity,
    status: m.status,
    dataFreshness: m.dataFreshness // Include freshness info
  })

  const allMarkets = [
    ...polymarkets.slice(0, 4).map(m => formatMarket(m, 'polymarket')),
    ...kalshiMarkets.slice(0, 4).map(m => formatMarket(m, 'kalshi'))
  ]

  featuredMarketsCache.data = {
    markets: allMarkets,
    timestamp: now
  }

  return allMarkets
}

app.use(cors(config.cors))
app.use(express.json())

app.get('/api/status', (_req, res) => {
  res.json({
    status: 'operational',
    version: '1.0.0',
    sources: ['newsapi', 'google-news', 'reddit'],
    transport: 'websocket',
    environment: config.nodeEnv,
    hasNewsApiKey: !!config.newsApiKey
  })
})

app.get('/api/health', (_req, res) => {
  const health = {
    timestamp: new Date().toISOString(),
    providers: {
      newsapi: {
        enabled: config.enableNewsAPI,
        configured: !!config.newsApiKey,
        status:
          config.enableNewsAPI && config.newsApiKey
            ? 'ready'
            : config.enableNewsAPI
              ? 'missing-key'
              : 'disabled'
      },
      'google-news': {
        enabled: config.enableGoogleNews,
        configured: true,
        status: config.enableGoogleNews ? 'ready' : 'disabled'
      },
      reddit: {
        enabled: config.enableReddit,
        configured: true,
        status: config.enableReddit ? 'ready' : 'disabled'
      },
      deepseek: {
        enabled: config.hasAiApi,
        configured: !!config.aiApiKey,
        status:
          config.hasAiApi && config.aiApiKey
            ? 'ready'
            : config.hasAiApi
              ? 'missing-key'
              : 'disabled'
      },
      polymarket: {
        enabled: config.hasPolymarketApi,
        configured: !!config.polymarketApiKey,
        status:
          config.hasPolymarketApi && config.polymarketApiKey
            ? 'ready'
            : config.hasPolymarketApi
              ? 'missing-key'
              : 'disabled'
      },
      kalshi: {
        enabled: config.hasKalshiApi,
        configured: !!config.kalshiApiKey,
        status:
          config.hasKalshiApi && config.kalshiApiKey
            ? 'ready'
            : config.hasKalshiApi
              ? 'missing-key'
              : 'ready' // Kalshi doesn't require API key for public markets
      }
    }
  }

  res.json(health)
})

app.get('/api/data-quality', async (_req, res) => {
  try {
    // Fetch latest data to assess quality
    const [polymarkets, kalshiMarkets] = await Promise.all([
      getPolymarketFeatured(),
      getKalshiFeatured()
    ])

    const allMarkets = [...polymarkets, ...kalshiMarkets]

    // Validate market data quality
    const marketDataQuality = {
      polymarket: {
        available: polymarkets.length > 0,
        count: polymarkets.length,
        hasStaleData: polymarkets.some(m => m.dataFreshness?.isStale),
        warnings: polymarkets
          .filter(m => m.dataFreshness?.warning)
          .map(m => m.dataFreshness?.warning)
      },
      kalshi: {
        available: kalshiMarkets.length > 0,
        count: kalshiMarkets.length,
        hasStaleData: kalshiMarkets.some(m => m.dataFreshness?.isStale),
        warnings: kalshiMarkets
          .filter(m => m.dataFreshness?.warning)
          .map(m => m.dataFreshness?.warning)
      }
    }

    const metrics = {
      timestamp: new Date().toISOString(),
      marketData: marketDataQuality,
      aggregatedMetrics: {
        totalMarkets: allMarkets.length,
        averageAge: Math.round(
          allMarkets.reduce((sum, m) => sum + (m.dataFreshness?.daysOld || 0), 0) /
            Math.max(1, allMarkets.length)
        ),
        qualityScore: calculateMarketQualityScore(allMarkets),
        overallStatus:
          allMarkets.length > 4 ? 'adequate' : allMarkets.length > 0 ? 'limited' : 'critical'
      }
    }

    res.json(metrics)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
})

function calculateMarketQualityScore(markets: any[]): number {
  let score = 100

  // Penalty for low market count
  if (markets.length < 4) score -= 40
  else if (markets.length < 8) score -= 20

  // Penalty for stale data
  const staleCount = markets.filter(m => m.dataFreshness?.isStale).length
  if (staleCount > markets.length / 2) score -= 30
  else if (staleCount > 0) score -= 15

  return Math.max(0, Math.min(100, score))
}

app.get('/api/featured-markets', async (_req, res) => {
  try {
    const [polymarkets, kalshiMarkets] = await Promise.all([
      getPolymarketFeatured(),
      getKalshiFeatured()
    ])

    const formatMarket = (m: any, source: string) => ({
      source,
      market: m.market,
      question: m.question,
      description: m.description,
      image: m.image,
      icon: m.icon,
      category: m.category,
      slug: m.slug,
      outcomes: m.outcomes,
      volume24h: m.volume24h,
      liquidity: m.liquidity,
      status: m.status,
      dataFreshness: m.dataFreshness
    })

    const allMarkets = [
      ...polymarkets.slice(0, 4).map(m => formatMarket(m, 'polymarket')),
      ...kalshiMarkets.slice(0, 4).map(m => formatMarket(m, 'kalshi'))
    ]

    res.json({
      success: true,
      count: allMarkets.length,
      markets: allMarkets
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ success: false, error: message })
  }
})

io.on('connection', socket => {
  console.log(`[socket] client connected: ${socket.id}`)

  // Send Featured Markets On Connect
  ;(async () => {
    try {
      const [polymarkets, kalshiMarkets] = await Promise.all([
        getPolymarketFeatured(),
        getKalshiFeatured()
      ])

      const formatMarket = (m: any, source: string) => ({
        source,
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
        status: m.status,
        relevance: m.relevance || 0.9,
        confidence: m.confidence || 0.85
      })

      const allMarkets = [
        ...polymarkets.map(m => formatMarket(m, 'polymarket')),
        ...kalshiMarkets.map(m => formatMarket(m, 'kalshi'))
      ]

      socket.emit('oracle:markets', allMarkets)
      console.log(`[socket] sent ${allMarkets.length} featured markets to ${socket.id}`)
    } catch (error) {
      console.error('[featured-markets] error:', error instanceof Error ? error.message : error)
    }
  })()

  socket.on('signal:query', async query => {
    if (!query || typeof query !== 'string') {
      socket.emit('error', { message: 'Invalid query' })
      return
    }

    const normalizedQuery = query.trim().toLowerCase()

    try {
      socket.emit('scan:start', { query })

      console.log(`[scan] oracle researching "${query}"`)

      let result

      // Check if this query is already being processed
      if (inFlightQueries.has(normalizedQuery)) {
        console.log(`[dedup] reusing in-flight request for "${query}"`)
        result = await inFlightQueries.get(normalizedQuery)
      } else {
        // Create a new request promise and cache it
        const queryPromise = (async () => {
          // Always return mock data for "test" query
          if (normalizedQuery === 'test') {
            console.log(`[test] generating mock data for demo`)
            const { generateMockSignals } = await import('./services/mockSignals.js')
            const mockSignals = generateMockSignals('test', 15)
            return {
              signals: mockSignals,
              analysis: {
                sentiment: 'Bullish',
                sentimentScore: 0.65,
                keyFindings: [
                  'Strong Institutional Interest Detected',
                  'Technical Indicators Show Uptrend',
                  'Market Momentum Building'
                ],
                recommendation: 'Monitor For Entry Opportunity',
                riskLevel: 'Medium',
                confidenceLevel: 0.82
              }
            }
          }

          // Use enhanced analysis if AI API is available
          if (config.hasAiApi || config.hasPolymarketApi) {
            return await acquireSignalsWithAnalysis(query)
          } else {
            // Fallback to basic signal acquisition or mock data
            const signals = await acquireSignals(query)
            return { signals }
          }
        })()

        inFlightQueries.set(normalizedQuery, queryPromise)

        try {
          result = await queryPromise
        } finally {
          // Remove from cache after query completes
          inFlightQueries.delete(normalizedQuery)
        }
      }

      // Emit results to client
      socket.emit('signals', result.signals)
      if (result.analysis) {
        socket.emit('oracle:analysis', result.analysis)
      }
      if (result.relatedMarkets && result.relatedMarkets.length > 0) {
        socket.emit('oracle:markets', result.relatedMarkets)
      }

      socket.emit('scan:complete', { query, count: 0 })
      console.log(`[scan] oracle analysis complete for "${query}"`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[scan:error] ${message}`)
      socket.emit('error', { message })
    }
  })

  socket.on('disconnect', () => {
    console.log(`[socket] client disconnected: ${socket.id}`)
  })
})

httpServer.listen(config.port, () => {
  console.log(`[sigint] server running on port ${config.port}`)
  console.log(`[socket.io] listening for connections`)
  console.log(`[env] ${config.nodeEnv}`)
  console.log(`[cors] origin: ${config.cors.origin}`)
})
