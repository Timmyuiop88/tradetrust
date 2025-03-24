"use client"

import { Skeleton } from "@/app/components/ui/skeleton";

export function ModernListingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 pb-16 animate-in fade-in duration-500">
      {/* Sticky header skeleton */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 py-3 px-4 flex items-center justify-between">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 my-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-8 w-40" />
      </div>
      
      {/* Main content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left column - Images skeleton */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 relative aspect-[4/3]">
            <div className="h-full w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse"></div>
            <div className="absolute top-4 left-4 z-10">
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
          
          {/* Thumbnail grid skeleton */}
          <div className="grid grid-cols-5 gap-2 mt-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
        
        {/* Right column - Listing details skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main info card skeleton */}
          <div className="rounded-xl overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-8 w-48" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <Skeleton className="h-4 w-12 mb-1" />
                  <Skeleton className="h-10 w-28" />
                </div>
                <Skeleton className="h-5 w-32" />
              </div>
              
              <div className="flex flex-col gap-3">
                <Skeleton className="h-12 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <Skeleton className="h-5 w-24 mb-3" />
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Seller card skeleton */}
          <div className="rounded-xl overflow-hidden border shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex flex-wrap gap-2 mb-5">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-6 w-24 rounded-full" />
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-5">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg text-center">
                    <Skeleton className="h-6 w-12 mx-auto mb-1" />
                    <Skeleton className="h-3 w-8 mx-auto" />
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Skeleton className="h-9 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabbed content skeleton */}
      <div className="mt-10">
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="w-full max-w-md grid grid-cols-4 h-auto p-0">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-10 w-full" />
            ))}
          </div>
        </div>
        
        <div className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="rounded-xl border shadow-sm p-4">
                <Skeleton className="h-6 w-32 mb-3" />
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom CTA skeleton for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 py-3 px-4 lg:hidden z-40">
        <div className="flex items-center justify-between gap-3 max-w-6xl mx-auto">
          <div>
            <Skeleton className="h-4 w-12 mb-1" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
} 