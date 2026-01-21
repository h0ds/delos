/**
 * BinaryOutcomeBar - Single split bar visualization for Yes/No outcomes
 * Shows a single bar with proportional red/green segments for two-sided markets
 */

export function BinaryOutcomeBar({ outcomes = [], compact = false }) {
  if (!outcomes || outcomes.length !== 2) return null

  // Sort outcomes so positive outcome (Yes) is first
  const sortedOutcomes = [...outcomes].sort(a => {
    const aIsYes = a.name.toLowerCase() === 'yes'
    return aIsYes ? -1 : 1
  })

  const [yesOutcome, noOutcome] = sortedOutcomes
  const yesProbability = Math.max(0, Math.min(1, yesOutcome?.probability || 0))
  const noProbability = 1 - yesProbability

  if (compact) {
    // Compact version: labels above, bar below
    return (
      <div className="w-full space-y-2">
        {/* Labels Above */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-green-500" />
            <span className="font-mono text-foreground font-semibold">
              {yesOutcome.name}
            </span>
            <span className="font-mono text-muted-foreground">
              {(yesProbability * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-muted-foreground">
              {(noProbability * 100).toFixed(1)}%
            </span>
            <span className="font-mono text-foreground font-semibold">
              {noOutcome.name}
            </span>
            <div className="w-2 h-2 rounded-sm bg-red-500" />
          </div>
        </div>

        {/* Bar */}
        <div className="relative h-8 rounded-md overflow-hidden border border-border/40 bg-card/30">
          {/* Green (Yes) segment */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-600/90 to-green-500/80 transition-all duration-500"
            style={{ width: `${yesProbability * 100}%` }}
          />

          {/* Red (No) segment */}
          <div
            className="absolute inset-y-0 right-0 bg-gradient-to-l from-red-600/90 to-red-500/80 transition-all duration-500"
            style={{ width: `${noProbability * 100}%` }}
          />

          {/* Center divider line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/20 pointer-events-none"
            style={{ left: `${yesProbability * 100}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-3">
      {/* Single Split Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <div className="relative h-12 rounded-lg overflow-hidden border border-border/40 bg-card/30 backdrop-blur-sm shadow-inner">
              {/* Green (Yes) segment */}
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-600/90 to-green-500/80 flex items-center justify-center transition-all duration-500 ease-out hover:from-green-500/95 hover:to-green-400/90"
                style={{ width: `${yesProbability * 100}%` }}
              >
                {yesProbability > 0.15 && (
                  <span className="text-sm font-mono font-semibold text-white drop-shadow-md">
                    {(yesProbability * 100).toFixed(1)}%
                  </span>
                )}
              </div>

              {/* Red (No) segment */}
              <div
                className="absolute inset-y-0 right-0 bg-gradient-to-l from-red-600/90 to-red-500/80 flex items-center justify-center transition-all duration-500 ease-out hover:from-red-500/95 hover:to-red-400/90"
                style={{ width: `${noProbability * 100}%` }}
              >
                {noProbability > 0.15 && (
                  <span className="text-sm font-mono font-semibold text-white drop-shadow-md">
                    {(noProbability * 100).toFixed(1)}%
                  </span>
                )}
              </div>

              {/* Center divider line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white/20 pointer-events-none"
                style={{ left: `${yesProbability * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="flex items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-green-600 to-green-500" />
            <span className="text-xs font-mono text-foreground font-semibold">
              {yesOutcome.name}: {(yesProbability * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-red-600 to-red-500" />
            <span className="text-xs font-mono text-foreground font-semibold">
              {noOutcome.name}: {(noProbability * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
