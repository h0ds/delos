/**
 * Professional candlestick chart visualization (data-dense, no borders)
 * Shows OHLC data for financial analysis
 */
export function CandlestickChart({ data, title = 'Price Action' }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-3 text-center text-sm text-muted-foreground">No OHLC Data Available</div>
    )
  }

  // Normalize data bounds
  const allPrices = data.flatMap(d => [d.open, d.high, d.low, d.close])
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)
  const priceRange = maxPrice - minPrice
  const padding = priceRange * 0.1

  const normalize = price => {
    const normalized = (price - (minPrice - padding)) / (priceRange + padding * 2)
    return Math.max(0, Math.min(1, normalized)) * 100
  }

  const candles = data.map((candle, idx) => {
    const isBullish = candle.close >= candle.open
    const wickHigh = normalize(candle.high)
    const wickLow = normalize(candle.low)
    const bodyOpen = normalize(candle.open)
    const bodyClose = normalize(candle.close)
    const bodyTop = Math.min(bodyOpen, bodyClose)
    const bodyHeight = Math.abs(bodyClose - bodyOpen) || 2

    return {
      ...candle,
      isBullish,
      wickHigh,
      wickLow,
      bodyTop,
      bodyHeight,
      idx
    }
  })

  const firstCandle = candles[0]
  const lastCandle = candles[candles.length - 1]
  const highestHigh = Math.max(...candles.map(c => c.high))
  const lowestLow = Math.min(...candles.map(c => c.low))
  const avgVolume = candles.reduce((sum, c) => sum + c.volume, 0) / candles.length
  const changePercent = ((lastCandle.close - firstCandle.open) / firstCandle.open) * 100

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground font-mono">{candles.length} periods</p>
      </div>

      {/* SVG Candlestick Chart - No border */}
      <div className="w-full h-28 bg-muted/5 rounded-lg p-2">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="bullishGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.6 0.2 145)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="oklch(0.6 0.2 145)" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="bearishGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.55 0.2 25)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="oklch(0.55 0.2 25)" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1="0"
            y1="25"
            x2="100"
            y2="25"
            stroke="oklch(0.22 0.01 260 / 0.15)"
            strokeWidth="0.5"
          />
          <line
            x1="0"
            y1="50"
            x2="100"
            y2="50"
            stroke="oklch(0.22 0.01 260 / 0.15)"
            strokeWidth="0.5"
          />
          <line
            x1="0"
            y1="75"
            x2="100"
            y2="75"
            stroke="oklch(0.22 0.01 260 / 0.15)"
            strokeWidth="0.5"
          />

          {/* Candlesticks */}
          {candles.map(candle => {
            const x = (candle.idx / (candles.length - 1)) * 100
            const width = (100 / candles.length) * 0.6

            return (
              <g key={candle.idx}>
                {/* Wick */}
                <line
                  x1={x}
                  y1={candle.wickHigh}
                  x2={x}
                  y2={candle.wickLow}
                  stroke={candle.isBullish ? 'oklch(0.6 0.2 145)' : 'oklch(0.55 0.2 25)'}
                  strokeWidth="0.8"
                />
                {/* Body */}
                <rect
                  x={x - width / 2}
                  y={candle.bodyTop}
                  width={width}
                  height={candle.bodyHeight}
                  fill={candle.isBullish ? 'url(#bullishGradient)' : 'url(#bearishGradient)'}
                  stroke={candle.isBullish ? 'oklch(0.6 0.2 145)' : 'oklch(0.55 0.2 25)'}
                  strokeWidth="0.5"
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Condensed Statistics - 4 columns, no borders */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        {/* Open */}
        <div className="text-center">
          <p className="text-muted-foreground font-mono uppercase tracking-tight mb-0.5">Open</p>
          <p className="text-sm font-semibold font-mono text-primary">
            {firstCandle.open.toFixed(4)}
          </p>
        </div>

        {/* High */}
        <div className="text-center">
          <p className="text-muted-foreground font-mono uppercase tracking-tight mb-0.5">High</p>
          <p className="text-sm font-semibold font-mono text-bullish">{highestHigh.toFixed(4)}</p>
        </div>

        {/* Low */}
        <div className="text-center">
          <p className="text-muted-foreground font-mono uppercase tracking-tight mb-0.5">Low</p>
          <p className="text-sm font-semibold font-mono text-bearish">{lowestLow.toFixed(4)}</p>
        </div>

        {/* Close */}
        <div className="text-center">
          <p className="text-muted-foreground font-mono uppercase tracking-tight mb-0.5">Close</p>
          <p className="text-sm font-semibold font-mono text-primary">
            {lastCandle.close.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Secondary Metrics - 3 columns, no borders */}
      <div className="grid grid-cols-3 gap-2 text-xs text-center">
        <div>
          <p className="text-muted-foreground font-mono uppercase tracking-tight mb-0.5">Volume</p>
          <p className="text-sm font-semibold font-mono text-muted-foreground">
            {(avgVolume / 1000).toFixed(0)}K
          </p>
        </div>
        <div>
          <p className="text-muted-foreground font-mono uppercase tracking-tight mb-0.5">Range</p>
          <p className="text-sm font-semibold font-mono text-muted-foreground">
            {priceRange.toFixed(4)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground font-mono uppercase tracking-tight mb-0.5">Change</p>
          <p
            className={`text-sm font-semibold font-mono ${changePercent >= 0 ? 'text-bullish' : 'text-bearish'}`}
          >
            {changePercent >= 0 ? '+' : ''}
            {changePercent.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  )
}
