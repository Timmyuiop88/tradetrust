import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"

export function useListings(filters = {}) {
  return useInfiniteQuery({
    queryKey: ['listings', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await axios.get('/api/listings', {
        params: {
          page: pageParam,
          limit: 10,
          ...filters
        }
      })
      return data
    },
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.nextPage : undefined,
    retry: 1,
    staleTime: 60 * 1000,
  })
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