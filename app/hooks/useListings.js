import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import useSWR from "swr"

// Add this fetcher function if not already defined in the file
const fetcher = async (url) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    error.info = await res.json()
    error.status = res.status
    throw error
  }
  return res.json()
}

export function useListings(filters = {}) {
  const fetchListings = async ({ pageParam = 1 }) => {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    // Add page parameter
    queryParams.append("page", pageParam);
    
    // Add limit parameter (default to 12)
    queryParams.append("limit", 12);
    
    // Add platform filter if provided
    if (filters.platform) {
      queryParams.append("platform", filters.platform);
    }
    
    // Add category filter if provided
    if (filters.category) {
      queryParams.append("category", filters.category);
    }
    
    // Add search filter if provided
    if (filters.search) {
      queryParams.append("search", filters.search);
    }
    
    // Add sort parameters if provided
    if (filters.sortBy) {
      queryParams.append("sortBy", filters.sortBy);
    }
    
    if (filters.order) {
      queryParams.append("order", filters.order);
    }
    
    // Make the API request
    const response = await fetch(`/api/listings?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch listings");
    }
    
    return response.json();
  };

  return useInfiniteQuery({
    queryKey: ["listings", filters],
    queryFn: fetchListings,
    getNextPageParam: (lastPage) => {
      // If there are more pages, return the next page number
      if (lastPage.pagination.currentPage < lastPage.pagination.totalPages) {
        return lastPage.pagination.currentPage + 1;
      }
      // Otherwise return undefined to indicate there are no more pages
      return undefined;
    },
    // Only enable the query if we have valid filters
    enabled: true,
    // Refetch when window gets focus
    refetchOnWindowFocus: false,
    // Keep previous data while fetching new data
    keepPreviousData: true,
  });
}

export function useListing(id) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      if (!id) {
        return null;
      }
      
      try {
        const response = await fetch(`/api/listings/${id}`);
        const data = await response.json();
        
        console.log('Listing API response:', { status: response.status, data });
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch listing");
        }
        
        if (data.listing) {
          // If API returns { listing: {...} } format
          return data.listing;
        } else if (data.id) {
          // If API returns the listing object directly
          return data;
        } else {
          throw new Error("Invalid listing data format");
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        throw error;
      }
    },
    enabled: !!id,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSellerStats(sellerId) {
  return useQuery({
    queryKey: ["seller-stats", sellerId],
    queryFn: async () => {
      if (!sellerId) {
        return null;
      }
      
      const response = await fetch(`/api/users/${sellerId}/stats`);
      const data = await response.json();
      
      if (!response.ok) {
        return null; // Return null instead of throwing an error
      }
      
      return data;
    },
    enabled: !!sellerId, // Only run the query if we have a seller ID
    refetchOnWindowFocus: false,
  });
}

export function useListingFavorite(listingId, userId) {
  return useQuery({
    queryKey: ["favorite", listingId, userId],
    queryFn: async () => {
      if (!listingId || !userId) {
        return false;
      }
      
      const response = await fetch(`/api/favorites?listingId=${listingId}`);
      const data = await response.json();
      
      if (!response.ok) {
        return false; // Default to not favorited on error
      }
      
      return data.isFavorite || false;
    },
    enabled: !!listingId && !!userId, // Only run if we have both IDs
    refetchOnWindowFocus: false,
  });
}

export function useSimilarListings(listingId, platformId, categoryId) {
  return useQuery({
    queryKey: ["similar-listings", listingId, platformId, categoryId],
    queryFn: async () => {
      if (!listingId || (!platformId && !categoryId)) {
        return [];
      }
      
      // Build query params
      const params = new URLSearchParams();
      if (platformId) params.append("platformId", platformId);
      if (categoryId) params.append("categoryId", categoryId);
      params.append("excludeId", listingId);
      params.append("limit", 3);
      
      const response = await fetch(`/api/listings/similar?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        return []; // Return empty array instead of throwing
      }
      
      return data.listings || data || [];
    },
    enabled: !!listingId && (!!platformId || !!categoryId),
    refetchOnWindowFocus: false,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (listingData) => {
      const { data } = await axios.post('/api/listings', listingData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['listings'])
    }
  })
}

export function useToggleListingStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await fetch(`/api/listings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Create a more structured error object with the server's error message
        const error = new Error(data.error || 'Failed to update listing status');
        error.status = response.status;
        error.data = data; // Include the full response data for more context
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['seller-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing-detail'] });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (updateData) => {
      const { id, ...listingData } = updateData
      const { data } = await axios.patch(`/api/listings/${id}`, listingData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['listings'])
    }
  })
}

export function useSellerListings(sellerId, excludeId) {
  const { data, error, isLoading } = useSWR(
    sellerId ? `/api/sellers/${sellerId}/listings?excludeId=${excludeId}` : null,
    fetcher
  )

  return {
    listings: data || [],
    isLoading,
    isError: error
  }
} 