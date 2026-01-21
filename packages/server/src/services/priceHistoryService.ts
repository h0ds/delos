/**
 * Price History Service - Fetches real historical price data from Polymarket
 * Provides methods to get OHLC candles and price time series for technical analysis
 */

export interface PricePoint {
  t: number // Unix timestamp
  p: number // Price
}

export interface OHLCCandle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

const POLYMARKET_CLOB_ENDPOINTS = [
  'https://clob.polymarket.com',
  'https://clob-api.polymarket.com',
  'https://api.polymarket.com/clob'
]

/**
 * Fetch raw price history from Polymarket CLOB API
 * @param tokenId - CLOB token ID (e.g., "0x..." from market outcomes)
 * @param interval - Data interval: '1m', '1h', '1d', '1w', 'max'
 * @returns Array of price points with timestamps
 */
export async function fetchPriceHistory(
  tokenId: string,
  interval: '1m' | '1h' | '1d' | '1w' | 'max' = '1d'
): Promise<PricePoint[]> {
  const url = `https://clob.polymarket.com/prices-history?market=${tokenId}&interval=${interval}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Delos-Market-Intelligence/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as { history: PricePoint[] }
    return (data.history || []) as PricePoint[]
  } catch (error) {
    console.error(`[priceHistory] Failed to fetch ${tokenId}:`, error)
    return []
  }
}

/**
 * Convert price points into OHLC candles for technical analysis
 * Groups price points by time period (default: 1 hour)
 *
 * @param pricePoints - Array of {t: timestamp, p: price} objects
 * @param intervalMinutes - Candle width in minutes (default: 60)
 * @returns Array of OHLC candles
 */
export function generateOHLCCandles(
  pricePoints: PricePoint[],
  intervalMinutes: number = 60
): OHLCCandle[] {
  if (pricePoints.length === 0) return []

  const intervalMs = intervalMinutes * 60 * 1000
  const candles: Map<number, OHLCCandle> = new Map()

  // Sort by timestamp ascending
  const sorted = [...pricePoints].sort((a, b) => a.t - b.t)

  for (const point of sorted) {
    const candleTime = Math.floor(point.t / intervalMs) * intervalMs
    const price = point.p

    if (!candles.has(candleTime)) {
      candles.set(candleTime, {
        timestamp: candleTime,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: 1
      })
    } else {
      const candle = candles.get(candleTime)!
      candle.high = Math.max(candle.high, price)
      candle.low = Math.min(candle.low, price)
      candle.close = price
      candle.volume = (candle.volume || 1) + 1
    }
  }

  // Return sorted candles
  return Array.from(candles.values()).sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * Fetch and generate OHLC candles for a market
 * This is the main entry point for getting real candlestick data
 *
 * @param tokenId - CLOB token ID
 * @param interval - Polymarket interval: '1m', '1h', '1d', '1w', 'max'
 * @param candleWidthMinutes - Width of each OHLC candle (default: 60 minutes)
 * @returns Array of OHLC candles
 */
export async function fetchOHLCCandles(
  tokenId: string,
  interval: '1m' | '1h' | '1d' | '1w' | 'max' = '1d',
  candleWidthMinutes: number = 60
): Promise<OHLCCandle[]> {
  try {
    const pricePoints = await fetchPriceHistory(tokenId, interval)

    if (pricePoints.length === 0) {
      console.warn(`[priceHistory] No price history available for ${tokenId}`)
      return []
    }

    console.log(
      `[priceHistory] Fetched ${pricePoints.length} price points for ${tokenId}, generating ${candleWidthMinutes}min candles`
    )

    const candles = generateOHLCCandles(pricePoints, candleWidthMinutes)
    return candles
  } catch (error) {
    console.error(`[priceHistory] Error fetching OHLC candles:`, error)
    return []
  }
}

/**
 * Calculate high/low from price history
 * Useful for support/resistance levels
 */
export function calculatePriceLevels(pricePoints: PricePoint[]): {
  high: number
  low: number
  range: number
  midpoint: number
} {
  if (pricePoints.length === 0) {
    return { high: 0, low: 0, range: 0, midpoint: 0 }
  }

  const prices = pricePoints.map(p => p.p)
  const high = Math.max(...prices)
  const low = Math.min(...prices)

  return {
    high,
    low,
    range: high - low,
    midpoint: (high + low) / 2
  }
}

/**
 * Get latest price from price history
 */
export function getLatestPrice(pricePoints: PricePoint[]): number | null {
  if (pricePoints.length === 0) return null
  const sorted = [...pricePoints].sort((a, b) => a.t - b.t)
  return sorted[sorted.length - 1].p
}

/**
 * Calculate price volatility (standard deviation)
 */
export function calculateVolatility(pricePoints: PricePoint[]): number {
  if (pricePoints.length < 2) return 0

  const prices = pricePoints.map(p => p.p)
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length

  return Math.sqrt(variance)
}

/**
 * Cache for price history (in-memory for now)
 * Can be replaced with database later
 */
const priceCache: Map<string, { data: OHLCCandle[]; timestamp: number; ttlMs: number }> = new Map()

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Get cached OHLC data if available and not stale
 */
export function getCachedCandles(tokenId: string): OHLCCandle[] | null {
  const cached = priceCache.get(tokenId)

  if (cached && Date.now() - cached.timestamp < cached.ttlMs) {
    console.log(`[priceHistory] Using cached candles for ${tokenId}`)
    return cached.data
  }

  return null
}

/**
 * Cache OHLC candles for future use
 */
export function cacheCandles(
  tokenId: string,
  candles: OHLCCandle[],
  ttlMs: number = CACHE_TTL_MS
): void {
  priceCache.set(tokenId, {
    data: candles,
    timestamp: Date.now(),
    ttlMs
  })
}

/**
 * Clear all cached price data
 */
export function clearPriceCache(): void {
  priceCache.clear()
  console.log('[priceHistory] Cleared price cache')
}

/**
 * Get cache statistics (useful for debugging)
 */
export function getCacheStats(): {
  size: number
  entries: Array<{ tokenId: string; candles: number; age: number }>
} {
  const entries = Array.from(priceCache.entries()).map(([tokenId, cached]) => ({
    tokenId,
    candles: cached.data.length,
    age: Date.now() - cached.timestamp
  }))

  return {
    size: priceCache.size,
    entries
  }
}
