import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export function usePayoutSettings() {
  return useQuery({
    queryKey: ['payout-settings'],
    queryFn: async () => {
      const { data } = await axios.get('/api/users/payout-settings')
      return data
    }
  })
}

export function useUpdatePayoutSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (settings) => {
      const { data } = await axios.post('/api/users/payout-settings', settings)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payout-settings'])
    }
  })
} 