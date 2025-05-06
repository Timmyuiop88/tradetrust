"use client"

import React, { useState } from "react"
import Image from "next/image"
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
  BadgeCheck
} from "lucide-react"
import { Button } from "@/app/components/button"
import { Badge } from "@/app/components/badge"
import { Card, CardContent } from "@/app/components/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/tooltip"
import { formatDistanceToNow } from "date-fns"
import { formatCurrency } from "@/app/lib/utils"
import { StarRating } from "@/app/components/star-rating"

export function DetailedListingView({ listing, onBuyNow, isSubmitting, sellerStats }) {
  const [selectedImage, setSelectedImage] = useState(0)
  
  // Format the price with correct currency format
  const formattedPrice = formatCurrency(listing.price)
  
  // Calculate time ago
  const timeAgo = listing.createdAt 
    ? formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })
    : 'Recently'
  
  // Function to determine the color based on completion rate
  const getCompletionRateColor = (rate) => {
    if (!rate && rate !== 0) return "text-gray-400"
    if (rate >= 95) return "text-green-500"
    if (rate >= 80) return "text-yellow-500"
    return "text-red-500"
  }

  // Get seller reputation indicators
  const sellerName = `${listing.seller.firstName || ''} ${listing.seller.lastName || ''}`.trim() || 'Unknown Seller'
  const isVerified = listing.seller.isKycVerified
  
  // Calculate time since listing created
  const timeSince = () => {
    const now = new Date()
    const created = new Date(listing.createdAt)
    const diffInDays = Math.floor((now - created) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }
  
  // Determine listing type
  const isGiftCard = listing?.category?.name === 'Giftcards' || 
                    (listing?.description?.toLowerCase().includes('gift card'))
                    
  const isAccount = listing?.category?.name === 'Account' || 
                   listing?.followers > 0
                   
  const isDigitalProduct = !isAccount
  
  // Dynamic icon based on listing type
  const getListingIcon = () => {
    if (isGiftCard) return <Gift className="h-5 w-5" />
    if (isAccount) return <User className="h-5 w-5" />
    return <ShoppingCart className="h-5 w-5" />
  }

  return (
    <div className="bg-card rounded-xl border shadow overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Left column - Images */}
        <div className="space-y-4">
          <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
            {listing.mediaProof && listing.mediaProof.length > 0 ? (
              <Image
                src={listing.mediaProof[selectedImage]}
                alt={`${listing.platform?.name || 'Listing'} preview image`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                No image available
              </div>
            )}
            
            {listing.mediaProof && listing.mediaProof.length > 1 && (
              <>
                <button 
                  onClick={() => setSelectedImage(prev => (prev > 0 ? prev - 1 : listing.mediaProof.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1 shadow-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setSelectedImage(prev => (prev < listing.mediaProof.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1 shadow-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnail navigation */}
          {listing.mediaProof && listing.mediaProof.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {listing.mediaProof.map((img, index) => (
                <button
                  key={index}
                  className={`relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image src={img} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
          
          {/* Additional details section */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-medium">Listing Details</h3>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Listed: {timeSince()}</span>
                </div>
                
                {isAccount && listing.followers && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.followers.toLocaleString()} followers</span>
                  </div>
                )}
                
                {listing.accountAge && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.accountAge} {listing.accountAge === 1 ? 'month' : 'months'} old</span>
                  </div>
                )}
                
                {listing.accountCountry && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{listing.accountCountry}</span>
                  </div>
                )}
                
                {listing.transferMethod && (
                  <div className="flex items-center gap-2 col-span-2">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span>Delivery: {listing.transferMethod}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Content */}
        <div className="space-y-6">
          {/* Header info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              {listing.platform?.icon ? (
                <Image
                  src={listing.platform.icon}
                  alt={listing.platform.name}
                  width={20}
                  height={20}
                />
              ) : getListingIcon()}
              
              <Badge variant="outline" className="text-xs">
                {listing.category?.name || "Uncategorized"}
              </Badge>
              
              {listing.verified && (
                <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs">
                  <Check className="h-3 w-3 mr-1" /> Verified
                </Badge>
              )}
            </div>
            
            <h1 className="text-2xl font-bold mb-2">
              {listing.platform?.name} {isGiftCard ? "Gift Card" : isAccount ? "Account" : ""}
              {listing.username && ` @${listing.username}`}
            </h1>
            
            <p className="text-lg font-bold text-primary mb-4">
              {formattedPrice}
              {listing.negotiable && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (Negotiable)
                </span>
              )}
            </p>
          </div>
          
          {/* Description */}
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {listing.description}
            </p>
          </div>
          
          {/* Seller info */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium flex items-center">
                    {listing.seller.firstName} {listing.seller.lastName.charAt(0)}.
                    {listing.seller.isVerified && (
                      <BadgeCheck className="h-4 w-4 text-blue-500 ml-1" />
                    )}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <StarRating rating={sellerStats?.avgRating || 0} />
                    <span className="ml-1">
                      ({sellerStats?.totalRatings || 0})
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => window.location.href = `/dashboard/profile/${listing.sellerId}`}
              >
                View Profile
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Badge className="h-2 w-2 p-0 rounded-full bg-green-500" />
                <span>Recently active</span>
              </div>
              
              <div className="flex items-center gap-1">
                <span className={`font-medium ${getCompletionRateColor(sellerStats?.completionRate)}`}>
                  {sellerStats?.completionRate ? `${sellerStats.completionRate}%` : "N/A"}
                </span>
                <span>Completion</span>
              </div>
            </div>
          </div>
          
          {/* Buy now section */}
          <div className="border rounded-lg p-4 space-y-4">
            <Button 
              className="w-full flex items-center justify-center gap-2"
              onClick={onBuyNow}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Loading...</>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Buy Now • {formattedPrice}
                </>
              )}
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span>Secure transaction through escrow</span>
            </div>
            
            <div className="bg-muted/30 rounded p-3 text-sm space-y-2">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">100% Buyer Protection</p>
                  <p className="text-xs text-muted-foreground">
                    Your payment is held in escrow until you confirm receipt
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Verified Seller</p>
                  <p className="text-xs text-muted-foreground">
                    This seller has completed our verification process
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Terms */}
          <div className="text-xs text-muted-foreground">
            <p>
              By purchasing, you agree to our <a href="/terms" className="text-primary hover:underline">Terms and Conditions</a> and acknowledge that all sales are final unless the item is not as described.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 