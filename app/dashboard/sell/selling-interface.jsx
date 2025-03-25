"use client"

import { useState } from "react"
import { Button } from "@/app/components/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/components/card"
import { Plus, ListPlus, AlertCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { ListingCard } from "./listing-card"
import { Skeleton } from "@/app/components/skeleton"
import { ListingCardSkeleton } from "./listing-card"

async function fetchSellerListings(sellerId, page = 1, limit = 2) {
  const response = await fetch(`/api/listings/seller?sellerId=${sellerId}&page=${page}&limit=${limit}`)
  if (!response.ok) {
    throw new Error("Failed to fetch listings")
  }
  return response.json()
}

export function SellingInterface() {
  const router = useRouter()
  const { data: session } = useSession()
  const sellerId = session?.user?.id
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error, isPreviousData } = useQuery({
    queryKey: ["sellerListings", sellerId, page],
    queryFn: () => fetchSellerListings(sellerId, page),
    enabled: !!sellerId, // Only run query if sellerId exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true, // Keep previous data to avoid UI jumping
  })

  const listings = data?.listings || []
  const pagination = data?.pagination || { currentPage: 1, totalPages: 1, hasMore: false, hasPrevious: false }

  const handleNextPage = () => {
    if (!isPreviousData && pagination.hasMore) {
      setPage(old => old + 1)
    }
  }

  const handlePreviousPage = () => {
    if (pagination.hasPrevious) {
      setPage(old => Math.max(old - 1, 1))
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4">
      {/* Start Selling Card */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <ListPlus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <span>Start Selling</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Create a new listing or manage your existing ones
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <Button 
            className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm h-9 sm:h-10"
            onClick={() => router.push('/dashboard/sell/create-listing')}
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Create New Listing</span>
          </Button>
        </CardContent>
      </Card>

      {/* Active Listings Card */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Your Listings</CardTitle>
          {!isLoading && !isError && pagination.totalCount > 0 && (
            <CardDescription className="text-xs sm:text-sm">
              Showing {(pagination.currentPage - 1) * 2 + 1} - {Math.min(pagination.currentPage * 2, pagination.totalCount)} of {pagination.totalCount} listings
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {isLoading && (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {[...Array(2)].map((_, index) => (
                <ListingCardSkeleton key={index} />
              ))}
            </div>
          )}

          {isError && (
            <div className="flex items-center p-3 sm:p-4 mb-3 sm:mb-4 text-xs sm:text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
              <span>{error?.message || "Failed to load your listings. Please try again."}</span>
            </div>
          )}

          {!isLoading && !isError && listings.length === 0 && pagination.totalCount === 0 && (
            <div className="text-center text-muted-foreground py-6 sm:py-8 text-sm">
              No active listings yet
            </div>
          )}

          {!isLoading && !isError && listings.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </CardContent>
        
        {!isLoading && !isError && pagination.totalPages > 1 && (
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreviousPage}
              disabled={!pagination.hasPrevious || isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-1 text-xs sm:text-sm h-8 sm:h-9"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Previous
            </Button>
            
            <div className="flex items-center justify-center">
              <span className="text-xs sm:text-sm font-medium">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextPage}
              disabled={!pagination.hasMore || isLoading || isPreviousData}
              className="w-full sm:w-auto flex items-center justify-center gap-1 text-xs sm:text-sm h-8 sm:h-9"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
} 