/**
 * Centralized API endpoints for markets
 * Provides consistent interface for fetching market data
 */

const API_BASE = 'http://localhost:3333/api'

/**
 * Fetch featured markets (Polymarket + Kalshi)
 */
export async function getFeaturedMarkets() {
  try {
    const response = await fetch(`${API_BASE}/featured-markets`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (data.success && data.markets) {
      console.log('[api] fetched featured markets:', data.markets.length)
      return data.markets
    }
    return []
  } catch (err) {
    console.error('[api] getFeaturedMarkets failed:', err)
    return []
  }
}

/**
 * Fetch data quality metrics
 */
export async function getDataQuality() {
  try {
    const response = await fetch(`${API_BASE}/data-quality`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    return data.aggregatedMetrics || null
  } catch (err) {
    console.error('[api] getDataQuality failed:', err)
    return null
  }
}
