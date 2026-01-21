import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { X, Filter } from 'lucide-react'

export default function MarketFilterPanel({ markets, onFilter, onReset }) {
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedStatus, setSelectedStatus] = useState([])
  const [minVolume, setMinVolume] = useState(0)
  const [maxVolume, setMaxVolume] = useState(Infinity)

  // Extract unique categories and statuses from markets
  const categories = useMemo(() => {
    return [...new Set(markets.map(m => m.category).filter(Boolean))]
  }, [markets])

  const statuses = useMemo(() => {
    return [...new Set(markets.map(m => m.status).filter(Boolean))]
  }, [markets])

  const applyFilters = () => {
    const filtered = markets.filter(market => {
      const categoryMatch =
        selectedCategories.length === 0 || selectedCategories.includes(market.category)
      const statusMatch = selectedStatus.length === 0 || selectedStatus.includes(market.status)
      const volumeMatch = market.volume24h >= minVolume && market.volume24h <= maxVolume
      return categoryMatch && statusMatch && volumeMatch
    })

    onFilter(filtered)
    setShowFilters(false)
  }

  const resetFilters = () => {
    setSelectedCategories([])
    setSelectedStatus([])
    setMinVolume(0)
    setMaxVolume(Infinity)
    onReset()
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedStatus.length > 0 ||
    minVolume > 0 ||
    maxVolume < Infinity

  return (
    <div className="space-y-3">
      {/* Filter Toggle Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="text-xs font-mono gap-1.5"
        >
          <Filter className="w-3 h-3" />
          {hasActiveFilters && (
            <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs">
              {selectedCategories.length + selectedStatus.length}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs font-mono gap-1"
          >
            <X className="w-3 h-3" />
            Reset
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="border-border/50 bg-card/50 backdrop-blur animate-fade-in">
          <CardContent className="p-4 space-y-4">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold font-mono text-muted-foreground block">
                  Categories
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(cat => (
                    <Badge
                      key={cat}
                      variant={selectedCategories.includes(cat) ? 'default' : 'outline'}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => {
                        setSelectedCategories(prev =>
                          prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                        )
                      }}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            {statuses.length > 0 && (
              <div className="space-y-2 border-t border-border/30 pt-3">
                <label className="text-xs font-semibold font-mono text-muted-foreground block">
                  Status
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {statuses.map(status => (
                    <Badge
                      key={status}
                      variant={selectedStatus.includes(status) ? 'default' : 'outline'}
                      className="cursor-pointer hover:border-primary transition-colors capitalize"
                      onClick={() => {
                        setSelectedStatus(prev =>
                          prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
                        )
                      }}
                    >
                      {status === 'active' ? '◉ Live' : '◯ ' + status}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Volume Range */}
            <div className="space-y-2 border-t border-border/30 pt-3">
              <label className="text-xs font-semibold font-mono text-muted-foreground block">
                Volume Range (24h)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Min Volume</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minVolume === 0 ? '' : minVolume}
                    onChange={e => setMinVolume(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Max Volume</label>
                  <Input
                    type="number"
                    placeholder="∞"
                    value={maxVolume === Infinity ? '' : maxVolume}
                    onChange={e =>
                      setMaxVolume(Math.max(minVolume, parseInt(e.target.value) || Infinity))
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex gap-2 pt-2 border-t border-border/30">
              <Button onClick={applyFilters} className="btn-modern flex-1 text-xs h-8">
                Apply Filters
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowFilters(false)}
                className="flex-1 text-xs h-8"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function FilterableMarketsGrid({ markets, renderMarket }) {
  const [filteredMarkets, setFilteredMarkets] = useState(markets)

  const handleFilter = filtered => {
    setFilteredMarkets(filtered)
  }

  const handleReset = () => {
    setFilteredMarkets(markets)
  }

  return (
    <div className="space-y-4">
      <MarketFilterPanel markets={markets} onFilter={handleFilter} onReset={handleReset} />

      {/* Results */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-muted-foreground">
          {filteredMarkets.length} market{filteredMarkets.length !== 1 ? 's' : ''} found
        </div>

        {filteredMarkets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredMarkets.map((market, idx) => (
              <div
                key={`filtered-${idx}`}
                className="stagger-item"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {renderMarket(market, idx)}
              </div>
            ))}
          </div>
        ) : (
          <Card className="border-border/50 bg-card/30">
            <CardContent className="p-8 text-center">
              <p className="text-xs font-mono text-muted-foreground">
                No markets match your filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
