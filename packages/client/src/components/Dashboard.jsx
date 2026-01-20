import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Activity
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

export function Dashboard({ signals, chartData, stats, markets }) {
  const sentimentColor =
    stats.avgSentiment > 0.2
      ? 'text-bullish'
      : stats.avgSentiment < -0.2
        ? 'text-bearish'
        : 'text-neutral'
  const sentimentLabel =
    stats.avgSentiment > 0.2 ? 'Bullish' : stats.avgSentiment < -0.2 ? 'Bearish' : 'Neutral'

  return (
    <div className="space-y-3">
      {/* Key Metrics - Compact Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stagger-item">
          <Card className="border-border/50 bg-card/50 p-3 hover:bg-card hover:border-border/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out group cursor-default">
            <div className="text-xs text-muted-foreground font-mono mb-1 transition-colors group-hover:text-primary/80">
              Signals
            </div>
            <div className="text-xl font-bold font-mono animate-count">{stats.total}</div>
            <div className="text-xs text-muted-foreground mt-1 transition-colors group-hover:text-muted-foreground/80">
              Analyzed
            </div>
          </Card>
        </div>

        <div className="stagger-item">
          <Card className="border-border/50 bg-card/50 p-3 hover:bg-card hover:border-border/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out group cursor-default">
            <div className="text-xs text-muted-foreground font-mono mb-1 transition-colors group-hover:text-primary/80">
              Sentiment
            </div>
            <div className={`text-xl font-bold font-mono transition-colors ${sentimentColor}`}>
              {sentimentLabel}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.avgSentiment.toFixed(2)}
            </div>
          </Card>
        </div>

        <div className="stagger-item">
          <Card className="border-border/50 bg-card/50 p-3 hover:bg-card hover:border-border/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out group cursor-default">
            <div className="text-xs text-muted-foreground font-mono mb-1 transition-colors group-hover:text-bullish/80">
              Bullish
            </div>
            <div className="text-xl font-bold font-mono text-bullish">{stats.bullishCount}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {((stats.bullishCount / stats.total) * 100).toFixed(0)}%
            </div>
          </Card>
        </div>

        <div className="stagger-item">
          <Card className="border-border/50 bg-card/50 p-3 hover:bg-card hover:border-border/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out group cursor-default">
            <div className="text-xs text-muted-foreground font-mono mb-1 transition-colors group-hover:text-bearish/80">
              Bearish
            </div>
            <div className="text-xl font-bold font-mono text-bearish">{stats.bearishCount}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {((stats.bearishCount / stats.total) * 100).toFixed(0)}%
            </div>
          </Card>
        </div>
      </div>

      {/* Charts Grid - Condensed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Sentiment Over Time - Line Chart */}
        <div className="stagger-item">
          <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:border-border/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out group">
            <CardHeader className="pb-2 pt-3 px-3 transition-colors group-hover:bg-card/70">
              <CardTitle className="text-xs font-mono uppercase tracking-widest flex items-center gap-2 transition-colors group-hover:text-primary">
                <Activity className="w-3 h-3 text-primary transition-transform group-hover:scale-110 duration-300" />
                Signal Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart
                  data={chartData.timeline}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="2 2"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis dataKey="time" stroke="transparent" style={{ fontSize: '9px' }} />
                  <YAxis stroke="transparent" style={{ fontSize: '9px' }} width={25} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '4px',
                      fontSize: '10px',
                      animation: 'fadeInUp 0.2s ease-out'
                    }}
                    cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bullish"
                    stroke="var(--color-bullish)"
                    dot={false}
                    strokeWidth={1.5}
                    isAnimationActive={true}
                    animationDuration={600}
                  />
                  <Line
                    type="monotone"
                    dataKey="bearish"
                    stroke="var(--color-bearish)"
                    dot={false}
                    strokeWidth={1.5}
                    isAnimationActive={true}
                    animationDuration={600}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Source Breakdown - Compact Bar */}
        <div className="stagger-item">
          <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:border-border/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out group">
            <CardHeader className="pb-2 pt-3 px-3 transition-colors group-hover:bg-card/70">
              <CardTitle className="text-xs font-mono uppercase tracking-widest flex items-center gap-2 transition-colors group-hover:text-primary">
                <BarChart3 className="w-3 h-3 text-primary transition-transform group-hover:scale-110 duration-300" />
                Top Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ResponsiveContainer width="100%" height={120}>
                <BarChart
                  data={chartData.sources}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 50, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="2 2"
                    stroke="var(--color-border)"
                    horizontal={false}
                  />
                  <XAxis type="number" stroke="transparent" style={{ fontSize: '9px' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="transparent"
                    style={{ fontSize: '8px' }}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '4px',
                      fontSize: '10px',
                      animation: 'fadeInUp 0.2s ease-out'
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--color-primary)"
                    radius={[0, 3, 3, 0]}
                    isAnimationActive={true}
                    animationDuration={600}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sentiment Distribution - Compact Horizontal Bars */}
      <div className="stagger-item">
        <Card className="border-border/50 bg-card/50 hover:bg-card hover:border-border/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out group">
          <CardHeader className="pb-2 pt-3 px-3 transition-colors group-hover:bg-card/70">
            <CardTitle className="text-xs font-mono uppercase tracking-widest transition-colors group-hover:text-primary">
              Sentiment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {[
              { label: 'Bullish', count: stats.bullishCount, color: 'var(--color-bullish)' },
              {
                label: 'Neutral',
                count: stats.total - stats.bullishCount - stats.bearishCount,
                color: 'var(--color-neutral)'
              },
              { label: 'Bearish', count: stats.bearishCount, color: 'var(--color-bearish)' }
            ].map((item, idx) => {
              const percentage = (item.count / stats.total) * 100
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 stagger-item"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <span className="text-xs font-mono text-muted-foreground w-12 transition-colors hover:text-primary">
                    {item.label}
                  </span>
                  <div className="flex-1 h-1.5 bg-border/30 rounded-full overflow-hidden group/bar hover:bg-border/50 transition-colors duration-300">
                    <div
                      className="h-full transition-all duration-700 ease-out"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                        boxShadow: `0 0 10px ${item.color}40`
                      }}
                    />
                  </div>
                  <div className="text-xs font-mono text-foreground w-16 text-right transition-colors group-hover/bar:text-primary">
                    {item.count} ({percentage.toFixed(0)}%)
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Impact & Category Breakdown - Two Column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Signal Impact Distribution */}
        <div className="stagger-item">
          <Card className="border-border/50 bg-card/50 hover:bg-card hover:border-border/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out group">
            <CardHeader className="pb-2 pt-3 px-3 transition-colors group-hover:bg-card/70">
              <CardTitle className="text-xs font-mono uppercase tracking-widest transition-colors group-hover:text-primary">
                Impact Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-1.5">
              {[
                { label: 'High', count: stats.highImpactCount, color: 'var(--color-bullish)' },
                {
                  label: 'Medium',
                  count: stats.total - stats.highImpactCount - stats.total * 0.3,
                  color: 'var(--color-neutral)'
                },
                { label: 'Low', count: stats.total * 0.3, color: 'var(--color-bearish)' }
              ].map((item, idx) => {
                const percentage = (item.count / stats.total) * 100
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 text-xs stagger-item group/impact"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <span className="font-mono text-muted-foreground w-10 transition-colors group-hover/impact:text-primary">
                      {item.label}
                    </span>
                    <div className="flex-1 h-1 bg-border/30 rounded overflow-hidden hover:bg-border/50 transition-colors duration-300">
                      <div
                        className="h-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: item.color,
                          boxShadow: `0 0 8px ${item.color}40`
                        }}
                      />
                    </div>
                    <span className="font-mono text-foreground w-8 text-right transition-colors group-hover/impact:text-primary">
                      {Math.round(item.count)}
                    </span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Signal Category Breakdown */}
        <div className="stagger-item">
          <Card className="border-border/50 bg-card/50 hover:bg-card hover:border-border/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out group">
            <CardHeader className="pb-2 pt-3 px-3 transition-colors group-hover:bg-card/70">
              <CardTitle className="text-xs font-mono uppercase tracking-widest transition-colors group-hover:text-primary">
                Signal Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-1.5">
              {[
                {
                  label: 'News',
                  count: Math.round(stats.total * 0.4),
                  color: 'var(--color-primary)'
                },
                {
                  label: 'Social',
                  count: Math.round(stats.total * 0.35),
                  color: 'var(--color-bullish)'
                },
                {
                  label: 'Market',
                  count: Math.round(stats.total * 0.25),
                  color: 'var(--color-neutral)'
                }
              ].map((item, idx) => {
                const percentage = (item.count / stats.total) * 100
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 text-xs stagger-item group/category"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <span className="font-mono text-muted-foreground w-10 transition-colors group-hover/category:text-primary">
                      {item.label}
                    </span>
                    <div className="flex-1 h-1 bg-border/30 rounded overflow-hidden hover:bg-border/50 transition-colors duration-300">
                      <div
                        className="h-full transition-all duration-700 ease-out"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color,
                          boxShadow: `0 0 8px ${item.color}40`
                        }}
                      />
                    </div>
                    <span className="font-mono text-foreground w-8 text-right transition-colors group-hover/category:text-primary">
                      {item.count}
                    </span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Insights - Compact Section */}
      <div className="stagger-item">
        <Card className="border-border/30 bg-primary/5 border-primary/20 p-3 hover:bg-primary/10 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out group cursor-default">
          <div className="space-y-1.5 text-xs font-mono">
            <div className="text-muted-foreground transition-colors group-hover:text-foreground/90">
              <span className="font-semibold text-foreground transition-colors group-hover:text-primary">
                {stats.total} signals
              </span>{' '}
              analyzed •{' '}
              <span className={`font-semibold transition-colors ${sentimentColor}`}>
                {sentimentLabel}
              </span>{' '}
              bias •{' '}
              <span className="font-semibold text-foreground transition-colors group-hover:text-primary">
                {stats.highImpactCount} high-impact
              </span>
            </div>
            <div className="text-muted-foreground text-xs transition-colors group-hover:text-foreground/80">
              Bullish:{' '}
              <span className="font-semibold text-bullish transition-colors group-hover:opacity-80">
                {((stats.bullishCount / stats.total) * 100).toFixed(0)}%
              </span>{' '}
              • Neutral:{' '}
              <span className="font-semibold text-neutral transition-colors group-hover:opacity-80">
                {(
                  ((stats.total - stats.bullishCount - stats.bearishCount) / stats.total) *
                  100
                ).toFixed(0)}
                %
              </span>{' '}
              • Bearish:{' '}
              <span className="font-semibold text-bearish transition-colors group-hover:opacity-80">
                {((stats.bearishCount / stats.total) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
