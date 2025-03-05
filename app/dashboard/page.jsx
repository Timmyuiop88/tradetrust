"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useInView } from "react-intersection-observer"
import { Button } from "../components/button"
import { Badge } from "../components/badge"
import { ChevronDown, Clock, Star, CheckCircle, AlertCircle, Search, Filter } from "lucide-react"
import { cn } from "../lib/utils"
import { ListingCardSkeleton } from "../components/listing-card-skeleton"
import { usePlatforms } from "../hooks/usePlatforms"
import { useListings } from "../hooks/useListings"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu"

const SORT_OPTIONS = [
  { label: "Newest First", value: "createdAt:desc" },
  { label: "Oldest First", value: "createdAt:asc" },
  { label: "Price: High to Low", value: "price:desc" },
  { label: "Price: Low to High", value: "price:asc" },
  { label: "Most Followers", value: "followers:desc" },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState("All")
  const [sortBy, setSortBy] = useState("createdAt:desc")
  const { ref, inView } = useInView()

  const filters = {
    platform: selectedPlatform,
    sortBy: sortBy.split(":")[0],
    order: sortBy.split(":")[1],
  }

  const { 
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useListings(filters)

  const { data: platforms, isLoading: platformsLoading } = usePlatforms()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage])

  if (isError) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium">Something went wrong</h3>
        <p className="text-muted-foreground">Failed to load listings</p>
      </div>
    )
  }

  const listings = data?.pages.flatMap(page => page.listings) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Browse Accounts</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <span className="hidden md:inline">Sort by</span>
              <ChevronDown className="h-4 w-4 md:ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSortBy(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col space-y-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border bg-card px-9 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                <span>Platform: {selectedPlatform}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuItem onClick={() => setSelectedPlatform("All")}>
                All Platforms
              </DropdownMenuItem>
              <div className="my-1 h-px bg-muted" />
              {platforms?.map((platform) => (
                <DropdownMenuItem
                  key={platform.name}
                  onClick={() => setSelectedPlatform(platform.name)}
                >
                  {platform.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-3">
        {listings.map((listing) => (
          <div key={listing.id} className="bg-card p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                  {listing.username[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium truncate">{listing.username}</h3>
                    {listing.verified && (
                      <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4 shrink-0" />
                    <span className="truncate">15Min</span>
                    <Star className="ml-2 mr-1 h-4 w-4 shrink-0 text-yellow-500" />
                    <span>99%</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl font-bold">${listing.price.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">
                  {listing.followers.toLocaleString()} followers
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm flex-wrap gap-y-2">
              <div className="space-y-1">
                <div className="text-muted-foreground truncate max-w-[200px] md:max-w-none">
                  {listing.platform.name} • {listing.category.name} • {listing.engagement}% engagement
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["Escrow", "Stripe"].map((method) => (
                    <Badge key={method} variant="outline" className="text-xs">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button className="w-20 md:w-24">Buy</Button>
            </div>
          </div>
        ))}
        
        {(isLoading || isFetchingNextPage) && (
          Array(3).fill(0).map((_, i) => <ListingCardSkeleton key={i} />)
        )}
        
        <div ref={ref} className="h-10" />
      </div>
    </div>
  )
} 