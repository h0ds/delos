import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { getMarketHistory } from '@/lib/marketHistory'

export function VolumeChart({ marketId = null, source = 'polymarket' }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        if (marketId) {
          // Try to fetch real historical data
          const history = await getMarketHistory(marketId, source)
          setData(history)
        } else {
          setData(null)
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [marketId, source])

  const formatVolume = value => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">No volume data available</div>
      </div>
    )
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#27d9a6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#27d9a6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="dateDisplay"
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tickFormatter={formatVolume}
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            label={{ value: 'Volume', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 10, 15, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px'
            }}
            formatter={value => formatVolume(value)}
            labelFormatter={label => `Date: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#27d9a6"
            strokeWidth={2}
            fill="url(#volumeGradient)"
            isAnimationActive={true}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
