import { Skeleton } from '@/components/ui/skeleton'

export function MarketCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-4">
      {/* Title Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Probability Bars Skeleton */}
      <div className="space-y-3 py-2 border-t border-border/30 border-b border-border/30">
        {[1, 2].map(i => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map(i => (
          <div key={i} className="rounded-lg p-2.5 border border-border/30 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Status + Research Button Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
  )
}
