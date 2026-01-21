import { describe, it, expect } from 'vitest'
import {
  formatNumber,
  formatLargeNumber,
  formatPercent,
  formatPrice,
  formatVolume,
  formatConfidence,
  formatCorrelation,
  formatSentiment,
  formatVolatility
} from '@/lib/formatters'

describe('formatters', () => {
  describe('formatNumber', () => {
    it('should format numbers with appropriate decimal places', () => {
      expect(formatNumber(1234.5678, 2)).toBe('1234.57')
      expect(formatNumber(0.123456, 3)).toBe('0.123')
    })

    it('should remove trailing zeros', () => {
      expect(formatNumber(1.5, 4)).toBe('1.5')
      expect(formatNumber(2.0, 4)).toBe('2')
    })

    it('should handle null/undefined/NaN values', () => {
      expect(formatNumber(null)).toBe('—')
      expect(formatNumber(undefined)).toBe('—')
      expect(formatNumber(NaN)).toBe('—')
    })

    it('should abbreviate large numbers', () => {
      expect(formatNumber(1500000)).toBe('1.5M')
      // formatNumber only abbreviates >= 1000000, smaller numbers need formatLargeNumber
      expect(formatNumber(5300)).toBe('5300')
    })
  })

  describe('formatLargeNumber', () => {
    it('should convert millions', () => {
      expect(formatLargeNumber(1500000)).toBe('1.5M')
      expect(formatLargeNumber(1000000)).toBe('1M')
    })

    it('should convert thousands', () => {
      expect(formatLargeNumber(5300)).toBe('5.3K')
      expect(formatLargeNumber(1000)).toBe('1K')
    })

    it('should convert billions', () => {
      expect(formatLargeNumber(1200000000)).toBe('1.2B')
    })

    it('should handle small numbers', () => {
      expect(formatLargeNumber(500)).toBe('500')
    })
  })

  describe('formatPercent', () => {
    it('should format decimal percentages', () => {
      expect(formatPercent(0.125, 1)).toBe('+12.5%')
      expect(formatPercent(-0.032, 1)).toBe('-3.2%')
    })

    it('should handle null/undefined values', () => {
      expect(formatPercent(null)).toBe('—')
      expect(formatPercent(undefined)).toBe('—')
    })

    it('should handle zero', () => {
      expect(formatPercent(0, 1)).toBe('0%')
    })
  })

  describe('formatPrice', () => {
    it('should format prices with appropriate decimals', () => {
      expect(formatPrice(1234.56)).toContain('1,234.56')
    })

    it('should handle null values', () => {
      expect(formatPrice(null)).toBe('—')
    })

    it('should use custom currency symbol', () => {
      const result = formatPrice(0.043, 'EUR')
      expect(result).toContain('EUR')
    })
  })

  describe('formatVolume', () => {
    it('should format volume with abbreviations', () => {
      expect(formatVolume(1500000)).toBe('1.5M')
      expect(formatVolume(5300)).toBe('5.3K')
    })

    it('should handle null values', () => {
      expect(formatVolume(null)).toBe('—')
    })
  })

  describe('formatConfidence', () => {
    it('should format confidence as percentage', () => {
      expect(formatConfidence(85.5)).toBe('86%')
      expect(formatConfidence(0.95, true)).toBe('95%')
    })

    it('should handle null values', () => {
      expect(formatConfidence(null)).toBe('—')
    })
  })

  describe('formatCorrelation', () => {
    it('should format correlation to 3 decimals without trailing zeros', () => {
      expect(formatCorrelation(0.8542)).toBe('0.854')
      expect(formatCorrelation(0.5)).toBe('0.5')
    })

    it('should handle null values', () => {
      expect(formatCorrelation(null)).toBe('—')
    })
  })

  describe('formatSentiment', () => {
    it('should format sentiment with sign', () => {
      expect(formatSentiment(0.45)).toBe('+0.45')
      expect(formatSentiment(-0.12)).toBe('-0.12')
    })

    it('should handle null values', () => {
      expect(formatSentiment(null)).toBe('—')
    })
  })

  describe('formatVolatility', () => {
    it('should format volatility as percentage', () => {
      expect(formatVolatility(0.352)).toBe('+35.2%')
    })

    it('should handle null values', () => {
      expect(formatVolatility(null)).toBe('—')
    })
  })
})
