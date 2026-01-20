export interface Signal {
  source: string
  title: string
  summary?: string
  date?: string
  url?: string
  category: 'news' | 'social'
  impact: number
  sentiment: number
  relatedMarkets: string[]
}

export interface SignalResponse {
  query: string
  timestamp: string
  signals: Signal[]
  analysis?: OracleAnalysis
  relatedMarkets?: PolymarketData[]
}

export interface OracleAnalysis {
  sentiment: 'bullish' | 'bearish' | 'neutral'
  sentimentScore: number
  keyFindings: string[]
  recommendation: string
  riskLevel: 'low' | 'medium' | 'high'
  confidenceLevel: number
}

export interface PolymarketData {
  marketId?: string
  market?: string
  question: string
  description?: string
  image?: string
  icon?: string
  category?: string
  slug?: string
  outcomes: Array<{ name: string; probability: number }>
  volume24h: number
  liquidity?: number
  relevance?: number
  confidence?: number
  status?: 'active' | 'closed' | 'resolved'
}

export interface SocketMessage {
  type: 'signal' | 'error' | 'status'
  data: Signal | Signal[] | { message: string }
  timestamp: string
}

export interface ServerToClientEvents {
  signal: (data: Signal) => void
  signals: (data: Signal[]) => void
  'scan:start': (data: { query: string }) => void
  'scan:complete': (data: { query: string; count: number }) => void
  'oracle:analysis': (data: OracleAnalysis) => void
  'oracle:markets': (data: PolymarketData[]) => void
  error: (data: { message: string }) => void
  status: (data: { status: string }) => void
}

export interface ClientToServerEvents {
  'signal:query': (query: string) => void
}

export interface InterServerEvents {}

export interface SocketData {}
