import axios from 'axios'

/**
 * Fetch historical market data for a given market
 * Returns volume/liquidity trends over the last 7-30 days
 */
export async function getMarketHistory(marketId, source = 'polymarket', days = 7) {
  try {
    // For now, return mock data
    // In production, connect to real market history APIs:
    // - Polymarket: https://gamma-api.polymarket.com/history
    // - Kalshi: https://api.kalshi.com/v2/history

    console.log(`[market-history] fetching ${days}d history for ${source}:${marketId}`)

    const mockHistory = generateMockHistory(days)
    return mockHistory
  } catch (error) {
    console.error('[market-history] error:', error)
    return generateMockHistory(days)
  }
}

/**
 * Generate realistic mock historical data
 */
function generateMockHistory(days) {
  const data = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Create realistic volume trends with daily variation
    const baseVolume = 1500000 * (0.7 + Math.random() * 0.6)
    const variance = Math.sin(((days - i) / days) * Math.PI) * 0.3 + 0.7
    const noise = (Math.random() - 0.5) * 0.2

    data.push({
      date: date.toISOString().split('T')[0],
      dateDisplay: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: Math.round(baseVolume * variance * (1 + noise)),
      liquidity: Math.round(baseVolume * variance * (1 + noise) * 0.03),
      trades: Math.round(100 + Math.random() * 500),
      volatility: parseFloat((Math.random() * 50 + 10).toFixed(2))
    })
  }

  return data
}

/**
 * Fetch Polymarket price history if API provides it
 */
export async function getPolymarketHistory(marketId) {
  try {
    // Polymarket's Gamma API may have historical endpoints
    // This is a placeholder for future implementation
    const response = await axios.get(
      `https://gamma-api.polymarket.com/markets/${marketId}/history`,
      { timeout: 8000 }
    )
    return response.data
  } catch (error) {
    console.warn('[polymarket-history] not available, using mock data')
    return generateMockHistory(7)
  }
}

/**
 * Fetch Kalshi price history
 */
export async function getKalshiHistory(marketId) {
  try {
    // Kalshi's public API endpoint for market history
    const response = await axios.get(`https://api.kalshi.com/v2/markets/${marketId}/history`, {
      timeout: 8000
    })
    return response.data
  } catch (error) {
    console.warn('[kalshi-history] not available, using mock data')
    return generateMockHistory(7)
  }
}
