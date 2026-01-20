# Style Guide & Code Organization

Comprehensive guide for maintaining sigint's visual and code quality standards.

---

## Design Philosophy

**Influenced by:**
- **fey.com** — Polished financial UI, cards with depth, clean data presentation
- **midday.ai** — Modern SaaS, subtle gradients, clear hierarchy
- **pipenet.dev** — Technical, minimal, monospace accents

**Core Principles:**
1. **Minimalist** — Every pixel serves a purpose
2. **Frictionless** — Information accessible in minimal clicks
3. **Data-centric** — Charts and tables prioritized over prose
4. **Dark-first** — Reduces eye strain, professional appearance
5. **Subtle** — Animations, colors, and depth are understated

---

## Visual Design

### Color System

**Core Palette (OKLch):**

```css
/* Backgrounds */
--background: oklch(0.08 0.01 260)      /* Deep black #0a0a0f */
--card: oklch(0.1 0.01 260)             /* Slightly lighter #0f172a */
--card-hover: oklch(0.12 0.01 260)      /* Card hover state */
--overlay: oklch(0.05 0.01 260)         /* Modal/overlay background */

/* Borders & Dividers */
--border: oklch(0.22 0.01 260)          /* Subtle borders #334155 */
--border-subtle: oklch(0.18 0.01 260)   /* Very subtle #1e293b */

/* Text */
--foreground: oklch(0.98 0.01 260)      /* Nearly white #f8fafc */
--muted-foreground: oklch(0.6 0.01 260) /* Disabled/secondary #94a3b8 */
--muted: oklch(0.3 0.01 260)            /* Deep muted #475569 */

/* Semantic Colors */
--primary: oklch(0.65 0.2 145)          /* Green accent #22c55e */
--primary-hover: oklch(0.62 0.18 145)   /* Green hover */
--primary-subtle: oklch(0.15 0.04 145)  /* Green background tint */

/* Sentiment */
--bullish: oklch(0.65 0.2 145)          /* Green #22c55e */
--neutral: oklch(0.6 0.01 260)          /* Slate #94a3b8 */
--bearish: oklch(0.6 0.28 30)           /* Red #ef4444 */

/* Impact */
--impact-high: oklch(0.6 0.28 30)       /* Red #ef4444 */
--impact-medium: oklch(0.75 0.18 85)    /* Yellow #eab308 */
--impact-low: oklch(0.55 0.15 250)      /* Purple #8b5cf6 */

/* Data Visualization */
--chart-primary: oklch(0.65 0.2 145)    /* #22c55e - green */
--chart-secondary: oklch(0.55 0.15 250) /* #8b5cf6 - purple */
--chart-accent: oklch(0.65 0.2 200)     /* #06b6d4 - cyan */
```

**Usage Rules:**
- Background: Use `--background` for page, `--card` for containers
- Text: Use `--foreground` for primary, `--muted-foreground` for secondary
- Borders: Use `--border/50` for subtle, `--border` for prominent
- Accents: Use `--primary` for interactive, semantic colors for data
- Don't use: Pure blacks (#000), pure whites (#fff), high-saturation colors

### Typography

**Font Stack (System):**
```css
/* Headings */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
font-weight: 600; /* semibold */

/* Body */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
font-weight: 400; /* regular */

/* Data/Code/Labels */
font-family: 'JetBrains Mono', 'Monaco', 'Courier New', monospace;
font-weight: 400; /* regular */
```

**Size Scale:**
```css
--text-xs: 11px; line-height: 16px;   /* Tiny labels, meta */
--text-sm: 12px; line-height: 16px;   /* Secondary, badge text */
--text-base: 14px; line-height: 20px; /* Body, most UI text */
--text-lg: 16px; line-height: 24px;   /* Card titles, larger buttons */
--text-xl: 18px; line-height: 28px;   /* Page titles */
--text-2xl: 20px; line-height: 28px;  /* Header titles */
```

**Weights:**
```css
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
```

**Usage Rules:**
- Headers: 16px semibold (card title), 18px semibold (page title)
- Body: 14px regular
- Labels/Meta: 12px regular, monospace
- Compact: 11px regular, monospace (badges, timestamps)
- **No custom fonts** — System fonts only (faster loading)
- **Monospace for data** — Numbers, codes, labels, status

### Spacing Scale

```css
--space-1: 4px;     /* Tight spacing */
--space-2: 8px;     /* Element gap */
--space-3: 12px;    /* Component gap */
--space-4: 16px;    /* Card padding */
--space-6: 24px;    /* Section gap */
--space-8: 32px;    /* Large gap */
```

**Usage Rules:**
- Container padding: `space-6` (24px)
- Card padding: `space-4` (16px)
- Element gaps: `space-2` or `space-3` (8px or 12px)
- Section separation: `space-6` (24px)
- Never use `space-1` for anything other than tiny refinements

### Shadows & Depth

```css
/* Subtle elevation */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

/* Glow effect (on hover) */
--glow: 0 0 20px rgba(34, 197, 94, 0.1);
--glow-accent: 0 0 15px rgba(6, 182, 212, 0.15);
```

**Usage Rules:**
- No drop shadows by default
- Cards: subtle border only (2px, 50% opacity)
- Hover cards: brighten background, add `--glow`
- Keep effects subtle — this is financial data, not marketing

### Responsive Design

```css
/* Breakpoints */
--mobile: 320px;    /* Small phones */
--sm: 640px;        /* Phones */
--md: 768px;        /* Tablets */
--lg: 1024px;       /* Desktop */
--xl: 1280px;       /* Large desktop */
--2xl: 1536px;      /* Very large */
```

**Layout Rules:**
- Mobile-first (320px base)
- 1 column layout < 768px
- 2 column layout 768px - 1024px
- 3-4 column layout > 1024px
- Max width: 1280px (xl)
- Container padding: 16px mobile, 24px desktop

### Animation Tokens

```css
--duration-fast: 75ms;      /* Micro-interactions */
--duration-base: 150ms;     /* Standard transitions */
--duration-slow: 200ms;     /* Deliberate movement */

--easing-in: cubic-bezier(0.4, 0, 1, 1);
--easing-out: cubic-bezier(0, 0, 0.2, 1);
--easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

**Usage Rules:**
- Hover states: 150ms fade
- Modal entry: 200ms slide
- Loading spinner: 1s spin (infinite)
- Pulse indicator: 2s pulse (infinite)
- **No bounce, no spring** — keep it professional
- **No effects over 200ms** — feels slow

---

## Component System

### Cards

**Structure:**
```jsx
<Card className="border-border/50 bg-card/50">
  <CardHeader className="border-b border-border/30">
    <CardTitle className="text-sm font-mono">Title</CardTitle>
  </CardHeader>
  <CardContent className="pt-4">
    Content here
  </CardContent>
</Card>
```

**Guidelines:**
- Very subtle border: `border-border/50`
- Slightly tinted background: `bg-card/50`
- Padding: 16px (space-4)
- Hover: brighten background, add subtle glow
- Never use shadows, only borders
- Title: 14px semibold (not all-caps)

### Buttons

**Primary (Solid Green):**
```jsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Action
</Button>
```

**Secondary (Ghost/Outline):**
```jsx
<Button variant="outline">
  Secondary
</Button>
```

**Guidelines:**
- Text: 14px medium, monospace for labels
- Padding: 8px 12px (compact)
- Rounded: 6px (subtle)
- Icons with text: icon + space-1 + text
- Loading state: spinner + text

### Inputs

**Standard:**
```jsx
<div className="relative">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
  <Input 
    className="pl-10 font-mono text-sm bg-card border-border/50"
    placeholder="Monospace placeholder..."
  />
</div>
```

**Guidelines:**
- Icon prefix on left
- Dark background: `bg-card`
- Subtle border: `border-border/50`
- Monospace text (for data entry)
- Focus: brighten border, subtle ring
- Height: 40px (10 units)

### Badges

**Outline Style (Preferred):**
```jsx
<Badge variant="outline" className="font-mono text-xs">
  Label
</Badge>
```

**With Color:**
```jsx
<Badge className="bg-bullish/20 text-bullish border-bullish/30 font-mono text-xs">
  Bullish
</Badge>
```

**Guidelines:**
- Monospace font always
- Outline by default (hollow)
- Semantic colors: green (positive), red (negative), yellow (warning)
- Text: 11px, uppercase not recommended
- Padding: 4px 8px (compact)

### Charts

**Dark Theme Defaults:**
```jsx
<AreaChart data={data}>
  <defs>
    <linearGradient id="gradient">
      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
  <XAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
  <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
  <Area type="monotone" fill="url(#gradient)" />
</AreaChart>
```

**Guidelines:**
- Stroke colors: `#334155` (grid), `#94a3b8` (axis)
- Fill colors: Semantic (green, red, yellow) with gradients
- Tooltip: Match card background & border
- Labels: 12px, muted color
- **No 3D effects, no gradual reveals**

---

## Code Organization

### Directory Structure

```
packages/client/src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── input.jsx
│   │   └── ...
│   ├── charts/                # Data visualization
│   │   ├── SignalTimeline.jsx
│   │   ├── SentimentChart.jsx
│   │   └── ...
│   ├── sections/              # Page sections
│   │   ├── Header.jsx
│   │   ├── SearchBox.jsx
│   │   ├── Dashboard.jsx
│   │   └── ...
│   └── Dashboard.jsx          # Main dashboard (temporary)
├── hooks/                     # Custom React hooks
│   ├── useSignals.js
│   ├── useLocalStorage.js
│   └── ...
├── lib/
│   ├── socket.ts              # Socket.io client
│   ├── mockData.ts            # Demo data
│   ├── utils.js               # Utilities
│   └── api.ts                 # API helpers
├── styles/
│   ├── globals.css            # Global styles
│   ├── tailwind.css           # Tailwind imports
│   └── animations.css         # Reusable animations
├── types.ts                   # Shared types
├── App.jsx                    # Root component
├── main.jsx                   # Entry point
└── index.css                  # Theme variables

packages/server/src/
├── index.ts                   # Server entry
├── config.ts                  # Configuration
├── types.ts                   # Types & interfaces
├── middleware/
│   ├── cors.ts
│   ├── errorHandler.ts
│   └── ...
├── services/
│   ├── signalAggregator.ts    # Signal fetching
│   ├── sentiment.ts           # Sentiment analysis
│   └── ...
├── handlers/
│   ├── socketHandlers.ts      # WebSocket handlers
│   └── httpHandlers.ts        # HTTP endpoints
└── utils/
    ├── logger.ts              # Logging utility
    └── cache.ts               # Cache wrapper
```

### Naming Conventions

**Components:**
- PascalCase: `SignalCard`, `Dashboard`, `Header`
- Descriptive: `SignalTimeline` not `Chart`, `SearchBox` not `Input`
- Group by feature: `ChartCardContent` over `Content`

**Files:**
- Components: `ComponentName.jsx` or `ComponentName.tsx`
- Utils: `utilName.ts` or `utilName.js`
- Hooks: `useHookName.js`
- Types: `types.ts` (shared), `Component.types.ts` (local)
- Tests: `Component.test.jsx` (same folder)

**Variables & Functions:**
- camelCase: `getUserSignals`, `chartData`, `isLoading`
- Descriptive: `bullishSignals` not `positive`, `avgSentiment` not `avg`
- Private: `_internalMethod` or move to utils
- Constants: `SOURCES`, `MARKETS`, `API_TIMEOUT`

**CSS Classes:**
- kebab-case: `text-green-400`, `bg-card`, `border-border/50`
- BEM for complex components: `signal-card__header`, `signal-card__content`
- Semantic names: `card`, `badge`, `button` over `box`, `label`, `action`

### Code Style

**JavaScript/TypeScript:**

```javascript
// ✅ Preferred
const handleSearch = (query) => {
  if (!query.trim()) return
  socket.emit('signal:query', query)
}

// ❌ Avoid
const handleSearch = (query) => {
  // This will emit the query to the server
  if (!query.trim()) {
    return // early return
  }
  socket.emit('signal:query', query) // emit query
}
```

**Rules:**
- **No comments** unless genuinely complex
- **Prefer early returns** (guard clauses)
- **Const by default**, let only when needed
- **Arrow functions** for callbacks, normal functions for exports
- **Named exports** for components: `export function Card()`
- **Default export** for pages only
- **Destructure** function parameters when > 2 args
- **No console.log** in production code (use logger)

**React Components:**

```jsx
// ✅ Preferred
function SignalCard({ signal }) {
  const sentiment = getSentimentLabel(signal.sentiment)
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-medium">{signal.title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{signal.source}</p>
      </CardContent>
    </Card>
  )
}

// ❌ Avoid
function SignalCard(props) {
  const { signal } = props
  
  return (
    <div className="card">
      <div className="card-header">
        <h3>{signal.title}</h3>
      </div>
      <div className="card-content">
        <p>{signal.source}</p>
      </div>
    </div>
  )
}
```

**Rules:**
- **Keep under 100 lines** (extract logic to hooks/utils)
- **Destructure props** in function signature
- **Use shadcn components** (not custom divs)
- **Lift state up** when multiple children need it
- **Memoize callbacks** when passed to charts
- **Use hooks** for side effects (not useEffect in render)

**TypeScript:**

```typescript
// ✅ Preferred
interface Signal {
  source: string
  title: string
  sentiment: number
}

function processSignals(signals: Signal[]): Signal[] {
  return signals.sort((a, b) => b.sentiment - a.sentiment)
}

// ❌ Avoid
function processSignals(signals: any): any {
  return signals.sort((a, b) => b.sentiment - a.sentiment)
}
```

**Rules:**
- **Strict mode enabled** (non-negotiable)
- **Type all function parameters** (except obvious contexts)
- **Export types** alongside implementations
- **Use `interface`** for objects, `type` for unions
- **Avoid `any`** (use `unknown` if truly unknown)
- **No type coercion** in logic

### File Size Guidelines

- **Components**: Max 100 lines (extract hooks/utils)
- **Utilities**: Max 50 lines (split into files)
- **Hooks**: Max 40 lines (consider custom hook pattern)
- **Files**: Preferably < 300 lines (split modules)

### Import Organization

```javascript
// 1. External libraries
import React, { useState } from 'react'
import { LineChart } from 'recharts'

// 2. Internal components
import { Card } from '@/components/ui/card'
import { Dashboard } from '@/components/Dashboard'

// 3. Utilities & helpers
import { generateChartData } from '@/lib/mockData'
import { socket } from '@/lib/socket'

// 4. Types
import type { Signal } from '@/types'

// 5. Styles
import '@/styles/dashboard.css'
```

---

## Testing Standards

**Jest + React Testing Library:**

```javascript
// ✅ Preferred
describe('SignalCard', () => {
  it('displays signal title', () => {
    const signal = { title: 'Bitcoin surges', source: 'Reuters' }
    const { getByText } = render(<SignalCard signal={signal} />)
    expect(getByText('Bitcoin surges')).toBeInTheDocument()
  })
})

// ❌ Avoid
test('renders', () => {
  render(<SignalCard />)
})
```

**Rules:**
- **Descriptive test names** (what, not how)
- **Test behavior, not implementation**
- **Mock external dependencies** (API, Socket.io)
- **Aim for 80%+ coverage** (not 100%)
- **Test edge cases** (empty, error, loading states)

---

## Git & Commits

### Commit Message Format

```
type(scope): brief description

optional body explaining why, not what

optional: Closes #123
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (whitespace, semicolons)
- `refactor:` Code restructure
- `perf:` Performance improvement
- `test:` Adding/updating tests
- `ci:` CI/CD configuration
- `chore:` Dependencies, build tools

**Examples:**
```
feat(dashboard): add sentiment distribution chart

Implement pie chart showing bullish/neutral/bearish distribution
using Recharts. Updates analytics dashboard with new visualization.

Closes #42
```

```
fix(socket): reconnect on connection loss

Implement exponential backoff for WebSocket reconnection attempts.
Handles network interruptions gracefully.
```

```
docs: improve deployment guide with AWS example
```

### Branch Naming

```
feature/signal-filtering
fix/websocket-reconnect
docs/add-api-reference
```

---

## Pull Request Guidelines

**Title Format:**
```
[feature] Add sentiment distribution chart
[fix] Handle empty signal responses
[docs] Update deployment guide
```

**Checklist:**
- [ ] Follows style guide
- [ ] Tests added/updated
- [ ] TypeScript strict mode passes
- [ ] No console.log or debug code
- [ ] Components under 100 lines
- [ ] Imports organized correctly
- [ ] Color/spacing using design tokens
- [ ] Responsive design tested (mobile/tablet/desktop)
- [ ] Dark theme checked
- [ ] Accessibility reviewed (keyboard, contrast, focus)

---

## Documentation Standards

**README Sections (in order):**
1. Badges (status, license, coverage)
2. Brief description
3. Features
4. Screenshots/Demo
5. Quick start
6. Configuration
7. Architecture
8. Contributing
9. License

**Code Documentation:**
- README.md in each package
- STYLE_GUIDE.md for consistency
- Component stories (Storybook optional)
- Type definitions as documentation

**Comment Standards:**
- No comments for obvious code
- Comments explain WHY, not WHAT
- Use JSDoc for exported functions
- Mark TODO/FIXME with context

```javascript
// ❌ Bad
const sentiment = text.includes('surge') ? 1 : 0 // check if surge

// ✅ Good
// Credit Sentiment Weighted toward positive keywords for market signals
const sentiment = text.includes('surge') ? 1 : 0
```

---

## Performance Checklist

- [ ] Bundle size < 300 KB (gzipped)
- [ ] First contentful paint < 2s
- [ ] WebSocket latency < 100ms
- [ ] Chart render < 100ms
- [ ] No unnecessary re-renders
- [ ] Images optimized (no uncompressed PNGs)
- [ ] Lazy load charts (only on demand)
- [ ] Memoize expensive computations

---

## Accessibility (a11y)

- [ ] Color contrast 4.5:1 (WCAG AA)
- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Focus indicators visible
- [ ] Form labels associated
- [ ] ARIA labels where needed
- [ ] Semantic HTML (h1-h3, button, input)
- [ ] Alt text on images
- [ ] Error messages clear & accessible

---

## Review Checklist (For Maintainers)

Before merging PRs:

1. **Code Quality**
   - [ ] Follows style guide
   - [ ] No console.log or debug code
   - [ ] TypeScript passes strict mode
   - [ ] Tests added & passing

2. **Design**
   - [ ] Uses design tokens (colors, spacing)
   - [ ] Responsive design tested
   - [ ] Dark theme maintained
   - [ ] Animations smooth & subtle

3. **Performance**
   - [ ] No performance regression
   - [ ] Bundle size impact < 10 KB
   - [ ] Appropriate memoization

4. **Documentation**
   - [ ] README updated if needed
   - [ ] Breaking changes documented
   - [ ] Comments clear & minimal

5. **Accessibility**
   - [ ] Keyboard accessible
   - [ ] Color contrast OK
   - [ ] Focus management correct

---

## Common Patterns

### Fetching Data with Socket.io

```typescript
const [data, setData] = useState([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  socket.on('signals', (signals) => {
    setData(signals)
    setLoading(false)
  })
  
  return () => socket.off('signals')
}, [])

const handleFetch = () => {
  setLoading(true)
  socket.emit('signal:query', query)
}
```

### Conditional Rendering

```jsx
// ✅ Preferred
{loading && <LoadingState />}
{error && <ErrorState error={error} />}
{data.length > 0 ? <DataView data={data} /> : <EmptyState />}

// ❌ Avoid
{loading ? <LoadingState /> : null}
{data && data.length > 0 ? <DataView data={data} /> : <EmptyState />}
```

### Error Handling

```typescript
try {
  const signals = await acquireSignals(query)
  setData(signals)
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  setError(message)
  logger.error('Signal fetch failed', { query, error: message })
}
```

---

## Tools & Configuration

**Code Formatting:**
- ESLint (configured, run `npm run lint`)
- Prettier (auto-format on save)
- TypeScript strict mode

**Development:**
- Vite for fast HMR
- tsx for TypeScript execution
- Hot Module Replacement enabled

**Testing:**
- Jest for unit tests
- React Testing Library for component tests
- Vitest optional (faster than Jest)

---

## Maintenance

### Regular Tasks

**Weekly:**
- Review open issues
- Check failing tests
- Monitor performance metrics

**Monthly:**
- Update dependencies
- Review security advisories
- Analyze error logs

**Quarterly:**
- Refactor tech debt
- Optimize performance
- User feedback review

### Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create release branch
4. Run full test suite
5. Build production bundles
6. Tag release: `v1.2.3`
7. Push to main
8. Deploy to production

---

## Questions?

See [CONTRIBUTING.md](./CONTRIBUTING.md) or open a GitHub Issue.
