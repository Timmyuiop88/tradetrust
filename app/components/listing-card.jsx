import { formatDistanceToNow } from "date-fns";
import { 
  Clock, 
  Star, 
  CheckCircle, 
  ShoppingCart,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { Button } from "./button";
import { Badge } from "./badge";
import { cn } from "../lib/utils";
import { useCompletionRate } from "../hooks/useCompletionRate";

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

export function ListingCard({ listing }) {
  // Use the hook to fetch seller performance data
  const { 
    stats: sellerStats, 
    isLoading: isLoadingSellerStats 
  } = useCompletionRate(listing.seller?.id);

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
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
            
            {isLoadingSellerStats ? (
              <div className="flex items-center gap-1">
                <div className="h-3.5 w-3.5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              </div>
            ) : sellerStats ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="h-3.5 w-3.5 text-yellow-500 mr-0.5" />
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
                <Star className="h-3.5 w-3.5 text-yellow-500" />
                <span>New Seller</span>
              </div>
            )}
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
          </div>
        </div>
      </div>
    </div>
  );
} 