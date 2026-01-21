# Design Audit & Compliance Report

**Date:** January 20, 2026  
**Status:** ⚠️ PARTIAL COMPLIANCE

---

## Current State vs. Style Guide

### ✅ What's Done Well

1. **Dark backgrounds** — Black/near-black backgrounds throughout
2. **Monospace fonts** — JetBrains Mono for data/labels
3. **Color palette foundation** — OKLch color system in place
4. **Data-first UI** — Charts, cards, metrics prioritized
5. **Minimal animations** — Subtle transitions only
6. **White text baseline** — Foreground color set to near-white

### ⚠️ Issues Found

1. **Text case inconsistency**
   - Some labels use Title Case (should be lowercase)
   - Button text mixed case (should match monospace style)
   - Chart labels not consistently lowercase

2. **Color usage**
   - Hardcoded Tailwind colors used (green-400, red-400, yellow-400, purple)
   - Should use OKLch CSS variables exclusively
   - Accent colors not consistently applied

3. **Text styling**
   - Some headings use `font-semibold` (should be regular/medium)
   - Data labels missing consistent monospace application
   - Inconsistent font weights

4. **Card styling**
   - Some cards have mixed background opacity (bg-card/50, bg-card/80)
   - Border consistency could be improved
   - Hover states not standardized

5. **Spacing**
   - Generally good, but some padding uses hardcoded values
   - Gap sizing could be more consistent
   - Some sections have excessive whitespace

---

## Required Changes

### Priority 1: Typography & Text Case

**Rule:** All text lowercase except proper nouns (BTC, ETH, etc.)

**Files to update:**
- `App.jsx` — Button labels, headers
- `Dashboard.jsx` — Card titles, labels
- `components/ui/*` — Button text

**Examples:**
```jsx
// ❌ Before
<h3 className="text-sm font-semibold">Total Signals</h3>

// ✅ After
<h3 className="text-sm font-medium font-mono">total signals</h3>
```

### Priority 2: Color Variables

**Rule:** Use OKLch CSS variables, NO hardcoded hex/Tailwind colors

**Current hardcoded colors:**
- `text-green-400` → Use `--color-chart-1` (#22c55e)
- `text-red-400` → Use `--color-destructive`
- `text-yellow-400` → Use `--color-chart-3`
- `text-purple-*` → Use `--color-chart-4`
- `text-cyan-*` → Use `--color-chart-2`

**Update all:**
```jsx
// ❌ Before
<span className="text-green-400">bullish</span>

// ✅ After
<span style={{ color: 'var(--color-chart-1)' }}>bullish</span>
// OR in CSS
<span className="text-bullish">bullish</span>
```

**New CSS variables to add to index.css:**
```css
--color-bullish: oklch(0.65 0.2 145);    /* Green */
--color-bearish: oklch(0.55 0.2 25);    /* Red */
--color-neutral: oklch(0.6 0.01 260);   /* Slate */
--color-impact-high: oklch(0.55 0.2 25); /* Red */
--color-impact-med: oklch(0.7 0.15 60);  /* Yellow */
--color-impact-low: oklch(0.55 0.15 250); /* Purple */
```

### Priority 3: Font Weights

**Rule:** Data = regular (400), labels = medium (500), headings = semibold (600) MAX

**Current mixed usage:**
- Some numbers use `font-semibold` (should be `font-mono`)
- Labels use `font-xs` (correct) but not always monospace
- Headers use `font-semibold` (should stay but check consistency)

**Standardize:**
```jsx
// Data/numbers
<span className="font-mono font-normal">42</span>

// Labels
<span className="text-xs font-mono font-medium">label text</span>

// Card titles
<h3 className="text-sm font-medium font-mono">card title</h3>

// Headers
<h1 className="text-xl font-semibold">page title</h1>
```

### Priority 4: Card Styling

**Rule:** Consistent opacity, borders, and hover states

**Current inconsistencies:**
- `bg-card/50` (50% opacity)
- `bg-card/80` (80% opacity)
- Mixed hover states

**Standardize to:**
```jsx
// Default card
<Card className="border-border/50 bg-card/50">

// Hover state (in CSS)
.card:hover {
  background-color: oklch(0.11 0.01 260); /* Slightly lighter */
  border-color: oklch(0.24 0.01 260);    /* Slightly brighter */
  box-shadow: 0 0 20px oklch(0.65 0.2 145 / 0.05);
}
```

### Priority 5: Chart Colors

**Rule:** White text, bold semantic colors, no gradients on dark backgrounds

**Current:**
```jsx
<stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
```

**Update to use CSS variables:**
```jsx
<defs>
  <linearGradient id="gradient-bullish">
    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.8} />
    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
  </linearGradient>
</defs>
```

---

## Implementation Checklist

### Phase 1: CSS Variables (index.css)

- [ ] Add semantic color variables (bullish, bearish, neutral, impact levels)
- [ ] Verify all colors are in OKLch format
- [ ] Remove all Tailwind color references
- [ ] Add dark mode color overrides

### Phase 2: Typography (All Components)

- [ ] Convert all text to lowercase (except proper nouns)
- [ ] Apply monospace to all data/labels
- [ ] Standardize font sizes and weights
- [ ] Update button labels to monospace
- [ ] Fix heading hierarchy

### Phase 3: Card Styling

- [ ] Standardize card background opacity (`bg-card/50`)
- [ ] Standardize card borders (`border-border/50`)
- [ ] Create consistent hover states
- [ ] Update all card titles to use new typography rules

### Phase 4: Charts

- [ ] Replace hardcoded colors with CSS variables
- [ ] Update all Recharts components
- [ ] Verify white text on dark backgrounds
- [ ] Test accessibility (contrast ratios)

### Phase 5: Consistency Pass

- [ ] Code review all components
- [ ] Verify ESLint passes (with updated rules)
- [ ] Test on mobile/tablet/desktop
- [ ] Screenshot comparison (before/after)

---

## Color Palette (Final)

### Semantic Colors
```
Bullish:  #22c55e (oklch(0.65 0.2 145))
Bearish:  #ef4444 (oklch(0.55 0.2 25))
Neutral:  #94a3b8 (oklch(0.6 0.01 260))
```

### Impact Levels
```
High:     #ef4444 (Red - Bearish)
Medium:   #eab308 (Yellow)
Low:      #8b5cf6 (Purple)
```

### Backgrounds
```
Background: #0a0a0f (oklch(0.08 0.01 260))
Card:       #0f172a (oklch(0.1 0.01 260))
Border:     #334155 (oklch(0.22 0.01 260))
```

### Text
```
Foreground:      #f1f5f9 (oklch(0.93 0.01 260))
Muted:           #94a3b8 (oklch(0.6 0.01 260))
Primary Accent:  #22c55e (Green)
```

---

## Typography Rules (Final)

### Font Stack
- **Data/Labels:** JetBrains Mono (monospace)
- **Body:** System sans-serif
- **Headings:** System sans-serif

### Case Rules
```
Page Titles:   Sentence case (e.g., "Signal intelligence")
Card Titles:   lowercase (e.g., "total signals")
Labels:        lowercase (e.g., "bullish", "high impact")
Buttons:       lowercase (e.g., "scan", "show analytics")
Market Tags:   UPPERCASE (e.g., "BTC", "ETH", "FED")
Proper Nouns:  Standard case (e.g., "Reuters", "Bloomberg")
```

### Size & Weight Rules
```
h1: 20px semibold (page title)
h2: 18px semibold (section title)
h3: 14px semibold (card title)
body: 14px regular
small: 12px regular
tiny: 11px regular

data: monospace regular
label: monospace medium
badge: monospace regular
```

---

## Testing Checklist

- [ ] **Contrast** — All text >= 4.5:1 contrast ratio
- [ ] **Readability** — Monospace data is easily scannable
- [ ] **Consistency** — All similar elements styled identically
- [ ] **Dark Mode** — Dark backgrounds throughout, white text
- [ ] **Colors** — No hardcoded colors, all OKLch variables
- [ ] **Responsive** — Layout works on 320px, 768px, 1280px+ widths
- [ ] **Performance** — No CSS regressions, bundle size stable

---

## Files to Update

**High Priority:**
- [ ] `packages/client/src/index.css` — Add semantic variables
- [ ] `packages/client/src/App.jsx` — Lowercase text, colors
- [ ] `packages/client/src/components/Dashboard.jsx` — Colors, typography
- [ ] `packages/client/src/components/ui/card.jsx` — Check styling

**Medium Priority:**
- [ ] `packages/client/src/lib/mockData.ts` — Verify data generation
- [ ] `packages/client/vite.config.js` — No changes needed
- [ ] `packages/client/tailwind.config.js` — May need updates

**Review:**
- [ ] `AGENTS.md` — Verify design section matches implementation
- [ ] `STYLE_GUIDE.md` — Ensure guidance is being followed

---

## Success Criteria

When complete:
- ✅ All text lowercase (except proper nouns/abbreviations)
- ✅ All colors use OKLch CSS variables
- ✅ Monospace font used for all data/labels
- ✅ Bold semantic colors for sentiment/impact
- ✅ White text on black backgrounds throughout
- ✅ Consistent typography hierarchy
- ✅ All hardcoded colors removed
- ✅ ESLint passes with updated rules
- ✅ Pixel-perfect match to fey.com/midday.ai aesthetic
- ✅ Data visualization is the priority

---

## Time Estimate

- Phase 1 (CSS): 30 minutes
- Phase 2 (Typography): 1 hour
- Phase 3 (Cards): 45 minutes
- Phase 4 (Charts): 1 hour
- Phase 5 (Testing): 1 hour

**Total: ~4 hours** for full compliance

---

Next: Execute implementation in priority order.
