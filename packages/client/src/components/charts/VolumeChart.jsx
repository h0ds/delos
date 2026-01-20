import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export function VolumeChart({ volume = 0 }) {
  // Generate mock historical volume data (last 7 days)
  const generateVolumeData = () => {
    const data = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const variance = Math.random() * 0.4 + 0.8 // 80-120% of current volume
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: Math.round(volume * variance)
      })
    }
    return data
  }

  const data = generateVolumeData()
  const maxVolume = Math.max(...data.map(d => d.volume))

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
            dataKey="date"
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
