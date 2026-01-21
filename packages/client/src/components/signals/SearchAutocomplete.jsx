import { useState, useRef, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'

const POPULAR_QUERIES = [
  'Bitcoin price surge',
  'Fed interest rates',
  'Tech market crash',
  'AI regulation',
  'S&P 500 performance',
  'Crypto volatility',
  'Market correction',
  'Economic inflation'
]

export function SearchAutocomplete({ value, onChange, onSelect, onFocus, onBlur }) {
  const [isOpen, setIsOpen] = useState(false)
  const [filtered, setFiltered] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Filter suggestions based on input
  useEffect(() => {
    if (value.trim().length === 0) {
      setFiltered(POPULAR_QUERIES)
    } else {
      const query = value.toLowerCase()
      const results = POPULAR_QUERIES.filter(q => q.toLowerCase().includes(query))
      setFiltered(results)
    }
    setSelectedIndex(-1)
  }, [value])

  // Handle keyboard navigation
  const handleKeyDown = e => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
        setSelectedIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          const selected = filtered[selectedIndex]
          onChange({ target: { value: selected } })
          onSelect(selected)
          setIsOpen(false)
        } else if (value.trim()) {
          onSelect(value)
          setIsOpen(false)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
      default:
        break
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Dropdown Menu */}
      {isOpen && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border border-border/60 rounded-xl shadow-lg overflow-hidden animate-in fade-in duration-150">
          <div className="max-h-72 overflow-y-auto">
            {filtered.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onChange({ target: { value: suggestion } })
                  onSelect(suggestion)
                  setIsOpen(false)
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-2 font-mono border-b border-border/20 last:border-b-0 ${
                  idx === selectedIndex
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-card/80 hover:border-primary/30'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5 opacity-60 flex-shrink-0" />
                <span className="truncate flex-1">{suggestion}</span>
              </button>
            ))}
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              No suggestions found
            </div>
          )}
        </div>
      )}

    </div>
  )
}
