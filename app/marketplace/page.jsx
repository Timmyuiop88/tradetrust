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
import { ProductCard } from "../components/product-card"
import { useCategories } from "../hooks/useCategories"
import { useProducts } from "../hooks/useProducts"
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
import { Badge } from "../components/badge"
import Image from "next/image"

const SORT_OPTIONS = [
  { label: "Newest First", value: "createdAt:desc" },
  { label: "Oldest First", value: "createdAt:asc" },
  { label: "Price: High to Low", value: "price:desc" },
  { label: "Price: Low to High", value: "price:asc" },
]

const PRODUCT_TYPES = [
  { label: "All Types", value: "All" },
  { label: "Digital Products", value: "DIGITAL" },
  { label: "E-books", value: "EBOOK" },
  { label: "Courses", value: "COURSE" },
  { label: "Events", value: "EVENT" },
  { label: "Memberships", value: "MEMBERSHIP" },
  { label: "Coaching Calls", value: "CALL" },
  { label: "Coffee", value: "COFFEE" },
]

export default function MarketplacePage() {
  const { data: session, status } = useSession()
  const { user, isLoading: userLoading } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedType, setSelectedType] = useState("All")
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
    type: selectedType !== "All" ? selectedType : undefined,
    categoryId: selectedCategory !== "All" ? selectedCategory : undefined,
    sortBy: sortBy.split(":")[0],
    order: sortBy.split(":")[1],
    search: debouncedSearch || undefined
  }

  // Use the useProducts hook with the filters
  const { 
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch
  } = useProducts(filters)

  // Fetch categories for the dropdown
  const { data: categories, isLoading: categoriesLoading } = useCategories()

  // Refetch when filters change
  useEffect(() => {
    refetch();
  }, [filters.type, filters.categoryId, filters.sortBy, filters.order, filters.search, refetch]);

  // Load more products when scrolling to the bottom
  useEffect(() => {
    if (inView && hasNextPage && !isLoading && !isFetchingNextPage && autoLoadMore) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage, autoLoadMore]);

  // Handle type selection
  const handleTypeSelect = (type) => {
    setSelectedType(type);
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
    setSelectedType("All");
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
        <p className="text-muted-foreground">Failed to load products</p>
      </div>
    )
  }

  const products = data?.pages.flatMap(page => page.products) || []
  const totalProducts = data?.pages[0]?.pagination?.total || 0

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-1 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Browse Products</h1>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
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
                  {PRODUCT_TYPES.find(t => t.value === selectedType)?.label || "Type"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {PRODUCT_TYPES.map((type) => (
                <DropdownMenuItem
                  key={type.value}
                  onClick={() => handleTypeSelect(type.value)}
                  className="flex items-center"
                >
                  {type.label}
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
      {(selectedType !== "All" || selectedCategory !== "All" || debouncedSearch) && (
        <div className="flex flex-wrap items-center gap-2 text-sm mt-2">
          <span className="text-muted-foreground">Active filters:</span>
          {selectedType !== "All" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>{PRODUCT_TYPES.find(t => t.value === selectedType)?.label}</span>
              <button 
                onClick={() => setSelectedType("All")} 
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
          Showing {products.length} of {totalProducts} products
        </div>
      )}

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        
        {(isLoading) && (
          Array(8).fill(0).map((_, i) => <ListingCardSkeleton key={i} />)
        )}
      </div>
      
      {/* Loading and load more UI */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="flex items-center space-x-2">
            <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading more products...</span>
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
            Load More Products
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
      
      {products.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No products found</h3>
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
