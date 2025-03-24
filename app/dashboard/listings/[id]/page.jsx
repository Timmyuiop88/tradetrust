"use client"

import { useState } from "react"
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
import { cn } from "@/app/lib/utils"
import Image from "next/image"
import { DetailedListingView } from './detailed-listing-view'
import { ModernListingView } from './modern-listing-view'
import { ModernListingSkeleton } from '@/app/components/modern-listing-skeleton'
import { 
  useListing, 
  useSellerStats, 
  useListingFavorite, 
  useSimilarListings, 
  useToggleFavorite 
} from "@/app/hooks/useListings"
import { useCreateOrder } from "@/app/hooks/useOrders"

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

export default function ListingPage() {
  const router = useRouter()
  const { id } = useParams()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Use React Query hooks for data fetching
  const { 
    data: listing,
    isLoading: isListingLoading,
    error: listingError 
  } = useListing(id)
  
  const createOrderMutation = useCreateOrder()
  
  const handleBuyNow = async () => {
    if (!session) {
      router.push('/login?redirect=' + encodeURIComponent(`/dashboard/listings/${id}`))
      return
    }
    
    setIsSubmitting(true)
    try {
      const result = await createOrderMutation.mutateAsync({ listingId: id })
      if (result.order) {
        router.push(`/dashboard/orders/${result.order.id}`)
      }
    } catch (error) {
      console.error("Error buying listing:", error)
    } finally {
      setIsSubmitting(false)
    }
  }


  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title || 'Check out this listing',
        text: listing?.description?.substring(0, 100) || 'Check out this listing on TradeTrust',
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  }
  
  const handleContactSeller = () => {
    if (!session) {
      router.push('/login?redirect=' + encodeURIComponent(`/dashboard/listings/${id}`))
      return
    }
    
    if (!listing || !listing.seller) {
      toast.error("Cannot contact seller at this time")
      return
    }
    
    router.push(`/dashboard/messages?recipient=${listing.seller.id}&listingId=${listing.id}`)
  }

  // Loading state
  if (isListingLoading) {
    return <ModernListingSkeleton />
  }
  
  // Error state
  if (listingError || !listing) {
    console.log({listingError})
      
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 dark:bg-red-900/20 h-20 w-20 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-4">{listingError?.message || "Listing not found"}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The listing you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push('/dashboard')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    )
  }
  
  return (
    <ModernListingView
      listing={listing}
      onBuyNow={handleBuyNow}
      isSubmitting={isSubmitting || createOrderMutation.isPending}
      
      handleShare={handleShare}
      handleContactSeller={handleContactSeller}
    />
  )
} 