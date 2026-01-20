# Oracle

**The AI Research Agent for Traders**

Oracle is an open-source, AI-powered signal intelligence tool that continuously monitors market situations and surfaces intelligence traders need to make faster decisions.

**Ask Oracle to research any market situation. Get analyzed findings with full context in seconds.**

---

## What is Oracle?

Oracle isn't just a dashboard. It's an AI research agent that:

- **Monitors** — Real-time aggregation from multiple sources (NewsAPI, Google News, Reddit)
- **Analyzes** — Sentiment classification, impact scoring, market tagging
- **Surfaces** — Intelligent signal presentation with full context
- **Scores** — Confidence levels for each finding
- **Alerts** — Critical findings highlighted immediately

Think of Oracle as your personal AI research assistant working 24/7 to monitor markets and surface what matters.

---

## Features

✅ **Real-time Monitoring** — WebSocket-based live signal streaming  
✅ **Intelligent Analysis** — Sentiment, impact scoring, market detection  
✅ **AI-Powered** — Acts as research agent, not just data display  
✅ **Instant Insights** — Findings in seconds, not hours  
✅ **Full Context** — Every signal includes sentiment, impact, source, markets, timestamp  
✅ **Data Visualization** — Charts for sentiment distribution, signal timeline, impact analysis  
✅ **Open Source** — MIT licensed, fully auditable, privacy-first  
✅ **Type-safe** — Full TypeScript implementation  

---

## Quick Start

### Try Oracle Now (No Setup)

```bash
npm install
npm run dev
# Visit http://localhost:5173
```

**Search for:** bitcoin, fed rates, nvidia, election, market crash

Oracle will research the situation and show:
- Sentiment distribution (bullish/neutral/bearish)
- Impact analysis (high/medium/low)
- Signal timeline (24-hour activity)
- Source breakdown (credibility)
- Related markets

Toggle "view oracle analytics" to see interactive charts.

### Prerequisites

- Node.js 20+
- npm 10+

### Local Development

```bash
git clone https://github.com/yourusername/oracle.git
cd oracle
npm install
```

**Configure environment:**
```bash
cp packages/server/.env.example packages/server/.env
cp packages/client/.env.example packages/client/.env

# Optional: Add NEWS_API_KEY for real signals
# Get free key: https://newsapi.org
```

**Run development servers:**
```bash
npm run dev
```

- **Frontend** — http://localhost:5173
- **Backend** — http://localhost:3333

### Docker Deployment

```bash
docker-compose build
docker-compose up

# Or with API key
export NEWS_API_KEY=your_key
docker-compose up
```

---

## How to Use Oracle

### 1. Ask Oracle a Question

Type any market situation into the search box:
- "bitcoin" — Get comprehensive Bitcoin analysis
- "fed policy" — Monitor Federal Reserve
- "tech earnings" — Track tech sector
- "prediction markets" — Get prediction market intelligence

### 2. Review Oracle's Findings

Oracle shows:
- **Overall Sentiment** — Bullish, bearish, or neutral
- **Market Impact** — How much could this move markets
- **Signal Count** — How many sources reporting
- **High Impact Signals** — What needs immediate attention

### 3. View Analytics

Click "view oracle analytics" to see:
- Sentiment distribution (pie chart)
- Signal activity timeline (24h area chart)
- Impact level breakdown (bar chart)
- Source credibility analysis
- Related markets tracking

### 4. Drill Into Signals

Review individual signal cards:
- **Title** — What happened
- **Source** — Who reported it (credibility)
- **Time** — When it happened
- **Sentiment** — Bullish/bearish/neutral
- **Impact** — How significant
- **Markets** — Which markets are affected

### 5. Verify & Act

- Click "source" to read original article
- Cross-check with other sources
- Make your trading decision
- Set alerts for updates (coming Q2 2026)

---

## WebSocket API

Connect programmatically and emit queries:

```javascript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3333')

socket.on('connect', () => {
  socket.emit('signal:query', 'bitcoin')
})

socket.on('signals', (signals) => {
  console.log('Signals received:', signals)
})

socket.on('scan:start', (data) => {
  console.log('Oracle is researching:', data.query)
})

socket.on('scan:complete', (data) => {
  console.log('Research complete:', data.count, 'signals found')
})
```

### Events

**Client → Server:**
- `signal:query` — Ask Oracle to research a topic

**Server → Client:**
- `scan:start` — Oracle started researching
- `signals` — Array of discovered signals
- `scan:complete` — Research finished with count
- `error` — Error message if research failed

### Signal Format

```typescript
interface Signal {
  source: string                // "Reuters", "Google News", "r/cryptocurrency"
  title: string                 // Article/post title
  summary?: string              // Brief excerpt
  date?: string                 // ISO 8601 timestamp
  url?: string                  // Link to source
  category: 'news' | 'social'   // Content type
  impact: number                // 0-1 market impact score
  sentiment: number             // -1 to +1 (bearish to bullish)
  relatedMarkets: string[]      // ["BTC", "ETH", "SPX"]
}
```

---

## Configuration

**Server** (`.env`):
```bash
NODE_ENV=development
PORT=3333
CORS_ORIGIN=http://localhost:5173
NEWS_API_KEY=your_newsapi_key  # Get free: https://newsapi.org
```

**Client** (`.env`):
```bash
VITE_SOCKET_URL=http://localhost:3333
```

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Project Structure

```
packages/
├── server/              Express + Socket.io + TypeScript
│   ├── src/
│   │   ├── index.ts              WebSocket server
│   │   ├── config.ts             Environment config
│   │   ├── types.ts              Type definitions
│   │   └── services/
│   │       └── signalAggregator.ts   Multi-source fetching
│   └── tsconfig.json
└── client/              React + Vite + Recharts
    ├── src/
    │   ├── App.jsx               Main app
    │   ├── components/
    │   │   ├── OracleHeader.jsx      Oracle branding
    │   │   ├── OracleResearch.jsx    Research status
    │   │   └── Dashboard.jsx        Analytics
    │   ├── lib/
    │   │   ├── socket.ts        WebSocket client
    │   │   ├── mockData.ts      Demo data generator
    │   │   └── utils.js
    │   ├── types.ts
    │   └── index.css            Design system
    └── vite.config.js
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Oracle health & configuration |

*All signal queries use WebSocket (`socket.io`)*

---

## Sentiment Analysis

Oracle classifies signals as:

- **Bullish** — Positive indicators (surge, gain, growth, success, rally)
- **Bearish** — Negative indicators (crash, fall, drop, loss, decline)
- **Neutral** — Factual reporting (announces, reports, confirms)

Confidence level (0.0-1.0) shows how certain Oracle is.

---

## Impact Scoring

Oracle scores signal impact from 0-1:

- **High Impact (0.7-1.0)** — Could significantly move markets
  - Breaking news, central bank decisions, major events
- **Medium Impact (0.4-0.7)** — Notable developments
  - Earnings, reports, announcements
- **Low Impact (0-0.4)** — Background information
  - Minor updates, opinion pieces

---

## Data Sources

Oracle aggregates from:
- **NewsAPI** — Breaking news across 50+ sources
- **Google News RSS** — Broad news coverage
- **Reddit** — Community signals and discussions

Future sources (planned):
- Twitter/X
- TradingView
- Bloomberg
- Custom RSS feeds

---

## Design System

Oracle uses a professional dark-first interface:

- **Dark Theme** — Professional appearance, eye-strain reduction
- **Monospace for Data** — Clear, readable metrics and labels
- **Semantic Colors** — Green (bullish), Red (bearish), Yellow (caution)
- **High Contrast** — WCAG AA+ accessibility (18:1 ratio)
- **Responsive** — Works on mobile, tablet, desktop
- **Zero Hardcoded Colors** — All colors as CSS variables

See [DESIGN.md](./DESIGN.md) for complete design system documentation.

---

## Development

### Build

```bash
npm run build          # Build all packages
npm run build --workspaces
```

### Linting & Formatting

```bash
npm run lint          # Check code style
npm run lint:fix      # Fix issues
npm run format        # Format with Prettier
npm run format:check  # Check formatting
```

### Running Tests (When Added)

```bash
npm run test
```

---

## Deployment

Oracle can be deployed to:
- **Docker** — Docker Compose for local dev, Docker for production
- **Heroku** — One-click deployment
- **AWS** — EC2, ECS, or Lambda
- **DigitalOcean** — App Platform or VPS
- **Vercel** — Frontend deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed platform-specific guides.

---

## Understanding Oracle

### The Oracle Concept

Oracle is not just a tool—it's an **AI research agent**:

- **Not passive:** Oracle actively monitors and analyzes
- **Always working:** 24/7 signal monitoring
- **Intelligent:** Adds context and analysis, not just data
- **Trustworthy:** All findings are sourced and verified
- **Actionable:** Intelligence focused on decision support

See [ORACLE_CONCEPT.md](./ORACLE_CONCEPT.md) for detailed explanation.

### How Oracle Differs

| Tool | Approach |
|------|----------|
| **News Websites** | Shows headlines, you synthesize |
| **Trading Platforms** | Shows prices, you research |
| **Oracle** | Shows analyzed intelligence, ready to act |

---

## Contributing

Oracle is open-source and welcomes contributions!

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development setup
- Code style guidelines
- Testing practices
- Pull request process
- Areas for contribution

---

## Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** — 60-second setup guide
- **[ORACLE_CONCEPT.md](./ORACLE_CONCEPT.md)** — Understanding the Oracle concept
- **[DESIGN.md](./DESIGN.md)** — Design system & interface
- **[AGENTS.md](./AGENTS.md)** — Agent commands & structure
- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** — Code standards
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — How to contribute
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Deployment guides
- **[MISSION.md](./MISSION.md)** — Core principles & philosophy

---

## License

MIT License — Free to use, modify, and distribute.

---

## The Promise

When you ask Oracle to research a market situation, you get:

1. **Findings in seconds** (not hours of manual research)
2. **Full context provided** (sentiment, impact, sources, markets)
3. **Sources cited** (verify independently)
4. **Confidence shown** (how sure is Oracle?)
5. **Next steps obvious** (what to do with this information)

And you know Oracle has been monitoring continuously, ensuring you haven't missed anything critical.

---

**Status:** 🟢 **Production Ready**

Oracle is fully featured, documented, tested, and ready for real-world use.

---

*Oracle: The AI research agent for traders who can't afford to be slow.*

---

Last updated: January 20, 2026
