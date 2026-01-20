# sigint

Open-source signal intelligence for prediction markets.

## Commands

```bash
# Development
npm run dev              # Run both client and server
npm run dev:client       # Frontend only (http://localhost:5173)
npm run dev:server       # Backend only (http://localhost:3333)

# Build
npm run build            # Build all packages

# Lint/Check
npm run lint --workspace=@sigint/client
```

## Project Structure

```
packages/
├── client/              # Vite + React + shadcn/ui
│   └── src/
│       ├── components/
│       │   └── ui/      # shadcn components
│       ├── lib/
│       ├── App.jsx
│       └── index.css    # Tailwind + theme
└── server/              # Express API
    └── src/
        ├── routes/
        └── services/
```

## Design System

**Reference Sites:**
- [pipenet.dev](https://pipenet.dev) — Technical, minimal, monospace
- [fey.com](https://fey.com) — Polished financial UI, cards with depth, clean data presentation
- [midday.ai](https://midday.ai) — Modern SaaS, subtle gradients, clear hierarchy

### Design Principles

1. **Dark-first** — Deep background (#0a0a0f), subtle borders
2. **Monospace accents** — Use `font-mono` for data, labels, status
3. **Green primary** — oklch(0.65 0.2 145) for accents and interactive elements
4. **Subtle depth** — Cards with very subtle borders, hover states with glow
5. **Data-dense** — Prioritize information density, avoid excessive whitespace
6. **Minimal animations** — Subtle transitions, no flashy effects

### Color Palette

```css
--background: oklch(0.08 0.01 260)    /* Near black */
--card: oklch(0.1 0.01 260)           /* Slightly lighter */
--border: oklch(0.22 0.01 260)        /* Subtle borders */
--primary: oklch(0.65 0.2 145)        /* Green accent */
--muted-foreground: oklch(0.6 0.01 260)
```

### Typography

- **Headings**: System sans-serif, semibold
- **Body**: System sans-serif, regular
- **Data/Labels**: JetBrains Mono or system monospace
- **Sizes**: Keep compact — 12px-14px for most text

### Component Guidelines

**Cards:**
- Very subtle border (border-border/50)
- Slight background tint (bg-card/50)
- Hover: slightly brighter background, subtle glow

**Badges:**
- Outline style preferred
- Monospace font
- Semantic colors: green (positive), red (negative), yellow (warning)

**Inputs:**
- Dark background matching card
- Monospace placeholder text
- Icon prefix (Terminal, Search)

**Buttons:**
- Primary: solid green
- Secondary: ghost/outline

### shadcn Components Used

- Button, Input, Card, Badge, Separator, ScrollArea
- Add more as needed via: `npx shadcn@latest add [component]`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/signals/:query` | GET | Fetch signals for a query |
| `/api/status` | GET | Server health check |

## Environment Variables

```bash
PORT=3333                    # Server port
NEWS_API_KEY=xxx            # Optional: NewsAPI key for better results
```

## Code Style

See [STYLE_GUIDE.md](./STYLE_GUIDE.md) for comprehensive style standards.

**Quick Reference:**
- **No comments** unless code is genuinely complex
- **Prefer named exports** for components
- **Keep components small** — extract when > 100 lines
- **Use path aliases** — `@/components/...`
- **TypeScript strict mode** required (server only)
- **Monospace for data** — Labels, numbers, status codes
- **Early returns** (guard clauses)
- **Destructure props** in function signature

## Linting & Formatting

```bash
npm run lint        # Check code style (ESLint)
npm run lint:fix    # Fix style issues
npm run format      # Format with Prettier
npm run format:check # Check formatting
```

ESLint & Prettier configured in `.eslintrc.json` and `.prettierrc.json`.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development setup
- Making changes
- Pull request process
- Code review guidelines
- Release process
