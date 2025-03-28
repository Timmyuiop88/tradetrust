export function TransactionSkeleton() {
  return (
    <div className="p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-24 sm:w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-16 sm:w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-5 w-16 sm:w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    </div>
  )
} 