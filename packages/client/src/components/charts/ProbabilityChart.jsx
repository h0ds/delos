import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

export function ProbabilityChart({ outcomes = [] }) {
  if (!outcomes || outcomes.length === 0) return null

  const data = outcomes.map(outcome => ({
    name: outcome.name.length > 15 ? outcome.name.substring(0, 15) + '...' : outcome.name,
    fullName: outcome.name,
    probability: outcome.probability * 100
  }))

  const colors = ['#27d9a6', '#ef4444', '#f59e0b', '#3b82f6']

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 10, 15, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px'
            }}
            formatter={value => `${value.toFixed(1)}%`}
            labelFormatter={label => `Outcome: ${label}`}
          />
          <Bar dataKey="probability" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
