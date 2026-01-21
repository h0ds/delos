import { Server } from 'socket.io'
import { getFeaturedMarkets as getPolymarketFeatured } from './polymarketService.js'
import { getFeaturedMarkets as getKalshiFeatured } from './kalshiService.js'
import {
  fetchOHLCCandles,
  getCachedCandles,
  cacheCandles,
  OHLCCandle
} from './priceHistoryService.js'

interface MarketUpdatePayload {
  source: 'polymarket' | 'kalshi'
  marketId: string
  question: string
  outcomes: Array<{ name: string; probability: number }>
  volume24h: number
  liquidity?: number
  timestamp: number
  priceChangePercent?: number // For tracking momentum
  priceChangeDirection?: 'up' | 'down' | 'stable'
  ohlcCandles?: OHLCCandle[] // Real historical OHLC data
}

export interface MarketData {
  market: string
  question: string
  outcomes: Array<{ name: string; probability: number }>
  volume24h: number
  liquidity?: number
  clobTokenIds?: string[] // For fetching real price history
}

export class MarketBroadcaster {
  private io: Server
  private broadcastInterval: NodeJS.Timeout | null = null
  private lastMarketPrices: Map<string, number[]> = new Map()
  private marketOHLCData: Map<string, OHLCCandle[]> = new Map() // Store real OHLC data
  private static readonly BROADCAST_INTERVAL = 5000 // 5 seconds
  private static readonly OHLC_FETCH_INTERVAL = 3600000 // Fetch OHLC every 1 hour

  constructor(io: Server) {
    this.io = io
  }

  /**
   * Start broadcasting market updates to all connected clients
   */
  public startBroadcasting(): void {
    if (this.broadcastInterval) {
      console.log('[broadcaster] already broadcasting')
      return
    }

    console.log('[broadcaster] starting market broadcast service')

    // Initial broadcast
    this.broadcastMarketUpdates()

    // Continuous broadcast
    this.broadcastInterval = setInterval(
      () => this.broadcastMarketUpdates(),
      MarketBroadcaster.BROADCAST_INTERVAL
    )
  }

  /**
   * Stop broadcasting market updates
   */
  public stopBroadcasting(): void {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval)
      this.broadcastInterval = null
      console.log('[broadcaster] stopped market broadcast service')
    }
  }

  /**
   * Fetch and cache real OHLC data for a market
   * This runs periodically to get fresh historical data
   */
  private async fetchOHLCForMarket(
    market: MarketData,
    source: 'polymarket' | 'kalshi'
  ): Promise<OHLCCandle[] | null> {
    try {
      // Only fetch OHLC for Polymarket (Kalshi API not accessible)
      if (source !== 'polymarket') return null

      const tokenIds = market.clobTokenIds || []
      if (tokenIds.length === 0) {
        console.log(`[broadcaster] No CLOB token IDs for market ${market.market}`)
        return null
      }

      const tokenId = tokenIds[0] // Get primary outcome
      const marketId = `${source}:${market.market}`

      // Try cache first
      const cached = getCachedCandles(tokenId)
      if (cached) {
        this.marketOHLCData.set(marketId, cached)
        return cached
      }

      // Fetch real OHLC from Polymarket
      console.log(`[broadcaster] Fetching OHLC for ${marketId} (token: ${tokenId})`)
      const candles = await fetchOHLCCandles(tokenId, '1d', 60) // 1d interval, 60-min candles

      if (candles.length > 0) {
        cacheCandles(tokenId, candles)
        this.marketOHLCData.set(marketId, candles)
        console.log(`[broadcaster] Cached ${candles.length} candles for ${marketId}`)
        return candles
      } else {
        console.warn(`[broadcaster] No OHLC data received for ${tokenId}`)
      }
    } catch (error) {
      console.error(
        `[broadcaster] Error fetching OHLC:`,
        error instanceof Error ? error.message : error
      )
    }

    return null
  }

  /**
   * Fetch latest market data and broadcast to all clients
   */
  private async broadcastMarketUpdates(): Promise<void> {
    try {
      const [polymarkets, kalshiMarkets] = await Promise.all([
        getPolymarketFeatured(),
        getKalshiFeatured()
      ])

      const updates: MarketUpdatePayload[] = []

      // Process Polymarket updates (fetch OHLC if available)
      for (const market of polymarkets.slice(0, 4)) {
        // Try to fetch real OHLC data
        const ohlcCandles = await this.fetchOHLCForMarket(market, 'polymarket')

        const update = this.createMarketUpdate(market, 'polymarket', ohlcCandles || undefined)
        if (update) updates.push(update)
      }

      // Process Kalshi updates
      for (const market of kalshiMarkets.slice(0, 4)) {
        const update = this.createMarketUpdate(market, 'kalshi')
        if (update) updates.push(update)
      }

      // Broadcast to all connected clients
      if (updates.length > 0) {
        this.io.emit('market:update', updates)
        console.log(`[broadcaster] sent ${updates.length} market updates`)
      }
    } catch (error) {
      console.error('[broadcaster] error:', error instanceof Error ? error.message : error)
    }
  }

  /**
   * Create market update payload with price change tracking and OHLC data
   */
  private createMarketUpdate(
    market: MarketData,
    source: 'polymarket' | 'kalshi',
    ohlcCandles?: OHLCCandle[]
  ): MarketUpdatePayload | null {
    try {
      const marketId = `${source}:${market.market}`
      const primaryOutcome = market.outcomes?.[0]

      if (!primaryOutcome) return null

      const currentPrice = primaryOutcome.probability
      const priceHistory = this.lastMarketPrices.get(marketId) || [currentPrice]

      // Calculate price change
      const previousPrice = priceHistory[priceHistory.length - 1]
      const priceChangePercent =
        previousPrice > 0 ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0

      const priceChangeDirection =
        currentPrice > previousPrice ? 'up' : currentPrice < previousPrice ? 'down' : 'stable'

      // Keep last 20 price points for trend analysis
      priceHistory.push(currentPrice)
      if (priceHistory.length > 20) priceHistory.shift()
      this.lastMarketPrices.set(marketId, priceHistory)

      const payload: MarketUpdatePayload = {
        source,
        marketId: market.market,
        question: market.question,
        outcomes: market.outcomes,
        volume24h: market.volume24h,
        liquidity: market.liquidity,
        timestamp: Date.now(),
        priceChangePercent: parseFloat(priceChangePercent.toFixed(2)),
        priceChangeDirection
      }

      // Include real OHLC data if available
      if (ohlcCandles && ohlcCandles.length > 0) {
        payload.ohlcCandles = ohlcCandles
        console.log(
          `[broadcaster] Included ${ohlcCandles.length} real candles in update for ${marketId}`
        )
      }

      return payload
    } catch (error) {
      console.error(
        `[broadcaster] error processing market: ${error instanceof Error ? error.message : error}`
      )
      return null
    }
  }

  /**
   * Get price history for a specific market
   */
  public getPriceHistory(marketId: string): number[] {
    return this.lastMarketPrices.get(marketId) || []
  }

  /**
   * Clear price history
   */
  public clearHistory(): void {
    this.lastMarketPrices.clear()
  }

  /**
   * Get OHLC candles for a specific market
   */
  public getOHLCCandles(marketId: string): OHLCCandle[] | null {
    return this.marketOHLCData.get(marketId) || null
  }

  /**
   * Get all cached market OHLC data
   */
  public getAllOHLCData(): Map<string, OHLCCandle[]> {
    return new Map(this.marketOHLCData)
  }
}
