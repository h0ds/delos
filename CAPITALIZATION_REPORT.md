# Comprehensive Capitalization Inconsistencies Report
## packages/client/src Directory

Generated: 2026-01-21
Status: COMPLETE SCAN

---

## CRITICAL ISSUES (High Priority)

### Issue #1: Inconsistent Market Status Labels
**Severity:** High - Breaks UI consistency across pages

#### Instances Found:

| File | Line | Current Text | Context | Recommended |
|------|------|--------------|---------|-------------|
| `PolymarketCard.jsx` | 164 | `Open` / `Closed` | Status badge on market card | `Active` / `Closed` |
| `KalshiCard.jsx` | 163 | `Open` / `Closed` | Status badge on market card | `Active` / `Closed` |
| `MarketDetailPage.jsx` | 172 | `Live` / `Closed` | Status badge on detail page | `Active` / `Closed` |
| `MarketComparisonPage.jsx` | 303 | `Active` / `Closed` | Comparison page market1 | ✅ Already correct |
| `MarketComparisonPage.jsx` | 311 | `Active` / `Closed` | Comparison page market2 | ✅ Already correct |

**Problem:** Three different terms used for the same state: "Open", "Live", "Active"

**Solution:** Standardize to **"Active" / "Closed"** across all components for consistency

---

### Issue #2: Lowercase Cryptocurrency Names
**Severity:** High - Breaks proper noun capitalization

#### Instances Found:

| File | Line | Current | Suggested | Context |
|------|------|---------|-----------|---------|
| `App.jsx` | 164 | `'bitcoin'` | `'Bitcoin'` | Mock signal generation trigger |
| `App.jsx` | 166 | `'bitcoin'` | `'Bitcoin'` | Search query set |

**Code Context:**
```javascript
// Line 164
const mockSignals = generateMockSignals('bitcoin', 25)

// Line 166
setSearchedQuery('bitcoin')
```

**Problem:** Lowercase cryptocurrency ticker when used as display string

**Solution:** Capitalize: `'Bitcoin'`

---

### Issue #3: Lowercase Time Descriptors in Badges
**Severity:** Medium - UI label consistency

#### Instances Found:

| File | Line | Current Text | Context | Suggested |
|------|------|--------------|---------|-----------|
| `MarketDetailPage.jsx` | 189 | `days old` | Data freshness badge | `Days Old` |

**Code Context:**
```javascript
// Line 189 (in Status & Metadata Row)
{market.dataFreshness.daysOld} days old
```

**Problem:** UI label uses lowercase for badge text, inconsistent with other badges (Active, Closed, etc.)

**Solution:** Change to `Days Old` for title case consistency

---

## MEDIUM PRIORITY ISSUES

### Issue #4: Inconsistent Empty State Message
**Severity:** Medium - Minor UI polish

#### Instances Found:

| File | Line | Current Text | Suggested | Context |
|------|------|--------------|-----------|---------|
| `SignalsSidebar.jsx` | 44 | `No signals to display` | `No Signals To Display` | Empty state message |

**Code Context:**
```javascript
// Line 44
<p className="text-xs text-muted-foreground text-center">No signals to display</p>
```

**Problem:** Lowercase message in UI label context; other section headers use Title Case

**Solution:** Change to `No Signals To Display` for consistency with design system

---

## VERIFIED AS CORRECT ✅

### Impact/Quality Levels (SignalsSidebar.jsx)
```javascript
// Line 14: 'High' ✅ Correct
// Line 16: 'Medium' ✅ Correct
// Line 17: 'Low' ✅ Correct
```

### Sentiment Labels
```javascript
// 'Bullish' ✅ Correct
// 'Bearish' ✅ Correct
// 'Neutral' ✅ Correct
```

### Status Messages (OracleHeader.jsx)
```javascript
// Line 55: 'Analyzing' / 'Ready' ✅ Correct
// Line 74: 'Live' / 'Connecting' ✅ Correct
```

### Section Headers (All proper)
- "Probability Distribution" ✅
- "24h Volume" ✅
- "Advanced Analytics" ✅
- "Market Statistics" ✅
- "Signal Feed" ✅
- "Related Markets" ✅
- "Related Signals" ✅

### Button Labels
- "Research" ✅
- "Compare" ✅
- "Back" ✅

---

## EDGE CASES & NOTES

### 1. Case-Insensitive Comparisons (Correct)
The codebase correctly uses case-insensitive comparisons for user-facing data:
```javascript
// Correct approach - compares lowercase
const aIsYes = a.name.toLowerCase() === 'yes'
const bIsYes = b.name.toLowerCase() === 'yes'
```

### 2. Placeholder Text
```javascript
// Line 293 App.jsx - Acceptable as placeholder
placeholder="Research market..."  ✅
```

### 3. API Provider Names
```javascript
// Correct capitalization
'NewsAPI' ✅
'Polymarket' ✅
'Kalshi' ✅
```

---

## IMPLEMENTATION PRIORITY

### Phase 1: CRITICAL (Do First)
1. **Standardize market status labels** → All use "Active" / "Closed"
   - Update 3 files: PolymarketCard, KalshiCard, MarketDetailPage

2. **Fix Bitcoin capitalization** → "Bitcoin"
   - Update 1 file: App.jsx (2 lines)

### Phase 2: IMPORTANT (Do Next)
3. **Capitalize time descriptors** → "Days Old"
   - Update 1 file: MarketDetailPage.jsx (1 line)

### Phase 3: POLISH (Optional)
4. **Standardize empty state** → "No Signals To Display"
   - Update 1 file: SignalsSidebar.jsx (1 line)

---

## FILES REQUIRING CHANGES

### Files to Modify:
1. ✏️ `components/App.jsx` - 2 changes (Bitcoin)
2. ✏️ `components/PolymarketCard.jsx` - 1 change (Open → Active)
3. ✏️ `components/KalshiCard.jsx` - 1 change (Open → Active)
4. ✏️ `components/MarketDetailPage.jsx` - 2 changes (Live → Active, days old)
5. ✏️ `components/SignalsSidebar.jsx` - 1 change (No signals)

### Total Changes: 7 lines across 5 files

---

## DESIGN SYSTEM ALIGNMENT

**Current Pattern in Design System:**
- Section headers: Title Case ✅
- Button labels: Title Case ✅
- Status badges: Title Case ✅
- Sentiment badges: Title Case ✅
- Impact badges: Title Case ✅

**Recommended Standard:**
- All user-facing text: **Title Case**
- All code identifiers: **camelCase**
- All status values: **Active** / **Closed** (Title Case)

