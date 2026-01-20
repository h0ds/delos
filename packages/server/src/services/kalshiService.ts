import axios from 'axios'
import { Agent as HttpAgent } from 'http'
import { Agent as HttpsAgent } from 'https'
import { config } from '../config.js'
import { getMockKalshiMarkets } from './mockMarkets.js'

export interface KalshiRawMarket {
  id: string
  ticker: string
  title: string
  subtitle?: string
  image_url?: string
  category?: string
  strike_price?: number
  settlement_source?: string
  yes_price?: number
  no_price?: number
  volume?: number
  open_interest?: number
  status?: string
  expiration_date?: string
  created_at?: string
}

export interface KalshiSignal {
  market: string
  slug?: string // For linking to market website
  question: string
  description?: string
  image?: string
  category?: string
  outcomes: Array<{ name: string; probability: number }>
  volume24h: number
  liquidity: number
  relevance: number
  confidence: number
  status: 'active' | 'closed' | 'resolved'
  dataFreshness?: {
    isStale: boolean
    daysOld: number
    warning?: string
  }
}

// Kalshi public API endpoints
const KALSHI_PUBLIC_API = 'https://api.kalshi.com/v2'

// Create agent instances with DNS and timeout configuration
const httpAgent = new HttpAgent({
  timeout: 8000,
  keepAlive: true,
  keepAliveMsecs: 1000
})

const httpsAgent = new HttpsAgent({
  timeout: 8000,
  keepAlive: true,
  keepAliveMsecs: 1000
})

/**
 * Convert Kalshi raw market data to unified signal format
 */
function rawMarketToSignal(rawMarket: KalshiRawMarket, query: string): KalshiSignal {
  const yesProbability = rawMarket.yes_price
    ? parseFloat(rawMarket.yes_price.toString()) / 100
    : 0.5
  const noProbability = 1 - yesProbability

  const isRelevant =
    query.length === 0 || rawMarket.title.toLowerCase().includes(query.toLowerCase())
  const relevanceScore = isRelevant ? 0.9 : 0.3
  const confidenceScore = isRelevant ? 0.85 : 0.5

  const createdDate = rawMarket.created_at
  const dataFreshness = calculateDataFreshness(createdDate)

  return {
    market: rawMarket.id,
    slug: rawMarket.ticker, // Use ticker as URL slug for Kalshi
    question: rawMarket.title,
    description: rawMarket.subtitle,
    image: rawMarket.image_url,
    category: rawMarket.category || 'Kalshi',
    outcomes: [
      { name: 'Yes', probability: yesProbability },
      { name: 'No', probability: noProbability }
    ],
    volume24h: rawMarket.volume || 0,
    liquidity: rawMarket.open_interest || 0,
    relevance: relevanceScore,
    confidence: confidenceScore,
    status:
      rawMarket.status === 'closed' || rawMarket.status === 'resolved'
        ? 'closed'
        : rawMarket.status === 'resolved'
          ? 'resolved'
          : 'active',
    dataFreshness
  }
}

function calculateDataFreshness(createdDate?: string): {
  isStale: boolean
  daysOld: number
  warning?: string
} {
  if (!createdDate) {
    return { isStale: false, daysOld: 0 }
  }

  const date = new Date(createdDate)
  const now = new Date()
  const daysOld = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (daysOld > 730) {
    return {
      isStale: true,
      daysOld,
      warning: `Market from ${daysOld} days ago`
    }
  }

  return { isStale: false, daysOld }
}

/**
 * Fetch all featured/hot markets from Kalshi for dashboard display
 * Public API - no authentication required
 * Uses mock data in dev when API is unavailable
 */
export async function getFeaturedMarkets(): Promise<KalshiSignal[]> {
  try {
    console.log('[kalshi] 🔍 fetching featured markets from public API...')

    // Kalshi public API endpoint for markets
    const response = await axios.get(`${KALSHI_PUBLIC_API}/markets`, {
      params: {
        limit: 100,
        status: 'active'
      },
      timeout: 8000,
      httpAgent,
      httpsAgent,
      // Add explicit DNS settings for reliability
      lookup: undefined // Use Node's default DNS resolution
    })

    const allMarkets: KalshiRawMarket[] = response.data.markets || response.data || []

    console.log(`[kalshi] 📊 retrieved ${allMarkets.length} total markets from API`)

    // Filter to active markets - prioritize by volume (no strict volume minimum)
    const activeMarkets = allMarkets
      .filter(m => m.status === 'active')
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, 20)

    console.log(`[kalshi] ✅ filtered to ${activeMarkets.length} featured markets`)

    const featuredMarkets = activeMarkets
      .map(rawMarket => rawMarketToSignal(rawMarket, ''))
      .slice(0, 8)

    return featuredMarkets
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[kalshi] ❌ error fetching markets:', errorMsg)

    // Detailed error logging for debugging
    if (errorMsg.includes('ENOTFOUND')) {
      console.error('[kalshi] ⚠️  DNS resolution failed - API domain unreachable')
      console.error(
        '[kalshi] 💡 Try: Check network connectivity, firewall rules, or DNS configuration'
      )
    } else if (errorMsg.includes('ECONNREFUSED')) {
      console.error('[kalshi] ⚠️  Connection refused - API may be down')
    } else if (errorMsg.includes('ECONNRESET')) {
      console.error('[kalshi] ⚠️  Connection reset - unstable network')
    } else if (errorMsg.includes('timeout')) {
      console.error('[kalshi] ⚠️  Request timeout - API response delayed')
    }

    // Use mock data in development when API is unavailable
    if (config.isDev) {
      console.log('[kalshi] 💡 using mock data for local development')
      return getMockKalshiMarkets()
    }

    return []
  }
}

/**
 * Search for markets related to a query
 */
export async function getMarketsByQuery(query: string): Promise<KalshiSignal[]> {
  try {
    console.log(`[kalshi] 🔍 searching for markets: "${query}"`)

    const response = await axios.get(`${KALSHI_PUBLIC_API}/markets`, {
      params: {
        limit: 50,
        status: 'active'
      },
      timeout: 8000,
      httpAgent,
      httpsAgent
    })

    const allMarkets: KalshiRawMarket[] = response.data.markets || response.data || []

    // Filter markets by query relevance
    const relatedMarkets = allMarkets
      .filter(m => {
        const matchesQuery =
          m.title.toLowerCase().includes(query.toLowerCase()) ||
          m.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
          m.category?.toLowerCase().includes(query.toLowerCase())
        return matchesQuery && m.status === 'active'
      })
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, 5)

    console.log(`[kalshi] ✅ found ${relatedMarkets.length} related markets`)

    return relatedMarkets.map(rawMarket => rawMarketToSignal(rawMarket, query))
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[kalshi] ❌ error searching markets:', errorMsg)

    if (errorMsg.includes('ENOTFOUND') || errorMsg.includes('ECONNREFUSED')) {
      console.error('[kalshi] ⚠️  Network error - API may be unreachable.')
    }

    return []
  }
}

/**
 * Fetch historical market data for a specific Kalshi market
 * Per Kalshi API docs: https://docs.kalshi.com/getting_started/api_keys
 */
export async function getMarketHistory(marketTicker: string): Promise<any[]> {
  try {
    console.log(`[kalshi:history] fetching history for market: ${marketTicker}`)

    // Kalshi API endpoint for market history
    const response = await axios.get(`${KALSHI_PUBLIC_API}/markets/${marketTicker}/history`, {
      timeout: 8000,
      httpAgent,
      httpsAgent
    })

    if (response.data && response.data.history) {
      console.log(`[kalshi:history] ✅ fetched ${response.data.history.length} price points`)
      return response.data.history
    }

    console.warn('[kalshi:history] ⚠️ no history data returned')
    return []
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.warn(`[kalshi:history] ⚠️ failed to fetch history: ${errorMsg}`)
    // Return empty array - client will use mock data as fallback
    return []
  }
}
