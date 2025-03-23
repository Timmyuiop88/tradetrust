import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import { useQueryClient, useMutation } from "@tanstack/react-query"

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
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await axios.patch(`/api/listings/${id}/status`, {
        status: status
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['listings'])
    }
  })
}

export function useUpdateListing() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (updateData) => {
      const { id, ...listingData } = updateData
      
      // Log the data being sent (for debugging)
      console.log('Updating listing with data:', { id, ...listingData })
      
      try {
        const { data } = await axios.patch(`/api/listings/${id}`, listingData)
        return data
      } catch (error) {
        console.error('Error updating listing:', error.response?.data || error.message)
        throw new Error(error.response?.data?.error || error.message || 'Failed to update listing')
      }
    },
    onSuccess: (data) => {
      // Invalidate both the listings collection and the specific listing
      queryClient.invalidateQueries(['listings'])
      queryClient.invalidateQueries(['listing', data.id])
      return data
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      throw error
    }
  })
}

// New hook for fetching a single listing
export function useListing(id) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/listings/${id}`)
      return data
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
  })
} 