import axios from 'axios'
import { Agent as HttpAgent } from 'http'
import { Agent as HttpsAgent } from 'https'
import { config } from '../config.js'

export interface PolymarketRawMarket {
  id: string
  question: string
  description?: string
  image?: string
  icon?: string
  slug?: string
  category?: string
  outcomes: string[]
  outcomePrices: string[]
  volume?: number
  liquidity?: number
  volume24hr?: number
  liquidityNum?: number
  volumeNum?: number
  volume1wk?: number
  volume1mo?: number
  createdAt?: string
  updatedAt?: string
  active?: boolean
  closed?: boolean
  endDate?: string
}

export interface PolymarketSignal {
  market: string
  question: string
  description?: string
  image?: string
  icon?: string
  category?: string
  outcomes: Array<{ name: string; probability: number }>
  volume24h: number
  liquidity: number
  relevance: number
  confidence: number
  slug?: string
  status: 'active' | 'closed' | 'resolved'
  dataFreshness?: {
    isStale: boolean
    daysOld: number
    warning?: string
  }
}

// Gamma API (legacy, has stale data)
const GAMMA_API_BASE = 'https://gamma-api.polymarket.com'

// CLOB API (newer, real-time order book)
// Try multiple possible endpoints
const CLOB_API_URLS = [
  'https://clob.polymarket.com/api', // Primary
  'https://clob.polymarket.com', // Fallback 1
  'https://markets-api.polymarket.com' // Fallback 2
]

// Create agent instances for timeout handling
const httpAgent = new HttpAgent({ timeout: 5000 })
const httpsAgent = new HttpsAgent({ timeout: 5000 })

/**
 * Fetch from modern CLOB API for real-time market data
 * Falls back to Gamma API if CLOB is unavailable
 */
export async function getFeaturedMarkets(): Promise<PolymarketSignal[]> {
  try {
    console.log('[polymarket] 🔍 fetching featured markets from CLOB API...')

    // Try CLOB API endpoints in order
    for (const clobUrl of CLOB_API_URLS) {
      try {
        console.log(`[polymarket-clob] 📡 trying ${clobUrl}/markets...`)
        const response = await axios.get(`${clobUrl}/markets`, {
          params: {
            limit: 100
          },
          timeout: 5000,
          httpAgent,
          httpsAgent
        })

        // Handle different response structures
        let allMarkets = []
        if (response.data.markets && Array.isArray(response.data.markets)) {
          allMarkets = response.data.markets
        } else if (Array.isArray(response.data)) {
          allMarkets = response.data
        }

        if (allMarkets.length > 0) {
          console.log(`[polymarket-clob] 📊 retrieved ${allMarkets.length} markets from CLOB API`)

          // Filter and transform markets from CLOB
          const activeMarkets = allMarkets
            .filter((m: any) => {
              // Ensure market has essential data
              return (
                m.question &&
                m.outcomePrices &&
                (m.active === true || m.status === 'active') &&
                m.volume24h > 0
              )
            })
            .sort((a: any, b: any) => (b.volume24h || 0) - (a.volume24h || 0))
            .slice(0, 8)

          if (activeMarkets.length > 0) {
            console.log(`[polymarket-clob] ✅ found ${activeMarkets.length} active markets`)
            return activeMarkets.map((m: any) => rawMarketToSignal(m, ''))
          }
        }
      } catch (endpointError) {
        console.warn(
          `[polymarket-clob] ⚠️  ${clobUrl} failed`,
          endpointError instanceof Error ? endpointError.message : String(endpointError)
        )
        // Continue to next endpoint
      }
    }

    console.log('[polymarket] 📡 all CLOB endpoints failed, falling back to Gamma API...')

    // Fallback to Gamma API (historical/secondary data)
    const response = await axios.get(`${GAMMA_API_BASE}/markets`, {
      params: {
        limit: 100
      },
      timeout: 10000,
      httpAgent,
      httpsAgent
    })

    const allMarkets: PolymarketRawMarket[] = Array.isArray(response.data)
      ? response.data
      : response.data.data || []

    console.log(`[polymarket] 📊 retrieved ${allMarkets.length} total markets from Gamma API`)

    // Filter markets: show open first, then closed with high volume
    const activeMarkets = allMarkets
      .sort((a, b) => {
        const aOpen = !a.closed ? 1 : 0
        const bOpen = !b.closed ? 1 : 0
        if (aOpen !== bOpen) return bOpen - aOpen
        return (b.volumeNum || 0) - (a.volumeNum || 0)
      })
      .slice(0, 8)

    console.log(`[polymarket] ✅ filtered to ${activeMarkets.length} featured markets`)

    const featuredMarkets = activeMarkets.map(rawMarket => rawMarketToSignal(rawMarket, ''))

    return featuredMarkets
  } catch (error) {
    console.error('[polymarket:featured] ❌ ERROR:', error instanceof Error ? error.message : error)
    return []
  }
}

/**
 * Search for markets matching a query using CLOB API
 */
export async function getPolymarketMarkets(query: string): Promise<PolymarketSignal[]> {
  try {
    console.log(`[polymarket] 🔍 searching markets for query: "${query}"`)

    // Try CLOB API endpoints in order
    for (const clobUrl of CLOB_API_URLS) {
      try {
        const response = await axios.get(`${clobUrl}/markets`, {
          params: {
            limit: 50
          },
          timeout: 5000,
          httpAgent,
          httpsAgent
        })

        let allMarkets = []
        if (response.data.markets && Array.isArray(response.data.markets)) {
          allMarkets = response.data.markets
        } else if (Array.isArray(response.data)) {
          allMarkets = response.data
        }

        if (allMarkets.length > 0) {
          const relevantMarkets = allMarkets
            .filter((market: any) => market.active && !market.closed)
            .filter((market: any) => isRelevantToQuery(market as PolymarketRawMarket, query))
            .map((market: any) => rawMarketToSignal(market, query))
            .sort((a: any, b: any) => b.relevance - a.relevance)
            .slice(0, 5)

          if (relevantMarkets.length > 0) {
            console.log(
              `[polymarket-clob] 📊 found ${relevantMarkets.length} relevant markets for "${query}"`
            )
            return relevantMarkets
          }
        }
      } catch (endpointError) {
        console.warn(
          `[polymarket-clob:search] ⚠️  ${clobUrl} failed`,
          endpointError instanceof Error ? endpointError.message : String(endpointError)
        )
      }
    }

    console.log('[polymarket] 📡 all CLOB endpoints failed, falling back to Gamma API...')

    // Fallback to Gamma API
    const response = await axios.get(`${GAMMA_API_BASE}/markets`, {
      params: {
        limit: 50,
        order: 'volume24hr'
      },
      timeout: 10000,
      httpAgent,
      httpsAgent
    })

    const allMarkets: PolymarketRawMarket[] = Array.isArray(response.data)
      ? response.data
      : response.data.data || []

    const relevantMarkets = allMarkets
      .filter(market => market.active && !market.closed)
      .filter(market => isRelevantToQuery(market, query))
      .map(market => rawMarketToSignal(market, query))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5)

    console.log(`[polymarket] 📊 found ${relevantMarkets.length} relevant markets for "${query}"`)
    return relevantMarkets
  } catch (error) {
    console.error('[polymarket:search] ❌ ERROR:', error instanceof Error ? error.message : error)
    return []
  }
}

function isRelevantToQuery(market: PolymarketRawMarket, query: string): boolean {
  if (!query || query.length === 0) return true

  const text = (
    market.question +
    ' ' +
    (market.description || '') +
    ' ' +
    (market.category || '')
  ).toLowerCase()

  const queryLower = query.toLowerCase()

  // Direct match
  if (text.includes(queryLower)) return true

  // Keyword matching
  const keywords = queryLower.split(/\s+/).filter(k => k.length > 2)
  const matchCount = keywords.filter(kw => text.includes(kw)).length

  return matchCount >= Math.max(1, Math.floor(keywords.length / 2))
}

function calculateDataFreshness(createdDate?: string): {
  isStale: boolean
  daysOld: number
  warning?: string
} {
  if (!createdDate) {
    return { isStale: true, daysOld: 999, warning: 'Date unknown' }
  }

  const date = new Date(createdDate)
  const now = new Date()
  const daysOld = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (daysOld > 365) {
    return {
      isStale: true,
      daysOld,
      warning: `Market from ${daysOld} days ago (${date.getFullYear()})`
    }
  }

  return { isStale: false, daysOld }
}

function rawMarketToSignal(market: PolymarketRawMarket, query: string): PolymarketSignal {
  // Parse outcomes
  let outcomes: string[] = []
  try {
    if (typeof market.outcomes === 'string') {
      outcomes = JSON.parse(market.outcomes)
    } else if (Array.isArray(market.outcomes)) {
      outcomes = market.outcomes
    } else {
      outcomes = ['Yes', 'No']
    }
  } catch (e) {
    outcomes = ['Yes', 'No']
  }

  // Parse outcome prices
  let prices: number[] = []
  try {
    if (typeof market.outcomePrices === 'string') {
      const parsed = JSON.parse(market.outcomePrices)
      prices = parsed.map((p: string | number) => (typeof p === 'string' ? parseFloat(p) : p))
    } else if (Array.isArray(market.outcomePrices)) {
      prices = market.outcomePrices.map(p => (typeof p === 'string' ? parseFloat(p) : p))
    }
  } catch (e) {
    prices = [0.5, 0.5]
  }

  // Ensure right number of prices
  while (prices.length < outcomes.length) {
    prices.push(1 / outcomes.length)
  }

  const totalPrice = prices.reduce((sum, p) => sum + p, 0) || 1

  // Calculate relevance
  let relevance = 0
  let confidence = 0

  if (query && query.length > 0) {
    const text = (
      market.question +
      ' ' +
      (market.description || '') +
      ' ' +
      (market.category || '')
    ).toLowerCase()
    const queryLower = query.toLowerCase()

    if (text.includes(queryLower)) {
      relevance = 0.95
      confidence = 0.95
    } else {
      const keywords = queryLower.split(/\s+/).filter(k => k.length > 2)
      const matches = keywords.filter(kw => text.includes(kw)).length
      relevance = matches > 0 ? Math.min(1, matches / keywords.length) : 0.3
      confidence = Math.max(0.5, relevance)
    }
  } else {
    relevance = 0.8
    confidence = 0.9
  }

  // Check data freshness
  const dataFreshness = calculateDataFreshness(market.createdAt)

  return {
    market: market.id,
    question: market.question,
    description: market.description,
    image: market.image,
    icon: market.icon,
    category: market.category,
    slug: market.slug,
    outcomes: outcomes.map((name, idx) => ({
      name,
      probability: prices[idx] ? prices[idx] / totalPrice : 1 / outcomes.length
    })),
    volume24h: market.volumeNum || market.volume || 0,
    liquidity: market.liquidityNum || market.liquidity || 0,
    relevance,
    confidence,
    status: market.closed ? 'closed' : market.active ? 'active' : 'resolved',
    dataFreshness
  }
}

export async function getMarketProbabilities(marketId: string): Promise<number[]> {
  try {
    const response = await axios.get(`${GAMMA_API_BASE}/markets?id=${marketId}`, {
      timeout: 5000,
      httpAgent,
      httpsAgent
    })

    const market: PolymarketRawMarket = Array.isArray(response.data)
      ? response.data[0]
      : response.data

    if (!market) return []

    let prices: number[] = []
    try {
      if (typeof market.outcomePrices === 'string') {
        prices = JSON.parse(market.outcomePrices).map((p: string | number) =>
          typeof p === 'string' ? parseFloat(p) : p
        )
      } else if (Array.isArray(market.outcomePrices)) {
        prices = market.outcomePrices.map(p => (typeof p === 'string' ? parseFloat(p) : p))
      }
    } catch (e) {
      prices = [0.5, 0.5]
    }

    const totalPrice = prices.reduce((sum, p) => sum + p, 0) || 1
    return prices.map(p => p / totalPrice)
  } catch (error) {
    console.error('[polymarket:probabilities] ❌', error instanceof Error ? error.message : error)
    return []
  }
}
