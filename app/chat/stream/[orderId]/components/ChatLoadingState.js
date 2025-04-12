import { cn } from "@/app/lib/utils"

export function ChatLoadingState() {
  return (
    <div className="flex flex-col h-[100dvh]">
      <div className="h-14 border-b animate-pulse bg-muted/50" />
      
      <div className="flex-1 p-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={cn(
            "flex gap-2 max-w-[75%]",
            i % 2 === 0 && "ml-auto"
          )}>
            {i % 2 !== 0 && (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            )}
            <div className="space-y-2">
              {i % 2 !== 0 && (
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              )}
              <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
              <div className="h-2 w-12 bg-muted animate-pulse rounded ml-auto" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t p-4">
        <div className="h-10 bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  );
}
