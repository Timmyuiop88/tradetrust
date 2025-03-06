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
    mutationFn: async (data) => {
      if (data.delete) {
        await axios.delete(`/api/users/payout-settings?id=${data.id}`)
        return { success: true }
      }
      
      if (data.id) {
        const { data: response } = await axios.put('/api/users/payout-settings', data)
        return response
      } else {
        const { data: response } = await axios.post('/api/users/payout-settings', data)
        return response
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-settings'] })
    }
  })
} 