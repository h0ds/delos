# Changelog

All notable changes to sigint are documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- (Features coming soon)

### Changed
- (Improvements coming soon)

### Fixed
- (Bug fixes coming soon)

### Removed
- (Deprecations coming soon)

---

## [1.0.0] - 2026-01-20

### Added
- **Core Features**
  - WebSocket-first architecture with Socket.io
  - Real-time signal streaming
  - Multi-source aggregation (NewsAPI, Google News RSS, Reddit)
  
- **Analytics**
  - Sentiment analysis (bullish/bearish/neutral)
  - Impact scoring (0-1 scale)
  - Market auto-tagging (BTC, ETH, FED, TECH, etc.)
  - 5 chart types (area, pie, bar) using Recharts

- **Frontend**
  - React 19 + Vite
  - Dark-first design system
  - shadcn/ui components
  - Responsive layout (mobile/tablet/desktop)
  - Mock data demo mode

- **Backend**
  - Express + Socket.io server
  - TypeScript with strict mode
  - Configuration management
  - 5-minute caching layer
  - Error handling & logging

- **Deployment**
  - Docker + Docker Compose
  - Multi-platform deployment guides
  - Production-ready configuration

- **Documentation**
  - Comprehensive style guide
  - Design system documentation
  - Contribution guidelines
  - Deployment instructions
  - API documentation

### Notes
- **Initial Release** — Full feature set for demo and early testing
- All core functionality implemented
- Ready for real API integration
- Open source with Apache 2.0 license

---

## Versioning

sigint follows [Semantic Versioning](https://semver.org/):
- **Major (X.0.0)** — Breaking changes
- **Minor (0.X.0)** — New features (backward compatible)
- **Patch (0.0.X)** — Bug fixes

---

## Submitting Changes

To get your change included:

1. Fork the repository
2. Create a feature branch
3. Make changes following [STYLE_GUIDE.md](./STYLE_GUIDE.md)
4. Commit with conventional format
5. Push and open a Pull Request
6. Wait for review and approval

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## Release Schedule

- **Patch releases (0.0.x)** — As needed (bug fixes)
- **Minor releases (0.x.0)** — Monthly (features)
- **Major releases (x.0.0)** — Quarterly (significant updates)

---

## Release Checklist (Maintainers)

- [ ] All issues closed or moved to next milestone
- [ ] All PRs merged and tested
- [ ] Tests passing (when added)
- [ ] Build succeeds
- [ ] Documentation updated
- [ ] Version bumped in package.json
- [ ] CHANGELOG.md updated
- [ ] Git tag created (`v1.2.3`)
- [ ] Release notes published
- [ ] Deployed to production
- [ ] Announcement posted

---

Last updated: January 20, 2026
