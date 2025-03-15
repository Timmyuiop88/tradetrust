// UserListings.jsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/button";
import { useRouter } from "next/navigation";
import { Loader2, Package, AlertCircle } from "lucide-react";

export function UserListings({ userId }) {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/listings?sellerId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        
        const data = await response.json();
        setListings(data.listings || []);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(err.message || 'Failed to load listings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [userId]);

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
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
  if (listings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
        <Package className="h-12 w-12 mb-4 text-muted-foreground/50" />
        <p>This user doesn't have any available listings.</p>
      </div>
    );
  }
  
  // Show listings
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {listings.map((listing) => (
        <Card key={listing.id} className="overflow-hidden h-full flex flex-col">
          <CardContent className="flex-grow p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg line-clamp-1">{listing.username}</h3>
              <Badge variant={listing.status === "AVAILABLE" ? "success" : "secondary"}>
                {listing.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{listing.description}</p>
            <div className="flex items-center justify-between mt-auto">
              <div>
                <p className="text-sm text-muted-foreground">Platform</p>
                <p className="font-medium">{listing.platform?.name || "Unknown"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-bold">{formatCurrency(listing.price)}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => router.push(`/dashboard/listings/${listing.id}`)}
            >
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}