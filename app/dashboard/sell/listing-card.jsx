import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { formatCurrency } from "@/lib/utils";
import { Pencil, Power, Loader2, MoreVertical, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/app/components/button";
import { useToggleListingStatus } from "@/app/hooks/useListings";
import { useRouter } from "next/navigation";
import { toast } from "@/app/components/custom-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

export function ListingCard({ listing }) {
  const router = useRouter();
  const { mutate: toggleStatus, isPending: isTogglingStatus } = useToggleListingStatus();
  const [isHovered, setIsHovered] = useState(false);

  const isActive = listing.status === "AVAILABLE";

  const handleToggleStatus = () => {
    const newStatus = isActive ? "INACTIVE" : "AVAILABLE";
    const actionText = isActive ? "deactivate" : "reactivate";
    
    if (confirm(`Are you sure you want to ${actionText} this listing?`)) {
      toggleStatus(
        { id: listing.id, status: newStatus },
        {
          onSuccess: () => {
            toast.success(`Listing ${isActive ? "deactivated" : "reactivated"} successfully`);
          },
          onError: (error) => {
            const errorMessage = error.data?.error || error.message || `Failed to ${actionText} listing`;
            toast.error(errorMessage);
          }
        }
      );
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/listings/${listing.id}/edit`);
  };

  return (
    <div 
      className={cn(
        "bg-card rounded-xl border overflow-hidden transition-all duration-300 flex flex-col h-full",
        isHovered ? "shadow-md transform translate-y-[-4px]" : "shadow-sm"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        {/* Header with platform info and price */}
        <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-medium text-sm sm:text-base truncate">{listing.platform?.name}</h3>
                {listing.verified && (
                  <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {listing.category?.name || 'Unknown Category'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                 {listing.platform?.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <p className="font-bold text-primary text-base sm:text-lg whitespace-nowrap">
              {formatCurrency(listing.price)}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                >
                  <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem 
                  onClick={handleEdit}
                  disabled={isTogglingStatus || (listing.status !== "AVAILABLE" && listing.status !== "INACTIVE")}
                  className="cursor-pointer text-xs sm:text-sm py-1.5 sm:py-2"
                >
                  <Pencil className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleToggleStatus}
                  disabled={isTogglingStatus || (listing.status !== "AVAILABLE" && listing.status !== "INACTIVE")}
                  className={`cursor-pointer text-xs sm:text-sm py-1.5 sm:py-2 ${isActive ? "text-destructive" : "text-green-500"}`}
                >
                  <Power className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{isActive ? "Deactivate" : "Reactivate"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Description */}
        <div className="mt-1 sm:mt-2 mb-2 sm:mb-3 flex-grow">
          <p className="text-xs sm:text-sm line-clamp-2 text-muted-foreground">
            {listing.description || "No description available"}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
              <span className="truncate">
                {listing.createdAt ? formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true }) : 'Recently'}
              </span>
            </div>
            <Badge 
              variant={listing?.status === "AVAILABLE" ? "" : "secondary"}
              className="text-[10px] sm:text-xs"
            >
              {listing?.status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListingCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardContent className="flex-grow p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-1 animate-pulse"></div>
          </div>
          <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-shrink-0"></div>
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="h-5 sm:h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="h-4 w-24 sm:w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-5 sm:h-6 w-14 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        </div>
      </CardFooter>
    </Card>
  );
} 