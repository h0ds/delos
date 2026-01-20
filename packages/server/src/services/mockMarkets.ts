/**
 * Mock Markets Service - Used for local development when APIs aren't accessible
 */

export interface MockMarket {
  market: string
  question: string
  description?: string
  image?: string
  icon?: string
  category?: string
  slug?: string
  outcomes: Array<{ name: string; probability: number }>
  volume24h: number
  liquidity: number
  relevance: number
  confidence: number
  status: 'active' | 'closed' | 'resolved'
  dataFreshness: {
    isStale: boolean
    daysOld: number
    warning?: string
  }
}

const MOCK_POLYMARKETS: MockMarket[] = [
  {
    market: 'poly-001',
    question: 'Will Bitcoin reach $100,000 by end of 2024?',
    description: 'BTC spot price on major exchanges',
    category: 'Cryptocurrency',
    outcomes: [
      { name: 'Yes', probability: 0.72 },
      { name: 'No', probability: 0.28 }
    ],
    volume24h: 450000,
    liquidity: 125000,
    relevance: 0.9,
    confidence: 0.85,
    status: 'active',
    dataFreshness: { isStale: false, daysOld: 0 }
  },
  {
    market: 'poly-002',
    question: 'Will the Federal Reserve cut rates in Q1 2024?',
    description: 'Fed funds rate decision',
    category: 'Finance',
    outcomes: [
      { name: 'Yes', probability: 0.45 },
      { name: 'No', probability: 0.55 }
    ],
    volume24h: 320000,
    liquidity: 98000,
    relevance: 0.9,
    confidence: 0.85,
    status: 'active',
    dataFreshness: { isStale: false, daysOld: 0 }
  },
  {
    market: 'poly-003',
    question: 'Will OpenAI release GPT-5 in 2024?',
    description: 'New major AI model release',
    category: 'Technology',
    outcomes: [
      { name: 'Yes', probability: 0.38 },
      { name: 'No', probability: 0.62 }
    ],
    volume24h: 210000,
    liquidity: 56000,
    relevance: 0.9,
    confidence: 0.85,
    status: 'active',
    dataFreshness: { isStale: false, daysOld: 0 }
  },
  {
    market: 'poly-004',
    question: 'Will the S&P 500 close above 5,500 by end of 2024?',
    description: 'Stock market index performance',
    category: 'Finance',
    outcomes: [
      { name: 'Yes', probability: 0.63 },
      { name: 'No', probability: 0.37 }
    ],
    volume24h: 380000,
    liquidity: 115000,
    relevance: 0.9,
    confidence: 0.85,
    status: 'active',
    dataFreshness: { isStale: false, daysOld: 0 }
  }
]

const MOCK_KALSHI_MARKETS: MockMarket[] = [
  {
    market: 'kalshi-001',
    slug: 'unemployment-rate-2024',
    question: 'Will the US unemployment rate be below 4% in March 2024?',
    description: 'BLS unemployment rate',
    category: 'Economics',
    outcomes: [
      { name: 'Yes', probability: 0.68 },
      { name: 'No', probability: 0.32 }
    ],
    volume24h: 125000,
    liquidity: 42000,
    relevance: 0.9,
    confidence: 0.85,
    status: 'active',
    dataFreshness: { isStale: false, daysOld: 0 }
  },
  {
    market: 'kalshi-002',
    slug: 'eth-price-prediction-2024',
    question: 'Will Ethereum break $2,500 by February 2024?',
    description: 'Ethereum price prediction',
    category: 'Cryptocurrency',
    outcomes: [
      { name: 'Yes', probability: 0.55 },
      { name: 'No', probability: 0.45 }
    ],
    volume24h: 98000,
    liquidity: 31000,
    relevance: 0.9,
    confidence: 0.85,
    status: 'active',
    dataFreshness: { isStale: false, daysOld: 0 }
  },
  {
    market: 'kalshi-003',
    slug: 'inflation-cpi-2024',
    question: 'Will inflation (CPI) be above 3% in January 2024?',
    description: 'Consumer Price Index year-over-year',
    category: 'Economics',
    outcomes: [
      { name: 'Yes', probability: 0.72 },
      { name: 'No', probability: 0.28 }
    ],
    volume24h: 145000,
    liquidity: 48000,
    relevance: 0.9,
    confidence: 0.85,
    status: 'active',
    dataFreshness: { isStale: false, daysOld: 0 }
  },
  {
    market: 'kalshi-004',
    slug: 'tech-outperformance-2024',
    question: 'Will tech sector (QQQ) outperform S&P 500 in 2024?',
    description: 'Nasdaq-100 vs S&P 500 performance',
    category: 'Finance',
    outcomes: [
      { name: 'Yes', probability: 0.58 },
      { name: 'No', probability: 0.42 }
    ],
    volume24h: 110000,
    liquidity: 36000,
    relevance: 0.9,
    confidence: 0.85,
    status: 'active',
    dataFreshness: { isStale: false, daysOld: 0 }
  }
]

export function getMockPolymarkets(): MockMarket[] {
  return MOCK_POLYMARKETS
}

export function getMockKalshiMarkets(): MockMarket[] {
  return MOCK_KALSHI_MARKETS
}

export function getAllMockMarkets(): MockMarket[] {
  return [...MOCK_POLYMARKETS, ...MOCK_KALSHI_MARKETS]
}
