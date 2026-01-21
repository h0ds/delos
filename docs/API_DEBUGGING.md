# API Debugging Guide

## Console Output

All API calls now log to the server console with emoji indicators:

### Logging Format
```
[module] 🔍 description
[module] ✅ success
[module] ❌ ERROR: error message
[module] ⚠️  warning
```

### Example Console Output

When you search for "bitcoin":

```
[aggregator] 📡 acquiring signals for "bitcoin"
[newsapi] 🔍 fetching for query: "bitcoin"
[newsapi] ✅ fetched 20 articles
[google-news] 🔍 fetching for query: "bitcoin"
[google-news] ✅ fetched 15 articles
[reddit] 🔍 fetching for query: "bitcoin"
[reddit] ✅ fetched 12 posts
[aggregator] 📊 aggregated 47 total signals
[aggregator] ✅ deduped to 25 signals
[ai] 🧠 analyzing 25 signals with deepseek
[ai:deepseek] 📤 sending request to DeepSeek
[ai:deepseek] ✅ response received
[ai] ✅ analysis complete: sentiment=bullish
[polymarket] 🔍 fetching markets for query: "bitcoin"
[polymarket] ✅ fetched 20 markets
[polymarket] 📊 filtered to 3 relevant markets
```

## Troubleshooting

### "signal stream: connecting" with no results

1. **Check server is running**
   ```bash
   curl http://localhost:3333/api/status
   ```
   Should return `{"status": "operational", ...}`

2. **Check server logs** (if using `npm run dev`)
   Look for these indicators:
   - ❌ `[newsapi] ❌ ERROR` → NewsAPI key invalid or expired
   - ❌ `[ai] ❌ ERROR` → AI API key invalid
   - ❌ `[polymarket] ❌ ERROR` → Polymarket API issue
   - ⚠️ `⚠️ KEY not set` → Skipping that source (normal)

3. **Verify API keys in `.env`**
   ```bash
   cat packages/server/.env | grep API_KEY
   ```
   Keys should NOT be blank (shows `[REDACTED:api-key]` if set)

4. **Check frontend socket connection**
   Open browser console (F12):
   ```
   [socket] connected
   ```
   Should appear when app loads

5. **Test socket manually**
   ```bash
   # Kill browser, reload, search for "bitcoin"
   # Watch server logs for activity
   ```

## API Key Requirements

| Service | Required | Key Format | Where to Get |
|---------|----------|------------|--------------|
| NewsAPI | ✅ YES | alphanumeric | https://newsapi.org |
| DeepSeek | ✅ YES (if AI enabled) | alphanumeric | https://platform.deepseek.com |
| Polymarket | ❌ NO | alphanumeric | https://api.polymarket.com |
| Google News | ❌ NO | (public RSS) | (no key needed) |
| Reddit | ❌ NO | (public API) | (no key needed) |

## Common Errors

### `[newsapi] ❌ ERROR: 401 Unauthorized`
→ NewsAPI key is invalid or expired
→ Get new key from https://newsapi.org

### `[ai:deepseek] ❌ ERROR: 401 Unauthorized`
→ DeepSeek API key is invalid
→ Verify key at https://platform.deepseek.com

### `[polymarket] ❌ ERROR: Network timeout`
→ Polymarket API is slow or unreachable
→ Try again, or disable with unset `POLYMARKET_API_KEY`

### Socket connects but no signals appear
1. Check server logs for actual API errors (not just "connecting")
2. If logs show ✅ signals fetched but UI shows nothing:
   - Check browser console for JS errors (F12)
   - Verify socket events are being received

## Testing Without Keys

To test without API keys, use demo mode:
1. Stop the server (`npm run dev` → Ctrl+C)
2. Search in the browser (no server needed)
3. Mock data is generated automatically

## Next Steps

1. **Verify each API**:
   ```bash
   # In server logs, watch for these when you search:
   [newsapi] ✅ fetched X articles    # NewsAPI working
   [ai:deepseek] ✅ response received  # AI working
   [polymarket] ✅ fetched X markets   # Polymarket working
   ```

2. **If an API shows ❌ ERROR**:
   - Check the error message in console
   - Verify API key is correct
   - Check if service is operational

3. **If demo signals appear but real API doesn't**:
   - Reload page and search again
   - Check server is still running
   - Watch for 🔍 → ✅ or ❌ sequence in logs

---

*For more help, check the console logs when searching. Every API call is now logged.*
