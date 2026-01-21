# Demo Mode Guide

## Overview

**sigint** includes a built-in demo mode with mock signal data and analytics visualizations. This lets you explore the UI and data visualization capabilities without requiring a backend server or API keys.

## Running the Demo

### Quick Start

```bash
npm run dev
```

Visit **http://localhost:5173** and start searching:

- `bitcoin` — Crypto-related signals
- `fed rates` — Federal Reserve & macroeconomic signals
- `nvidia` — Tech & AI signals
- `election` — Political signals
- *(search anything — generates contextual mock data)*

### Demo Features

When you search, you'll see:

1. **Signal Cards** — Individual news/social media signals with:
   - Title, source, publication date
   - Sentiment classification (bullish/bearish/neutral)
   - Impact level (high/medium/low)
   - Related markets (BTC, ETH, SPX, etc.)

2. **Analytics Dashboard** — Toggle with "show analytics" button:
   - **Key Metrics** — Total signals, average sentiment, average impact
   - **Signal Activity (24h)** — Stacked area chart showing sentiment distribution over time
   - **Sentiment Distribution** — Donut chart (bullish/neutral/bearish split)
   - **Impact Levels** — Bar chart (high/medium/low breakdown)
   - **Top Sources** — Horizontal bar chart of signal sources
   - **Sentiment Breakdown** — Progress bars with counts

## How It Works

### Mock Data Generation

The demo uses `src/lib/mockData.ts` to generate realistic-looking signals:

```javascript
import { generateMockSignals, generateChartData } from '@/lib/mockData'

const signals = generateMockSignals('bitcoin', 25)  // 25 signals for "bitcoin"
const charts = generateChartData(signals)          // Derived analytics
```

**Features:**
- Context-aware titles based on search query
- Realistic sentiment (-1 to +1) and impact (0 to 1) scores
- Appropriate market tagging (auto-detects BTC, ETH, FED, etc.)
- Varied sources (Reuters, Bloomberg, Reddit, Google News)
- Timestamps within last 48 hours

### Design System

All charts follow the **sigint design system**:

- **Colors** — Dark background, green accents (#22c55e), semantic reds/yellows
- **Typography** — Monospace for labels, system sans-serif for headers
- **Charts** — Minimal, data-dense visualizations with subtle animations
- **Layout** — Card-based, responsive grid (2 cols → 1 col on mobile)

## Switching Modes

### Demo Mode (Default)

Always uses mock data. Good for:
- UI/UX exploration
- Design reviews
- Demos to stakeholders
- Development without backend

**Environment:**
```bash
VITE_DEMO_MODE=true
VITE_SOCKET_URL=http://localhost:3333
```

### Connected Mode

Requires running backend server. Fetches real signals from:
- **NewsAPI** — News articles
- **Google News RSS** — RSS feed parsing
- **Reddit API** — Social signals (no key required)

**Setup:**
```bash
# Terminal 1: Start backend
npm run dev:server

# Terminal 2: Start frontend (auto-falls back to mock if server down)
npm run dev
```

**Environment:**
```bash
VITE_SOCKET_URL=http://localhost:3333
# If server is unreachable, falls back to mock data automatically
```

## Customizing Mock Data

Edit `packages/client/src/lib/mockData.ts`:

```typescript
// Add custom news sources
const SOURCES = ['Reuters', 'Your Source', ...]

// Customize market keywords
const keywords = {
  'YOUR_TICKER': ['keyword1', 'keyword2'],
  ...
}

// Modify sentiment/impact distribution
function generateSentiment(): number {
  return Math.random() * 2 - 1  // Change formula here
}
```

## Chart Components

The dashboard uses **Recharts** for visualizations:

- `AreaChart` — Signal activity timeline
- `PieChart` — Sentiment distribution (donut style)
- `BarChart` — Impact levels & source breakdown
- Custom progress bars for sentiment counts

All configured with dark theme, custom colors, and minimal styling.

## Navigation Tips

1. **Empty state** — Shows when no search yet
2. **Search box** — Type anything, hit "scan"
3. **Results count** — Badge shows total signals
4. **Toggle analytics** — Button appears after search
5. **Signal cards** — Top 10 displayed, scrollable
6. **View signal source** — Click "source" link (external URLs)

## Performance

- **Mock data generation** — <50ms for 25 signals
- **Chart rendering** — <100ms for all visualizations
- **Total load time** — ~200ms from search to results
- **Bundle size** — 684 KB (minified), 208 KB (gzipped) including Recharts

## Next Steps

When backend is ready:

1. Stop using mock data (remove `VITE_DEMO_MODE`)
2. Server streams real signals via WebSocket
3. Charts auto-update with live data
4. Same UI, real data

The demo mode provides a **pixel-perfect preview** of the finished product.

## Troubleshooting

**Charts not rendering?**
- Check browser console for errors
- Recharts requires responsive container width

**Mock data looks unrealistic?**
- Edit `packages/client/src/lib/mockData.ts` title/summary pools

**Want to see different data?**
- Clear search and search again (generates new random data)
- Each search generates 25 unique signals

---

Enjoy exploring sigint! 🚀
