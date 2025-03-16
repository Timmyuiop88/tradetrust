"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { 
  Instagram, 
  Twitter, 
  TrainTrack,
  Youtube,
  Facebook,
  CheckCircle,
  Users,
  BarChart,
  Calendar,
  MessageSquare,
  Shield,
  Clock,
  Star,
  Heart,
  Share2,
  ArrowRight,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Info,
  Lock,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/app/components/button"
import { Badge } from "@/app/components/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/app/components/custom-toast"
import { useInView } from "react-intersection-observer"
import { cn } from "@/app/lib/utils"
import { AddBalanceSheet } from "@/app/components/add-balance-sheet"
import { useCompletionRate } from "@/app/hooks/useCompletionRate"
import { StarRating } from "@/app/components/star-rating"

// Platform icons mapping
const platformIcons = {
  "Instagram": Instagram,
  "Twitter": Twitter,
  "TikTok": TrainTrack,
  "YouTube": Youtube,
  "Facebook": Facebook,
}

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

// Hook to fetch similar listings
function useSimilarListings(listingId, platformId, categoryId) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!platformId || !categoryId || fetchedRef.current) return;

    const fetchSimilarListings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/listings/similar?platformId=${platformId}&categoryId=${categoryId}&excludeId=${listingId}&limit=3`);
        if (response.ok) {
          const data = await response.json();
          setListings(data);
          fetchedRef.current = true;
        }
      } catch (error) {
        console.error("Error fetching similar listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarListings();
  }, [listingId, platformId, categoryId]);

  return { listings, loading };
}

export default function ListingDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isHeaderSticky, setIsHeaderSticky] = useState(false)
  const { ref: stickyRef, inView } = useInView({ threshold: 0 })
  const [isAddBalanceOpen, setIsAddBalanceOpen] = useState(false)
  const [insufficientFunds, setInsufficientFunds] = useState(false)
  const [requiredAmount, setRequiredAmount] = useState(0)
  const [currentBalance, setCurrentBalance] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sellerStats, setSellerStats] = useState(null)
  const [isLoadingSellerStats, setIsLoadingSellerStats] = useState(true)
  const [isSeller, setIsSeller] = useState(false)
  const fetchedStatsRef = useRef(false);

  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/listings/${id}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch listing')
        }
        
        const data = await response.json()
        setListing(data)
        
        // Check if this seller is in favorites
        if (session?.user && data.seller?.id) {
          const favResponse = await fetch(`/api/user/favorites?sellerId=${data.seller.id}`);
          if (favResponse.ok) {
            const { isFavorite } = await favResponse.json();
            setIsFavorite(isFavorite);
          } else {
            const errorData = await favResponse.json();
            toast.error(errorData.error || 'Failed to check favorite status');
          }
        }
      } catch (err) {
        setError(err.message || 'Something went wrong')
        toast.error(err.message || 'Failed to load listing details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchListing()
    }
  }, [id, session])

  // Fetch seller stats once when listing is loaded
  useEffect(() => {
    if (!listing?.seller?.id || fetchedStatsRef.current) return;
    
    const fetchSellerStats = async () => {
      try {
        setIsLoadingSellerStats(true);
        const response = await fetch(`/api/users/${listing.seller.id}/completion-rate`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch completion rate");
        }
        
        const data = await response.json();
        setSellerStats(data);
        
        // Determine if user is a seller based on data
        const sellerStatus = data ? 
          (data.totalOrders > 0 || (data.totalListings !== undefined && data.totalListings > 0)) 
          : false;
        
        setIsSeller(sellerStatus);
        fetchedStatsRef.current = true;
      } catch (error) {
        console.error("Error fetching seller stats:", error);
      } finally {
        setIsLoadingSellerStats(false);
      }
    };
    
    // Use a small timeout to prevent immediate fetch that might cause twitching
    const timer = setTimeout(() => {
      fetchSellerStats();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [listing?.seller?.id]);

  // Update sticky header state
  useEffect(() => {
    setIsHeaderSticky(!inView);
  }, [inView]);

  // Fetch similar listings
  const { listings: similarListings, loading: loadingSimilar } = 
    useSimilarListings(id, listing?.platformId, listing?.categoryId);

  const handleBuyNow = async () => {
    if (!session) {
      router.push('/login?redirect=' + encodeURIComponent(`/dashboard/listings/${id}`))
      return
    }
    
    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listingId: id
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Order created successfully!')
        router.push(`/dashboard/orders/${data.orderId}`)
      } else {
        // Handle insufficient funds error specifically
        if (data.error === 'Insufficient funds in your buying balance' && data.currentBalance !== undefined) {
          toast.error(data.error || 'Failed to create order')
          setInsufficientFunds(true)
          setCurrentBalance(data.currentBalance)
          setRequiredAmount(data.required)
          setIsAddBalanceOpen(true)
         
        } else {
          toast.error(data.error || 'Failed to create order')
        }
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContactSeller = () => {
    if (!session) {
      toast.error("Please sign in to contact the seller");
      router.push(`/login?redirect=/dashboard/listings/${id}`);
      return;
    }
    router.push(`/chat/${id}`);
  }

  const toggleFavorite = async () => {
    if (!session) {
      toast.error("Please sign in to save sellers");
      return;
    }
    
    if (!listing.seller?.id) {
      toast.error("Seller information not available");
      return;
    }
    
    try {
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: listing.seller.id })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update favorites');
      }
      
      const { isFavorite } = await response.json();
      setIsFavorite(isFavorite);
      toast.success(isFavorite ? "Seller added to favorites" : "Seller removed from favorites");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${listing.username} on SocialMarket`,
        text: `Check out this ${listing.platform.name} account with ${formatFollowers(listing.followers)} followers!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  }

  // Function to determine the color based on completion rate
  const getCompletionRateColor = (rate) => {
    if (rate >= 90) return "text-green-500";
    if (rate >= 70) return "text-amber-500";
    return "text-red-500";
  };

  // Function to determine the icon based on completion rate
  const getCompletionRateIcon = (rate) => {
    if (rate >= 70) return <CheckCircle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <>
        {/* Sticky header skeleton */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
          <div className="container flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="flex flex-col gap-1">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-9 w-24 bg-primary/20 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="container max-w-7xl mx-auto px-1 py-6 pt-8 md:py-8">
          {/* Back button skeleton */}
          <div className="mb-4">
            <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main content area - Left side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Media Gallery Skeleton */}
              <Card className="overflow-hidden border-none shadow-none">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse relative">
                  {/* Action buttons overlay */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-600 animate-pulse"></div>
                    <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-600 animate-pulse"></div>
                  </div>
                </div>
                {/* Thumbnail strip */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2 px-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="relative rounded-md overflow-hidden h-16 w-24 flex-shrink-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
                    ></div>
                  ))}
                </div>
              </Card>

              {/* Account Details Card Skeleton */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                      <div>
                        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Tabs Skeleton */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ))}
                  </div>
                  
                  {/* Stats Grid Skeleton */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-muted/40 p-3 rounded-lg">
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>

                  {/* Description Skeleton */}
                  <div className="space-y-2 mb-6">
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Features Grid Skeleton */}
                  <div>
                    <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Right side */}
            <div className="space-y-6">
              {/* Purchase Card Skeleton */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
                    
                    {/* Buttons */}
                    <div className="space-y-2">
                      <div className="h-11 w-full bg-primary/20 rounded animate-pulse"></div>
                      <div className="h-11 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>

                    {/* Security Info */}
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>

                    {/* Buyer Protection Box */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mt-0.5"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seller Information Card Skeleton */}
              <Card>
                <CardHeader>
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Seller Profile */}
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <div className="h-10 w-full bg-primary/20 rounded animate-pulse"></div>
                    <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>

              {/* Similar Listings Card Skeleton */}
              <Card>
                <CardHeader>
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                          <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
        <p className="text-muted-foreground mb-6">The listing you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // Determine platform icon
  const PlatformIcon = platformIcons[listing.platform.name] || Users;

  return (
    <>
      {/* Sticky header for mobile */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b transition-all duration-200 transform",
        isHeaderSticky ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <h3 className="font-medium text-sm line-clamp-1">{listing.username}</h3>
              <p className="text-xs text-muted-foreground">{formatFollowers(listing.followers)} followers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-bold">${typeof listing.price === 'number' ? listing.price.toLocaleString() : '0'}</p>
            <Button size="sm" onClick={handleBuyNow}>Buy Now</Button>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-1 py-6 pt-8 md:py-8">
        {/* Back button */}
        <div ref={stickyRef} className="mb-4">
          <Button variant="ghost" size="sm" className="pl-0" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Media Gallery */}
            <Card className="overflow-hidden border-none shadow-none">
              <div className="aspect-video bg-muted relative rounded-lg overflow-hidden">
                {listing.mediaProof && listing.mediaProof[selectedImage] ? (
                  <img 
                    src={listing.mediaProof[selectedImage]} 
                    alt={`Proof ${selectedImage + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <PlatformIcon className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                )}
                
                {/* Action buttons overlay */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={toggleFavorite}
                  >
                    <Heart className={cn("h-5 w-5", isFavorite ? "fill-primary text-primary" : "")} />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              {listing.mediaProof && listing.mediaProof.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2 px-1">
                  {listing.mediaProof.map((media, index) => (
                    <button
                      key={index}
                      className={cn(
                        "relative rounded-md overflow-hidden h-16 w-24 flex-shrink-0 border-2 transition-all",
                        selectedImage === index ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                      )}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img 
                        src={media} 
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Account Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <PlatformIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <CardTitle>{listing.username}</CardTitle>
                        {listing.verified && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <CardDescription>
                        {listing.platform.name} • {formatFollowers(listing.followers)} followers
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">${typeof listing.price === 'number' ? listing.price.toLocaleString() : '0'}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="mt-2">
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="stats">Stats</TabsTrigger>
                    <TabsTrigger value="transfer">Transfer</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted/40 p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground">Followers</div>
                        <div className="font-medium">{formatFollowers(listing.followers)}</div>
                      </div>
                      <div className="bg-muted/40 p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground">Engagement</div>
                        <div className="font-medium">{listing.engagement}%</div>
                      </div>
                      <div className="bg-muted/40 p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground">Account Age</div>
                        <div className="font-medium">{listing.accountAge} months</div>
                      </div>
                      <div className="bg-muted/40 p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground">Posts</div>
                        <div className="font-medium">{listing.posts.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Description</h3>
                      <p className="text-muted-foreground">{listing.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                          listing.verified && "Verified Account",
                          "Original Email Access",
                          "No Copyright Strikes",
                          "Clean Account History",
                          listing.transferMethod === "email_password" && "Email & Password Transfer",
                          listing.transferMethod === "full_account" && "Full Account Takeover",
                          listing.transferMethod === "api_transfer" && "API-Based Transfer"
                        ].filter(Boolean).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="stats" className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium">Avg. Engagement Rate</h3>
                            <BarChart className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-2xl font-bold">{listing.engagement}%</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {parseFloat(listing.engagement) > 3 ? 'Above industry average' : 'Industry average'}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium">Followers Growth</h3>
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-2xl font-bold">+{Math.round(listing.followers * 0.05 / 30)}K/mo</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Estimated based on account activity
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium">Account Age</h3>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-2xl font-bold">{listing.accountAge} months</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {listing.accountAge > 12 ? 'Established account' : 'Growing account'}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium">Total Posts</h3>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-2xl font-bold">{listing.posts.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {listing.posts > 500 ? 'Rich content history' : 'Building content base'}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="transfer" className="space-y-4">
                    <div className="bg-muted/40 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Transfer Method</h3>
                      <p className="text-muted-foreground mb-4">
                        {listing.transferMethod === "email_password" 
                          ? "This account will be transferred via email and password change. The seller will provide the login credentials and assist with the transfer process."
                          : listing.transferMethod === "full_account" 
                          ? "This account includes full takeover with original email access. The seller will transfer ownership of both the social media account and the associated email."
                          : "This account will be transferred using the platform's API. The seller will initiate the transfer through the platform's official transfer system."}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Protected by SocialMarket's Secure Transfer Protocol</span>
                      </div>
                    </div>
                    
                    <div className="bg-muted/40 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Transfer Timeline</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">1</div>
                          <div>
                            <p className="font-medium">Purchase</p>
                            <p className="text-sm text-muted-foreground">Complete payment through our secure system</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">2</div>
                          <div>
                            <p className="font-medium">Transfer</p>
                            <p className="text-sm text-muted-foreground">Seller initiates account transfer within 24 hours</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">3</div>
                          <div>
                            <p className="font-medium">Verification</p>
                            <p className="text-sm text-muted-foreground">Confirm successful transfer and account access</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">4</div>
                          <div>
                            <p className="font-medium">Release Payment</p>
                            <p className="text-sm text-muted-foreground">Funds are released to seller after confirmation</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card className=" top-20">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-4xl font-bold text-center">${typeof listing.price === 'number' ? listing.price.toLocaleString() : '0'}</p>
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="lg" 
                      className="w-full" 
                      onClick={handleBuyNow}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>Processing...</>
                      ) : (
                        <>Buy Now</>
                      )}
                    </Button>
                    {listing.negotiable && (
                      <Button variant="outline" className="w-full">
                        Make Offer
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Secure payment via escrow</span>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Buyer Protection</p>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          Your payment is held in escrow until you confirm successful account transfer
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Information */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Verified Seller</p>
                    <p className="text-sm text-muted-foreground cursor-pointer underline" onClick={() => router.push(`/dashboard/profile/${listing.seller.id}`)}>{listing.seller.email}</p>
                    <p className="text-sm text-muted-foreground">Member since {new Date().getFullYear()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Fast Response</span>
                  </div>
                  {isLoadingSellerStats ? (
                    <div className="flex items-center gap-1.5">
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                    </div>
                  ) : sellerStats && isSeller ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        {sellerStats.averageRating ? (
                          <div className="flex items-center">
                            <StarRating rating={sellerStats.averageRating} />
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({sellerStats.averageRating.toFixed(1)})
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium">New Seller</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getCompletionRateIcon(sellerStats.completionRate)}
                        <span className={cn("text-xs", getCompletionRateColor(sellerStats.completionRate))}>
                          {sellerStats.completionRate}% Completion
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>New Seller</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                <Button className="w-full" onClick={() => router.push(`/dashboard/profile/${listing.seller.id}`)}>
                  View Seller
                </Button>
                <Button variant="outline" className="w-full" onClick={handleContactSeller}>
                  Contact Seller
                </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Similar Listings */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSimilar ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0 animate-pulse">
                        <div className="h-12 w-12 bg-muted rounded-md flex-shrink-0"></div>
                        <div className="min-w-0 flex-1">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : similarListings.length > 0 ? (
                  <div className="space-y-3">
                    {similarListings.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                        <div className="h-12 w-12 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                          {item.mediaProof && item.mediaProof[0] ? (
                            <img 
                              src={item.mediaProof[0]} 
                              alt={item.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {(() => {
                                const ItemPlatformIcon = platformIcons[item.platform.name] || Users;
                                return <ItemPlatformIcon className="h-6 w-6 text-muted-foreground/50" />;
                              })()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {item.platform.name} • {formatFollowers(item.followers)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${typeof item.price === 'number' ? item.price.toLocaleString() : '0'}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-shrink-0"
                          onClick={() => router.push(`/dashboard/listings/${item.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-3">No similar listings found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Balance Sheet for insufficient funds */}
      <AddBalanceSheet
        open={isAddBalanceOpen}
        onOpenChange={setIsAddBalanceOpen}
        initialAmount={insufficientFunds ? requiredAmount - currentBalance : undefined}
        onSuccess={() => {
          setInsufficientFunds(false)
          handleBuyNow()
        }}
      />
    </>
  )
} 