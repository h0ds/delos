# Contributing to sigint

Thanks for your interest in contributing! Here's how to get started.

## Before You Start

- Read [STYLE_GUIDE.md](./STYLE_GUIDE.md) for code style & organization
- Check existing [issues](../../issues) & [discussions](../../discussions)
- Review [AGENTS.md](./AGENTS.md) for design principles

## Development Setup

```bash
git clone https://github.com/yourusername/sigint.git
cd sigint
npm install

# Create env files
cp packages/server/.env.example packages/server/.env
cp packages/client/.env.example packages/client/.env

# Optional: Add your NEWS_API_KEY to packages/server/.env for real data
```

## Running Development Servers

```bash
# Both server + client
npm run dev

# Frontend only
npm run dev:client

# Backend only
npm run dev:server
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3333

## Code Quality

### Linting & Formatting

```bash
# Check code style
npm run lint

# Fix style issues
npm run lint:fix

# Format with Prettier
npm run format

# Check formatting without changing
npm run format:check
```

Run these **before committing**. ESLint and Prettier are configured in `.eslintrc.json` and `.prettierrc.json`.

### TypeScript

```bash
# Check types (server)
npm --workspace=@sigint/server run build
```

Must pass strict mode. No `any` types allowed.

### Building

```bash
npm run build  # Build all packages
```

Must succeed with no errors before PR.

## Making Changes

### Code Style (See STYLE_GUIDE.md)

**JavaScript/TypeScript:**
- No comments (code should be self-documenting)
- Early returns (guard clauses)
- `const` by default, `let` only when needed
- Arrow functions for callbacks, named for exports
- Destructure parameters when > 2 args
- Named exports for components

**React Components:**
- Keep under 100 lines (extract to hooks/utils)
- Destructure props in function signature
- Use shadcn/ui components
- Memoize expensive computations
- Use hooks, not inline side effects

**File Organization:**
```
components/        # React components
  ui/             # shadcn/ui components
  sections/       # Page sections
  charts/         # Data visualizations
hooks/            # Custom React hooks
lib/              # Utilities & helpers
types.ts          # Shared types
```

**Naming:**
- Components: PascalCase (`SignalCard`, not `signal-card`)
- Files: Match component name or utility purpose
- Variables: camelCase (`bullishSignals`, not `positive`)
- Constants: UPPERCASE (`API_TIMEOUT`, `MARKETS`)
- CSS classes: kebab-case (Tailwind)

### Design System (See AGENTS.md & DESIGN.md)

**Colors:**
- Use CSS variables: `--primary`, `--border`, `--background`
- Semantic colors: `--bullish`, `--bearish`, `--neutral`
- No hardcoded hex values

**Spacing:**
- Use Tailwind scale: `space-2`, `space-4`, `space-6`
- Padding: 16px (cards), 24px (sections)
- Gaps: 12px (components), 8px (elements)

**Typography:**
- Headlines: System sans-serif, semibold
- Body: System sans-serif, regular
- Data: Monospace (JetBrains Mono or fallback)
- No custom fonts

**Charts:**
- Dark backgrounds (#0f172a)
- Semantic colors (green/red/yellow)
- Gradients with opacity
- No 3D effects

### Components

- Use shadcn/ui components
- Keep < 100 lines (split if larger)
- Export as named exports
- Prop types documented via TypeScript

```jsx
// ✅ Good
export function SignalCard({ signal }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold">{signal.title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{signal.source}</p>
      </CardContent>
    </Card>
  )
}
```

### Backend Services

- Type all function parameters
- Handle errors explicitly
- Use descriptive logging: `[service] message`
- Keep functions pure & testable
- Cache when appropriate

```typescript
export async function acquireSignals(query: string): Promise<Signal[]> {
  try {
    const signals = await fetchFromAPI(query)
    logger.info(`[signals] acquired ${signals.length}`)
    return signals
  } catch (error) {
    logger.error(`[signals] fetch failed`, { query, error })
    return []
  }
}
```

## Testing

```bash
npm run test  # Run tests (coming soon)
```

When tests are added:
- Add tests for new features
- Update tests for changes
- Aim for 80%+ coverage
- Test behavior, not implementation

```javascript
describe('SignalCard', () => {
  it('displays signal title', () => {
    const signal = { title: 'Bitcoin surges' }
    const { getByText } = render(<SignalCard signal={signal} />)
    expect(getByText('Bitcoin surges')).toBeInTheDocument()
  })
})
```

## Git Workflow

### Branch Naming

```
feature/signal-filtering    # New feature
fix/websocket-reconnect     # Bug fix
docs/add-api-reference      # Documentation
refactor/component-cleanup  # Refactoring
```

### Commit Messages

Use conventional commits:

```
feat(dashboard): add sentiment distribution chart
fix(socket): reconnect on connection loss
docs: improve deployment guide
refactor: organize chart components
```

**Format:** `type(scope): description`

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code formatting (no logic change)
- `refactor:` Code restructure
- `perf:` Performance improvement
- `test:` Adding/updating tests
- `chore:` Dependencies, setup

**Rules:**
- Lowercase, no period
- Imperative mood (add, fix, not adds, fixed)
- Specific scope when applicable
- Reference issues: `Closes #123`

```
feat(charts): add impact level breakdown

Implement bar chart showing signal distribution by impact level.
Uses Recharts with dark theme colors matching design system.

Closes #42
```

### Pull Request Process

1. Fork the repository
2. Create feature branch: `git checkout -b feat/your-feature`
3. Make changes in logical commits
4. **Run linting & tests:** `npm run lint:fix && npm run build`
5. Push to your fork
6. Open PR using template (.github/PULL_REQUEST_TEMPLATE.md)

**PR Requirements:**
- Clear title & description
- Links related issues
- Passes all checks (lint, build, tests)
- Code review approved
- Follows style guide

## Issues & Discussions

### Opening an Issue

Check existing issues first. Use templates:

**Bug Report:**
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment info (OS, browser, Node version)
- Screenshots if applicable

**Feature Request:**
- Problem statement
- Proposed solution
- Why it's needed
- Alternatives considered

### Discussions

Use discussions for:
- Questions about features
- Design feedback
- Best practices
- Ideas (before opening issue)

Link discussions in related PRs/issues.

## Areas for Contribution

### High Priority
- [ ] More signal sources (Twitter, TradingView, Bloomberg)
- [ ] Improve sentiment analysis (ML models, custom keywords)
- [ ] Error handling & retry logic
- [ ] Performance optimization

### Medium Priority
- [ ] User authentication & accounts
- [ ] Saved searches & alerts
- [ ] Signal filtering & sorting
- [ ] Historical data tracking
- [ ] Admin dashboard

### Nice to Have
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (email, Slack, push)
- [ ] Export to CSV/JSON
- [ ] Custom market definitions
- [ ] Browser extensions

### Documentation
- [ ] API documentation
- [ ] Video tutorials
- [ ] Architecture diagrams
- [ ] Troubleshooting guides

## Code Review

### What Reviewers Look For

1. **Correctness** — Does it work as intended?
2. **Style** — Follows STYLE_GUIDE.md?
3. **Performance** — Any regressions?
4. **Tests** — Adequate coverage?
5. **Docs** — Updated if needed?
6. **Design** — Follows design system?

### Responding to Reviews

- Acknowledge feedback
- Ask questions if unclear
- Make changes in new commits (don't force-push)
- Request re-review after changes

## Maintenance Tasks

Maintainers periodically:
- Review & merge PRs
- Manage issues & discussions
- Update dependencies
- Monitor performance
- Plan releases

## Release Process (Maintainers Only)

1. Update version: `package.json` & tags
2. Update `CHANGELOG.md`
3. Run full test suite
4. Build: `npm run build`
5. Tag: `git tag v1.2.3`
6. Push: `git push origin main --tags`
7. Deploy to production

## Questions?

- **Setup issues?** Open an issue or ask in Discussions
- **Design questions?** Check AGENTS.md, DESIGN.md, STYLE_GUIDE.md
- **Code style?** See STYLE_GUIDE.md
- **Need help?** Comment on an issue or open a Discussion

Thanks for contributing! 🚀
