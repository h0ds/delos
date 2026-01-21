/**
 * Centralized API endpoints for health checks and provider status
 * Provides real-time monitoring of connected services
 */

const API_BASE = 'http://localhost:3333/api'

/**
 * Fetch health status of all configured providers
 * @returns {Promise<{providers: Object, timestamp: string}>}
 */
export async function getHealthStatus() {
  try {
    const response = await fetch(`${API_BASE}/health`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.json()
    console.log('[api] health check:', {
      providers: Object.keys(data.providers || {})
    })
    return data
  } catch (err) {
    console.error('[api] getHealthStatus failed:', err)
    return {
      providers: {},
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Get provider status from health check
 * @param {string} providerName - Name of provider to check
 * @returns {Promise<{enabled: boolean, configured: boolean, status: string}>}
 */
export async function getProviderStatus(providerName) {
  try {
    const health = await getHealthStatus()
    return (
      health.providers?.[providerName] || {
        enabled: false,
        configured: false,
        status: 'unavailable'
      }
    )
  } catch (err) {
    console.error(`[api] getProviderStatus(${providerName}) failed:`, err)
    return {
      enabled: false,
      configured: false,
      status: 'error'
    }
  }
}
