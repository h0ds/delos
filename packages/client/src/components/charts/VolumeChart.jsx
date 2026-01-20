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

export function VolumeChart({ volume = 0, marketId = null, source = 'polymarket' }) {
  const [data, setData] = useState([])

  useEffect(() => {
    const loadData = async () => {
      if (marketId) {
        // Try to fetch real historical data
        const history = await getMarketHistory(marketId, source)
        setData(history)
      } else {
        // Generate mock data if no marketId provided
        setData(generateMockHistory(7, volume))
      }
    }

    loadData()
  }, [marketId, source, volume])

  const maxVolume = Math.max(...data.map(d => d.volume), 1)

  const formatVolume = value => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
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

function generateMockHistory(days, volume = 1500000) {
  const data = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const variance = Math.random() * 0.4 + 0.8
    data.push({
      dateDisplay: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: Math.round(volume * variance)
    })
  }

  return data
}
