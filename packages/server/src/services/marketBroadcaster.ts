import { Server } from 'socket.io'
import { getFeaturedMarkets as getPolymarketFeatured } from './polymarketService.js'
import { getFeaturedMarkets as getKalshiFeatured } from './kalshiService.js'

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
}

export class MarketBroadcaster {
  private io: Server
  private broadcastInterval: NodeJS.Timeout | null = null
  private lastMarketPrices: Map<string, number[]> = new Map()
  private static readonly BROADCAST_INTERVAL = 5000 // 5 seconds

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
   * Fetch latest market data and broadcast to all clients
   */
  private async broadcastMarketUpdates(): Promise<void> {
    try {
      const [polymarkets, kalshiMarkets] = await Promise.all([
        getPolymarketFeatured(),
        getKalshiFeatured()
      ])

      const updates: MarketUpdatePayload[] = []

      // Process Polymarket updates
      for (const market of polymarkets.slice(0, 4)) {
        const update = this.createMarketUpdate(market, 'polymarket')
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
   * Create market update payload with price change tracking
   */
  private createMarketUpdate(
    market: any,
    source: 'polymarket' | 'kalshi'
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

      return {
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
}
