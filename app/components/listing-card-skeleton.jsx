import { Skeleton } from "./ui/skeleton"

export function ListingCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden animate-pulse">
     
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div>
              <div className="h-4 w-24 bg-muted rounded mb-1" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
          </div>
          <div className="h-6 w-16 bg-muted rounded" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
          
          <div className="flex flex-wrap gap-1.5 my-2">
            <div className="h-5 w-16 bg-muted rounded-full" />
            <div className="h-5 w-24 bg-muted rounded-full" />
            <div className="h-5 w-20 bg-muted rounded-full" />
          </div>
          
          <div className="h-8 w-full bg-muted rounded mt-2" />
        </div>
      </div>
    </div>
  )
} 