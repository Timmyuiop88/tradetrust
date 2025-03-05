export function KycStepsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((step) => (
        <div 
          key={step}
          className="flex items-center justify-between p-4 rounded-lg border animate-pulse"
        >
          <div className="flex items-center space-x-4">
            <div className="h-5 w-5 rounded-full bg-muted" />
            <div>
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-48 bg-muted rounded mt-2" />
            </div>
          </div>
          <div className="h-8 w-20 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
} 