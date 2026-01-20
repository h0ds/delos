import { Skeleton } from '@/components/ui/skeleton'

export function SignalListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border/40 bg-card/50 p-3 space-y-2.5">
          {/* Title + Sentiment Badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
          </div>

          {/* Source + Impact */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>

          {/* Market Badges */}
          <div className="flex gap-1.5 flex-wrap">
            {[1, 2].map(j => (
              <Skeleton key={j} className="h-5 w-20 rounded-full" />
            ))}
          </div>

          {/* Time */}
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  )
}
