import { Brain, Zap, Activity, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { HealthCheckIndicator } from './HealthCheckIndicator'
import { OracleVisualization } from './OracleVisualization'

export function OracleHeader({ connected, isResearching, onHeaderClick, currentPage }) {
  const isResearchPage = currentPage === 'research'

  return (
    <header className="relative border-b border-border/50 backdrop-blur-sm bg-background/50 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4">
        {/* Header Top Row - Compact */}
        <div className="flex items-center justify-between mb-3">
          {/* Delos Identity - Clickable to return home */}
          <div
            onClick={onHeaderClick}
            className={`flex items-center gap-2 cursor-pointer transition-all duration-300 ${
              isResearchPage ? 'hover:opacity-70' : ''
            }`}
          >
            <div className="p-1.5">
              <img src="/delos.svg" alt="Delos Logo" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight font-mono">Delos</h1>
              <p className="text-xs text-muted-foreground font-mono leading-tight">
                Make Better Decisions.
              </p>
            </div>
            {isResearchPage && (
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-border/30 text-xs font-mono text-muted-foreground">
                <ChevronRight className="w-3 h-3" />
                <span>Research</span>
              </div>
            )}
          </div>

          {/* Status Indicators - Compact Row */}
          <div className="flex items-center gap-3">
            {/* Research Status */}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`font-mono text-xs py-1 px-2 h-7 ${
                  isResearching
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-muted text-muted-foreground border-muted'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    isResearching ? 'bg-primary animate-pulse' : 'bg-muted-foreground'
                  }`}
                />
                {isResearching ? 'Analyzing' : 'Ready'}
              </Badge>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`font-mono text-xs py-1 px-2 h-7 ${
                  connected
                    ? 'bg-bullish/10 text-bullish border-bullish/30'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    connected ? 'bg-bullish animate-pulse' : 'bg-yellow-400'
                  }`}
                />
                {connected ? 'Live' : 'Connecting'}
              </Badge>
            </div>

            {/* API Health Dropdown */}
            <HealthCheckIndicator />
          </div>
        </div>

        {/* Description & Capabilities - Single Compact Line */}
        <div className="flex items-center justify-between text-xs">
          <p className="text-muted-foreground max-w-2xl">
            Monitors prediction markets, analyzes news signals and sentiment across multiple sources
            in real-time.
          </p>
          <div className="hidden lg:flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-primary" />
              Markets
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-primary" />
              Signals
            </span>
            <span className="flex items-center gap-1.5">
              <Brain className="h-3 w-3 text-primary" />
              Analysis
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
