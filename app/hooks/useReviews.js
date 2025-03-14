import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function useListingReviews(listingId) {
  return useQuery({
    queryKey: ['reviews', listingId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/listings/${listingId}/reviews`)
      return data
    },
    enabled: !!listingId
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ listingId, review }) => {
      const { data } = await axios.post(`/api/listings/${listingId}/reviews`, review)
      return data
    },
    onSuccess: (_, { listingId }) => {
      queryClient.invalidateQueries(['reviews', listingId])
      queryClient.invalidateQueries(['listings', listingId])
    }
  })
}

export function useReviews() {
  const queryClient = useQueryClient();

  // Fetch reviews for a user with optional filters and pagination
  const getReviews = async ({ userId, rating, page = 1, limit = 10 }) => {
    if (!userId) return null;
    
    const params = new URLSearchParams();
    params.append('userId', userId);
    if (rating) params.append('rating', rating);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await fetch(`/api/reviews?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    return response.json();
  };

  // Submit a new review
  const submitReview = async (reviewData) => {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit review');
    }
    
    return response.json();
  };

  // React Query hook for fetching reviews
  const useGetReviews = (params) => {
    return useQuery({
      queryKey: ['reviews', params],
      queryFn: () => getReviews(params),
      enabled: !!params.userId,
    });
  };

  // React Query mutation for submitting a review
  const useSubmitReview = () => {
    return useMutation({
      mutationFn: submitReview,
      onSuccess: (data, variables) => {
        // Invalidate relevant queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['reviews', { userId: variables.sellerId }] });
      },
    });
  };

  return {
    useGetReviews,
    useSubmitReview,
  };
} 