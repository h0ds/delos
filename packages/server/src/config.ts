const isProd = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV !== 'production'

const corsOptions = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => {
  if (isDev && origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    callback(null, true)
  } else if (!origin || origin === process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*') {
    callback(null, true)
  } else {
    callback(new Error('CORS policy violation'))
  }
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3333', 10),
  newsApiKey: process.env.NEWS_API_KEY || '',
  aiApiKey: process.env.DEEPSEEK_API_KEY || '',
  polymarketApiKey: process.env.POLYMARKET_API_KEY || '',
  kalshiApiKey: process.env.KALSHI_API_KEY || '',
  kalshiApiSecret: process.env.KALSHI_API_SECRET || '',
  enableNewsAPI: process.env.ENABLE_NEWS_API !== 'false',
  enableGoogleNews: process.env.ENABLE_GOOGLE_NEWS !== 'false',
  enableReddit: process.env.ENABLE_REDDIT !== 'false',
  useNewPolymarketAPI: process.env.USE_NEW_POLYMARKET_API === 'true',
  aiApiProvider: process.env.AI_API_PROVIDER || 'deepseek',
  hasAiApi: !!process.env.DEEPSEEK_API_KEY,
  hasPolymarketApi: !!process.env.POLYMARKET_API_KEY,
  hasKalshiApi: !!process.env.KALSHI_API_KEY,
  cors: {
    origin: corsOptions,
    methods: ['GET', 'POST'],
    credentials: true
  },
  isDev,
  isProd
}
