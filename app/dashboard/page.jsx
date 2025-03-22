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
  Tag,
  X,
  Grid2X2,
  LoaderCircle
} from "lucide-react"
import { ListingCardSkeleton } from "../components/listing-card-skeleton"
import { ListingCard } from "../components/listing-card"
import { usePlatforms } from "../hooks/usePlatforms"
import { useCategories } from "../hooks/useCategories"
import { useListings } from "../hooks/useListings"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "../components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/hooks/useUser"
import { useChat } from "@/app/hooks/useChat"
import { Badge } from "../components/badge"
import { BalanceSummary } from "./balance-summary"
import Image from "next/image"

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
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("createdAt:desc")
  const [autoLoadMore, setAutoLoadMore] = useState(true)
  const { ref, inView } = useInView({ threshold: 0.1 })
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
    category: selectedCategory !== "All" ? selectedCategory : undefined,
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

  // Fetch categories for the dropdown
  const { data: categories, isLoading: categoriesLoading } = useCategories()

  // Refetch when filters change
  useEffect(() => {
    refetch();
  }, [filters.platform, filters.category, filters.sortBy, filters.order, filters.search, refetch]);

  // Load more listings when scrolling to the bottom
  useEffect(() => {
    if (inView && hasNextPage && !isLoading && !isFetchingNextPage && autoLoadMore) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage, autoLoadMore]);

  // Handle platform selection
  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
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
    setSelectedCategory("All");
    setSortBy("createdAt:desc");
  };

  // Handle search clear
  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
  };

  // Handle load more
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Toggle auto load
  const toggleAutoLoad = () => {
    setAutoLoadMore(!autoLoadMore);
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
  const totalListings = data?.pages[0]?.pagination?.total || 0

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-1 py-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Browse Accounts</h1>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border bg-background px-9 py-2 text-sm"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
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
                <Grid2X2 className="h-4 w-4 mr-2 text-muted-foreground" />
                All Platforms
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {platforms?.map((platform) => (
                <DropdownMenuItem
                  key={platform.id}
                  onClick={() => handlePlatformSelect(platform.name)}
                  className="flex items-center"
                >
                  {platform.icon ? (
                    <div className="h-5 w-5 mr-2 flex-shrink-0">
                      <Image 
                        src={platform.icon} 
                        alt={platform.name} 
                        width={20} 
                        height={20} 
                      />
                    </div>
                  ) : (
                    <div className="h-5 w-5 mr-2 bg-muted rounded-full flex-shrink-0" />
                  )}
                  <span>{platform.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <span className="hidden md:inline">
                  {selectedCategory === "All" ? "Category" : selectedCategory}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={() => handleCategorySelect("All")}>
                All Categories
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {categories?.map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  onClick={() => handleCategorySelect(category.name)}
                >
                  {category.name}
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
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
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
      {(selectedPlatform !== "All" || selectedCategory !== "All" || debouncedSearch) && (
        <div className="flex flex-wrap items-center gap-2 text-sm mt-2">
          <span className="text-muted-foreground">Active filters:</span>
          {selectedPlatform !== "All" && (
            <Badge variant="secondary" className="flex items-center gap-1 pl-1 pr-2">
              {platforms?.find(p => p.name === selectedPlatform)?.icon && (
                <Image 
                  src={platforms.find(p => p.name === selectedPlatform).icon} 
                  alt={selectedPlatform}
                  width={16}
                  height={16}
                  className="mr-1"
                />
              )}
              <span>{selectedPlatform}</span>
              <button 
                onClick={() => setSelectedPlatform("All")} 
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedCategory !== "All" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>{selectedCategory}</span>
              <button 
                onClick={() => setSelectedCategory("All")} 
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {debouncedSearch && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>"{debouncedSearch}"</span>
              <button 
                onClick={handleClearSearch} 
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs"
            onClick={handleResetFilters}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Results count */}
      {!isLoading && (
        <div className="text-sm text-muted-foreground">
          Showing {listings.length} of {totalListings} accounts
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
        
        {(isLoading) && (
          Array(6).fill(0).map((_, i) => <ListingCardSkeleton key={i} />)
        )}
      </div>
      
      {/* Loading and load more UI */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="flex items-center space-x-2">
            <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading more accounts...</span>
          </div>
        </div>
      )}

      {hasNextPage && !isFetchingNextPage && !isLoading && (
        <div className="flex flex-col items-center gap-3 mt-6">
          <Button 
            onClick={handleLoadMore} 
            variant="outline"
            className="px-8"
          >
            Load More Accounts
          </Button>
          
          <div className="flex items-center gap-2">
            <label htmlFor="autoload" className="text-sm text-muted-foreground flex items-center gap-2 cursor-pointer">
              <input
                id="autoload"
                type="checkbox"
                checked={autoLoadMore}
                onChange={toggleAutoLoad}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              Auto-load more when scrolling
            </label>
          </div>
        </div>
      )}
      
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
