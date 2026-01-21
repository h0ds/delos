import axios from 'axios'

/**
 * Fetch historical market data for a given market
 * Returns volume/liquidity trends over the last 7-30 days
 */
export async function getMarketHistory(marketId, source = 'polymarket', days = 7) {
  try {
    // Try to fetch from backend API first
    console.log(`[market-history] fetching ${days}d history from backend for ${source}:${marketId}`)
    const response = await axios.get(
      `http://localhost:3333/api/markets/${source}/${marketId}/history`,
      { timeout: 5000 }
    )

    if (response.data.success && response.data.history && response.data.history.length > 0) {
      console.log(`[market-history] ✅ fetched ${response.data.historyPoints} history points`)
      // Format backend data to match client expectations
      return formatHistoryData(response.data.history, source)
    }

    // Return null if no data available
    console.log('[market-history] no history data from backend')
    return null
  } catch (error) {
    console.warn('[market-history] error fetching from backend:', error.message)
    return null
  }
}

/**
 * Format backend history data to client display format
 */
function formatHistoryData(history, source) {
  if (!Array.isArray(history) || history.length === 0) {
    return null
  }

  try {
    // Format based on source API
    if (source === 'polymarket') {
      // Polymarket history format handling
      return history.map((point, idx) => ({
        dateDisplay: new Date(
          point.timestamp || Date.now() - (history.length - idx) * 86400000
        ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: parseFloat(point.volume || point.volumeNum || 0),
        liquidity: parseFloat(point.liquidity || point.liquidityNum || 0),
        trades: parseInt(point.trades || 0)
      }))
    } else if (source === 'kalshi') {
      // Kalshi history format handling (price history)
      return history.map((point, idx) => ({
        dateDisplay: new Date(
          point.timestamp || Date.now() - (history.length - idx) * 86400000
        ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: parseFloat(point.volume || 0),
        yesPrice: parseFloat(point.yes_price || point.yesPrice || 0),
        noPrice: parseFloat(point.no_price || point.noPrice || 0)
      }))
    }

    return null
  } catch (error) {
    console.warn('[market-history] error formatting data:', error.message)
    return null
  }
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
  } catch {
    console.warn('[polymarket-history] not available')
    return null
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
  } catch {
    console.warn('[kalshi-history] not available')
    return null
  }
}
