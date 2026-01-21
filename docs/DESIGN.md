# Design & Architecture

## Visual Layout

### Main Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                            HEADER                               │
│  [📡 sigint] v1.0.0      [Search Query]  [scan] [GitHub]       │
│  "Open-source signal intelligence..."                            │
│  [● live/demo] NewsAPI • Reddit • RSS                            │
└─────────────────────────────────────────────────────────────────┘
                                
┌─────────────────────────────────────────────────────────────────┐
│                         SEARCH RESULTS                           │
│  Signals for "bitcoin"    [25 results] [show analytics]         │
├─────────────────────────────────────────────────────────────────┤
│                       ANALYTICS DASHBOARD                        │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐  │
│  │Total: 25     │Avg Sentiment:│Avg Impact:   │High Impact:  │  │
│  │              │+0.42         │0.65          │8             │  │
│  └──────────────┴──────────────┴──────────────┴──────────────┘  │
│                                                                  │
│  ┌───────────────────────────┬───────────────────────────────┐  │
│  │  Signal Activity (24h)    │  Sentiment Distribution       │  │
│  │  [Area Chart: stacked     │  [Pie Chart: Bullish/Neutral  │  │
│  │   bullish/neutral/bearish]│   /Bearish breakdown]         │  │
│  │                           │                               │  │
│  │                           │                               │  │
│  │                           │                               │  │
│  └───────────────────────────┴───────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────┬───────────────────────────────┐  │
│  │  Impact Levels            │  Top Sources                  │  │
│  │  [Bar: High/Med/Low]      │  [Horizontal Bar Chart]       │  │
│  │                           │  · Reuters        ███ 8       │  │
│  │                           │  · Google News    ██ 5        │  │
│  │                           │  · Bloomberg      █ 4         │  │
│  │                           │  · r/crypto       █ 3         │  │
│  │                           │  · CNBC           █ 2         │  │
│  └───────────────────────────┴───────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Sentiment Breakdown                                         ││
│  │ Bullish  ████████████░░░ 17                                 ││
│  │ Neutral  ███░░░░░░░░░░░░ 4                                  ││
│  │ Bearish  ███░░░░░░░░░░░░ 4                                  ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                      SIGNAL CARDS (TOP 10)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Bitcoin surges past $50,000 on institutional demand      │   │
│  │ Reuters · 2h ago                          [high] bullish │   │
│  │ Strong institutional demand drives prices higher...      │   │
│  │ [BTC] [ETH]          source ↗                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Federal Reserve signals crypto-friendly regulation       │   │
│  │ Google News · 4h ago                [med] neutral        │   │
│  │ Regulatory clarity may accelerate institutional adoption │   │
│  │ [FED] [BTC] [TECH]   source ↗                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ... (8 more signals)                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                            FOOTER                               │
│  MIT License        sigint · open source intelligence            │
└─────────────────────────────────────────────────────────────────┘
```

## Color System

### Semantic Colors

```
Sentiment:
  Bullish  → #22c55e (green)
  Neutral  → #64748b (slate)
  Bearish  → #ef4444 (red)

Impact:
  High     → #ef4444 (red)
  Medium   → #eab308 (yellow)
  Low      → #8b5cf6 (purple)

UI:
  Primary    → #06b6d4 (cyan accent in charts)
  Background → #0a0a0f (near black)
  Card       → #0f172a (slightly lighter)
  Border     → #334155 (subtle)
```

## Component Hierarchy

```
App
├── Header
│   ├── Logo + Title
│   ├── Search Input
│   ├── GitHub Link
│   └── Status Badge
├── Main
│   ├── Search Form
│   ├── Error Card (conditional)
│   ├── Results Header
│   ├── Loading State (conditional)
│   ├── Dashboard (conditional)
│   │   ├── Key Metrics Grid (4 cards)
│   │   ├── Chart Grid (2 cols)
│   │   │   ├── Signal Activity Area Chart
│   │   │   ├── Sentiment Distribution Pie Chart
│   │   │   ├── Impact Levels Bar Chart
│   │   │   └── Top Sources Horizontal Bar
│   │   └── Sentiment Breakdown Progress Bars
│   ├── Signal Cards Scroll Area
│   │   └── SignalCard (repeating)
│   │       ├── Title
│   │       ├── Source + Date
│   │       ├── Summary
│   │       ├── Market Badges
│   │       └── Source Link
│   └── Empty State (conditional)
└── Footer
```

## Typography Scale

```
Logo/Header     → 20px · Bold · Monospace
Page Title      → 16px · Semibold · Sans-serif
Card Title      → 14px · Medium · Sans-serif
Body Text       → 14px · Regular · Sans-serif
Label/Meta      → 12px · Regular · Monospace
Badge/Small     → 12px · Regular · Monospace
Tiny            → 11px · Regular · Monospace
```

## Spacing System

```
Container padding     → 24px (6 units)
Card padding          → 16px (4 units)
Section gap           → 24px (6 units)
Component gap         → 12px (3 units)
Element gap           → 8px (2 units)
Tight gap             → 4px (1 unit)
```

## Responsive Breakpoints

```
Mobile     → 320px–640px   (1 column layout)
Tablet     → 640px–1024px  (2 column layout)
Desktop    → 1024px+       (4 column metrics, 2 col charts)

Max width  → 1280px (7xl container)
```

## Animation Tokens

```
Pulse      → 2s · infinite (connection status)
Spin       → 1s · linear (loading spinner)
Fade       → 150ms (hover effects)
Slide      → 200ms (drawer/modal)
Color      → 150ms (button/link hover)
```

## Accessibility

- **Semantic HTML** — Proper heading hierarchy (h1 → h3)
- **Color Contrast** — WCAG AA compliant (4.5:1 minimum)
- **Focus Indicators** — Visible focus rings on interactive elements
- **Keyboard Navigation** — All interactions keyboard-accessible
- **Labels** — Form inputs have associated labels
- **Alt Text** — Chart titles and descriptions

## Dark Mode

The entire application uses a dark-first color scheme:

- **Background** — Near black (#0a0a0f)
- **Cards** — Slightly lighter (#0f172a)
- **Text** — High contrast white/light gray
- **Borders** — Subtle dark gray with opacity
- **Accents** — Vibrant colors (green, cyan, red, yellow)
- **No light mode toggle** — Single dark theme

## Data Visualization

### Chart Library

**Recharts** — Lightweight React charting library

```typescript
<AreaChart data={data}>
  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
  <XAxis dataKey="time" stroke="#94a3b8" />
  <YAxis stroke="#94a3b8" />
  <Tooltip contentStyle={{...}} />
  <Area dataKey="bullish" fill="url(#bullish)" />
</AreaChart>
```

### Chart Types

| Chart | Purpose | Data |
|-------|---------|------|
| Area Chart (Stacked) | Signal timeline | Hourly bullish/neutral/bearish |
| Pie Chart (Donut) | Sentiment distribution | % bullish/neutral/bearish |
| Bar Chart (Vertical) | Impact breakdown | Count of high/med/low |
| Bar Chart (Horizontal) | Source ranking | Signal count per source |
| Progress Bars | Sentiment counts | Absolute counts + visual % |

### Custom Gradients

```javascript
<defs>
  <linearGradient id="bullish" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
  </linearGradient>
</defs>
```

## State Management

**React Hooks** (no Redux needed for current scope):

```typescript
const [signals, setSignals] = useState([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
const [showDashboard, setShowDashboard] = useState(false)
```

## Performance Considerations

- **Lazy Load Charts** — Only render dashboard when data exists
- **Virtualization** — ScrollArea for card list (max 10 visible)
- **Memoization** — Dashboard component memoized if needed
- **CSS-in-JS** — Minimal, Tailwind for performance
- **Code Splitting** — Recharts imported, not bundled by default

## Future Enhancements

- [ ] Dark/Light mode toggle
- [ ] Custom market definitions
- [ ] Export dashboard as PNG/PDF
- [ ] Real-time chart updates
- [ ] Signal bookmarking
- [ ] Custom alerts
- [ ] Mobile-optimized charts
