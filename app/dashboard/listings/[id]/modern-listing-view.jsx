"use client"

import React, { useState, useEffect } from "react"
import NextImage from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Check, 
  Clock, 
  Gift, 
  Mail, 
  ShieldCheck, 
  Star, 
  CreditCard, 
  AlertTriangle, 
  Shield, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Globe, 
  ArrowRight, 
  BadgeCheck,
  Share2,
  ExternalLink,
  BarChart,
  TrendingUp,
  Zap,
  Lock,
  MessageSquare,
  CheckCircle,
  LinkIcon,
  Sparkles,
  Users,
  ShoppingBag,
  Info,
  Wallet,
  TrainTrack,
  Youtube,
  AlertCircle,
  MapPin,
  Award,
  Eye,
  ImageIcon,
  Loader2,
  Package
} from "lucide-react"
import { Button } from "@/app/components/button"
import { Badge } from "@/app/components/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/tooltip"
import { StarRating } from "@/app/components/star-rating"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/app/lib/utils"
import ReactCountryFlag from "react-country-flag"
import Link from "next/link"
import { PlatformIcon } from "@/app/components/platform-icon"
import { CategoryIcon } from "@/app/components/category-icon"
import { Separator as BaseSeparator } from "@/app/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar"
import { CircularProgress } from "@/app/components/ui/circular-progress"
import { useSession } from "next-auth/react"
import ImageGallery from "@/app/components/ui/image-gallery"
import { FollowButton } from "@/app/components/follow-button"
import Image from "next/image"
import { useSellerListings } from "@/app/hooks/useListings"
import { useCompletionRate } from "@/app/hooks/useCompletionRate"

// Updated custom separator component that won't overflow
const Separator = ({ className, ...props }) => (
  <BaseSeparator 
    className={cn("max-w-full flex-shrink-0 overflow-hidden", className)} 
    {...props} 
  />
)

export function ModernListingView({ listing, onBuyNow, isSubmitting, similarListings = [], handleShare, handleContactSeller }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedImage, setSelectedImage] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [showAllImages, setShowAllImages] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  
  // Use the completion rate hook to get seller stats
  const { stats: sellerStats, isLoading: sellerStatsLoading } = useCompletionRate(listing.seller?.id)
  
  // Keep using the sellerListings hook for other listings from the seller
  const { listings: sellerListings, isLoading: sellerListingsLoading } = 
    useSellerListings(listing.seller?.id, listing.id)
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  // Handle image loading
  useEffect(() => {
    if (listing.mediaProof && listing.mediaProof.length > 0) {
      const img = new window.Image()
      img.onload = () => setIsImageLoading(false)
      img.onerror = () => setIsImageLoading(false)
      img.src = listing.mediaProof[selectedImage]
    } else {
      setIsImageLoading(false)
    }
  }, [listing.mediaProof, selectedImage])

  // Image navigation handlers
  const handleImageChange = (direction) => {
    if (!listing.mediaProof || listing.mediaProof.length <= 1) return;
    
    if (direction === 'prev') {
      setSelectedImage((prev) => (prev > 0 ? prev - 1 : listing.mediaProof.length - 1));
    } else {
      setSelectedImage((prev) => (prev < listing.mediaProof.length - 1 ? prev + 1 : 0));
    }
  };
  
  // Format the price with correct currency format
  const formattedPrice = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(listing.price || 0)
  
  // Get country code for flag
  const getCountryCode = (countryValue) => {
    if (!countryValue) return "US";
    
    // Simple mapping for common countries
    const mappings = {
      "united_states": "US",
      "united_kingdom": "GB",
      "canada": "CA",
    }
    
    if (mappings[countryValue?.toLowerCase()]) return mappings[countryValue.toLowerCase()];
    
    // Return first two letters capitalized as default
    return countryValue.substring(0, 2).toUpperCase();
  }
  
  // Format followers
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
  }
  
  // Function to determine the color based on completion rate
  const getCompletionRateColor = (rate) => {
    if (!rate && rate !== 0) return "text-gray-400";
    if (rate >= 95) return "text-green-500";
    if (rate >= 80) return "text-yellow-500";
    return "text-red-500";
  }

  // Get platform icon
  const platformIcon = () => {
    if (listing.platform?.name === "Instagram") return <Instagram className="h-5 w-5" />
    if (listing.platform?.name === "Twitter") return <Twitter className="h-5 w-5" />
    if (listing.platform?.name === "Facebook") return <Facebook className="h-5 w-5" />
    return <Globe className="h-5 w-5" />
  }
  
  // Placeholder functions for any missing imported icons
  const Instagram = () => <Users className="h-5 w-5" />
  const Twitter = () => <Users className="h-5 w-5" />
  const Facebook = () => <Users className="h-5 w-5" />
  
  // Function to check if a value should be displayed (not null, undefined, or zero)
  const shouldDisplay = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'number' && value === 0) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
  };

  // Function to check if an object has any displayable properties
  const hasDisplayableContent = (obj, properties) => {
    if (!obj) return false;
    return properties.some(prop => shouldDisplay(obj[prop]));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
      {/* Sticky header for mobile view that appears when scrolled */}
      <motion.div 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 py-3 px-4 flex items-center justify-between",
          isScrolled ? "translate-y-0" : "-translate-y-full"
        )}
        initial={{ translateY: -100 }}
        animate={{ translateY: isScrolled ? 0 : -100 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="font-semibold text-lg truncate max-w-[200px]">{listing.title}</div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleShare}
            className="rounded-full"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 my-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="gap-1 h-8 px-2"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </Button>
        <span>/</span>
        <span>Listings</span>
        <span>/</span>
        <span className="font-medium text-primary truncate max-w-[200px]">{listing.title}</span>
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left column - Images */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 relative aspect-[4/3] group">
            {/* Featured image with skeleton loading */}
            {isImageLoading ? (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
                <PlatformIcon platform={listing.platform?.name} size="xl" className="text-gray-300 dark:text-gray-700 opacity-50" />
              </div>
            ) : listing.mediaProof && listing.mediaProof.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                <NextImage
                  src={listing.mediaProof[selectedImage]}
                  alt={`${listing.title || listing.username} - image ${selectedImage + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 40vw"
                  priority
                  onLoadingComplete={() => setIsImageLoading(false)}
                />
              </motion.div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/5">
                <PlatformIcon platform={listing.platform?.name} size="2xl" className="text-gray-400" />
              </div>
            )}
            
            {/* Navigation arrows - only show when not loading */}
            {!isImageLoading && listing.mediaProof && listing.mediaProof.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleImageChange('prev')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleImageChange('next')}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
            
            {/* Status badge - always show */}
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="secondary" className="font-medium backdrop-blur-sm bg-white/80 dark:bg-gray-950/80">
                {listing.status === "AVAILABLE" ? (
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                    {listing.status}
                  </span>
                )}
              </Badge>
            </div>
            
            {/* Special badges - always show */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              {listing.views > 50 && (
                <Badge variant="destructive" className="font-medium backdrop-blur-sm bg-red-500/90 border-none text-white">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
              {new Date(listing.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                <Badge variant="default" className="font-medium backdrop-blur-sm bg-primary/90 border-none text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  New
                </Badge>
              )}
            </div>
          </div>
          
          {/* Thumbnail grid with skeleton loading */}
          {listing.mediaProof && listing.mediaProof.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mt-2">
              {listing.mediaProof.slice(0, 5).map((img, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden cursor-pointer",
                    selectedImage === idx ? "ring-2 ring-primary" : ""
                  )}
                  onClick={() => setSelectedImage(idx)}
                >
                  {isImageLoading ? (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                  ) : (
                    <NextImage
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 20vw, 10vw"
                    />
                  )}
                </div>
              ))}
              {listing.mediaProof.length > 5 && (
                <Button 
                  variant="outline"
                  className="aspect-square h-full w-full text-xs font-medium"
                  onClick={() => {/* Open full gallery modal */}}
                >
                  +{listing.mediaProof.length - 5} more
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Right column - Listing details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main info card with glassmorphism effect */}
          <Card className="overflow-hidden border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {listing.country && (
                      <ReactCountryFlag 
                        countryCode={getCountryCode(listing.country || listing.accountCountry)} 
                        svg 
                        className="rounded-sm mr-1" 
                        style={{ width: '1.2em', height: '1.2em' }} 
                      />
                    )}
                    <Badge variant="outline" className="font-normal text-xs">
                      <CategoryIcon category={listing.category?.name} size="sm" className="mr-1" />
                      {listing.category?.name || "Other"}
                    </Badge>
                    <Badge variant="outline" className="font-normal text-xs">
                     <Image src={listing.platform?.icon} alt={listing.platform?.name} width={16} height={16} />
                      {listing.platform?.name || "General"}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold leading-tight">{listing.title || listing.username}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={handleShare}
                          className="rounded-full"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share listing</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Price</div>
                  <div className="text-3xl font-bold text-primary">{formattedPrice}</div>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={onBuyNow}
                  disabled={isSubmitting || listing.status !== "AVAILABLE"}
                  className="relative overflow-hidden group font-medium"
                  size="lg"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-2">
                    {isSubmitting ? (
                      <>Processing...</>
                    ) : (
                      <>
                        Buy Now
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </span>
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleContactSeller}
                  className="font-medium"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Seller
                </Button>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <div className="text-sm font-medium mb-2">Quick info</div>
                <div className="grid grid-cols-2 gap-3">
                  {(listing.type || listing.category?.name) && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <CategoryIcon category={listing.category?.name} size="sm" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {listing.type === "gift_card" ? "Gift Card" : 
                           listing.type === "account" || listing.category?.name === "Account" ? "Account" : "Digital"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Type</div>
                      </div>
                    </div>
                  )}
                  
                  {listing.createdAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{new Date(listing.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Listed on</div>
                      </div>
                    </div>
                  )}
                  
                  {(listing.country || listing.accountCountry) && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          <ReactCountryFlag 
                            countryCode={getCountryCode(listing.country || listing.accountCountry)} 
                            svg 
                            className="rounded-sm" 
                            style={{ width: '1em', height: '1em' }} 
                          />
                          {listing.country || listing.accountCountry}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Country</div>
                      </div>
                    </div>
                  )}
                  
                  {listing.platform?.name && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                       <Image src={listing.platform?.icon} alt={listing.platform?.name} width={16} height={16} />
                      </div>
                      <div>
                        <div className="font-medium">{listing.platform?.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Platform</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          

{/* Description Section */}
<section>
          <div className="flex items-center mb-4 w-full overflow-hidden">
            <h2 className="text-2xl font-semibold flex-shrink-0 mr-4">Description</h2>
            <Separator className="flex-grow" />
          </div>
          
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border shadow-sm">
            <CardContent className="py-6">
              {listing.description ? (
                <div className="prose dark:prose-invert max-w-none prose-sm">
                  <p className="whitespace-pre-line">{listing.description}</p>
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-sm italic">
                  No description available for this listing.
                </div>
              )}
            </CardContent>
          </Card>
        </section>

          {/* Updated seller card with trust indicators and other listings */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md overflow-hidden border shadow-sm">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 border-b dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                    {listing.seller?.avatar ? (
                      <NextImage
                        src={listing.seller.avatar}
                        alt={listing.seller.firstName || "Seller"}
                        width={40}
                        height={40}
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-1.5">
                      {listing.seller?.firstName || "Anonymous"} {listing.seller?.lastName || ""}
                      {listing.seller?.isKycVerified && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                          <BadgeCheck className="h-3 w-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Member since {new Date(listing.seller?.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/dashboard/profile/${listing.seller.id}`)}
                  className="text-xs"
                >
                  View Profile
                </Button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="grid grid-cols-3 gap-6 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">
                    {sellerStatsLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                      `${sellerStats?.completionRate ?? 0}%`
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {sellerStatsLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                      sellerStats?.totalOrders ?? 0
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Sales</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold flex items-center justify-center">
                    {sellerStatsLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        {sellerStats?.avgRating ? sellerStats.avgRating.toFixed(1) : '0.0'}
                        <span className="text-yellow-400 ml-1">★</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Average Rating</div>
                </div>
              </div>

              {/* Additional seller metrics if available */}
              {sellerStats?.totalListings > 0 && (
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {sellerStats.totalListings} listing{sellerStats.totalListings !== 1 ? 's' : ''}
                  </div>
                  {sellerStats.isSeller && (
                    <div className="flex items-center gap-1">
                      <BadgeCheck className="h-4 w-4 text-primary" />
                      Verified Seller
                    </div>
                  )}
                </div>
              )}

              {sellerListings.length > 0 && (
                <>
                  <div className="flex items-center mb-3 w-full overflow-hidden">
                    <h3 className="text-sm font-medium flex-shrink-0 mr-4">More from this seller</h3>
                    <Separator className="flex-grow" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {sellerListings.slice(0, 2).map(item => (
                      <Card 
                        key={item.id} 
                        className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => router.push(`/dashboard/listings/${item.id}`)}
                      >
                        <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
                          {item.mediaProof && item.mediaProof[0] ? (
                            <NextImage
                              src={item.mediaProof[0]}
                              alt={item.title || "Listing image"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {item.platform?.icon ? (
                                <div className="h-8 w-8 rounded-full overflow-hidden">
                                  <img 
                                    src={item.platform.icon} 
                                    alt={item.platform.name} 
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <PlatformIcon platform={item.platform?.name} size="sm" className="text-primary" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-1">
                            <div className="truncate text-sm font-medium">{item.title}</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-primary font-bold">${parseFloat(item.price).toFixed(2)}</div>
                            <Badge variant="outline" className="text-xs">
                              {item.category?.name || "Other"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {sellerListings.length > 2 && (
                    <Button 
                      variant="ghost" 
                      className="w-full mt-3 text-sm"
                      onClick={() => router.push(`/dashboard/users/${listing.seller.id}`)}
                    >
                      View all {sellerListings.length} listings
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>
          
          {/* Trust factors */}
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                Trust & Safety
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm">Secure escrow payment protection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm">24/7 customer support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm">Fraud prevention technology</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm">Encrypted communications</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Content sections (replacing tabbed content) */}
      <div className="mt-10 space-y-8">
        {/* Details Section */}
        <section>
          <div className="flex items-center mb-4 w-full overflow-hidden">
            <h2 className="text-2xl font-semibold flex-shrink-0 mr-4">Account Details</h2>
            <Separator className="flex-grow" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left column - Product details */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Account metrics */}
                <div className="grid grid-cols-2 gap-4">
                  {shouldDisplay(listing.followers) && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
                      <div className="font-medium">{formatFollowers(listing.followers)}</div>
                    </div>
                  )}
                  
                  {shouldDisplay(listing.engagement) && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Engagement</div>
                      <div className="font-medium">{listing.engagement}%</div>
                    </div>
                  )}
                  
                  {shouldDisplay(listing.accountAge) && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Account Age</div>
                      <div className="font-medium">{listing.accountAge} months</div>
                    </div>
                  )}
                  
                  {shouldDisplay(listing.posts) && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
                      <div className="font-medium">{listing.posts.toLocaleString()}</div>
                    </div>
                  )}
                </div>
                
                {/* Additional details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500 dark:text-gray-400">Listing ID</span>
                    <span className="font-medium">{listing.id?.substring(0, 8) || "Unknown"}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500 dark:text-gray-400">Category</span>
                    <span className="font-medium">{listing.category?.name || "Uncategorized"}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500 dark:text-gray-400">Platform</span>
                    <span className="font-medium flex items-center gap-1">
                      {(() => {
                        // Dynamic platform icon (small)
                        if (listing.platform?.name === "Instagram") return <Instagram className="h-3.5 w-3.5 mr-1" />;
                        if (listing.platform?.name === "Twitter") return <Twitter className="h-3.5 w-3.5 mr-1" />;
                        if (listing.platform?.name === "Facebook") return <Facebook className="h-3.5 w-3.5 mr-1" />;
                        if (listing.platform?.name === "TikTok") return <TrainTrack className="h-3.5 w-3.5 mr-1" />;
                        if (listing.platform?.name === "YouTube") return <Youtube className="h-3.5 w-3.5 mr-1" />;
                        return <Globe className="h-3.5 w-3.5 mr-1" />;
                      })()}
                      {listing.platform?.name || "General"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500 dark:text-gray-400">Transfer Method</span>
                    <span className="font-medium">
                      {listing.transferMethod === "email_password" 
                        ? "Email & Password" 
                        : listing.transferMethod === "full_account" 
                        ? "Full Account" 
                        : listing.transferMethod === "api_transfer" 
                        ? "API Transfer" 
                        : listing.transferMethod || "Standard"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Verified Account</span>
                    <span className="font-medium flex items-center">
                      {listing.verified ? (
                        <><CheckCircle className="text-green-500 h-4 w-4 mr-1" /> Yes</>
                      ) : (
                        <><AlertCircle className="text-gray-400 h-4 w-4 mr-1" /> No</>
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Right column - Features/Highlights */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    listing.verified && "Verified Account",
                    listing.transferMethod === "full_account" && "Original Email Access",
                    listing.transferMethod === "email_password" && "Email & Password Transfer",
                    listing.transferMethod === "api_transfer" && "API-Based Transfer",
                    listing.platform?.name && `${listing.platform.name} ${listing.category?.name}`,
                    listing.followers > 10000 && "Established Following",
                    listing.engagement > 3 && "Above Average Engagement",
                    listing.accountAge > 12 && "Aged Account",
                    "Clean Account History"
                  ].filter(Boolean).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        

        {/* Transfer Information Section */}
        <section className="overflow-x-hidden">
          <div className="flex items-center mb-4 w-full overflow-hidden">
            <h2 className="text-2xl font-semibold flex-shrink-0 mr-4">Transfer Information</h2>
            <Separator className="flex-grow" />
          </div>
          
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border shadow-sm">
            <CardContent className="py-6">
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Transfer Method</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {listing.transferMethod === "email_password" 
                      ? "This account will be transferred via email and password change. The seller will provide the login credentials and assist with the transfer process."
                      : listing.transferMethod === "full_account" 
                      ? "This account includes full takeover with original email access. The seller will transfer ownership of both the social media account and the associated email."
                      : listing.transferMethod === "api_transfer" 
                      ? "This account will be transferred using the platform's API. The seller will initiate the transfer through the platform's official transfer system."
                      : "Standard transfer method will be used. The seller will provide all necessary information to complete the transfer securely."}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Protected by TradeTrust's Secure Transfer Protocol</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Transfer Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">1</div>
                      <div>
                        <p className="font-medium">Purchase</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Complete payment through our secure system</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">2</div>
                      <div>
                        <p className="font-medium">Transfer</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Seller initiates account transfer within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">3</div>
                      <div>
                        <p className="font-medium">Verification</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Confirm successful transfer and account access</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">4</div>
                      <div>
                        <p className="font-medium">Release Payment</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Funds are released to seller after confirmation</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Note:</p>
                  <p>All sales are final. By purchasing this listing, you agree to the platform's terms of service and the seller's specific terms outlined above.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Similar Listings Section */}
    
      </div>
      
      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 py-3 px-4 lg:hidden z-40">
        <div className="flex items-center justify-between gap-3 max-w-6xl mx-auto">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Price</div>
            <div className="text-lg font-bold text-primary">{formattedPrice}</div>
          </div>
          <Button 
            onClick={onBuyNow}
            disabled={isSubmitting || listing.status !== "AVAILABLE"}
            className="relative overflow-hidden group font-medium"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  Buy Now
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
} 