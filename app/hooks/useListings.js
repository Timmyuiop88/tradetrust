import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"

export function useListings(filters = {}) {
  return useInfiniteQuery({
    queryKey: ['listings', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: pageParam,
        limit: 10,
        ...filters
      })
      
      const { data } = await axios.get(`/api/listings?${params}`)
      return data
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.nextPage : undefined
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
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