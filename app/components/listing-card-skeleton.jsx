import { Skeleton } from "./ui/skeleton"

export function ListingCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden animate-pulse flex flex-col h-full">
      {/* Media preview skeleton */}
      <div className="w-full" />
      
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted flex-shrink-0" />
            <div>
              <div className="h-4 w-24 bg-muted rounded mb-1" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
          </div>
          <div className="h-5 sm:h-6 w-16 bg-muted rounded flex-shrink-0" />
        </div>
        
        <div className="space-y-2 sm:space-y-3 flex-grow">
          {/* Description lines */}
          <div className="space-y-1.5 mt-1 sm:mt-2 mb-2 sm:mb-3">
            <div className="h-2.5 sm:h-3 w-full bg-muted rounded" />
            <div className="h-2.5 sm:h-3 w-11/12 bg-muted rounded" />
          </div>
          
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-auto">
            <div className="h-4 sm:h-5 w-16 bg-muted rounded-full" />
            <div className="h-4 sm:h-5 w-24 bg-muted rounded-full" />
            <div className="h-4 sm:h-5 w-20 bg-muted rounded-full" />
          </div>
          
          {/* Timestamp and seller info */}
          <div className="flex items-center justify-between">
            <div className="h-2.5 sm:h-3 w-20 bg-muted rounded" />
            <div className="h-2.5 sm:h-3 w-16 bg-muted rounded" />
          </div>
          
          <div className="h-8 sm:h-9 w-full bg-muted rounded mt-2" />
        </div>
      </div>
    </div>
  )
} 