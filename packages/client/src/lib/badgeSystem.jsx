/**
 * Badge Type System
 * Defines consistent badge variants, colors, and icons across the application
 */

import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  AlertTriangle,
  Lightbulb,
  Activity,
  Percent,
  DollarSign
} from 'lucide-react'

/**
 * Utility function to properly capitalize text
 */
function toProperCase(text) {
  if (!text) return ''
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Badge type definitions
 */
export const BADGE_TYPES = {
  // Sentiment & Direction
  BULLISH: 'bullish',
  BEARISH: 'bearish',
  NEUTRAL: 'neutral',

  // Status
  ACTIVE: 'active',
  CLOSED: 'closed',
  PENDING: 'pending',

  // Sentiment Levels
  STRONG_BULLISH: 'strong-bullish',
  WEAK_BULLISH: 'weak-bullish',
  STRONG_BEARISH: 'strong-bearish',
  WEAK_BEARISH: 'weak-bearish',

  // Metrics
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',

  // Quality
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',

  // Market Status
  TRENDING_UP: 'trending-up',
  TRENDING_DOWN: 'trending-down',

  // Risk
  RISK: 'risk',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success',

  // Sources & Tags
  SOURCE: 'source',
  CATEGORY: 'category',
  THEME: 'theme'
}

/**
 * Badge configuration mapping - No borders, squircle design
 */
const BADGE_CONFIG = {
  [BADGE_TYPES.BULLISH]: {
    className: 'bg-bullish/25 text-bullish',
    icon: TrendingUp,
    label: 'Bullish'
  },
  [BADGE_TYPES.BEARISH]: {
    className: 'bg-bearish/25 text-bearish',
    icon: TrendingDown,
    label: 'Bearish'
  },
  [BADGE_TYPES.NEUTRAL]: {
    className: 'bg-muted/30 text-muted-foreground',
    icon: Activity,
    label: 'Neutral'
  },

  [BADGE_TYPES.ACTIVE]: {
    className: 'bg-bullish/25 text-bullish',
    icon: Zap,
    label: 'Active'
  },
  [BADGE_TYPES.CLOSED]: {
    className: 'bg-bearish/25 text-bearish',
    icon: AlertCircle,
    label: 'Closed'
  },
  [BADGE_TYPES.PENDING]: {
    className: 'bg-primary/25 text-primary',
    icon: Clock,
    label: 'Pending'
  },

  [BADGE_TYPES.STRONG_BULLISH]: {
    className: 'bg-bullish/30 text-bullish font-semibold',
    icon: TrendingUp,
    label: 'Strong Bullish'
  },
  [BADGE_TYPES.WEAK_BULLISH]: {
    className: 'bg-bullish/20 text-bullish',
    icon: TrendingUp,
    label: 'Weak Bullish'
  },
  [BADGE_TYPES.STRONG_BEARISH]: {
    className: 'bg-bearish/30 text-bearish font-semibold',
    icon: TrendingDown,
    label: 'Strong Bearish'
  },
  [BADGE_TYPES.WEAK_BEARISH]: {
    className: 'bg-bearish/20 text-bearish',
    icon: TrendingDown,
    label: 'Weak Bearish'
  },

  [BADGE_TYPES.HIGH]: {
    className: 'bg-bearish/25 text-bearish',
    icon: AlertTriangle,
    label: 'High'
  },
  [BADGE_TYPES.MEDIUM]: {
    className: 'bg-primary/25 text-primary',
    icon: AlertCircle,
    label: 'Medium'
  },
  [BADGE_TYPES.LOW]: {
    className: 'bg-bullish/25 text-bullish',
    icon: CheckCircle,
    label: 'Low'
  },

  [BADGE_TYPES.EXCELLENT]: {
    className: 'bg-bullish/30 text-bullish font-semibold',
    icon: CheckCircle,
    label: 'Excellent'
  },
  [BADGE_TYPES.GOOD]: {
    className: 'bg-bullish/25 text-bullish',
    icon: CheckCircle,
    label: 'Good'
  },
  [BADGE_TYPES.FAIR]: {
    className: 'bg-primary/25 text-primary',
    icon: AlertCircle,
    label: 'Fair'
  },
  [BADGE_TYPES.POOR]: {
    className: 'bg-bearish/20 text-bearish',
    icon: AlertTriangle,
    label: 'Poor'
  },

  [BADGE_TYPES.TRENDING_UP]: {
    className: 'bg-bullish/25 text-bullish',
    icon: TrendingUp,
    label: 'Trending Up'
  },
  [BADGE_TYPES.TRENDING_DOWN]: {
    className: 'bg-bearish/25 text-bearish',
    icon: TrendingDown,
    label: 'Trending Down'
  },

  [BADGE_TYPES.RISK]: {
    className: 'bg-bearish/25 text-bearish',
    icon: AlertTriangle,
    label: 'Risk'
  },
  [BADGE_TYPES.WARNING]: {
    className: 'bg-primary/25 text-primary',
    icon: AlertCircle,
    label: 'Warning'
  },
  [BADGE_TYPES.INFO]: {
    className: 'bg-primary/20 text-primary',
    icon: Activity,
    label: 'Info'
  },
  [BADGE_TYPES.SUCCESS]: {
    className: 'bg-bullish/25 text-bullish',
    icon: CheckCircle,
    label: 'Success'
  },

  [BADGE_TYPES.SOURCE]: {
    className: 'bg-primary/20 text-primary font-mono text-xs',
    icon: null,
    label: 'Source'
  },
  [BADGE_TYPES.CATEGORY]: {
    className: 'bg-primary/20 text-primary font-mono text-xs',
    icon: Target,
    label: 'Category'
  },
  [BADGE_TYPES.THEME]: {
    className: 'bg-primary/20 text-primary font-mono text-xs',
    icon: Lightbulb,
    label: 'Theme'
  }
}

/**
 * Semantic badge helper functions
 */
export function getSentimentBadgeType(sentiment) {
  if (sentiment > 0.5) return BADGE_TYPES.STRONG_BULLISH
  if (sentiment > 0.1) return BADGE_TYPES.WEAK_BULLISH
  if (sentiment < -0.5) return BADGE_TYPES.STRONG_BEARISH
  if (sentiment < -0.1) return BADGE_TYPES.WEAK_BEARISH
  return BADGE_TYPES.NEUTRAL
}

export function getVolatilityBadgeType(volatility) {
  if (volatility > 60) return BADGE_TYPES.HIGH
  if (volatility > 30) return BADGE_TYPES.MEDIUM
  return BADGE_TYPES.LOW
}

export function getConfidenceBadgeType(confidence) {
  if (confidence > 80) return BADGE_TYPES.EXCELLENT
  if (confidence > 60) return BADGE_TYPES.GOOD
  if (confidence > 40) return BADGE_TYPES.FAIR
  return BADGE_TYPES.POOR
}

export function getMarketStatusBadgeType(status) {
  return status === 'active' ? BADGE_TYPES.ACTIVE : BADGE_TYPES.CLOSED
}

/**
 * Unified Badge Component
 * Usage: <BadgeUnified type={BADGE_TYPES.BULLISH} label="Strong Uptrend" />
 */
export function BadgeUnified({
  type,
  label,
  icon: Icon,
  className: customClassName,
  children,
  showIcon = true
}) {
  const config = BADGE_CONFIG[type]

  if (!config) {
    console.warn(`Unknown badge type: ${type}`)
    return null
  }

  const IconComponent = Icon || config.icon
  const rawLabel = children || label || config.label
  const displayLabel = toProperCase(rawLabel)

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 rounded-2xl ${config.className} ${customClassName || ''}`}
    >
      {showIcon && IconComponent && <IconComponent className="w-3 h-3" />}
      <span>{displayLabel}</span>
    </Badge>
  )
}

/**
 * Compact badge - no label, icon only (circular with 2x rounding)
 */
export function BadgeCompact({ type, tooltip }) {
  const config = BADGE_CONFIG[type]

  if (!config || !config.icon) return null

  const Icon = config.icon

  return (
    <div
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full border ${config.className}`}
      title={tooltip || config.label}
    >
      <Icon className="w-3 h-3" />
    </div>
  )
}

/**
 * Horizontal list of badges
 */
export function BadgeList({ items, type = BADGE_TYPES.SOURCE, max = 3, className = '' }) {
  const displayed = items.slice(0, max)
  const remaining = items.length - max

  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      {displayed.map((item, idx) => (
        <BadgeUnified key={idx} type={type} label={item} />
      ))}
      {remaining > 0 && (
        <BadgeUnified type={BADGE_TYPES.INFO} label={`+${remaining} More`} showIcon={false} />
      )}
    </div>
  )
}

export default {
  BADGE_TYPES,
  BadgeUnified,
  BadgeCompact,
  BadgeList,
  getSentimentBadgeType,
  getVolatilityBadgeType,
  getConfidenceBadgeType,
  getMarketStatusBadgeType
}
