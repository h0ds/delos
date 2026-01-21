/**
 * Professional number and data formatting utilities
 * Removes excessive trailing zeros, makes data beautiful
 */

/**
 * Format a number with smart decimals (removes trailing zeros)
 * @param {number} value - The number to format
 * @param {number} maxDecimals - Maximum decimal places
 * @returns {string} Formatted number like "1063.4" or "0.003"
 */
export function formatNumber(value, maxDecimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '—'

  // For very large numbers (>1000000), use scientific or abbreviated
  if (Math.abs(value) >= 1000000) {
    return formatLargeNumber(value)
  }

  // For very small numbers (<0.001), show more decimals
  if (Math.abs(value) > 0 && Math.abs(value) < 0.001) {
    return value.toFixed(6).replace(/\.?0+$/, '')
  }

  // Standard formatting: convert to string, parse as float to remove trailing zeros
  const formatted = Number(value.toFixed(maxDecimals)).toString()
  return formatted === '0' ? '0.00' : formatted
}

/**
 * Format large numbers with abbreviations (M, K, B)
 * @param {number} value - The number to format
 * @returns {string} Formatted like "1.2M" or "5.3K"
 */
export function formatLargeNumber(value) {
  if (Math.abs(value) >= 1000000000) {
    return (value / 1000000000).toFixed(1).replace(/\.?0+$/, '') + 'B'
  }
  if (Math.abs(value) >= 1000000) {
    return (value / 1000000).toFixed(1).replace(/\.?0+$/, '') + 'M'
  }
  if (Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(1).replace(/\.?0+$/, '') + 'K'
  }
  return formatNumber(value)
}

/**
 * Format a percentage value (expects 0-100 scale)
 * @param {number} value - The percentage value (0-100 scale, e.g., 75 = 75%)
 * @param {number} maxDecimals - Maximum decimal places (default 1)
 * @returns {string} Formatted like "+12.5%" or "-3.2%"
 */
export function formatPercent(value, maxDecimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '—'

  // Remove trailing zeros, format with sign
  const formatted = Number(value.toFixed(maxDecimals)).toString()
  const sign = value > 0 ? '+' : value === 0 ? '' : ''

  return `${sign}${formatted}%`
}

/**
 * Format price/currency values with proper decimal places
 * @param {number} value - Price value
 * @param {string} currency - Currency symbol (default '$')
 * @returns {string} Formatted like "$1,234.56" or "€0.043"
 */
export function formatPrice(value, currency = '$') {
  if (value === null || value === undefined || isNaN(value)) return '—'

  // Very small prices get more decimals
  if (Math.abs(value) < 0.01 && value !== 0) {
    return `${currency}${value.toFixed(6).replace(/\.?0+$/, '')}`
  }

  // Standard prices
  if (Math.abs(value) >= 1) {
    return `${currency}${Number(value.toFixed(2)).toLocaleString('en-US')}`
  }

  // Fractional prices
  return `${currency}${value.toFixed(4).replace(/\.?0+$/, '')}`
}

/**
 * Format volume with abbreviations (K, M, B)
 * @param {number} value - Volume value
 * @returns {string} Formatted like "1.2M" or "5.3K"
 */
export function formatVolume(value) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return formatLargeNumber(value)
}

/**
 * Format a probability/confidence value (0-100 or 0-1)
 * @param {number} value - Confidence value
 * @param {boolean} isDecimal - Whether value is 0-1 (default false, assumes 0-100)
 * @returns {string} Formatted like "95%" or "0%"
 */
export function formatConfidence(value, isDecimal = false) {
  if (value === null || value === undefined || isNaN(value)) return '—'

  const numValue = isDecimal ? value * 100 : value
  return `${Math.round(numValue)}%`
}

/**
 * Format a decimal correlation/index value (0-1)
 * @param {number} value - Correlation value between 0-1
 * @returns {string} Formatted like "0.85" or "0.002"
 */
export function formatCorrelation(value) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return value.toFixed(3).replace(/\.?0+$/, '')
}

/**
 * Format a volatility percentage (expects 0-100 scale)
 * @param {number} value - Volatility percentage (0-100, e.g., 35.2 = 35.2%)
 * @returns {string} Formatted like "35.2%" or "2.1%"
 */
export function formatVolatility(value) {
  if (value === null || value === undefined || isNaN(value)) return '—'

  // Don't use formatPercent since volatility doesn't need + sign
  const formatted = Number(value.toFixed(1)).toString()
  return `${formatted}%`
}

/**
 * Format sentiment score (-1 to 1)
 * @param {number} value - Sentiment score -1 (bearish) to +1 (bullish)
 * @returns {string} Formatted like "+0.45" or "-0.12"
 */
export function formatSentiment(value) {
  if (value === null || value === undefined || isNaN(value)) return '—'

  const formatted = value.toFixed(2).replace(/\.?0+$/, '')
  const sign = value > 0 ? '+' : value === 0 ? '' : ''

  return `${sign}${formatted}`
}
