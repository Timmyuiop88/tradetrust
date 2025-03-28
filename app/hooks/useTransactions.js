import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export function useTransactions({ page = 1, limit = 5, status = null }) {
  return useQuery({
    queryKey: ['transactions', page, limit, status],
    queryFn: async () => {
      const { data } = await axios.get(`/api/transactions?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`)
      return data
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
} 