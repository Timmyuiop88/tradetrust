import { formatDistanceToNow } from "date-fns";
import { 
  Clock, 
  Star, 
  CheckCircle, 
  ShoppingCart,
  AlertTriangle,
  Heart,
  ExternalLink,
  Globe,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { Button } from "./button";
import { Badge } from "./badge";
import { cn } from "../lib/utils";
import { useCompletionRate } from "../hooks/useCompletionRate";
import Image from "next/image";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { countries } from "../lib/data/countries";
import ReactCountryFlag from "react-country-flag";

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

// Function to determine the color based on completion rate
const getCompletionRateColor = (rate) => {
  if (rate >= 90) return "text-green-500";
  if (rate >= 70) return "text-amber-500";
  return "text-red-500";
};

// Function to determine the icon based on completion rate
const getCompletionRateIcon = (rate) => {
  if (rate >= 70) return <CheckCircle className="h-3.5 w-3.5" />;
  return <AlertTriangle className="h-3.5 w-3.5" />;
};

// Function to truncate text with ellipsis
const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// Function to get country code for flag display
const getCountryCode = (countryValue) => {
  // Convert the country value to a 2-letter ISO code for the flag
  const countryMappings = {
    "united_states": "US",
    "united_kingdom": "GB",
    "canada": "CA",
    // For other countries, we'll try to use the first two letters of the value
    // or fallback to the first two letters capitalized
  };
  
  if (countryMappings[countryValue]) {
    return countryMappings[countryValue];
  }
  
  // For countries where we don't have a specific mapping,
  // try to create a 2-letter code from the value
  if (countryValue && countryValue.length >= 2) {
    return countryValue.substring(0, 2).toUpperCase();
  }
  
  return "US"; // Default fallback
};

export function ListingCard({ listing }) {
  // Use the hook to fetch seller performance data
  const { 
    stats: sellerStats, 
    isLoading: isLoadingSellerStats 
  } = useCompletionRate(listing.seller?.id);

  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Determine if this is an account type listing
  const isAccountType = listing.category?.name === "Account";

  // Get the first media item if available
  const mediaPreview = listing.media?.[0]?.url || null;
  
  // Format price with commas and currency symbol
  const formattedPrice = typeof listing.price === 'number' 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(listing.price)
    : '$0.00';

  // Get country info for flag display
  const countryInfo = listing.accountCountry ? 
    countries.find(c => c.value === listing.accountCountry) : null;
  
  // Get country code for flag (convert from country value to ISO code)
  const countryCode = listing.accountCountry ? 
    getCountryCode(listing.accountCountry) : null;

  return (
    <div 
      className={cn(
        "bg-card rounded-xl border overflow-hidden transition-all duration-300 flex flex-col h-full",
        isHovered ? "shadow-md transform translate-y-[-4px]" : "shadow-sm"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Media Preview Section - Conditionally rendered if media exists */}
      {mediaPreview && (
        <div className="relative w-full aspect-video sm:aspect-video md:h-36 bg-muted overflow-hidden">
          <img 
            src={mediaPreview} 
            alt="Listing preview" 
            className="w-full h-full object-cover"
          />
          
          {/* Favorite button */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }} 
            className="absolute top-2 right-2 h-8 w-8 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-full flex items-center justify-center shadow-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <Heart 
              className={cn(
                "h-4 w-4 transition-colors", 
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
              )} 
            />
          </button>
          
          {/* Negotiable badge */}
          {listing.negotiable && (
            <div className="absolute top-2 left-2">
              <Badge variant="success" className="text-xs font-medium">
                Negotiable
              </Badge>
            </div>
          )}
        </div>
      )}
      
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        {/* Header with platform info and price */}
        <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold overflow-hidden flex-shrink-0">
              <Image src={listing.platform?.icon} alt={listing.platform?.name} width={40} height={40} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-medium text-sm sm:text-base truncate">{listing.platform?.name}</h3>
                {listing.verified && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Verified Listing</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                <span className="truncate">{listing.category?.name || 'Unknown Category'}</span>
                {isAccountType && (
                  <> • <span className="truncate">{formatFollowers(listing.followers)} followers</span></>
                )}
                {listing.accountCountry && countryCode && (
                  <span className="flex items-center ml-1 flex-shrink-0">
                    <span className="mx-1 hidden xs:inline">•</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center">
                            <ReactCountryFlag 
                              countryCode={countryCode} 
                              svg 
                              style={{
                                width: '1em',
                                height: '1em',
                              }}
                              title={countryInfo?.label || listing.accountCountry}
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{countryInfo?.label || listing.accountCountry}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-base sm:text-lg font-bold text-primary whitespace-nowrap">{formattedPrice}</p>
          </div>
        </div>
        
        {/* Description section */}
        <div className="mt-1 sm:mt-2 mb-2 sm:mb-3 flex-grow">
          <p className="text-xs sm:text-sm line-clamp-2 text-muted-foreground">
            {listing.description || "No description available"}
          </p>
        </div>
        
        {/* Preview link if available */}
        {listing.previewLink && (
          <div className="mb-2 sm:mb-3">
            <a 
              href={listing.previewLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline flex items-center gap-1"
              onClick={e => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Preview</span>
            </a>
          </div>
        )}
        
        <div className="mt-auto space-y-2 sm:space-y-3">
          {/* Tags section */}
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {listing.category && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs">
                {listing.category.name}
              </Badge>
            )}
            {isAccountType && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs">
                {listing.engagement || 0}% engagement
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] sm:text-xs flex items-center gap-1">
              <CreditCard className="h-2.5 sm:h-3 w-2.5 sm:w-3 flex-shrink-0" />
              {listing.transferMethod === "email_password" ? "Email & Password" :
               listing.transferMethod === "full_account" ? "Full Account" :
               listing.transferMethod === "api_transfer" ? "API Transfer" : "Transfer"}
            </Badge>
          </div>
          
          {/* Timestamp and seller info */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
              <span className="truncate">
                {listing.createdAt ? formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true }) : 'Recently'}
              </span>
            </div>
            
            {isLoadingSellerStats ? (
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 sm:h-3.5 sm:w-3.5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div className="h-2.5 sm:h-3 w-14 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              </div>
            ) : sellerStats ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-500 mr-0.5 flex-shrink-0" />
                  <span>{sellerStats.averageRating ? sellerStats.averageRating.toFixed(1) : "New"}</span>
                </div>
                <div className="flex items-center">
                  {getCompletionRateIcon(sellerStats.completionRate)}
                  <span className={cn("ml-0.5", getCompletionRateColor(sellerStats.completionRate))}>
                    {sellerStats.completionRate}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-500 flex-shrink-0" />
                <span>New Seller</span>
              </div>
            )}
          </div>
          
          {/* Action button */}
          <div className="flex gap-2 mt-2">
            <Link href={`/dashboard/listings/${listing.id}`} className="flex-1">
              <Button 
                className={cn(
                  "w-full transition-colors text-xs sm:text-sm h-8 sm:h-9", 
                  isHovered ? "bg-primary text-primary-foreground" : "bg-primary/90"
                )} 
                size="sm"
              >
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 