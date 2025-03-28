"use client"

import { useState } from "react"
import { useUserActivity } from "@/app/hooks/useUserActivity"
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/card"
import { Badge } from "@/app/components/badge"
import { Button } from "@/app/components/button"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/app/lib/utils"
import Link from "next/link"
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Package, 
  ShoppingBag, 
  ListPlus, 
  Wallet,
  RefreshCw,
  Loader2
} from "lucide-react"

export default function ActivityPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isFetching,
    isPreviousData 
  } = useUserActivity({ page, limit })

  // Format amount with currency
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Get icon based on activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'PURCHASE':
        return <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      case 'SALE':
        return <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      case 'LISTING_CREATED':
        return <ListPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      case 'DEPOSIT':
        return <ArrowDownLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      case 'WITHDRAWAL':
        return <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      default:
        return <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    }
  }

  // Get color scheme based on activity type
  const getActivityColor = (type) => {
    switch (type) {
      case 'PURCHASE':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'SALE':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'LISTING_CREATED':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'DEPOSIT':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'WITHDRAWAL':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800'
    }
  }

  const handlePreviousPage = () => {
    setPage(old => Math.max(old - 1, 1))
  }

  const handleNextPage = () => {
    if (data?.hasNextPage && !isPreviousData) {
      setPage(old => old + 1)
    }
  }

  return (
    <div className="container max-w-3xl py-2 sm:py-4 md:py-6 px-2 sm:px-4 space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Activity</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Track your recent activity and transactions
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isLoading}
          className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm px-2 sm:px-3"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            // Skeleton loading state
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-2 sm:p-3 md:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="h-4 w-32 sm:w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-5 w-16 sm:w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-4 text-center">
              <p className="text-sm text-red-500">
                {error?.message || "Failed to load activity"}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="mt-2"
              >
                Try again
              </Button>
            </div>
          ) : (
            <>
              <div className="divide-y">
                {data?.items.map((activity) => (
                  <div key={activity.id} className="p-2 sm:p-3 md:p-4">
                    <div className="flex items-start sm:items-center gap-1.5 sm:gap-2 md:gap-3">
                      <div className={cn(
                        "h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full flex items-center justify-center flex-shrink-0",
                        getActivityColor(activity.type)
                      )}>
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate">
                          {activity.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-0.5">
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </p>
                          {activity.status && (
                            <Badge 
                              variant={activity.status === "COMPLETED" ? "success" : "secondary"}
                              className="text-[10px] px-1 sm:px-2 h-3.5 sm:h-4 md:h-5"
                            >
                              {activity.status}
                            </Badge>
                          )}
                          {activity.listingId && (
                            <Link 
                              href={`/dashboard/listings/${activity.listingId}`}
                              className="text-[10px] sm:text-xs text-primary hover:underline"
                            >
                              View listing
                            </Link>
                          )}
                        </div>
                      </div>
                      
                      {activity.amount !== undefined && (
                        <div className="flex-shrink-0">
                          <span className={cn(
                            "font-medium text-xs sm:text-sm whitespace-nowrap",
                            activity.amount < 0 ? "text-red-600" : "text-green-600"
                          )}>
                            {activity.amount < 0 ? "-" : "+"}
                            {formatAmount(Math.abs(activity.amount))}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {activity.description && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 ml-7 sm:ml-9 md:ml-11">
                        {activity.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="p-1.5 sm:p-2 md:p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 md:gap-4">
                <p className="text-[10px] sm:text-xs text-muted-foreground order-2 sm:order-1">
                  {data?.totalCount > 0 ? (
                    <>
                      Showing{' '}
                      <span className="font-medium">
                        {((page - 1) * limit) + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(page * limit, data.totalCount)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{data.totalCount}</span> activities
                    </>
                  ) : (
                    'No activities found'
                  )}
                </p>

                <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={page === 1 || isFetching}
                    className="h-7 px-2 text-[10px] flex-1"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-medium">
                      Page {page}
                    </span>
                    {isFetching && (
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!data?.hasNextPage || isFetching || isPreviousData}
                    className="h-7 px-2 text-[10px] flex-1"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Mobile Pagination - Fixed Bottom */}
      {!isLoading && !isError && data?.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-background/80 backdrop-blur-lg border-t p-1.5 z-40">
          <div className="flex items-center justify-between gap-1.5 max-w-3xl mx-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={page === 1 || isFetching}
              className="h-7 px-2 text-[10px] flex-1"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium">
                Page {page}
              </span>
              {isFetching && (
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!data?.hasNextPage || isFetching || isPreviousData}
              className="h-7 px-2 text-[10px] flex-1"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 