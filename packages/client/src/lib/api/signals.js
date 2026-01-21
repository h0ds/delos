/**
 * Centralized API endpoints for signal analysis
 * Provides consistent interface for fetching market intelligence
 */

const API_BASE = 'http://localhost:3333/api'

/**
 * Fetch signals and analysis for a query
 * @param {string} query - Market query to analyze
 * @returns {Promise<{signals: Array, relatedMarkets: Array, success: boolean}>}
 */
export async function searchSignals(query) {
  try {
    console.log(`[api] searching signals for: "${query}"`)
    const response = await fetch(`${API_BASE}/signals/${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.json()
    if (data.success) {
      console.log('[api] search complete:', {
        signals: data.signals?.length || 0,
        markets: data.relatedMarkets?.length || 0
      })
      return {
        signals: data.signals || [],
        relatedMarkets: data.relatedMarkets || [],
        success: true
      }
    }
    return { signals: [], relatedMarkets: [], success: false }
  } catch (err) {
    console.warn('[api] searchSignals failed:', err)
    return { signals: [], relatedMarkets: [], success: false }
  }
}
