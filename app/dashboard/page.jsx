"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useInView } from "react-intersection-observer"
import { Button } from "../components/button"
import { 
  ChevronDown, 
  AlertCircle, 
  Search, 
  Filter,
  ArrowUpDown,
} from "lucide-react"
import { ListingCardSkeleton } from "../components/listing-card-skeleton"
import { ListingCard } from "../components/listing-card"
import { usePlatforms } from "../hooks/usePlatforms"
import { useListings } from "../hooks/useListings"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/hooks/useUser"
import { useChat } from "@/app/hooks/useChat"
import { Badge } from "../components/badge"
const SORT_OPTIONS = [
  { label: "Newest First", value: "createdAt:desc" },
  { label: "Oldest First", value: "createdAt:asc" },
  { label: "Price: High to Low", value: "price:desc" },
  { label: "Price: Low to High", value: "price:asc" },
  { label: "Most Followers", value: "followers:desc" },
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { user, isLoading: userLoading } = useUser()
  const { sendMessage } = useChat()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState("All")
  const [sortBy, setSortBy] = useState("createdAt:desc")
  const { ref, inView } = useInView()
  const router = useRouter()

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Create filters object
  const filters = {
    platform: selectedPlatform !== "All" ? selectedPlatform : undefined,
    sortBy: sortBy.split(":")[0],
    order: sortBy.split(":")[1],
    search: debouncedSearch || undefined
  }

  // Use the useListings hook with the filters
  const { 
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch
  } = useListings(filters)

  // Fetch platforms for the dropdown
  const { data: platforms, isLoading: platformsLoading } = usePlatforms()

  // Refetch when filters change
  useEffect(() => {
    refetch();
  }, [filters.platform, filters.sortBy, filters.order, filters.search, refetch]);

  // Load more listings when scrolling to the bottom
  useEffect(() => {
    if (inView && hasNextPage && !isLoading && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage]);

  // Handle platform selection
  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
  };

  // Handle sort selection
  const handleSortSelect = (sortOption) => {
    setSortBy(sortOption);
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedPlatform("All");
    setSortBy("createdAt:desc");
  };

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
    <div className="space-y-6 max-w-6xl mx-auto px-1 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Browse Accounts</h1>
        
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border bg-background px-9 py-2 text-sm"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span className="hidden md:inline">
                  {selectedPlatform === "All" ? "Platform" : selectedPlatform}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={() => handlePlatformSelect("All")}>
                All Platforms
              </DropdownMenuItem>
              <div className="my-1 h-px bg-muted" />
              {platforms?.map((platform) => (
                <DropdownMenuItem
                  key={platform.id}
                  onClick={() => handlePlatformSelect(platform.name)}
                >
                  {platform.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden md:inline">
                  {SORT_OPTIONS.find(option => option.value === sortBy)?.label || "Sort"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSortSelect(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active filters display */}
      {(selectedPlatform !== "All" || debouncedSearch) && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          {selectedPlatform !== "All" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Platform: {selectedPlatform}
            </Badge>
          )}
          {debouncedSearch && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {debouncedSearch}
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs"
            onClick={handleResetFilters}
          >
            Clear filters
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
        
        {(isLoading || isFetchingNextPage) && (
          Array(6).fill(0).map((_, i) => <ListingCardSkeleton key={i} />)
        )}
      </div>
      
      {listings.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No listings found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
          <Button 
            variant="outline" 
            onClick={handleResetFilters}
          >
            Reset Filters
          </Button>
        </div>
      )}
      
      <div ref={ref} className="h-10" />
    </div>
  )
}
