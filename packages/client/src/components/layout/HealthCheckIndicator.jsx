import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ChevronDown } from 'lucide-react'

const PROVIDER_DISPLAY = {
  newsapi: 'NewsAPI',
  'google-news': 'Google News',
  reddit: 'Reddit',
  deepseek: 'DeepSeek',
  polymarket: 'Polymarket',
  kalshi: 'Kalshi'
}

export function HealthCheckIndicator() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:3333/api/health')
        if (response.ok) {
          const data = await response.json()
          // Only get providers that are actually returned (enabled/configured)
          const providersList = Object.entries(data.providers).map(([key, info]) => ({
            name: PROVIDER_DISPLAY[key] || key,
            status: info.status,
            key
          }))
          setProviders(providersList)
          console.log(`[health] ✅ ${providersList.length} providers checked`)
          setLoading(false)
        }
      } catch (error) {
        console.error('[health] ❌ check failed:', error.message)
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  if (loading) return null

  const readyCount = providers.filter(p => p.status === 'ready').length
  const totalCount = providers.length
  const isHealthy = totalCount > 0 && readyCount === totalCount

  return (
    <div className="relative">
      {/* Main Indicator Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card transition-all duration-300 group"
      >
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              isHealthy ? 'bg-bullish animate-pulse' : 'bg-yellow-400'
            }`}
          />
          <span className="text-xs font-mono text-muted-foreground">
            {readyCount}/{totalCount}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-300 group-hover:text-primary ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu - Only configured providers */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-border/50 rounded-lg shadow-lg backdrop-blur-sm z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
            {providers.map(provider => {
              const isReady = provider.status === 'ready'
              const statusText =
                provider.status === 'ready'
                  ? 'Ready'
                  : provider.status === 'disabled'
                    ? 'Disabled'
                    : 'Missing Key'

              return (
                <div
                  key={provider.key}
                  className="flex items-center justify-between gap-3 p-2 rounded hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${
                        isReady ? 'bg-bullish' : 'bg-yellow-400'
                      }`}
                    />
                    <span className="text-xs font-mono text-foreground truncate">
                      {provider.name}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs font-mono flex-shrink-0 ${
                      isReady
                        ? 'bg-bullish/10 text-bullish border-bullish/30'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                    }`}
                  >
                    {statusText}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
