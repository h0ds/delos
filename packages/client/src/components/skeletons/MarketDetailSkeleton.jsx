import { Skeleton } from '@/components/ui/skeleton'

export function MarketDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Charts (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Probability Chart */}
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>

          {/* Volume Chart */}
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>

        {/* Sidebar (1 column) */}
        <div className="space-y-4">
          {/* Liquidity Card */}
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>

          {/* Key Metrics */}
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
            <Skeleton className="h-4 w-40" />
            {[1, 2].map(i => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Sections */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
