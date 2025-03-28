import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export function useUserActivity({ page = 1, limit = 10 } = {}) {
  return useQuery({
    queryKey: ['user-activity', page, limit],
    queryFn: async () => {
      const { data } = await axios.get(`/api/user/activity?page=${page}&limit=${limit}`)
      return data
    },
    keepPreviousData: true, // Keep showing previous data while fetching new page
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
} 