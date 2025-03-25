import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { formatCurrency } from "@/lib/utils";
import { Pencil, Power, Loader2, MoreVertical } from "lucide-react";
import { Button } from "@/app/components/button";
import { useToggleListingStatus } from "@/app/hooks/useListings";
import { useRouter } from "next/navigation";
import { toast } from "@/app/components/custom-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

export function ListingCard({ listing }) {
  const router = useRouter();
  const { mutate: toggleStatus, isPending: isTogglingStatus } = useToggleListingStatus();

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
            
            if (error.data?.activeListings && error.data?.maxActiveListings) {
              toast.error(
                `${errorMessage} (${error.data.activeListings}/${error.data.maxActiveListings} active listings)`,
                { duration: 5000 }
              );
            } else {
              toast.error(errorMessage);
            }
          }
        }
      );
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/listings/${listing.id}/edit`);
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardContent className="flex-grow p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-1">
              {listing.username || listing.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {listing.description}
            </p>
          </div>
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
      </CardContent>
      
      <CardFooter className="p-3 sm:p-4 pt-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <span className="font-bold text-base sm:text-lg order-1 sm:order-none">
          {formatCurrency(listing.price)}
        </span>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            Listed: {new Date(listing.createdAt).toLocaleDateString()}
          </span>
          <Badge 
            variant={isActive ? "success" : "secondary"}
            className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5"
          >
            {isActive ? "ACTIVE" : "INACTIVE"}
          </Badge>
          {isTogglingStatus && (
            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin ml-1" />
          )}
        </div>
      </CardFooter>
    </Card>
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