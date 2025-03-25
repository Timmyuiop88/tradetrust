// UserListings.jsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/button";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Package, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { ListingCard } from "@/app/components/listing-card";

export function UserListings({ userId }) {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 4; // Show 4 listings per page

  useEffect(() => {
    const fetchListings = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        // Explicitly request listings from this specific seller
        const response = await fetch(`/api/listings?sellerId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        
        const data = await response.json();
        const sellerListings = data.listings || [];
        
        // Filter to only include listings where sellerId matches the userId
        const filteredListings = sellerListings.filter(listing => listing.sellerId === userId);
        
        setTotalCount(filteredListings.length);
        
        // Manually handle pagination on the client side
        const startIndex = (page - 1) * limit;
        const paginatedListings = filteredListings.slice(startIndex, startIndex + limit);
        setListings(paginatedListings);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(err.message || 'Failed to load listings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [userId, page, limit]);

  // Handle pagination
  const handleNextPage = () => {
    if (page < Math.ceil(totalCount / limit)) {
      setPage(old => old + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(old => old - 1);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="overflow-hidden h-full flex flex-col">
            <CardContent className="flex-grow p-4 flex items-center justify-between">
              <div className="w-3/4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-1 animate-pulse"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-8 text-red-500">
        <AlertCircle className="h-5 w-5 mr-2" />
        <p>{error}</p>
      </div>
    );
  }
  
  // Show empty state
  if (listings.length === 0 && totalCount === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
        <Package className="h-12 w-12 mb-4 text-muted-foreground/50" />
        <p>This user doesn't have any available listings.</p>
      </div>
    );
  }

  // Calculate pagination details
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);
  
  // Show listings with pagination
  return (
    <div className="space-y-4">
      {/* Listings count and pagination info */}
      {totalCount > 0 && (
        <div className="text-sm text-muted-foreground mb-2">
          Showing {startItem} - {endItem} of {totalCount} listings
        </div>
      )}
      
      {/* Listings grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      
      {/* Pagination controls - only show if more than one page */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePreviousPage}
            disabled={!hasPreviousPage || isLoading}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center justify-center gap-1">
            <span className="text-sm font-medium">
              Page {page} of {totalPages}
            </span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextPage}
            disabled={!hasNextPage || isLoading}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}