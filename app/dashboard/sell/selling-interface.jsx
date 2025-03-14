"use client"

import { Button } from "@/app/components/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/app/components/card"
import { Plus, ListPlus, AlertCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { ListingCard } from "./listing-card"

async function fetchSellerListings(sellerId) {
  const response = await fetch(`/api/listings/seller?sellerId=${sellerId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch listings")
  }
  return response.json()
}

export function SellingInterface() {
  const router = useRouter()
  const { data: session } = useSession()
  const sellerId = session?.user?.id

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["sellerListings", sellerId],
    queryFn: () => fetchSellerListings(sellerId),
    enabled: !!sellerId, // Only run query if sellerId exists
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const listings = data?.listings || []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ListPlus className="h-5 w-5 text-primary" />
            <span>Start Selling</span>
          </CardTitle>
          <CardDescription>
            Create a new listing or manage your existing ones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full flex items-center justify-center space-x-2"
            onClick={() => router.push('/dashboard/sell/create-listing')}
          >
            <Plus className="h-4 w-4" />
            <span>Create New Listing</span>
          </Button>
        </CardContent>
      </Card>

      {/* Active Listings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Listings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {isError && (
            <div className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{error?.message || "Failed to load your listings. Please try again."}</span>
            </div>
          )}

          {!isLoading && !isError && listings.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No active listings yet
            </div>
          )}

          {!isLoading && !isError && listings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 