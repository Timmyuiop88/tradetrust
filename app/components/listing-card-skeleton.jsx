import { Skeleton } from "./ui/skeleton"

export function ListingCardSkeleton() {
  return (
    <div className="bg-card p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="text-right shrink-0">
          <Skeleton className="h-6 w-24 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  )
} 