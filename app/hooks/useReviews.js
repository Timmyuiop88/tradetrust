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