"use client"

import { useState } from "react"
import { useTransactions } from "@/app/hooks/useTransactions"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/app/components/card"
import { Button } from "@/app/components/button"
import { Badge } from "@/app/components/badge"
import { Separator } from "@/app/components/ui/separator"
import { ChevronLeft, ChevronRight, Wallet, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/app/lib/utils"

export default function TransactionsPage() {
  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  
  const { 
    data, 
    isLoading, 
    isFetching,
    isError,
    error 
  } = useTransactions({ page, limit })

  const handlePreviousPage = () => {
    setPage(old => Math.max(old - 1, 1))
  }

  const handleNextPage = () => {
    if (data?.totalPages && page < data.totalPages) {
      setPage(old => old + 1)
    }
  }

  // Format amount with currency
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="container max-w-5xl py-2 sm:py-4 md:py-6 px-2 sm:px-4 space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Transactions</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            View your transaction history and payment details
          </p>
        </div>
        
        <Card className="bg-primary/10 border-0">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Total Spent</p>
                <p className="text-base sm:text-lg font-bold">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : (
                    formatAmount(data?.totalSpent || 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            // Skeleton loading state
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-2 sm:p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-24 sm:w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        <div className="h-3 w-16 sm:w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-3 text-center">
              <p className="text-xs sm:text-sm text-red-500">
                {error?.message || "Failed to load transactions"}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="mt-2 h-7 text-xs"
              >
                Try again
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {data?.transactions.map((transaction) => (
                <div key={transaction.id} className="p-2 sm:p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <div className={cn(
                        "h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center flex-shrink-0",
                        transaction.type === "DEBIT" 
                          ? "bg-red-100 text-red-600 dark:bg-red-900/20" 
                          : "bg-green-100 text-green-600 dark:bg-green-900/20"
                      )}>
                        {transaction.type === "DEBIT" ? (
                          <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        ) : (
                          <ArrowDownLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                          </p>
                          <Badge 
                            variant={transaction.status === "COMPLETED" ? "success" : "secondary"}
                            className="text-[10px] px-1 h-3.5 sm:h-4"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-1.5 mt-1.5 sm:mt-0">
                      <span className="text-[10px] text-muted-foreground sm:hidden">
                        Amount
                      </span>
                      <span className={cn(
                        "font-medium text-xs sm:text-sm whitespace-nowrap",
                        transaction.type === "DEBIT" ? "text-red-600" : "text-green-600"
                      )}>
                        {transaction.type === "DEBIT" ? "-" : "+"}
                        {formatAmount(transaction.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && data?.transactions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 px-1">
          <p className="text-[10px] sm:text-xs text-muted-foreground order-2 sm:order-1">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of {data.total} results
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={page === 1 || isFetching}
              className="h-7 sm:h-8 px-2 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={page >= data.totalPages || isFetching}
              className="h-7 sm:h-8 px-2 text-xs"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 