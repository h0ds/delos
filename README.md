# Delos

**Make Better Decisions.**

Delos is an intelligent research platform that combines real-time market data with AI-powered analysis to help traders and researchers navigate prediction markets with confidence.

---

## What is Delos?

Delos bridges the gap between raw market data and actionable intelligence by:

- **Aggregating Markets** — Real-time data from Polymarket, Kalshi, and other prediction market platforms
- **Researching Topics** — AI-powered signal discovery across news, social media, and market data
- **Analyzing Context** — Sentiment classification, impact scoring, market correlation detection
- **Presenting Intelligence** — Clear visualization and comparison tools for informed decision-making
- **Scoring Impact** — Confidence levels and relevance metrics for every finding

Think of Delos as your research assistant for prediction markets—continuously monitoring, analyzing, and surfacing the intelligence you need.

---

## Features

✅ **Prediction Market Integration** — Polymarket & Kalshi data aggregation  
✅ **Real-time Signal Analysis** — Multi-source news, social, market data monitoring  
✅ **Market Research Tools** — Deep dives into market details and related signals  
✅ **Market Comparison** — Side-by-side analysis of related prediction markets  
✅ **Sentiment Analysis** — Classify signals as bullish, bearish, or neutral  
✅ **Impact Scoring** — Rate signal significance for market decisions  
✅ **Interactive Visualizations** — Charts and analytics for market trends  
✅ **Full Context** — Every market and signal includes source, time, related data  
✅ **Open Source** — MIT licensed, fully auditable, privacy-first  
✅ **Type-safe** — Full TypeScript implementation  

---

## Quick Start

### Try Delos Now (No Setup)

```bash
npm install
npm run dev
# Visit http://localhost:5173
```

**Explore:**
- Browse featured prediction markets
- Search for market signals and analysis
- Compare related markets side-by-side
- View real-time analytics

### Prerequisites

- Node.js 20+
- npm 10+

### Local Development

```bash
git clone https://github.com/h0ds/delos.git
cd delos
npm install
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

# Frontend: http://localhost:5173
# Backend: http://localhost:3333
```

---

## How to Use Delos

### 1. Explore Markets

Start on the home page to see featured prediction markets from Polymarket and Kalshi:
- Browse current markets by category
- View market metadata (description, expiry, participants)
- Check data freshness and quality scores

### 2. Dive Into Market Details

Click any market to see:
- **Market Overview** — Question, description, resolution criteria
- **Price History** — How odds have shifted over time
- **Related Signals** — News and discussions relevant to this market
- **Market Comparison** — Compare with similar markets

### 3. Research Markets

Use the search functionality to:
- Find signals about specific topics
- Get AI-powered analysis of market relevance
- Discover related markets you might have missed
- Understand sentiment across sources

### 4. Compare Markets

Select two markets to see:
- Side-by-side details and metrics
- Correlation analysis
- Overlapping signals
- Independent predictions

### 5. Make Informed Decisions

Delos provides the context you need:
- What are traders saying? (Sentiment)
- How significant is this news? (Impact)
- Which markets are affected? (Correlation)
- Where's the best value? (Comparison)

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
│   │       ├── marketAggregator.ts   Multi-source data
│   │       └── signalAnalysis.ts     Analysis engine
│   └── tsconfig.json
└── client/              React + Vite + shadcn/ui + Recharts
    ├── src/
    │   ├── App.jsx               Main app
    │   ├── components/
    │   │   ├── layout/           Header, navigation
    │   │   ├── market/           Market cards, details
    │   │   ├── signals/          Signal cards, search
    │   │   ├── pages/            Detail and comparison pages
    │   │   └── ui/               shadcn components
    │   ├── hooks/
    │   ├── lib/
    │   ├── types.ts
    │   └── index.css             Design system
    └── vite.config.js
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Server health & info |
| WebSocket: `markets` | Event | Real-time market data |
| WebSocket: `signal:query` | Event | Request signal analysis |

---

## WebSocket Events

### Client → Server

- `signal:query` — Request analysis for a topic
  ```json
  { "query": "bitcoin ETF" }
  ```

### Server → Client

- `markets` — Real-time market feed
- `scan:start` — Analysis started
- `signals` — Discovered signals and analysis
- `scan:complete` — Analysis finished
- `error` — Error message

---

## Sentiment Analysis

Delos classifies signals as:

- **Bullish** — Positive indicators (rally, gain, growth, approval, surge)
- **Bearish** — Negative indicators (crash, loss, decline, concern, drop)
- **Neutral** — Factual reporting (announces, reports, confirms, data)

Each classification includes a confidence score (0.0-1.0).

---

## Impact Scoring

Signals are scored 0-1 for market impact:

- **High Impact (0.7-1.0)** — Could significantly affect market odds
  - Breaking news, major announcements, policy changes
- **Medium Impact (0.4-0.7)** — Notable developments
  - Updates, reports, earnings
- **Low Impact (0-0.4)** — Background information
  - Opinion pieces, analysis, minor updates

---

## Data Sources

Delos aggregates from:
- **Polymarket API** — Prediction markets with real-time data
- **Kalshi API** — Binary event prediction markets
- **NewsAPI** — Breaking news across 50+ outlets
- **Google News RSS** — Broad news coverage
- **Reddit** — Community signals and discussions

Future sources:
- Twitter/X
- TradingView
- Bloomberg
- Custom RSS feeds

---

## Design System

Delos uses a professional, data-focused interface:

- **Dark Theme** — Reduces eye strain, modern appearance
- **Monospace for Data** — Clear, readable metrics and labels
- **Semantic Colors** — Green (bullish), Red (bearish), Yellow (caution)
- **High Contrast** — WCAG AA+ accessibility
- **Responsive** — Works on mobile, tablet, desktop
- **Minimal Animations** — Subtle, purposeful transitions

See [STYLE_GUIDE.md](./STYLE_GUIDE.md) for complete design documentation.

---

## Development

### Build

```bash
npm run build          # Build all packages
```

### Linting & Formatting

```bash
npm run lint          # Check code style
npm run lint:fix      # Fix issues
npm run format        # Format with Prettier
npm run format:check  # Check formatting
```

---

## Deployment

Delos can be deployed to:
- **Docker** — Docker Compose or standalone
- **Vercel** — Frontend (React)
- **Heroku** — Backend (Node.js)
- **AWS** — EC2, ECS, or Lambda
- **DigitalOcean** — App Platform or VPS

See docs/ folder for deployment guides.

---

## Configuration

**Server** (`.env`):
```bash
NODE_ENV=development
PORT=3333
CORS_ORIGIN=http://localhost:5173
```

**Client** (`.env`):
```bash
VITE_SOCKET_URL=http://localhost:3333
```

---

## Contributing

Delos is open-source and welcomes contributions!

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development setup
- Code style guidelines
- Testing practices
- Pull request process

---

## Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** — 60-second setup
- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** — Code standards & design
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Contributing guide
- **[AGENTS.md](./AGENTS.md)** — Development commands

See `docs/` folder for extended documentation.

---

## License

MIT License — Free to use, modify, and distribute.

---

## The Promise

When you use Delos to research prediction markets, you get:

1. **Current Market Data** — Real-time odds and metadata
2. **Relevant Signals** — News and discussions that matter
3. **Clear Analysis** — Sentiment and impact scoring
4. **Sources Cited** — Verify everything independently
5. **Confidence Shown** — How sure is the analysis?

Delos helps you make better decisions in prediction markets.

---

**Status:** 🟢 **Production Ready**

Delos is fully featured, documented, and ready for real-world use.

---

*Delos: Make Better Decisions.*

---

Last updated: January 21, 2026
