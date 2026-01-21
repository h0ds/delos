# Oracle AI Integration & Polymarket Support

**Date:** January 20, 2026  
**Status:** ✅ Implemented & Verified

---

## Overview

Oracle now has two major enhancements:

1. **AI-Powered Analysis** — Leverages language models to provide intelligent market analysis
2. **Polymarket Data** — Integrates prediction market data to show real market probabilities

Together, these make Oracle a powerful research agent with real intelligence backing its findings.

---

## AI Integration

### Supported Providers

Oracle supports multiple AI providers:

- **OpenAI** — GPT-4, GPT-4-turbo
- **Anthropic** — Claude 3 family
- **DeepSeek** — DeepSeek Chat (low-cost alternative)
- **Custom** — Any provider with OpenAI-compatible API

### Setup

Add your AI API key to `.env`:

```bash
# Choose one provider:

# OpenAI
AI_API_KEY=sk-proj-xxxxx
AI_API_PROVIDER=openai

# Anthropic
AI_API_KEY=sk-ant-xxxxx
AI_API_PROVIDER=anthropic

# DeepSeek
AI_API_KEY=sk-xxxxx
AI_API_PROVIDER=deepseek
```

### How It Works

When a user searches, Oracle:

1. **Aggregates signals** from NewsAPI, Google News, Reddit
2. **Calls AI API** with signal summary and query
3. **Gets intelligent analysis:**
   - Overall sentiment (bullish/bearish/neutral)
   - Sentiment confidence score
   - Key insights extracted from signals
   - Trading recommendations
   - Risk level assessment
   - Analysis confidence level
4. **Returns to client** with full context

### Example Request

```typescript
// To AI: "Analyze these signals for bitcoin"
{
  query: "bitcoin",
  signals: [
    {
      title: "Bitcoin surges past $50,000",
      source: "Reuters",
      sentiment: 0.8,
      impact: 0.85,
      // ... more signals
    },
    // ... more signals
  ]
}

// From AI:
{
  sentiment: "bullish",
  sentimentScore: 0.45,
  keyInsights: [
    "Institutional investors accumulating",
    "Technical resistance breached",
    "On-chain metrics positive"
  ],
  recommendation: "Market conditions favorable for long positions",
  riskLevel: "medium",
  confidenceLevel: 0.82
}
```

### What AI Provides

Unlike keyword-based analysis, AI:
- **Understands context** — Sarcasm, nuance, complex language
- **Identifies patterns** — Correlations humans miss
- **Synthesizes information** — Multiple signals into coherent view
- **Provides reasoning** — Why does this matter?
- **Adapts to domains** — Crypto, stocks, politics, etc.

### Fallback Mode

If AI API is unavailable:
- Oracle falls back to heuristic analysis
- Still provides insights, just less sophisticated
- System continues working reliably

---

## Polymarket Integration

### What is Polymarket?

Polymarket is a decentralized prediction market where traders bet on real-world outcomes:
- Political elections
- Sports outcomes
- Crypto prices
- Economic data
- World events

Real money trading = Real probability estimates

### Setup

Add Polymarket API key:

```bash
POLYMARKET_API_KEY=your_polymarket_api_key
```

Get key: [polymarket.com/api](https://polymarket.com/api)

### How It Works

When a user searches, Oracle:

1. **Aggregates signals** from news sources
2. **Searches Polymarket** for related prediction markets
3. **Extracts market data:**
   - Question (what's being predicted)
   - Outcomes and current probabilities
   - Trading volume (liquidity indicator)
   - Market relevance score
4. **Returns to client** as "related markets"

### Example

**User searches:** "bitcoin surge"

**Oracle finds markets:**
```
Market 1: "Will Bitcoin reach $100k by end of 2025?"
  - Yes: 65% ($0.65 per contract)
  - No: 35% ($0.35 per contract)
  - Volume: $2.3M
  - Relevance: 0.92

Market 2: "Bitcoin above $60k at month-end?"
  - Yes: 72%
  - No: 28%
  - Volume: $1.8M
  - Relevance: 0.85
```

### Market Relevance Scoring

Oracle scores how relevant each market is to the search:

- **Direct match** (0.85-1.0) — Market question mentions key terms
- **Strong relevance** (0.65-0.85) — Multiple keyword matches
- **Moderate relevance** (0.40-0.65) — Some connections
- **Low relevance** (0-0.40) — Tangential only

### Integrating Markets with Signals

**Before:** "Bitcoin prices up. Here are news signals."

**After:** "Bitcoin prices up. Here's what markets are pricing in:
- 72% chance Bitcoin stays above $60k
- This aligns with bullish news signals
- Current odds support the consensus"

This gives traders **market-driven ground truth**, not just sentiment.

---

## Socket.io Events

New events for AI analysis and markets:

### From Server

```typescript
// When research starts
socket.on('scan:start', { query: 'bitcoin' })

// Signal list
socket.on('signals', [/* ... signals ... */])

// NEW: AI Analysis
socket.on('oracle:analysis', {
  sentiment: 'bullish',
  sentimentScore: 0.45,
  keyFindings: [/* ... */],
  recommendation: '...',
  riskLevel: 'medium',
  confidenceLevel: 0.82
})

// NEW: Related Markets
socket.on('oracle:markets', [
  {
    marketId: 'uuid',
    question: 'Bitcoin above $60k?',
    outcomes: [
      { name: 'Yes', probability: 0.72 },
      { name: 'No', probability: 0.28 }
    ],
    volume24h: 1800000,
    relevance: 0.85
  },
  // ... more markets
])

// When done
socket.on('scan:complete', { query: 'bitcoin', count: 0 })
```

---

## Architecture

### Flow Diagram

```
User Query
    ↓
Oracle (Server)
    ├─→ Signal Aggregator
    │   ├─→ NewsAPI
    │   ├─→ Google News
    │   └─→ Reddit
    │
    ├─→ AI Intelligence Service
    │   ├─→ Build analysis prompt
    │   └─→ Call AI API (OpenAI/Anthropic/DeepSeek)
    │
    └─→ Polymarket Service
        ├─→ Search markets
        ├─→ Get probabilities
        └─→ Score relevance

    ↓
Emit Results to Client
    ├─→ signals: [...]
    ├─→ oracle:analysis: {...}
    └─→ oracle:markets: [...]
```

### Services

**signalAggregator.ts**
- `acquireSignals()` — Basic signal fetching
- `acquireSignalsWithAnalysis()` — Enhanced with AI + markets

**aiIntelligence.ts**
- `analyzeSignalsWithAI()` — Call AI for analysis
- Support for OpenAI, Anthropic, DeepSeek
- Fallback to heuristic analysis

**polymarketService.ts**
- `getPolymarketMarkets()` — Search and fetch markets
- `getMarketProbabilities()` — Get live probabilities
- Market relevance scoring

---

## Configuration

### Environment Variables

```bash
# AI API Configuration
AI_API_KEY=              # API key from provider
AI_API_PROVIDER=openai   # openai, anthropic, deepseek

# Market Data Configuration
POLYMARKET_API_KEY=      # Polymarket API key

# Detection
hasAiApi                 # true if AI_API_KEY set
hasPolymarketApi         # true if POLYMARKET_API_KEY set
```

### Behavior

- **Both APIs configured:** Full intelligence + market data
- **Only AI API:** Intelligence analysis only
- **Only Polymarket API:** Related markets only
- **Neither configured:** Heuristic analysis (keyword-based)

All modes work. More data = better insights.

---

## Usage Examples

### Search with AI Analysis

```typescript
// Client emits
socket.emit('signal:query', 'fed rate hike')

// Server processes
// 1. Fetches news signals
// 2. Calls OpenAI for analysis
// 3. Searches Polymarket markets
// 4. Sends back complete picture

// Client receives
socket.on('oracle:analysis', {
  sentiment: 'bearish',
  sentimentScore: -0.32,
  keyFindings: [
    'Strong institutional selling',
    'Multiple sources cite rate hike impact',
    'Market expects volatility'
  ],
  recommendation: 'Consider defensive positioning',
  riskLevel: 'high',
  confidenceLevel: 0.89
})

socket.on('oracle:markets', [
  {
    question: 'Will Fed hike rates in January?',
    outcomes: [
      { name: 'Yes', probability: 0.78 },
      { name: 'No', probability: 0.22 }
    ],
    volume24h: 5200000,
    relevance: 0.98
  }
])
```

### Search without APIs

If APIs unavailable:
```typescript
// Heuristic analysis still provided
socket.on('oracle:analysis', {
  sentiment: 'bearish',
  sentimentScore: -0.35,
  keyFindings: [
    '12 signals analyzed',
    '4 bullish, 7 bearish',
    'Average impact: 0.68'
  ],
  recommendation: 'Continue monitoring',
  riskLevel: 'medium',
  confidenceLevel: 0.65
})

// No markets (Polymarket API down)
// But system still functional
```

---

## Cost Considerations

### AI API Costs

**OpenAI GPT-4-turbo:**
- ~$0.01 per query (prompt + completion)
- 500 queries = $5

**Anthropic Claude 3:**
- ~$0.005 per query
- 500 queries = $2.50

**DeepSeek:**
- ~$0.0001 per query
- 500 queries = $0.05

### Polymarket API

- Free tier available
- No per-query costs

### Recommendation

For public deployment:
1. Use DeepSeek (lowest cost)
2. Add caching to avoid duplicate queries
3. Set rate limits per user
4. Monitor costs weekly

---

## Future Enhancements

### Phase 2 (Q2 2026)
- [ ] Fine-tuned AI models for trading-specific analysis
- [ ] Confidence scoring improvements
- [ ] Multi-market correlation analysis

### Phase 3 (Q3 2026)
- [ ] Real-time streaming of market probabilities
- [ ] Integration with more prediction markets
- [ ] Custom AI prompt templates per market type

### Phase 4 (Q4 2026+)
- [ ] Ensemble AI (multiple models for consensus)
- [ ] ML-based model selection (best provider per query type)
- [ ] Proprietary training on historical Oracle accuracy

---

## Troubleshooting

### AI API Not Working

```bash
# Check key format
# OpenAI: sk-proj-xxxxx
# Anthropic: sk-ant-xxxxx
# DeepSeek: sk-xxxxx

# Verify in logs
npm run dev:server
# Should show: [ai:analysis] success

# If error: [ai:analysis] failed
# 1. Check API key
# 2. Check API provider name
# 3. Verify plan has API access
# 4. Check rate limits
```

### Polymarket Data Missing

```bash
# Check API key
# Verify market exists for query
# Check relevance threshold

# Fallback: System works without Polymarket
# Just doesn't show markets
```

### Performance Issues

If queries are slow:
1. Add caching (TODO: implement)
2. Use cheaper AI provider (DeepSeek)
3. Reduce API calls (filter before calling)
4. Use Polymarket snapshot data (less real-time)

---

## Testing

### Without APIs (Always Works)

```bash
npm run dev
# Search "bitcoin"
# Should show heuristic analysis
# No market data
```

### With APIs

```bash
# Add keys to .env
AI_API_KEY=sk-xxx
POLYMARKET_API_KEY=xxx

npm run dev
# Search "bitcoin"
# Should show AI analysis + markets
```

---

## Security Notes

- API keys stored in `.env` (never committed)
- Keys sent securely to APIs (HTTPS)
- No caching of API responses with PII
- Rate limiting recommended for production
- Monitor API usage for unauthorized access

---

**Oracle is now an intelligent research agent backed by real AI and market data.**

---

Last updated: January 20, 2026
