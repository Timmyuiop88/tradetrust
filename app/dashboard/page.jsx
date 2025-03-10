"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useInView } from "react-intersection-observer"
import { Button } from "../components/button"
import { Badge } from "../components/badge"
import { 
  ChevronDown, 
  Clock, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter,
  ArrowUpDown,
  ShoppingCart,
  Heart,
  Share2,
  MessageCircle
} from "lucide-react"
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
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/hooks/useUser"
import { useChat } from "@/app/hooks/useChat"

const SORT_OPTIONS = [
  { label: "Newest First", value: "createdAt:desc" },
  { label: "Oldest First", value: "createdAt:asc" },
  { label: "Price: High to Low", value: "price:desc" },
  { label: "Price: Low to High", value: "price:asc" },
  { label: "Most Followers", value: "followers:desc" },
]

// Format numbers for display
const formatFollowers = (value) => {
  if (!value) return "0";
  const num = parseInt(value);
  if (isNaN(num)) return "0";
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString();
};

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

  // Add this effect to log session state changes
  useEffect(() => {
    console.log('Session state changed:', { 
      status, 
      session: session ? { 
        user: session.user,
        expires: session.expires 
      } : null 
    });
  }, [session, status]);

  const filters = {
    platform: selectedPlatform,
    sortBy: sortBy.split(":")[0],
    order: sortBy.split(":")[1],
    search: debouncedSearch
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
  }, [inView, hasNextPage, fetchNextPage])

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
                <span className="hidden md:inline">Platform</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={() => setSelectedPlatform("All")}>
                All Platforms
              </DropdownMenuItem>
              <div className="my-1 h-px bg-muted" />
              {platforms?.map((platform) => (
                <DropdownMenuItem
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.name)}
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
                <span className="hidden md:inline">Sort</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <div key={listing.id} className="bg-card rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
           
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                    {listing.username && listing.username[0] ? listing.username[0].toUpperCase() : '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-medium text-sm">{listing.username || 'Unnamed Account'}</h3>
                      {listing.verified && (
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {listing.platform?.name || 'Unknown Platform'} • {formatFollowers(listing.followers)} followers
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">${typeof listing.price === 'number' ? listing.price.toLocaleString() : '0'}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {listing.createdAt ? formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true }) : 'Recently'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500" />
                    <span>High Rating</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1.5 my-2">
                  {listing.category && (
                    <Badge variant="secondary" className="text-xs">
                      {listing.category.name}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {listing.engagement || 0}% engagement
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {listing.transferMethod === "email_password" ? "Email & Password" :
                     listing.transferMethod === "full_account" ? "Full Account" :
                     listing.transferMethod === "api_transfer" ? "API Transfer" : "Transfer"}
                  </Badge>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <Link href={`/dashboard/listings/${listing.id}`} className="flex-1">
                    <Button className="w-full" size="sm">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-none"
                    disabled={userLoading || status === 'loading'}
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (!user) {
                        router.push('/login');
                        return;
                      }

                      if (listing.sellerId === user.id) {
                        alert("This is your own listing!");
                        return;
                      }

                      try {
                        console.log('Starting chat with seller:', listing.sellerId);
                        const success = await sendMessage({
                          recipientId: listing.sellerId,
                          content: `Hi, I'm interested in your ${listing.platform?.name || ''} account listing.`,
                        });

                        if (success) {
                          console.log('Message sent successfully, navigating to chat...');
                          router.push(`/chat/${listing.sellerId}`);
                        } else {
                          throw new Error('Failed to send message');
                        }
                      } catch (error) {
                        console.error('Error starting chat:', error);
                        alert('Failed to start chat. Please try again.');
                      }
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
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
            onClick={() => {
              setSearchQuery("")
              setSelectedPlatform("All")
              setSortBy("createdAt:desc")
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
      
      <div ref={ref} className="h-10" />
    </div>
  )
} 
