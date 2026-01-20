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
}
